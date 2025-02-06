import "reflect-metadata";

import { inject, injectable } from "tsyringe";

import { ImageService } from "../../modules/images/application/image.service";
import { logger } from "../../utils/logger";

interface WithImage {
  image: string;
}

@injectable()
export class ImageProcessor {
  constructor(
    @inject(ImageService)
    private readonly imageService: ImageService,
  ) {}

  async processImage<T extends WithImage>(item: T): Promise<T> {
    try {
      const { url } = await this.imageService.getImageUrl(item.image);
      return {
        ...item,
        image: url,
      };
    } catch (error) {
      logger.error({ error, image: item.image }, "Failed to process image");
      return item;
    }
  }

  async processImages<T extends WithImage>(items: T[]): Promise<T[]> {
    try {
      return await Promise.all(items.map((item) => this.processImage(item)));
    } catch (error) {
      logger.error({ error }, "Failed to process multiple images");
      return items;
    }
  }

  async processBatchedImages<T extends WithImage>(
    items: T[],
    batchSize = 10,
  ): Promise<T[]> {
    const results: T[] = [];

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const processedBatch = await this.processImages(batch);
      results.push(...processedBatch);
    }

    return results;
  }
}
