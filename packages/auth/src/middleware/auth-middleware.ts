"use server";

import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getCookie, setCookie } from "cookies-next/server";

import type { AuthSession } from "@acme/auth";
import { AUTH_COOKIE_NAME } from "@acme/auth";
import { TokenUtils } from "@acme/auth/token";

import { env } from "../../env";
import { authClient } from "../utils/trpc-client";

interface AuthMiddlewareOptions {
  pages?: {
    signIn?: string;
    error?: string;
  };
  callbacks?: {
    authorized?: (session: AuthSession | null) => boolean | Promise<boolean>;
  };
}

const defaultOptions: AuthMiddlewareOptions = {
  pages: {
    signIn: "/login",
    error: "/error",
  },
};

export function authMiddleware(options: AuthMiddlewareOptions = {}) {
  const mergedOptions = { ...defaultOptions, ...options };

  return async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const authCookie = await getCookie(AUTH_COOKIE_NAME, { cookies: cookies });
    let session: AuthSession | null = null;

    if (authCookie) {
      try {
        session = JSON.parse(authCookie) as AuthSession;
      } catch {
        session = null;
      }
    }

    if (session) {
      try {
        const token = session.tokens.accessToken;
        if (TokenUtils.isExpired(token)) {
          const refreshToken = session.tokens.refreshToken;
          if (TokenUtils.isExpired(refreshToken)) {
            session = null;
          } else {
            const newTokens = await authClient.refreshToken(refreshToken);

            if (newTokens.error) {
              session = null;
              return NextResponse.redirect(
                new URL(mergedOptions.pages?.signIn ?? "/login", request.url),
              );
            }

            session = {
              user: {
                userId: newTokens.data.userId,
                telegramId: session.user.telegramId,
                publicKey: session.user.publicKey,
              },
              tokens: {
                accessToken: newTokens.data.accessToken,
                refreshToken: newTokens.data.refreshToken,
              },
              expiresAt:
                Math.floor(Date.now() / 1000) + newTokens.data.expiresAt,
            };

            const d = new Date();
            d.setTime(d.getTime() + 7 * 24 * 60 * 60 * 1000);

            await setCookie(AUTH_COOKIE_NAME, session, {
              expires: d,
              secure: env.NODE_ENV === "production",
              sameSite: "lax",
              cookies: cookies,
            });
          }
        }
      } catch {
        session = null;
      }
    }

    const isAuthorized =
      (await mergedOptions.callbacks?.authorized?.(session)) ?? !!session;

    if (!isAuthorized) {
      const signInPage = mergedOptions.pages?.signIn ?? "/login";
      const signInUrl = new URL(signInPage, request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
  };
}
