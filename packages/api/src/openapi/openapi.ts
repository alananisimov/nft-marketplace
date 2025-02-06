import { generateOpenApiDocument } from "trpc-to-openapi";

import { appRouter } from "../root";

export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: "NFT Market Platform API",
  version: "1.0.0",
  baseUrl: "http://localhost:3001/api",
  description: "API Documentation for NFT Market Platform",
  securitySchemes: {
    Bearer: {
      type: "http",
      scheme: "Bearer",
      bearerFormat: "JWT",
    },
  },
});
