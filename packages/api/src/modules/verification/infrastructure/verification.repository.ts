import { eq } from "drizzle-orm";

import { db } from "@acme/db/client";
import { Verification } from "@acme/db/schema";

import { DomainError } from "../../../shared/domain/errors";
import { logger } from "../../../utils/logger";
import { VerificationEntity } from "../domain/verification.entity";

export class VerificationRepository {
  async create(
    userId: string,
    walletAddress: string,
    purpose?: "verification" | "new_telegram_id",
  ): Promise<VerificationEntity> {
    try {
      logger.debug({ userId, walletAddress }, "Creating verification");

      const verification = VerificationEntity.create({ userId, walletAddress });

      const [result] = await db
        .insert(Verification)
        .values({
          id: verification.id,
          userId: verification.userId,
          walletAddress: verification.walletAddress,
          memo: verification.memo,
          isVerified: verification.isVerified,
          expiresAt: verification.expiresAt,
          purpose: purpose,
        })
        .returning();

      if (!result) {
        throw new DomainError(
          "Failed to create verification",
          "REPOSITORY_ERROR",
        );
      }

      logger.debug({ id: result.id }, "Created verification");
      return verification;
    } catch (error) {
      logger.error({ error }, "Error creating verification");
      throw error;
    }
  }

  async findById(id: string): Promise<VerificationEntity | null> {
    try {
      logger.debug({ id }, "Finding verification");

      const result = await db.query.Verification.findFirst({
        where: eq(Verification.id, id),
      });

      if (!result) {
        return null;
      }

      const verification = VerificationEntity.create({
        id: result.id,
        userId: result.userId,
        walletAddress: result.walletAddress,
        memo: result.memo,
        createdAt: result.createdAt,
      });

      if (result.isVerified) {
        verification.verify();
      }

      return verification;
    } catch (error) {
      logger.error({ error }, "Error finding verification");
      throw error;
    }
  }

  async updateVerificationStatus(
    id: string,
    isVerified: boolean,
  ): Promise<void> {
    try {
      logger.debug({ id, isVerified }, "Updating verification status");

      await db
        .update(Verification)
        .set({ isVerified })
        .where(eq(Verification.id, id));
    } catch (error) {
      logger.error({ error }, "Error updating verification status");
      throw error;
    }
  }
}
