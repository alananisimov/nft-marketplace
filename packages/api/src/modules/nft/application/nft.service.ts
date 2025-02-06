import "reflect-metadata";

import { inject, injectable } from "tsyringe";

import type { CollectionRepository } from "../../collection/infrastructure/collection.repository";
import type { MarketService } from "../infrastructure/market.service";
import type { NFTRepository } from "../infrastructure/nft.repository";
import type { StellarService } from "../infrastructure/stellar.service";
import type {
  CreateNFTInput,
  NFTResponse,
  NFTResponseWithMarketData,
} from "./dto";
import { CACHE_CONFIG } from "../../../constants";
import { DomainError, NotFoundError } from "../../../shared/domain/errors";
import { cacheService } from "../../../shared/infrastructure/cache";

import { logger } from "../../../utils/logger";
import { NFTEntity } from "../domain/nft.entity";
import { env } from "../../../env";
import { Keypair } from "@stellar/stellar-sdk";

@injectable()
export class NFTService {
  constructor(
    @inject("NFTRepository") private readonly nftRepository: NFTRepository,
    @inject("CollectionRepository")
    private readonly collectionRepository: CollectionRepository,
    @inject("MarketService")
    private readonly marketService: MarketService,
    @inject("StellarService")
    private readonly stellarService: StellarService,
  ) {}

  private async enrichWithMarketData(
    nft: NFTResponse,
  ): Promise<NFTResponseWithMarketData> {
    try {
      logger.debug(
        { nftId: nft.id, assetCode: nft.assetCode },
        "Enriching NFT with market data",
      );

      const marketData = await this.marketService.getMarketData(
        nft.assetCode,
        nft.issuerPubkey,
      );

      const dto = {
        ...nft,
        ...marketData,
      };

      return dto;
    } catch (error) {
      logger.error(
        {
          error,
          nftId: nft.id,
          assetCode: nft.assetCode,
          errorMessage: error instanceof Error ? error.message : String(error),
        },
        "Failed to enrich NFT with market data",
      );
      throw error;
    }
  }

  private async invalidateNFTCaches(
    nftId: string,
    collectionId: string,
  ): Promise<void> {
    await Promise.all([
      cacheService.del("all_nfts"),
      cacheService.del(`nft:${nftId}`),
      cacheService.del(`collection:${collectionId}`),
      cacheService.del("available_nfts"),
    ]);
  }

  async createNFT(input: CreateNFTInput): Promise<NFTResponseWithMarketData> {
    logger.info({ input }, "Creating new NFT");

    try {
      return await this.nftRepository.transaction(async () => {
        const exists = await this.collectionRepository.exists(
          input.collectionId,
        );
        if (!exists) {
          throw new NotFoundError("Collection", input.collectionId);
        }

        let issuer: Keypair, distrib: Keypair;

        if (env.STELLAR_NETWORK == "PUBLIC") {
          const accounts = await this.stellarService.createAccounts();
          issuer = accounts.issuer;
          distrib = accounts.distrib;
        } else {
          const accounts = this.stellarService.createAccountsForTesting();
          issuer = accounts.issuer;
          distrib = accounts.distrib;
        }

        const nft = NFTEntity.create({
          ...input,
          issuerPubkey: issuer.publicKey(),
          issuerPrivatekey: issuer.secret(),
          distribPubkey: distrib.publicKey(),
          distribPrivatekey: distrib.secret(),
          image: input.image,
        });

        logger.debug(
          {
            issuer: issuer.secret(),
            distrib: distrib.secret(),
          },
          "Created issuer and distributor accounts",
        );

        await this.stellarService.setupNFTAsset(nft, issuer, distrib);

        const savedNFT = await this.nftRepository.create(nft);

        const response = await this.enrichWithMarketData(savedNFT.toDTO());

        await this.invalidateNFTCaches(response.id, input.collectionId);

        logger.info({ id: response.id }, "Successfully created NFT");
        return response;
      });
    } catch (e) {
      const error = e as { response: unknown };
      logger.error(
        { error, response: error.response, input },
        "Failed to create NFT",
      );
      throw error instanceof DomainError
        ? error
        : new DomainError("Failed to create NFT", "NFT_CREATE_ERROR");
    }
  }

