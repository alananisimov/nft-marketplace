import { cookies } from "next/headers";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import SuperJSON from "superjson";

import type { AppRouter } from "@acme/api";
import type { AuthSession } from "@acme/auth";
import { AUTH_COOKIE_NAME } from "@acme/auth";

import { env } from "~/app/config/env";

interface CreateTRPCClientOptions {
  cookies: () => ReturnType<typeof cookies>;
}

export function createServerClient(opts: CreateTRPCClientOptions) {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        transformer: SuperJSON,
        url: `${env.NEXT_PUBLIC_API_URL}/trpc`,
        async headers() {
          const cookieStore = await opts.cookies();
          const sessionCookie = cookieStore.get(AUTH_COOKIE_NAME)?.value;

          if (sessionCookie) {
            try {
              const session = JSON.parse(
                decodeURIComponent(sessionCookie),
              ) as AuthSession;

              return {
                Authorization: `Bearer ${session.tokens.accessToken}`,
                "x-trpc-source": "server",
              };
            } catch (error) {
              console.log("Failed to parse session cookie:", error);
            }
          }

          return {
            "x-trpc-source": "server",
          };
        },
        fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: "omit",
          });
        },
      }),
    ],
  });
}

export const api = createServerClient({ cookies });
