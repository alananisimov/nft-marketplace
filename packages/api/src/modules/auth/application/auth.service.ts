import { compareSync, hashSync } from "bcrypt-edge";
import { inject, injectable } from "tsyringe";

import type { AuthRepository } from "../infrastructure/auth.repository";
import type { LoginInput, RegisterInput, TelegramAutoLogin, TokenResponse } from "./dto";
import { CACHE_CONFIG } from "../../../constants";
import { env } from "../../../env";
import {
  BadRequestError,
  DomainError,
  NotFoundError,
  ValidationError,
} from "../../../shared/domain/errors";
import { cacheService } from "../../../shared/infrastructure/cache";
import { logger } from "../../../utils/logger";
import { TokenEntity } from "../domain/token.entity";
import { verifyInitData } from "../../../utils/telegram";
import { verify } from "jsonwebtoken";

@injectable()
export class AuthService {
  constructor(
    @inject("AuthRepository")
    private readonly authRepository: AuthRepository,
  ) { }

  async register(input: RegisterInput) {
    logger.info(
      {
        data: {
          telegramId: input.telegramId,
        },
      },
      "Processing registration request",
    );

    try {
      const existingUser = await this.authRepository.findByTelegramId(
        input.telegramId,
      );
      if (existingUser) {
        throw new DomainError("User already exists", "USER_EXISTS");
      }

      const passwordHash = this.hashPassword(input.password);
      const user = await this.authRepository.create({
        telegramId: input.telegramId,
        passwordHash,
        publicKey: input.publicKey,
        authorizedTgIds: [input.telegramId],
      });

      logger.info({ userId: user.id }, "Registration successful");
    } catch (error) {
      logger.error(
        {
          error,
          telegramId: input.telegramId,
        },
        "Registration failed",
      );
      throw error instanceof DomainError
        ? error
        : new DomainError("Registration failed", "AUTH_ERROR");
    }
  }

  async login(input: LoginInput): Promise<TokenResponse> {
    logger.info({ telegramId: input.telegramId }, "Processing login request");

    try {
      const user = await this.authRepository.findByPublicKey(input.publicKey);
      if (!user) {
        throw new NotFoundError("User", input.publicKey);
      }

      const isValidPassword = compareSync(input.password, user.passwordHash);
      if (!isValidPassword) {
        throw new ValidationError("Invalid credentials", "INVALID_CREDENTIALS");
      }

      if (
        user.telegramId !== input.telegramId &&
        !user.authorizedTgIds.includes(input.telegramId)
      ) {
        throw new BadRequestError(
          "Verification is required for new Telegram account linking",
          "VERIFICATION_REQUIRED",
        );
      }

      const tokens = this.generateTokens(
        user.id,
        user.telegramId,
        user.publicKey,
        user.role,
      );
      await this.cacheTokens(user.id, tokens);

      logger.info({ userId: user.id }, "Login successful");
      return tokens;
    } catch (error) {
      logger.error({ error, telegramId: input.telegramId }, "Login failed");
      throw error instanceof DomainError
        ? error
        : new DomainError("Login failed", "AUTH_ERROR");
    }
  }


  async autoLoginTelegram(input: TelegramAutoLogin): Promise<TokenResponse> {
    logger.info({ telegramId: input.user?.id }, "Processing login request");

    try {

      const isValid = verifyInitData(input, env.TELEGRAM_BOT_TOKEN)
      if (!isValid) {
        throw new ValidationError("Invalid init data", "INVALID_CREDENTIALS")
      }

      if(!input.user?.id) {
        throw new ValidationError("Invalid init data", "INVALID_CREDENTIALS")
      }

      const user = await this.authRepository.findByTelegramId(input.user.id);
      if (!user) {
        throw new NotFoundError("User", input.hash);
      }

      const tokens = this.generateTokens(
        user.id,
        user.telegramId,
        user.publicKey,
        user.role,
      );
      await this.cacheTokens(user.id, tokens);

      logger.info({ userId: user.id }, "Login successful");
      return tokens;
    } catch (error) {
      logger.error({ error, telegramId: input.user?.id}, "Login failed");
      throw error instanceof DomainError
        ? error
        : new DomainError("Login failed", "AUTH_ERROR");
    }
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    try {
      const decoded = verify(refreshToken, env.JWT_REFRESH_SECRET) as {
        userId: string;
        telegramId: number;
        publicKey: string;
      };

      const user = await this.authRepository.findById(decoded.userId);
      if (!user) {
        throw new NotFoundError("User", decoded.userId);
      }

      const tokens = this.generateTokens(
        user.id,
        user.telegramId,
        user.publicKey,
        user.role,
      );
      await this.cacheTokens(user.id, tokens);

      logger.info({ userId: user.id }, "Token refreshed successfully");
      return tokens;
    } catch (error) {
      logger.error({ error }, "Token refresh failed");
      throw new DomainError("Invalid refresh token", "INVALID_TOKEN");
    }
  }

  private generateTokens(
    userId: string,
    telegramId: number,
    publicKey: string,
    role: "user" | "admin",
  ): TokenResponse {
    const accessToken = jwt.sign(
      { userId, telegramId, publicKey, role },
      env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign(
      { userId, telegramId, publicKey, role },
      env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" },
    );

    const token = TokenEntity.create({
      userId,
      accessToken,
      telegramId,
      refreshToken,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    return {
      userId: userId,
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      expiresIn: 900,
    };
  }

  private async cacheTokens(
    userId: string,
    tokens: TokenResponse,
  ): Promise<void> {
    await cacheService.set(
      `auth:${userId}`,
      tokens,
      CACHE_CONFIG.revalidate.protected,
    );
  }

  validateToken(token: string): boolean {
    try {
      jwt.verify(token, env.JWT_ACCESS_SECRET);
      return true;
    } catch {
      return false;
    }
  }

  getTokenPayload(token: string) {
    try {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
        userId: string;
        telegramId: number;
        publicKey: string;
        role: "user" | "admin";
      };
      return decoded;
    } catch (error) {
      console.error("Get token payload failed:", error);
      throw new DomainError("Invalid access token", "INVALID_TOKEN");
    }
  }

  async logout(userId: string): Promise<void> {
    try {
      await cacheService.del(`auth:${userId}`);
      logger.info({ userId }, "Logout successful");
    } catch (error) {
      logger.error({ error, userId }, "Logout failed");
      throw new DomainError("Logout failed", "AUTH_ERROR");
    }
  }

  async verifyNewTelegramId(
    telegramId: number,
    publicKey: string,
  ): Promise<void> {
    try {
      logger.info({ telegramId, publicKey }, "Processing wallet verification");

      const user = await this.authRepository.findByPublicKey(publicKey);
      if (!user) {
        throw new NotFoundError("User", publicKey);
      }

      user.addAuthorizedTgId(telegramId);

      await this.authRepository.update(user.id, {
        authorizedTgIds: user.authorizedTgIds,
      });

      logger.info({ userId: user.id }, "Wallet verified");
    } catch (error) {
      logger.error(
        { error, telegramId, publicKey },
        "Wallet verification failed",
      );
      throw error instanceof DomainError
        ? error
        : new DomainError("Wallet verification failed", "AUTH_ERROR");
    }
  }

  private hashPassword(password: string): string {
    return hashSync(password, 10);
  }
}
