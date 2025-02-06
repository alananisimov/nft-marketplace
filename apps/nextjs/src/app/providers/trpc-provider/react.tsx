"use client";

import type { QueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { getCookie } from "cookies-next/client";
import SuperJSON from "superjson";

import type { AppRouter } from "@acme/api";
import type { AuthSession } from "@acme/auth";
import { AUTH_COOKIE_NAME } from "@acme/auth";

import { env } from "~/app/config/env";
import { createQueryClient } from "./query-client";

let clientQueryClientSingleton: QueryClient | undefined = undefined;
const getQueryClient = () => {
  if (typeof window === "undefined") {
    return createQueryClient();
  }
  return (clientQueryClientSingleton ??= createQueryClient());
};

export const api = createTRPCReact<AppRouter>();

function getSessionFromCookie(): AuthSession | null {
  try {
    const sessionData = getCookie(AUTH_COOKIE_NAME);

    if (!sessionData) return null;

    return JSON.parse(sessionData) as AuthSession;
  } catch (error) {
    console.log("Failed to parse session cookie:", error);
    return null;
  }
}

export function TRPCReactProvider(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        loggerLink({
          enabled: (op) =>
            env.NODE_ENV === "development" ||
            (op.direction === "down" && op.result instanceof Error),
        }),
        httpBatchLink({
          transformer: SuperJSON,
          url: `${getBaseUrl()}/trpc`,
          headers() {
            const session = getSessionFromCookie();

            if (session?.tokens.accessToken) {
              return {
                Authorization: `Bearer ${session.tokens.accessToken}`,
                "x-trpc-source": "react",
              };
            }

            return {
              "x-trpc-source": "react",
            };
          },
          fetch: async (input, init?) => {
            try {
              const response = await fetch(input, {
                ...init,
                credentials: "omit",
              });

              if (response.status === 401) {
                console.log("Unauthorized request");
              }

              return response;
            } catch (error) {
              console.log("Fetch error:", error);
              throw error;
            }
          },
        }),
      ],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {props.children}
      </api.Provider>
    </QueryClientProvider>
  );
}

const getBaseUrl = () => {
  if (typeof window !== "undefined") return env.NEXT_PUBLIC_API_URL;
  return `http://localhost:${env.NEXT_PUBLIC_API_PORT}`;
};
