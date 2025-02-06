import "reflect-metadata";

import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { PgQueryResultHKT, PgTransaction } from "drizzle-orm/pg-core";
import { and, eq, inArray, sql } from "drizzle-orm";

import type * as schema from "@acme/db/schema";
import { db } from "@acme/db/client";
import { Collection, NFT } from "@acme/db/schema";

import type { IRepository } from "../../../shared/domain/types";
import type {
  NFTResponse,
  NFTResponseWithMarketData,
} from "../application/dto";
import { DomainError } from "../../../shared/domain/errors";
import { logger } from "../../../utils/logger";
import { NFTEntity } from "../domain/nft.entity";

type Transaction = PgTransaction<
  PgQueryResultHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;

export class NFTRepository implements IRepository<NFTEntity> {
  async findById(id: string): Promise<NFTEntity | null> {
    try {
      logger.debug({ id }, "Finding NFT by ID");

      const result = await db.query.NFT.findFirst({
        where: eq(NFT.id, id),
      });

      if (!result) {
        logger.debug({ id }, "NFT not found");
        return null;
      }

      logger.debug({ id }, "Found NFT");
      return NFTEntity.fromDB(result);
    } catch (error) {
      logger.error({ error, id }, "Error finding NFT by ID");
      throw new DomainError("Failed to find NFT", "REPOSITORY_ERROR");
    }
  }

  async findAll(): Promise<NFTEntity[]> {
    try {
      logger.debug("Finding all NFTs");

      const results = await db.query.NFT.findMany();

      logger.debug({ count: results.length }, "Found NFTs");
      return results.map((nft) => NFTEntity.fromDB(nft));
    } catch (error) {
      logger.error(error, "Error finding all NFTs");
      throw new DomainError("Failed to find NFTs", "REPOSITORY_ERROR");
    }
  }

  async findByCollection(collectionId: string): Promise<NFTEntity[]> {
    try {
      logger.debug({ collectionId }, "Finding NFTs by collection");

      const results = await db.query.NFT.findMany({
        where: eq(NFT.collectionId, collectionId),
      });

      logger.debug(
        {
          data: {
            collectionId,
            count: results.length,
          },
        },
        "Found collection NFTs",
      );
      return results.map((nft) => NFTEntity.fromDB(nft));
    } catch (error) {
      logger.error({ error, collectionId }, "Error finding NFTs by collection");
      throw new DomainError(
        "Failed to find collection NFTs",
        "REPOSITORY_ERROR",
      );
    }
  }

  async findByAssetCodes(
    assetCodes: string[],
    issuerPubkeys: string[],
  ): Promise<NFTEntity[]> {
    try {
      logger.debug({ assetCodes, issuerPubkeys }, "Finding NFT by asset code");

      const nfts = await db.query.NFT.findMany({
        where: and(
          inArray(NFT.assetCode, assetCodes),
          inArray(NFT.issuerPubkey, issuerPubkeys),
        ),
      });

      const results = nfts.map((nft) => NFTEntity.fromDB(nft));

      logger.debug({ count: results.length }, "Found NFTs");
      return results;
    } catch (error) {
      logger.error(
        {
          data: {
            error,
            assetCodes,
            issuerPubkeys,
          },
        },
        "Error finding NFT by asset code",
      );
      throw new DomainError(
        "Failed to find NFT by asset code",
        "REPOSITORY_ERROR",
      );
    }
  }

  async findByAssetCode(
    assetCode: string,
    issuerPubkey: string,
  ): Promise<NFTEntity | null> {
    try {
      logger.debug({ assetCode, issuerPubkey }, "Finding NFT by asset code");

      const result = await db.query.NFT.findFirst({
        where: and(
          eq(NFT.assetCode, assetCode),
          eq(NFT.issuerPubkey, issuerPubkey),
        ),
      });

      if (!result) {
        logger.debug({ assetCode, issuerPubkey }, "NFT not found");
        return null;
      }

      logger.debug({ id: result.id }, "Found NFT");
      return NFTEntity.fromDB(result);
    } catch (error) {
      logger.error(
        {
          data: {
            error,
            assetCode,
            issuerPubkey,
          },
        },
        "Error finding NFT by asset code",
      );
      throw new DomainError(
        "Failed to find NFT by asset code",
        "REPOSITORY_ERROR",
      );
    }
  }

  async findAvailable(userId: string): Promise<NFTEntity[]> {
    try {
      logger.debug({ userId }, "Finding available NFTs for user");

      const results = await db.query.NFT.findMany({
        where: and(
          sql`${NFT.id} NOT IN (SELECT nft_id FROM staking_item)`,
          sql`${NFT.id} NOT IN (SELECT nft_id FROM delivery_item)`,
        ),
      });

      logger.debug(
        {
          data: {
            userId,
            count: results.length,
          },
        },
        "Found available NFTs for user",
      );
      return results.map((nft) => NFTEntity.fromDB(nft));
    } catch (error) {
      logger.error({ error, userId }, "Error finding available NFTs");
      throw new DomainError(
        "Failed to find available NFTs",
        "REPOSITORY_ERROR",
      );
    }
  }

