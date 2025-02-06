import { z } from "zod";

import { AuthService } from "../modules/auth/application/auth.service";
import {
  LoginInput,
  RegisterInput,
  TelegramAutoLogin,
  TokenResponse,
} from "../modules/auth/application/dto";
import { AuthRepository } from "../modules/auth/infrastructure/auth.repository";
import { StellarService } from "../modules/nft/infrastructure/stellar.service";
import { protectedProcedure, publicProcedure } from "../trpc";
import { logger } from "../utils/logger";

export const authRouter = {
  register: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/auth/register",
        tags: ["Auth"],
        summary: "Register new user",
        description: "Create a new user account",
      },
    })
    .input(RegisterInput)
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      logger.info(
        {
          data: {
            telegramId: input.telegramId,
          },
        },
        "Processing registration request",
      );
      try {
        return await ctx.container.resolve(AuthService).register(input);
      } catch (error) {
        logger.error({ error }, "Registration failed");
        throw error;
      }
    }),

  login: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/auth/login",
        tags: ["Auth"],
        summary: "Login user",
        description: "Authenticate user and get tokens",
      },
    })
    .input(LoginInput)
    .output(TokenResponse)
    .mutation(async ({ input, ctx }) => {
      logger.info({ telegramId: input.telegramId }, "Processing login request");
      try {
        return await ctx.container.resolve(AuthService).login(input);
      } catch (error) {
        logger.error({ error }, "Login failed");
        throw error;
      }
    }),

  refresh: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/auth/refresh",
        tags: ["Auth"],
        summary: "Refresh token",
        description: "Get new access token using refresh token",
      },
    })
    .input(z.object({ refreshToken: z.string() }))
    .output(TokenResponse)
    .mutation(async ({ input, ctx }) => {
      logger.info("Processing token refresh request");
      try {
        return await ctx.container
          .resolve(AuthService)
          .refreshToken(input.refreshToken);
      } catch (error) {
        logger.error({ error }, "Token refresh failed");
        throw error;
      }
    }),


  autoLogin: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/auth/auto-login",
        tags: ["Auth"],
        summary: "Auto Login",
        description: "Auto login using telegram init data",
      },
    })
    .input(TelegramAutoLogin)
    .output(TokenResponse)
    .mutation(async ({ input, ctx }) => {
      logger.info("Processing auto login request");
      try {
        return await ctx.container
          .resolve(AuthService)
          .autoLoginTelegram(input);
      } catch (error) {
        logger.error({ error }, "Auto Login failed");
        throw error;
      }
    }),

  logout: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/auth/logout",
        tags: ["Auth"],
        summary: "Logout user",
        protect: true,
      },
    })
    .input(z.void())
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx }) => {
      const userId = ctx.session.user.userId;
      logger.info({ userId }, "Processing logout request");
      try {
        await ctx.container.resolve(AuthService).logout(userId);
        return { success: true };
      } catch (error) {
        logger.error({ error }, "Logout failed");
        throw error;
      }
    }),

  me: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/auth/me",
        tags: ["Auth"],
        summary: "Get current user",
        protect: true,
      },
    })
    .input(z.void())
    .output(
      z.object({
        id: z.string().uuid(),
        telegramId: z.number(),
        publicKey: z.string(),
        createdAt: z.coerce.date(),
      }),
    )
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.userId;
      logger.info({ userId }, "Fetching current user info");
      try {
        const user = await new AuthRepository().findById(userId);
        if (!user) {
          throw new Error("User not found");
        }
        return {
          id: user.id,
          telegramId: user.telegramId,
          publicKey: user.publicKey,
          createdAt: user.createdAt,
        };
      } catch (error) {
        logger.error({ error }, "Failed to fetch user info");
        throw error;
      }
    }),

  balance: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/auth/balance",
        tags: ["Auth"],
        summary: "Get user balance",
        protect: true,
      },
    })
    .input(z.void())
    .output(z.number())
    .query(async ({ ctx }) => {
      const publicKey = ctx.session.user.publicKey;
      return await new StellarService().getAccountBalance(publicKey);
    }),

  validateToken: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/auth/validate-token",
        tags: ["Auth"],
        summary: "Validate token",
      },
    })
    .input(z.object({ token: z.string() }))
    .output(z.object({ isValid: z.boolean() }))
    .mutation(({ input, ctx }) => {
      logger.info("Validating token");
      try {
        const isValid = ctx.container
          .resolve(AuthService)
          .validateToken(input.token);
        return { isValid };
      } catch (error) {
        logger.error({ error }, "Token validation failed");
        throw error;
      }
    }),
};
