import { eq } from "drizzle-orm";

import { db } from "@acme/db/client";
import { User } from "@acme/db/schema";

import type { IRepository } from "../../../shared/domain/types";
import { DomainError } from "../../../shared/domain/errors";
import { logger } from "../../../utils/logger";
import { UserEntity } from "../domain/user.entity";

interface CreateUserInput {
  telegramId: number;
  passwordHash: string;
  publicKey: string;
  authorizedTgIds?: number[];
}

export class AuthRepository implements IRepository<UserEntity> {
  async findById(id: string): Promise<UserEntity | null> {
    try {
      logger.debug({ id }, "Finding user by ID");

      const result = await db.query.User.findFirst({ where: eq(User.id, id) });

      if (!result) {
        logger.debug({ id }, "User not found");
        return null;
      }

      logger.debug({ id }, "Found user");
      return UserEntity.fromDB(result);
    } catch (error) {
      logger.error({ error, id }, "Error finding user by ID");
      throw new DomainError("Failed to find user", "REPOSITORY_ERROR");
    }
  }

  async findAll(): Promise<UserEntity[]> {
    try {
      logger.debug("Finding all users");

      const results = await db.query.User.findMany();

      logger.debug({ count: results.length }, "Found users");
      return results.map((user) => UserEntity.fromDB(user));
    } catch (error) {
      logger.error({ error }, "Error finding all users");
      throw new DomainError("Failed to find users", "REPOSITORY_ERROR");
    }
  }

  async findByTelegramId(telegramId: number): Promise<UserEntity | null> {
    try {
      logger.debug({ telegramId }, "Finding user by Telegram ID");

      const result = await db.query.User.findFirst({
        where: eq(User.telegramId, telegramId),
      });

      if (!result) {
        logger.debug({ telegramId }, "User not found");
        return null;
      }

      logger.debug({ id: result.id }, "Found user");
      return UserEntity.fromDB(result);
    } catch (error) {
      logger.error({ error, telegramId }, "Error finding user by Telegram ID");
      throw new DomainError("Failed to find user", "REPOSITORY_ERROR");
    }
  }

  async findByPublicKey(publicKey: string): Promise<UserEntity | null> {
    try {
      logger.debug({ publicKey }, "Finding user by Public Key");

      const result = await db.query.User.findFirst({
        where: eq(User.publicKey, publicKey),
      });

      if (!result) {
        logger.debug({ publicKey }, "User not found");
        return null;
      }

      logger.debug({ id: result.id }, "Found user");
      return UserEntity.fromDB(result);
    } catch (error) {
      logger.error({ error, publicKey }, "Error finding user by Public Key");
      throw new DomainError("Failed to find user", "REPOSITORY_ERROR");
    }
  }

  async create(input: CreateUserInput): Promise<UserEntity> {
    try {
      logger.debug({ telegramId: input.telegramId }, "Creating user");

      const [result] = await db
        .insert(User)
        .values({
          telegramId: input.telegramId,
          passwordHash: input.passwordHash,
          publicKey: input.publicKey,
          authorizedTgIds: input.authorizedTgIds ?? [],
        })
        .returning();

      if (!result) {
        throw new DomainError(
          "Failed to insert user into database",
          "REPOSITORY_ERROR",
        );
      }

      logger.debug({ id: result.id }, "Created user");
      return UserEntity.fromDB(result);
    } catch (error) {
      logger.error({ error, input }, "Error creating user");
      throw new DomainError("Failed to create user", "REPOSITORY_ERROR");
    }
  }

  async update(
    id: string,
    updates: Partial<typeof User.$inferSelect>,
  ): Promise<UserEntity> {
    try {
      logger.debug({ id, updates }, "Updating user");

      const [result] = await db
        .update(User)
        .set(updates)
        .where(eq(User.id, id))
        .returning();

      if (!result) {
        throw new DomainError(
          "Failed to update user in database",
          "REPOSITORY_ERROR",
        );
      }

      logger.debug({ id }, "Updated user");
      return UserEntity.fromDB(result);
    } catch (error) {
      logger.error({ error, id, updates }, "Error updating user");
      throw new DomainError("Failed to update user", "REPOSITORY_ERROR");
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      logger.debug({ id }, "Deleting user");

      const [result] = await db.delete(User).where(eq(User.id, id)).returning();

      const success = !!result;
      logger.debug({ id, success }, "Deleted user");
      return success;
    } catch (error) {
      logger.error({ error, id }, "Error deleting user");
      throw new DomainError("Failed to delete user", "REPOSITORY_ERROR");
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      logger.debug({ id }, "Checking user existence");

      const result = await db.query.User.findFirst({
        where: eq(User.id, id),
        columns: {
          id: true,
        },
      });

      const exists = !!result;
      logger.debug({ id, exists }, "Checked user existence");
      return exists;
    } catch (error) {
      logger.error({ error, id }, "Error checking user existence");
      throw new DomainError(
        "Failed to check user existence",
        "REPOSITORY_ERROR",
      );
    }
  }
}
