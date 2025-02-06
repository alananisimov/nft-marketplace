import { z } from "zod";

export const ImageUploadInput = z.object({
  file: z.custom<Buffer>(),
  filename: z.string().optional(),
  mimetype: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  quality: z.number().optional(),
});

export type ImageUploadInput = z.infer<typeof ImageUploadInput>;

export const ImageResponse = z.object({
  url: z.string(),
  filename: z.string(),
  mimetype: z.string(),
});

export type ImageResponse = z.infer<typeof ImageResponse>;
