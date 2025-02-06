import type { HTTPError } from "ky";
import ky from "ky";

import { env } from "../../env";

// {
//   "message": "Verification is required for new Telegram account linking",
//   "code": "INTERNAL_SERVER_ERROR",
//   "data": {
//       "code": "VERIFICATION_REQUIRED",
//       "httpStatus": 500,
//       "stack": "DomainError: Verification is required for new Telegram account linking\n    at AuthService.login (/Users/ekaterinaa/Developer/Work/next/create-t3-turbo/packages/api/src/modules/auth/application/auth.service.ts:81:15)\n    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)\n    at async <anonymous> (/Users/ekaterinaa/Developer/Work/next/create-t3-turbo/packages/api/src/router/auth.ts:59:16)\n    at async resolveMiddleware (file:///Users/ekaterinaa/Developer/Work/next/create-t3-turbo/node_modules/@trpc/server/dist/unstable-core-do-not-import/procedureBuilder.mjs:102:30)\n    at async callRecursive (file:///Users/ekaterinaa/Developer/Work/next/create-t3-turbo/node_modules/@trpc/server/dist/unstable-core-do-not-import/procedureBuilder.mjs:152:32)\n    at async outputValidatorMiddleware (file:///Users/ekaterinaa/Developer/Work/next/create-t3-turbo/node_modules/@trpc/server/dist/unstable-core-do-not-import/middleware.mjs:67:24)\n    at async callRecursive (file:///Users/ekaterinaa/Developer/Work/next/create-t3-turbo/node_modules/@trpc/server/dist/unstable-core-do-not-import/procedureBuilder.mjs:152:32)\n    at async callRecursive (file:///Users/ekaterinaa/Developer/Work/next/create-t3-turbo/node_modules/@trpc/server/dist/unstable-core-do-not-import/procedureBuilder.mjs:152:32)\n    at async <anonymous> (/Users/ekaterinaa/Developer/Work/next/create-t3-turbo/packages/api/src/trpc.ts:157:18)\n    at async callRecursive (file:///Users/ekaterinaa/Developer/Work/next/create-t3-turbo/node_modules/@trpc/server/dist/unstable-core-do-not-import/procedureBuilder.mjs:152:32)",
//       "path": "auth.login",
//       "zodError": null
//   }
// }

interface TRPCError {
  message: string;
  code: string;
  data: {
    code: string;
    httpStatus: number;
    stack: string;
  };
}

const api = ky.create({
  prefixUrl: env.NEXT_PUBLIC_API_URL,
});

type AuthClientResponse<T> =
  | { data: T; error: null }
  | { data: null; error: TRPCError };

export const authClient = {
  // Query (GET)
  async validateToken(
    token: string,
  ): Promise<AuthClientResponse<{ isValid: boolean }>> {
    try {
      const data = await api
        .post<{ isValid: boolean }>("api/auth/validate-token", {
          json: { token },
        })
        .json();
      return { data, error: null };
    } catch (error) {
      const errorData = await (error as HTTPError).response.json();

      return {
        data: null,
        error: errorData as TRPCError,
      };
    }
  },

  // Mutation (POST)
  async login(input: {
    telegramId: number;
    publicKey: string;
    password: string;
  }): Promise<
    AuthClientResponse<{
      userId: string;
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    }>
  > {
    try {
      const data = await api
        .post<{
          userId: string;
          accessToken: string;
          refreshToken: string;
          expiresIn: number;
        }>("api/auth/login", {
          json: { ...input },
        })
        .json();
      return { data, error: null };
    } catch (error) {
      const errorData = await (error as HTTPError).response.json();
      return {
        data: null,
        error: errorData as TRPCError,
      };
    }
  },

  async refreshToken(refreshToken: string): Promise<
    AuthClientResponse<{
      userId: string;
      accessToken: string;
      refreshToken: string;
      expiresAt: number;
    }>
  > {
    try {
      const data = await api
        .post<{
          userId: string;
          accessToken: string;
          refreshToken: string;
          expiresAt: number;
        }>("api/auth/refresh", {
          json: { refreshToken },
        })
        .json();
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: await (error as HTTPError).response.json(),
      };
    }
  },
};
