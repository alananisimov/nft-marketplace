import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  CheckVerificationStatusInput,
  CheckVerificationStatusOutput,
  CreateVerificationInput,
  CreateVerificationResponse,
  ResetPasswordInput,
  ResetPasswordOutput,
} from "../modules/verification/application/dto";
import { VerificationService } from "../modules/verification/application/verification.service";
import { publicProcedure } from "../trpc";
import { logger } from "../utils/logger";

export const verificationRouter = {
  create: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/verification",
        tags: ["Verification"],
        summary: "Create verification",
      },
    })
    .input(CreateVerificationInput)
    .output(CreateVerificationResponse)
    .mutation(async ({ input, ctx }) => {
      try {
        return await ctx.container
          .resolve(VerificationService)
          .createVerification(input.publicKey);
      } catch (error) {
        logger.error({ error }, "Failed to create verification");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error creating verification",
        });
      }
    }),

  checkStatus: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/verification/{verificationId}/status",
        tags: ["Verification"],
        summary: "Check verification status",
        protect: true,
      },
    })
    .input(CheckVerificationStatusInput)
    .output(CheckVerificationStatusOutput)
    .query(async ({ input, ctx }) => {
      try {
        return await ctx.container
          .resolve(VerificationService)
          .checkVerificationStatus(input.verificationId);
      } catch (error) {
        logger.error({ error }, "Failed to check verification status");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error checking verification status",
        });
      }
    }),

  resetPassword: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/verification/reset-password",
        tags: ["Verification"],
        summary: "Reset password",
      },
    })
    .input(ResetPasswordInput)
    .output(ResetPasswordOutput)
    .mutation(async ({ input, ctx }) => {
      try {
        const success = await ctx.container
          .resolve(VerificationService)
          .verifyPasswordReset(
            input.publicKey,
            input.verificationId,
            input.newPassword,
          );
        return { success };
      } catch (error) {
        logger.error({ error }, "Failed to reset password");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error resetting password",
        });
      }
    }),

  verifyNewTelegramId: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/verification/telegram",
        tags: ["Verification"],
        summary: "Verify new Telegram ID",
      },
    })
    .input(
      z.object({
        telegramId: z.number(),
        publicKey: z.string(),
        verificationId: z.string(),
      }),
    )
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const { isVerified } = await ctx.container
          .resolve(VerificationService)
          .checkVerificationStatus(input.verificationId);

        if (!isVerified) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Verification not completed",
          });
        }

        await ctx.container
          .resolve(VerificationService)
          .verifyNewTelegramId(input.telegramId, input.publicKey);

        return { success: true };
      } catch (error) {
        logger.error({ error }, "Failed to verify new Telegram ID");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error verifying new Telegram ID",
        });
      }
    }),
};
