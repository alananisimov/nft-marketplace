"use client";

import { useCallback } from "react";
import { deleteCookie, setCookie } from "cookies-next/client";

import type { AuthErrorType } from "./use-sign-in";
import { AUTH_COOKIE_NAME } from "../constants";
import { authClient } from "../utils/trpc-client";
import { useSession } from "./use-session";

type RefreshTokensResponse =
  | { success: true }
  | { success: false; error: string; errorType: AuthErrorType };

export function useRefreshTokens() {
  const { setSession, session } = useSession();

  const refreshTokens =
    useCallback(async (): Promise<RefreshTokensResponse> => {
      if (!session?.tokens.refreshToken) {
        return {
          success: false,
          error: "No refresh token",
          errorType: "UNAUTHORIZED",
        };
      }

      try {
        const result = await authClient.refreshToken(
          session.tokens.refreshToken,
        );

        if (result.error) {
          return {
            success: false,
            error: result.error.message,
            errorType: result.error.data.code as AuthErrorType,
          };
        }

        const newSession = {
          ...session,
          tokens: {
            accessToken: result.data.accessToken,
            refreshToken: result.data.refreshToken,
          },
          expiresAt: Math.floor(Date.now() / 1000) + result.data.expiresAt,
        };

        const d = new Date();
        d.setTime(d.getTime() + 7 * 24 * 60 * 60 * 1000);
        setCookie(AUTH_COOKIE_NAME, newSession, {
          expires: d,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        });

        setSession(newSession);

        return {
          success: true,
        };
      } catch (error) {
        deleteCookie(AUTH_COOKIE_NAME);
        throw error;
      }
    }, [setSession, session]);

  return {
    refreshTokens,
  };
}