  async getNFTById(id: string): Promise<NFTResponseWithMarketData> {
    logger.info({ id }, "Fetching NFT by ID");

    try {
      const cached = await cacheService.get<NFTResponseWithMarketData>(
        `nft:${id}`,
      );
      if (cached) {
        logger.info({ id }, "Returning cached NFT");
        return cached;
      }

      const nft = await this.nftRepository.findById(id);
      if (!nft) {
        throw new NotFoundError("NFT", id);
      }

      const response = await this.enrichWithMarketData(nft.toDTO());

      await cacheService.set(
        `nft:${id}`,
        response,
        CACHE_CONFIG.revalidate.public,
      );

      logger.info({ id }, "Successfully fetched NFT");
      return response;
    } catch (error) {
      logger.error({ error, id }, "Failed to fetch NFT");
      throw error instanceof DomainError
        ? error
        : new DomainError("Failed to fetch NFT", "NFT_FETCH_ERROR");
    }
  }

  async getAllNFTs(): Promise<NFTResponseWithMarketData[]> {
    logger.info("Fetching all NFTs");

    try {
      const cached =
        await cacheService.get<NFTResponseWithMarketData[]>("all_nfts");
      if (cached) {
        logger.info("Returning cached NFTs");
        return cached;
      }

      const nfts = await this.nftRepository.findAll();

      if (!nfts.length) {
        logger.info("No NFTs found");
        return [];
      }

      const marketDataMap = await this.marketService.batchGetMarketData(
        nfts.map((nft) => ({
          assetCode: nft.assetCode,
          issuerPubkey: nft.issuerPubkey,
        })),
      );

      const responses = nfts.map((nft) => ({
        ...nft.toDTO(),
        ...marketDataMap[nft.assetCode],
      }));

      if (responses.length > 0) {
        await cacheService
          .set("all_nfts", responses, CACHE_CONFIG.revalidate.public)
          .catch((error: unknown) => {
            logger.error({ error }, "Failed to cache NFTs");
          });
      }

      logger.info({ count: responses.length }, "Successfully fetched all NFTs");
      return responses;
    } catch (error) {
      logger.error({ error }, "Failed to fetch all NFTs");
      throw new DomainError("Failed to fetch NFTs", "NFTS_FETCH_ERROR");
    }
  }

  async getAvailableNFTs(
    userId: string,
    publicKey: string,
  ): Promise<NFTResponseWithMarketData[]> {
    logger.info({ userId }, "Fetching available NFTs for user");

    try {
      const cached = await cacheService.get<NFTResponseWithMarketData[]>(
        `available_nfts:${userId}`,
      );
      if (cached) {
        logger.info({ userId }, "Returning cached available NFTs for user");
        return cached;
      }

      const userNFTs = await this.getUserNFTs(publicKey);

      const availableNfts =
        await this.nftRepository.filterAvailableNFTs(userNFTs);

      const responses = await Promise.all(
        availableNfts.map(
          async (nft) => await this.enrichWithMarketData(nft.toDTO()),
        ),
      );

      await cacheService.set(
        `available_nfts:${userId}`,
        responses,
        CACHE_CONFIG.revalidate.public,
      );

      logger.info(
        { data: { userId, count: responses.length } },
        "Successfully fetched available NFTs for user",
      );
      return responses;
    } catch (error) {
      logger.error(
        { error, userId },
        "Failed to fetch available NFTs for user",
      );
      throw new DomainError(
        "Failed to fetch available NFTs",
        "NFTS_FETCH_ERROR",
      );
    }
  }

  async getUserNFTs(publicKey: string): Promise<NFTResponse[]> {
    logger.info({ publicKey }, "Fetching user NFTs");

    try {
      const cached = await cacheService.get<NFTResponse[]>(
        `user_nfts:${publicKey}`,
      );
      if (cached) {
        logger.info({ publicKey }, "Returning cached NFTs for user");
        return cached;
      }

      const assets = await this.stellarService.getAccountAssets(publicKey);
      if (!assets.length) {
        logger.info({ publicKey }, "User has no assets");
        return [];
      }

      const assetCodes = [...new Set(assets.map((asset) => asset.assetCode))];

      const issuerPks = [...new Set(assets.map((asset) => asset.issuer))];

      const nfts = await this.nftRepository.findByAssetCodes(
        assetCodes,
        issuerPks,
      );

      const responses = nfts.map((nft) => nft.toDTO());

      await cacheService.set(
        `user_nfts:${publicKey}`,
        responses,
        CACHE_CONFIG.revalidate.public,
      );

      return responses;
    } catch (error) {
      logger.error({ error, publicKey }, "Failed to fetch user NFTs");
      throw error instanceof DomainError
        ? error
        : new DomainError("Failed to fetch user NFTs", "USER_NFTS_FETCH_ERROR");
    }
  }

