import "reflect-metadata";

import { randomUUID } from "crypto";

import type { MinioService } from "../infrastructure/minio.service";
import type { ImageResponse, ImageUploadInput } from "./dto";
import { CACHE_CONFIG } from "../../../constants";
import { DomainError } from "../../../shared/domain/errors";
import { cacheService } from "../../../shared/infrastructure/cache";
import { logger } from "../../../utils/logger";
import { ImageEntity } from "../domain/image.entity";
import { inject, injectable } from "tsyringe";

@injectable()
export class ImageService {
  constructor(
    @inject("MinioService") private readonly minioService: MinioService,
  ) {}

  private getCacheKey(filename: string): string {
    return `image:${filename}`;
  }

  private generateUniqueFilename(): string {
    return `${randomUUID()}.webp`;
  }

  async uploadImage(input: ImageUploadInput): Promise<ImageResponse> {
    try {
      logger.info({ originalFilename: input.filename }, "Uploading image");

      const uniqueFilename = this.generateUniqueFilename();

      const url = await this.minioService.uploadImage(input.file, {
        filename: uniqueFilename,
        width: input.width,
        height: input.height,
        quality: input.quality,
      });

      const image = ImageEntity.create({
        filename: uniqueFilename,
        mimetype: "image/webp",
        url,
      });

      await cacheService.set(
        this.getCacheKey(uniqueFilename),
        image.toDTO(),
        CACHE_CONFIG.revalidate.public,
      );

      logger.info(
        {
          originalFilename: input.filename,
          savedAs: uniqueFilename,
          url,
        },
        "Successfully uploaded image",
      );

      return image.toDTO();
    } catch (error) {
      logger.error(
        { error, filename: input.filename },
        "Failed to upload image",
      );
      throw new DomainError("Failed to upload image", "IMAGE_UPLOAD_ERROR");
    }
  }

  async getImageUrl(filename: string): Promise<ImageResponse> {
    try {
      logger.info({ filename }, "Getting image URL");

      const cached = await cacheService.get<ImageResponse>(
        this.getCacheKey(filename),
      );
      if (cached) {
        logger.info({ filename }, "Returning cached image URL");
        return cached;
      }

      const url = await this.minioService.getImageUrl(filename);
      const mimetype = this.getMimeTypeFromFilename(filename);

      const image = ImageEntity.create({
        filename,
        mimetype,
        url,
      });

      await cacheService.set(
        this.getCacheKey(filename),
        image.toDTO(),
        CACHE_CONFIG.revalidate.public,
      );

      logger.info({ filename, url }, "Successfully generated image URL");

      return image.toDTO();
    } catch (error) {
      logger.error({ error, filename }, "Failed to get image URL");
      throw new DomainError("Failed to get image URL", "IMAGE_URL_ERROR");
    }
  }

  async getImage(filename: string) {
    try {
      logger.info({ filename }, "Getting image");

      const cached = await cacheService.get<ImageResponse>(
        this.getCacheKey(filename),
      );
      if (cached) {
        logger.info({ filename }, "Returning cached image URL");
        return cached;
      }

      const url = await this.minioService.getImageUrl(filename);
      const mimetype = this.getMimeTypeFromFilename(filename);

      const image = ImageEntity.create({
        filename,
        mimetype,
        url,
      });

      await cacheService.set(
        this.getCacheKey(filename),
        image.toDTO(),
        CACHE_CONFIG.revalidate.public,
      );

      logger.info({ filename, url }, "Successfully generated image URL");

      return image.toDTO();
    } catch (error) {
      logger.error({ error, filename }, "Failed to get image URL");
      throw new DomainError("Failed to get image URL", "IMAGE_URL_ERROR");
    }
  }

  async deleteImage(filename: string): Promise<void> {
    try {
      logger.info({ filename }, "Deleting image");

      await this.minioService.deleteImage(filename);
      await cacheService.del(this.getCacheKey(filename));

      logger.info({ filename }, "Successfully deleted image");
    } catch (error) {
      logger.error({ error, filename }, "Failed to delete image");
      throw new DomainError("Failed to delete image", "IMAGE_DELETE_ERROR");
    }
  }

  private getMimeTypeFromFilename(filename: string): string {
    const extension = filename.split(".").pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
    };
    return mimeTypes[extension ?? ""] ?? "application/octet-stream";
  }
}
