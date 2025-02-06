import "reflect-metadata";

/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1)
 * 2. You want to create a new middleware or type of procedure (see Part 3)
 *
 * tl;dr - this is where all the tRPC server stuff is created and plugged in.
 * The pieces you will need to use are documented accordingly near the end
 */

import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import type { IncomingHttpHeaders } from "http2";
import type { OpenApiMeta } from "trpc-to-openapi";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { container } from "./container";
import { AuthService } from "./modules/auth/application/auth.service";
import { DomainError } from "./shared/domain/errors";

superjson.registerCustom<Buffer, number[]>(
  {
    isApplicable: (v): v is Buffer => v instanceof Buffer,
    serialize: (v) => [...v],
    deserialize: (v) => Buffer.from(v),
  },
  "buffer",
);

const authService = container.resolve(AuthService);

function convertHeadersToIncomingHeaders(
  headers: Headers,
): IncomingHttpHeaders {
  const incomingHeaders: IncomingHttpHeaders = {};

  headers.forEach((value, key) => {
    incomingHeaders[key.toLowerCase()] = value;
  });

  return incomingHeaders;
}

export interface TRPCContextProps {
  req?: CreateFastifyContextOptions["req"];
  headers?: Headers;
}

export const createTRPCContext = (opts: TRPCContextProps) => {
  let user = null;
  let token = null;

  const heads =
    opts.req?.headers ??
    (opts.headers ? convertHeadersToIncomingHeaders(opts.headers) : {});

  const authHeader = heads.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const bearerToken = authHeader.substring(7);
    try {
      user = authService.getTokenPayload(bearerToken);
      token = bearerToken;
    } catch (error) {
      console.log("Invalid Bearer token:", error);
    }
  }

  const source = heads["x-trpc-source"] ?? null;

  console.log(">>> tRPC Request from", source, "by", user);

  return {
    session: user ? { user } : null,
    token,
    container: container,
    req: opts.req,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the trpc api is initialized, connecting the context and
 * transformer
 */
const t = initTRPC
  .meta<OpenApiMeta>()
  .context<typeof createTRPCContext>()
  .create({
    transformer: superjson,
    errorFormatter: ({ shape, error }) => {
      if (error.cause instanceof DomainError) {
        return {
          ...shape,
          data: {
            ...shape.data,
            code: error.cause.code,
            zodError: null,
          },
        };
      }

      // Обработка Zod ошибок
      if (error.cause instanceof ZodError) {
        return {
          ...shape,
          data: {
            ...shape.data,
            code: "VALIDATION_ERROR",
            zodError: error.cause.flatten(),
          },
        };
      }

      // Для остальных ошибок возвращаем стандартный код
      return {
        ...shape,
        data: {
          ...shape.data,
          code: shape.data.code,
          zodError: null,
        },
      };
    },
  });

/**
 * Create a server-side caller
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these
 * a lot in the /src/server/api/routers folder
 */

/**
 * This is how you create new routers and subrouters in your tRPC API
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Middleware for timing procedure execution and adding an articifial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

/**
 * Public (unauthed) procedure
 *
 * This is the base piece you use to build new queries and mutations on your
 * tRPC API. It does not guarantee that a user querying is authorized, but you
 * can still access user session data if they are logged in
 */
export const publicProcedure = t.procedure.use(timingMiddleware);

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
      ctx: {
        // infers the `session` as non-nullable
        session: { ...ctx.session, user: ctx.session.user },
      },
    });
  });

export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.role !== "admin") {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});
