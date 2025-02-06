import "reflect-metadata";

import { eq, inArray } from "drizzle-orm";

import type { NFT } from "@acme/db/schema";
import { db } from "@acme/db/client";
import { Collection } from "@acme/db/schema";

import type { IRepository } from "../../../shared/domain/types";
import { DomainError } from "../../../shared/domain/errors";
import { logger } from "../../../utils/logger";
import { NFTEntity } from "../../nft/domain/nft.entity";
import { CollectionEntity } from "../domain/collection.entity";

import { injectable } from "tsyringe";
import { CollectionResponse } from "../application/dto";

type CollectionWithNFTs = typeof Collection.$inferSelect & {
  nfts: (typeof NFT.$inferSelect)[];
};

@injectable()
export class CollectionRepository implements IRepository<CollectionEntity> {
  private transformDbResultToEntity(
    result: CollectionWithNFTs,
  ): CollectionEntity {
    try {
      const nftEntities = result.nfts.map((nftData) =>
        NFTEntity.fromDB(nftData),
      );

      return CollectionEntity.create({
        id: result.id,
        name: result.name,
        description: result.description,
        nfts: nftEntities,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt ?? undefined,
      });
    } catch (error) {
      logger.error({ error, result }, "Failed to transform collection data");
      throw new DomainError(
        "Failed to transform database result",
        "DATA_TRANSFORMATION_ERROR",
      );
    }
  }
  async findById(id: string): Promise<CollectionEntity | null> {
    try {
      logger.debug({ id }, "Finding collection by ID");

      const result = await db.query.Collection.findFirst({
        where: eq(Collection.id, id),
        with: {
          nfts: true,
        },
      });

      if (!result) {
        logger.debug({ id }, "Collection not found");
        return null;
      }

      logger.debug({ id }, "Found collection");
      return this.transformDbResultToEntity(result);
    } catch (error) {
      logger.error({ error, id }, "Error finding collection by ID");
      throw new DomainError("Failed to find collection", "REPOSITORY_ERROR");
    }
  }

  async findByIds(ids: string[]): Promise<CollectionResponse[]> {
    try {
      logger.debug("Finding all collections");

      const results = await db.query.Collection.findMany({
        with: {
          nfts: true,
        },
        where: inArray(Collection.id, ids),
      });

      logger.debug({ count: results.length }, "Found collections");
      return results.map((collection) =>
        this.transformDbResultToEntity(collection).toDTO(),
      );
    } catch (error) {
      logger.error({ error }, "Error finding all collections");
      throw new DomainError("Failed to find collections", "REPOSITORY_ERROR");
    }
  }

  async findAll(): Promise<CollectionEntity[]> {
    try {
      logger.debug("Finding all collections");

      const results = await db.query.Collection.findMany({
        with: {
          nfts: true,
        },
      });

      logger.debug({ count: results.length }, "Found collections");
      return results.map((collection) =>
        this.transformDbResultToEntity(collection),
      );
    } catch (error) {
      logger.error({ error }, "Error finding all collections");
      throw new DomainError("Failed to find collections", "REPOSITORY_ERROR");
    }
  }

  async create(entity: CollectionEntity): Promise<CollectionEntity> {
    try {
      logger.debug({ entity }, "Creating collection");

      const [result] = await db
        .insert(Collection)
        .values(entity.toDTO())
        .returning();

      if (!result) {
        throw new DomainError(
          "Failed to insert collection into database",
          "REPOSITORY_ERROR",
        );
      }

      logger.debug({ id: result.id }, "Created collection");
      return this.transformDbResultToEntity({ ...result, nfts: [] });
    } catch (error) {
      logger.error({ error, entity }, "Error creating collection");
      throw new DomainError("Failed to create collection", "REPOSITORY_ERROR");
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      logger.debug({ id }, "Checking collection existence");

      const result = await db.query.Collection.findFirst({
        where: eq(Collection.id, id),
        columns: {
          id: true,
        },
      });

      const exists = !!result;
      logger.debug({ id, exists }, "Checked collection existence");
      return exists;
    } catch (error) {
      logger.error({ error, id }, "Error checking collection existence");
      throw new DomainError(
        "Failed to check collection existence",
        "REPOSITORY_ERROR",
      );
    }
  }
  async update(
    id: string,
    updates: Partial<typeof Collection.$inferSelect>,
  ): Promise<CollectionEntity> {
    try {
      logger.debug({ id, updates }, "Updating collection");

      // Check if collection exists
      const existing = await this.findById(id);
      if (!existing) {
        throw new DomainError("Collection not found", "NOT_FOUND");
      }

      const [result] = await db
        .update(Collection)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(Collection.id, id))
        .returning();

      if (!result) {
        throw new DomainError(
          "Failed to update collection in database",
          "REPOSITORY_ERROR",
        );
      }

      logger.debug({ id }, "Updated collection");
      return this.transformDbResultToEntity({ ...result, nfts: [] });
    } catch (error) {
      logger.error({ error, id, updates }, "Error updating collection");
      throw error instanceof DomainError
        ? error
        : new DomainError("Failed to update collection", "REPOSITORY_ERROR");
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      logger.debug({ id }, "Deleting collection");

      const [result] = await db
        .delete(Collection)
        .where(eq(Collection.id, id))
        .returning();

      const success = !!result;
      logger.debug({ id, success }, "Deleted collection");
      return success;
    } catch (error) {
      logger.error({ error, id }, "Error deleting collection");
      throw new DomainError("Failed to delete collection", "REPOSITORY_ERROR");
    }
  }

  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    return await db.transaction(async (_tx) => {
      try {
        return await fn();
      } catch (error) {
        logger.error({ error }, "Transaction error");
        throw error instanceof DomainError
          ? error
          : new DomainError("Transaction failed", "TRANSACTION_ERROR");
      }
    });
  }
}