  async filterAvailableNFTs(
    nfts: (NFTResponse | NFTEntity | NFTResponseWithMarketData)[],
  ): Promise<NFTEntity[]> {
    try {
      if (!nfts.length) return [];

      const nftIds = [...new Set(nfts.map((nft) => nft.id))];

      const results = await db.query.NFT.findMany({
        where: and(
          inArray(NFT.id, nftIds),
          sql`${NFT.id} NOT IN (
            SELECT nft_id FROM staking_item 
            UNION 
            SELECT nft_id FROM delivery_item
          )`,
        ),
      });

      return results.map((nft) => NFTEntity.fromDB(nft));
    } catch (error) {
      logger.error({ error }, "Error filtering available NFTs");
      throw new DomainError(
        "Failed to filter available NFTs",
        "REPOSITORY_ERROR",
      );
    }
  }

  async create(entity: NFTEntity): Promise<NFTEntity> {
    try {
      logger.debug({ entity }, "Creating NFT");

      const collection = await db.query.Collection.findFirst({
        where: eq(Collection.id, entity.collectionId),
      });

      if (!collection) {
        throw new DomainError("Collection not found", "INVALID_REFERENCE");
      }

      const [result] = await db
        .insert(NFT)
        .values({
          assetCode: entity.assetCode,
          name: entity.name,
          description: entity.description,
          image: entity.image,
          lockupPeriod: entity.lockupPeriod,
          domain: entity.domain,
          code: entity.code,
          issuerPubkey: entity.issuerPubkey,
          issuerPrivatekey: entity.issuerPubkey,
          distribPubkey: entity.distributorPubkey,
          distribPrivatekey: entity.distributorPrivatekey,
          collectionId: entity.collectionId,
        })
        .returning();
      if (result == undefined) {
        throw new DomainError(
          "Failed to insert nft into database",
          "REPOSITORY_ERROR",
        );
      }

      logger.debug({ id: result.id }, "Created NFT");
      return NFTEntity.fromDB(result);
    } catch (error) {
      logger.error({ error, entity }, "Error creating NFT");
      throw error instanceof DomainError
        ? error
        : new DomainError("Failed to create NFT", "REPOSITORY_ERROR");
    }
  }

  async update(
    id: string,
    updates: Partial<typeof NFT.$inferSelect>,
  ): Promise<NFTEntity> {
    try {
      logger.debug({ id, updates }, "Updating NFT");

      const existing = await this.findById(id);
      if (!existing) {
        throw new DomainError("NFT not found", "NOT_FOUND");
      }

      if (updates.collectionId) {
        const collection = await db.query.Collection.findFirst({
          where: eq(Collection.id, updates.collectionId),
        });

        if (!collection) {
          throw new DomainError("Collection not found", "INVALID_REFERENCE");
        }
      }

      const [result] = await db
        .update(NFT)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(NFT.id, id))
        .returning();
      if (result === undefined) {
        throw new DomainError(
          "Failed to update nft in the database",
          "REPOSITORY_ERROR",
        );
      }

      logger.debug({ id }, "Updated NFT");
      return NFTEntity.fromDB(result);
    } catch (error) {
      logger.error({ error, id, updates }, "Error updating NFT");
      throw error instanceof DomainError
        ? error
        : new DomainError("Failed to update NFT", "REPOSITORY_ERROR");
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      logger.debug({ id }, "Deleting NFT");

      const [result] = await db.delete(NFT).where(eq(NFT.id, id)).returning();

      const success = !!result;
      logger.debug({ id, success }, "Deleted NFT");
      return success;
    } catch (error) {
      logger.error({ error, id }, "Error deleting NFT");
      throw new DomainError("Failed to delete NFT", "REPOSITORY_ERROR");
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      logger.debug({ id }, "Checking NFT existence");

      const result = await db.query.NFT.findFirst({
        where: eq(NFT.id, id),
        columns: {
          id: true,
        },
      });

      const exists = !!result;
      logger.debug({ id, exists }, "Checked NFT existence");
      return exists;
    } catch (error) {
      logger.error({ error, id }, "Error checking NFT existence");
      throw new DomainError(
        "Failed to check NFT existence",
        "REPOSITORY_ERROR",
      );
    }
  }

  async countByCollection(collectionId: string): Promise<number> {
    try {
      logger.debug({ collectionId }, "Counting NFTs in collection");

      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(NFT)
        .where(eq(NFT.collectionId, collectionId));

      const count = Number(result[0]?.count ?? 0);
      logger.debug({ collectionId, count }, "Counted NFTs in collection");
      return count;
    } catch (error) {
      logger.error(
        {
          data: {
            error,
            collectionId,
          },
        },
        "Error counting NFTs in collection",
      );
      throw new DomainError(
        "Failed to count NFTs in collection",
        "REPOSITORY_ERROR",
      );
    }
  }

  async transaction<T>(fn: (tx: Transaction) => Promise<T>): Promise<T> {
    return await db.transaction(async (tx) => {
      try {
        return await fn(tx);
      } catch (error) {
        logger.error({ error }, "Transaction error");
        throw error instanceof DomainError
          ? error
          : new DomainError("Transaction failed", "TRANSACTION_ERROR");
      }
    });
  }
}
