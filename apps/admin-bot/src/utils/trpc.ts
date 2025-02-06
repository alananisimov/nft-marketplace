import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { env } from "env";
import jwt from "jsonwebtoken";
import SuperJSON from "superjson";

import type { AppRouter } from "@acme/api";

SuperJSON.registerCustom<Buffer, number[]>(
  {
    isApplicable: (v): v is Buffer => v instanceof Buffer,
    serialize: (v) => [...v],
    deserialize: (v) => Buffer.from(v),
  },
  "buffer",
);

function generateInfiniteJWT() {
  const accessToken = jwt.sign(
    { userId: "", telegramId: 0, publicKey: "", role: "admin" },
    env.JWT_ACCESS_SECRET,
  );

  return accessToken;
}

const INFINITE_ACCESS_TOKEN = generateInfiniteJWT();

export function createServerClient() {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        transformer: SuperJSON,
        url: `${env.API_URL}/trpc`,
        headers() {
          return {
            Authorization: `Bearer ${INFINITE_ACCESS_TOKEN}`,
            "x-trpc-source": "server",
          };
        },
        fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: "include",
          });
        },
      }),
    ],
  });
}

export const api = createServerClient();
