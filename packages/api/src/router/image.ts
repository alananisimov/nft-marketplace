import { z } from "zod";

import {
  ImageResponse,
  ImageUploadInput,
} from "../modules/images/application/dto";
import { ImageService } from "../modules/images/application/image.service";
import { adminProcedure, publicProcedure } from "../trpc";
import { logger } from "../utils/logger";

export const imageRouter = {
  upload: adminProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/images",
        tags: ["Images"],
        summary: "Upload image",
        protect: true,
      },
    })
    .input(ImageUploadInput)
    .output(ImageResponse)
    .mutation(async ({ input, ctx }) => {
      logger.info({ filename: input.filename }, "Uploading image");
      return await ctx.container.resolve(ImageService).uploadImage(input);
    }),

  getUrl: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/images/{filename}",
        tags: ["Images"],
        summary: "Get image URL",
      },
    })
    .input(z.object({ filename: z.string() }))
    .output(ImageResponse)
    .query(async ({ input, ctx }) => {
      logger.info({ filename: input.filename }, "Getting image URL");
      return await ctx.container
        .resolve(ImageService)
        .getImageUrl(input.filename);
    }),

  delete: adminProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: "/images/{filename}",
        tags: ["Images"],
        summary: "Delete image",
        protect: true,
      },
    })
    .input(z.object({ filename: z.string() }))
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      logger.info({ filename: input.filename }, "Deleting image");
      return ctx.container.resolve(ImageService).deleteImage(input.filename);
    }),
};
