import "reflect-metadata";

import * as Minio from "minio";
import sharp from "sharp";
import { Service } from "typedi";

import { env } from "../../../env";
import { DomainError } from "../../../shared/domain/errors";
import { logger } from "../../../utils/logger";

interface UploadImageOptions {
  filename: string;
  width?: number;
  height?: number;
  quality?: number;
}

const DEFAULT_OPTIONS = {
  quality: 80,
  maxWidth: 1920,
  maxHeight: 1080,
  bucket: "images",
  urlExpiry: 60 * 60 * 24 * 7, // 7 days
};

@Service()
export class MinioService {
  private client: Minio.Client;

  constructor() {
    this.client = new Minio.Client({
      endPoint: env.MINIO_HOST,
      port: env.MINIO_PORT,
      useSSL: false,
      accessKey: env.MINIO_ROOT_USER,
      secretKey: env.MINIO_ROOT_PASSWORD,
    });
  }

  async uploadImage(
    file: Buffer,
    options: UploadImageOptions,
  ): Promise<string> {
    try {
      logger.debug({ filename: options.filename }, "Processing image");

      const processedImage = await this.processImage(file, options);

      await this.client.putObject(
        DEFAULT_OPTIONS.bucket,
        options.filename,
        processedImage,
      );

      const url = await this.getImageUrl(options.filename);

      logger.debug(
        { filename: options.filename, url },
        "Successfully uploaded image",
      );

      return url;
    } catch (error) {
      logger.error(
        { error, filename: options.filename },
        "Failed to upload image",
      );
      throw new DomainError("Failed to upload image", "MINIO_UPLOAD_ERROR");
    }
  }

  async getImageUrl(filename: string): Promise<string> {
    try {
      logger.debug({ filename }, "Generating presigned URL");

      const url = await this.client.presignedGetObject(
        DEFAULT_OPTIONS.bucket,
        filename,
        DEFAULT_OPTIONS.urlExpiry,
      );

      logger.debug({ filename, url }, "Successfully generated presigned URL");

      return url;
    } catch (error) {
      logger.error({ error, filename }, "Failed to generate presigned URL");
      throw new DomainError("Failed to generate image URL", "MINIO_URL_ERROR");
    }
  }

  async deleteImage(filename: string): Promise<void> {
    try {
      logger.debug({ filename }, "Deleting image");

      await this.client.removeObject(DEFAULT_OPTIONS.bucket, filename);

      logger.debug({ filename }, "Successfully deleted image");
    } catch (error) {
      logger.error({ error, filename }, "Failed to delete image");
      throw new DomainError("Failed to delete image", "MINIO_DELETE_ERROR");
    }
  }

  private async processImage(
    file: Buffer,
    options: UploadImageOptions,
  ): Promise<Buffer> {
    try {
      const image = sharp(file);
      const metadata = await image.metadata();

      if (options.width || options.height) {
        image.resize({
          width: options.width ?? DEFAULT_OPTIONS.maxWidth,
          height: options.height ?? DEFAULT_OPTIONS.maxHeight,
          fit: "inside",
          withoutEnlargement: true,
        });
      }

      if (metadata.format !== "webp") {
        image.webp({
          quality: options.quality ?? DEFAULT_OPTIONS.quality,
          lossless: false,
        });
      }

      return image.toBuffer();
    } catch (error) {
      logger.error({ error }, "Failed to process image");
      throw new DomainError("Failed to process image", "IMAGE_PROCESS_ERROR");
    }
  }
}
