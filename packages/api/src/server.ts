import "reflect-metadata";

import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import { fastifySwaggerUi } from "@fastify/swagger-ui";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import Fastify from "fastify";

import { fastifyTRPCOpenApiPlugin } from "trpc-to-openapi";

import { initCronJobs } from "./cronjob";
import { env } from "./env";
import { openApiDocument } from "./openapi/openapi";
import { appRouter } from "./root";
import { createTRPCContext } from "./trpc";
import { logger } from "./utils/logger";

const fastify = Fastify();

// collectDefaultMetrics();

async function main() {
  await fastify.register(cors, {
    origin: ["http://localhost:3000", env.NEXTAUTH_URL],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-trpc-source"],
  });

  // fastify.get("/metrics", async (request, reply) => {
  //   try {
  //     console.log("Metrics endpoint hit from:", request.ip);
  //     reply.header("Content-Type", register.contentType);
  //     return await register.metrics();
  //   } catch (err) {
  //     console.error("Error serving metrics:", err);
  //     reply.status(500).send(err);
  //   }
  // });

  await fastify.register(fastifyTRPCPlugin, {
    prefix: "/trpc",
    trpcOptions: {
      router: appRouter,
      createContext: createTRPCContext,
    },
  });

  await fastify.register(fastifyTRPCOpenApiPlugin, {
    basePath: "/api",
    router: appRouter,
    createContext: createTRPCContext,
  });

  fastify.get("/openapi.json", () => openApiDocument);
  // @ts-expect-error fuck ts
  await fastify.register(swagger, {
    routePrefix: "/docs",
    mode: "static",
    specification: { document: openApiDocument },
    uiConfig: { displayOperationId: true },
    exposeRoute: true,
  });

  fastify.get("/health", () => ({ status: "ok" }));

  await fastify.register(fastifySwaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      url: `http://localhost:${env.API_PORT}/openapi.json`,
      deepLinking: false,
    },
    staticCSP: true,
  });

  initCronJobs();

  try {
    await fastify.listen({ port: env.API_PORT });
    logger.info(`Server running on http://localhost:${env.API_PORT}`);
    logger.info(`API Documentation: http://localhost:${env.API_PORT}/docs`);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
}

main().catch((err) => {
  logger.error(err);
  process.exit(1);
});
