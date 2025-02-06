"use client";

import { setCookie } from "cookies-next/client";

import type { AuthSession, LoginInput } from "../types";
import { AUTH_COOKIE_NAME } from "../constants";
import { AuthError } from "../errors";
import { authClient } from "../utils/trpc-client";
import { useSession } from "./use-session";

export type AuthErrorType =
  | "INVALID_CREDENTIALS"
  | "NETWORK_ERROR"
  | "UNAUTHORIZED"
  | "TOKEN_EXPIRED"
  | "REFRESH_FAILED"
  | "VERIFICATION_REQUIRED"
  | "NOT_FOUND";

type SignInResponse =
  | { session: AuthSession; error: undefined; errorType: undefined }
  | { session: undefined; error: string; errorType: AuthErrorType };

export function useSignIn() {
  const { setSession } = useSession();

  const signIn = async (credentials: LoginInput): Promise<SignInResponse> => {
    try {
      const { data, error } = await authClient.login(credentials);

      if (error) {
        return {
          session: undefined,
          error: error.message,
          errorType: error.data.code as AuthErrorType,
        };
      }

      const newSession: AuthSession = {
        user: {
          userId: data.userId,
          telegramId: credentials.telegramId,
          publicKey: credentials.publicKey,
        },
        tokens: {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        },
        expiresAt: Math.floor(Date.now() / 1000) + data.expiresIn,
      };

      const d = new Date();
      d.setTime(d.getTime() + 7 * 24 * 60 * 60 * 1000);
      setCookie(AUTH_COOKIE_NAME, newSession, {
        expires: d,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      setSession(newSession);
      return { session: newSession, error: undefined, errorType: undefined };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      const errorType: AuthErrorType =
        error instanceof AuthError ? error.data.code : "NETWORK_ERROR";
      return { session: undefined, error: errorMessage, errorType };
    }
  };

  return {
    signIn,
  };
}
