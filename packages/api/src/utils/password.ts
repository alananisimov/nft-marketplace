import { hashSync } from "bcrypt-edge";

import { DomainError } from "../shared/domain/errors";
import { logger } from "./logger";

const SALT_ROUNDS = 10;

export function hashPassword(password: string): string {
  try {
    if (!password) {
      throw new DomainError("Password is required", "VALIDATION_ERROR");
    }

    if (password.length < 6) {
      throw new DomainError(
        "Password must be at least 6 characters long",
        "VALIDATION_ERROR",
      );
    }

    const hashedPassword = hashSync(password, SALT_ROUNDS);
    return hashedPassword;
  } catch (error) {
    logger.error({ error }, "Failed to hash password");
    throw error instanceof DomainError
      ? error
      : new DomainError("Failed to hash password", "CRYPTO_ERROR");
  }
}
