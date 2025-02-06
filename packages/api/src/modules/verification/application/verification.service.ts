import "reflect-metadata";

import { inject, injectable } from "tsyringe";

import type { AuthRepository } from "../../auth/infrastructure/auth.repository";
import type { VerificationEntity } from "../domain/verification.entity";
import type { StellarService } from "../infrastructure/stellar.service";
import type { VerificationRepository } from "../infrastructure/verification.repository";
import { env } from "../../../env";
import { DomainError } from "../../../shared/domain/errors";
import { logger } from "../../../utils/logger";
import { hashPassword } from "../../../utils/password";

interface VerificationResponse {
  id: string;
  walletAddress: string;
  memo: string;
  expiresAt: Date;
}

@injectable()
export class VerificationService {
  constructor(
    @inject("VerificationRepository")
    private readonly verificationRepository: VerificationRepository,
    @inject("AuthRepository")
    private readonly authRepository: AuthRepository,
    @inject("VerificationStellarService")
    private readonly stellarService: StellarService,
  ) {}

  async createVerification(publicKey: string): Promise<VerificationResponse> {
    logger.info({ publicKey }, "Creating new verification");

    try {
      const user = await this.authRepository.findByPublicKey(publicKey);
      if (!user) {
        throw new DomainError("User not found", "NOT_FOUND");
      }

      const verification = await this.verificationRepository.create(
        user.id,
        env.STELLAR_MAIN_WALLET,
      );

      const response = verification.toDTO();

      logger.info(
        {
          data: {
            publicKey,
            verificationId: verification.id,
          },
        },
        "Successfully created verification",
      );

      return response;
    } catch (error) {
      logger.error({ error, publicKey }, "Failed to create verification");
      throw error instanceof DomainError
        ? error
        : new DomainError(
            "Failed to create verification",
            "VERIFICATION_ERROR",
          );
    }
  }

  async verifyNewTelegramId(
    telegramId: number,
    publicKey: string,
  ): Promise<void> {
    const user = await this.authRepository.findByPublicKey(publicKey);
    if (!user) {
      logger.error({ publicKey }, "User not found");
      throw new DomainError("User not found", "NOT_FOUND");
    }

    if (user.authorizedTgIds.includes(telegramId)) {
      logger.error({ telegramId, publicKey }, "Telegram ID already authorized");
      throw new DomainError(
        "Telegram ID already authorized",
        "ALREADY_AUTHORIZED",
      );
    }

    user.addAuthorizedTgId(telegramId);

    await this.authRepository.update(user.id, {
      authorizedTgIds: user.authorizedTgIds,
    });
  }

  async checkVerificationStatus(
    verificationId: string,
  ): Promise<{ isVerified: boolean }> {
    logger.info({ verificationId }, "Checking verification status");

    const verification =
      await this.verificationRepository.findById(verificationId);
    if (!verification) {
      throw new DomainError("Verification not found", "NOT_FOUND");
    }

    if (verification.isExpired) {
      logger.info({ verificationId }, "Verification expired");
      return { isVerified: false };
    }

    if (verification.isVerified) {
      logger.info({ verificationId }, "Verification already verified");
      return { isVerified: true };
    }

    try {
      const isVerified = await this.verifyTransaction(verification);

      if (isVerified) {
        await this.verificationRepository.updateVerificationStatus(
          verificationId,
          true,
        );
      }

      logger.info(
        {
          data: {
            verificationId,
            isVerified,
          },
        },
        "Verification status checked",
      );

      return { isVerified };
    } catch (error) {
      logger.error(
        {
          data: {
            error,
            verificationId,
          },
        },
        "Failed to check verification status",
      );
      throw error instanceof DomainError
        ? error
        : new DomainError(
            "Failed to check verification status",
            "VERIFICATION_ERROR",
          );
    }
  }

  async verifyPasswordReset(
    publicKey: string,
    verificationId: string,
    newPassword: string,
  ): Promise<boolean> {
    logger.info({ publicKey, verificationId }, "Verifying password reset");

    const verification =
      await this.verificationRepository.findById(verificationId);
    if (!verification) {
      throw new DomainError("Verification not found", "NOT_FOUND");
    }

    if (verification.isExpired) {
      throw new DomainError("Verification expired", "VERIFICATION_EXPIRED");
    }

    const isVerified = await this.verifyTransaction(verification, publicKey);
    if (!isVerified) {
      return false;
    }

    const user = await this.authRepository.findByPublicKey(publicKey);
    if (!user) {
      throw new DomainError("User not found", "NOT_FOUND");
    }

    try {
      await this.authRepository.update(user.id, {
        passwordHash: hashPassword(newPassword),
      });

      await this.verificationRepository.updateVerificationStatus(
        verificationId,
        true,
      );

      logger.info(
        {
          data: {
            publicKey,
            verificationId,
          },
        },
        "Successfully reset password",
      );

      return true;
    } catch (error) {
      logger.error(
        {
          data: {
            error,
            publicKey,
            verificationId,
          },
        },
        "Failed to verify password reset",
      );
      throw error instanceof DomainError
        ? error
        : new DomainError(
            "Failed to verify password reset",
            "VERIFICATION_ERROR",
          );
    }
  }

  private async verifyTransaction(
    verification: VerificationEntity,
    fromPublicKey?: string,
  ): Promise<boolean> {
    try {
      const transactions = await this.stellarService.getAccountTransactions(
        verification.walletAddress,
      );

      const isVerified = transactions.some(
        (tx) =>
          tx.memo === verification.memo &&
          (fromPublicKey ? tx.source_account === fromPublicKey : true),
      );

      return isVerified;
    } catch (error) {
      logger.error({ error: error }, "Failed to verify transaction");
      return false;
    }
  }
}