  async getUserNFTsWithMD(
    publicKey: string,
  ): Promise<NFTResponseWithMarketData[]> {
    logger.info({ publicKey }, "Fetching user NFTs");

    try {
      const cached = await cacheService.get<NFTResponseWithMarketData[]>(
        `user_nfts_with_md:${publicKey}`,
      );
      if (cached) {
        logger.info({ publicKey }, "Returning cached NFTs for user");
        return cached;
      }

      const nfts = await this.getUserNFTs(publicKey);

      const responses = await Promise.all(
        nfts.map((nft) => this.enrichWithMarketData(nft)),
      );

      await cacheService.set(
        `user_nfts_with_md:${publicKey}`,
        responses,
        CACHE_CONFIG.revalidate.public,
      );

      logger.debug(
        {
          responses,
        },
        "User nfts",
      );

      return responses;
    } catch (error) {
      logger.error({ error, publicKey }, "Failed to fetch user NFTs");
      throw error instanceof DomainError
        ? error
        : new DomainError("Failed to fetch user NFTs", "USER_NFTS_FETCH_ERROR");
    }
  }

  async deleteNFT(id: string): Promise<void> {
    logger.info({ id }, "Deleting NFT");

    try {
      await this.nftRepository.transaction(async () => {
        const nft = await this.nftRepository.findById(id);
        if (!nft) {
          throw new NotFoundError("NFT", id);
        }

        await this.nftRepository.delete(id);

        await this.invalidateNFTCaches(id, nft.collectionId);
      });

      logger.info({ id }, "Successfully deleted NFT");
    } catch (error) {
      logger.error({ error, id }, "Failed to delete NFT");
      throw error instanceof DomainError
        ? error
        : new DomainError("Failed to delete NFT", "NFT_DELETE_ERROR");
    }
  }

  async getNFTsByCollection(
    collectionId: string,
  ): Promise<NFTResponseWithMarketData[]> {
    logger.info({ collectionId }, "Fetching NFTs by collection");

    try {
      const cached = await cacheService.get<NFTResponseWithMarketData[]>(
        `collection:${collectionId}`,
      );
      if (cached) {
        logger.info({ collectionId }, "Returning cached collection NFTs");
        return cached;
      }

      const exists = await this.nftRepository.exists(collectionId);
      if (!exists) {
        throw new NotFoundError("Collection", collectionId);
      }

      const nfts = await this.nftRepository.findByCollection(collectionId);
      const responses = await Promise.all(
        nfts.map((nft) => this.enrichWithMarketData(nft)),
      );

      await cacheService.set(
        `collection:${collectionId}`,
        responses,
        CACHE_CONFIG.revalidate.public,
      );

      logger.info(
        { data: { collectionId, count: responses.length } },
        "Successfully fetched collection NFTs",
      );
      return responses;
    } catch (error) {
      logger.error({ error, collectionId }, "Failed to fetch collection NFTs");
      throw error instanceof DomainError
        ? error
        : new DomainError(
            "Failed to fetch collection NFTs",
            "COLLECTION_NFTS_FETCH_ERROR",
          );
    }
  }

  async getCollectionNFTCount(collectionId: string): Promise<number> {
    logger.info({ collectionId }, "Getting collection NFT count");

    try {
      const count = await this.nftRepository.countByCollection(collectionId);

      logger.info(
        {
          data: {
            collectionId,
            count,
          },
        },
        "Successfully got collection NFT count",
      );
      return count;
    } catch (error) {
      logger.error(
        {
          data: {
            error,
            collectionId,
          },
        },
        "Failed to get collection NFT count",
      );
      throw error instanceof DomainError
        ? error
        : new DomainError(
            "Failed to get collection NFT count",
            "COLLECTION_COUNT_ERROR",
          );
    }
  }
}
