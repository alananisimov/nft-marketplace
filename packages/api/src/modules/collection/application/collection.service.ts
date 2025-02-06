import "reflect-metadata";

import { inject, injectable } from "tsyringe";

import type { NFTService } from "../../nft/application/nft.service";
import type { CollectionRepository } from "../infrastructure/collection.repository";
import type { CollectionResponse, CreateCollectionInput } from "./dto";
import { CACHE_CONFIG } from "../../../constants";
import { DomainError, NotFoundError } from "../../../shared/domain/errors";
import { cacheService } from "../../../shared/infrastructure/cache";
import { logger } from "../../../utils/logger";
import { CollectionEntity } from "../domain/collection.entity";

@injectable()
export class CollectionService {
  constructor(
    @inject("CollectionRepository")
    private readonly collectionRepository: CollectionRepository,
    @inject("NFTService")
    private readonly nftService: NFTService,
  ) {}

  async createCollection(
    input: CreateCollectionInput,
  ): Promise<CollectionResponse> {
    logger.info({ input }, "Creating new collection");

    try {
      const collection = CollectionEntity.create({ ...input, nfts: [] });
      const savedCollection =
        await this.collectionRepository.create(collection);

      await cacheService.del("all_collections");

      logger.info(
        {
          data: {
            id: savedCollection.id,
          },
        },
        "Successfully created collection",
      );
      return collection.toDTO();
    } catch (error) {
      logger.error({ error, input }, "Failed to create collection");
      throw error instanceof DomainError
        ? error
        : new DomainError(
            "Failed to create collection",
            "COLLECTION_CREATE_ERROR",
          );
    }
  }

  async getCollectionById(id: string): Promise<CollectionResponse> {
    logger.info({ id }, "Fetching collection by ID");

    try {
      const cached = await cacheService.get<CollectionResponse>(
        `collection:${id}`,
      );
      if (cached) {
        logger.info({ id }, "Returning cached collection");
        return cached;
      }

      const collection = await this.collectionRepository.findById(id);
      if (!collection) {
        throw new NotFoundError("Collection", id);
      }

      const response = collection.toDTO();

      await cacheService.set(
        `collection:${id}`,
        response,
        CACHE_CONFIG.revalidate.public,
      );

      logger.info({ id }, "Successfully fetched collection");
      return response;
    } catch (error) {
      logger.error({ error, id }, "Failed to fetch collection");
      throw error instanceof DomainError
        ? error
        : new DomainError(
            "Failed to fetch collection",
            "COLLECTION_FETCH_ERROR",
          );
    }
  }

  async getAllCollections(): Promise<CollectionResponse[]> {
    logger.info("Fetching all collections");

    try {
      const cached =
        await cacheService.get<CollectionResponse[]>("all_collections");
      if (cached) {
        logger.info("Returning cached collections");
        return cached;
      }

      const collections = await this.collectionRepository.findAll();

      const responses = collections.map((collection) => collection.toDTO());

      await cacheService.set(
        "all_collections",
        responses,
        CACHE_CONFIG.revalidate.public,
      );

      logger.info(
        { data: { count: responses.length } },
        "Successfully fetched all collections",
      );
      return responses;
    } catch (error) {
      logger.error({ error }, "Failed to fetch all collections");
      throw error instanceof DomainError
        ? error
        : new DomainError(
            "Failed to fetch collections",
            "COLLECTIONS_FETCH_ERROR",
          );
    }
  }

  async getUserCollections(publicKey: string): Promise<CollectionResponse[]> {
    logger.info("Fetching user collections");

    try {
      const cached = await cacheService.get<CollectionResponse[]>(
        `user_collections:${publicKey}`,
      );
      if (cached) {
        logger.info("Returning cached collections");
        return cached;
      }

      const userNFTs = await this.nftService.getUserNFTs(publicKey);
      if (userNFTs.length === 0) {
        return [];
      }

      const collectionIds = [
        ...new Set(userNFTs.map((nft) => nft.collectionId)),
      ];

      const collections =
        await this.collectionRepository.findByIds(collectionIds);
      if (collections.length === 0) {
        return [];
      }

      await cacheService.set(
        `user_collections:${publicKey}`,
        collections,
        CACHE_CONFIG.revalidate.public,
      );

      logger.info(
        { data: { count: collections.length } },
        "Successfully fetched user collections",
      );
      return collections;
    } catch (error) {
      logger.error({ error }, "Failed to fetch user collections");
      throw error instanceof DomainError
        ? error
        : new DomainError(
            "Failed to fetch collections",
            "COLLECTIONS_FETCH_ERROR",
          );
    }
  }
}
