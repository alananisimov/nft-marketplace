import "reflect-metadata";

import { injectable } from "tsyringe";

import type { FileUploadOptions } from "~/types";
import { api } from "~/utils/trpc";

@injectable()
export class FileService {
  async uploadImage(
    file: Buffer,
    options: FileUploadOptions = {},
  ): Promise<string> {
    try {
      const { filename } = await api.image.upload.mutate({
        file,
        ...options,
      });

      return filename;
    } catch (error) {
      console.error("Error processing image:", error);
      throw new Error("Failed to process and upload image");
    }
  }

  async deleteFile(fileName: string): Promise<void> {
    try {
      await api.image.delete.mutate({
        filename: fileName,
      });
    } catch (error) {
      console.error("Error deleting file:", error);
      throw new Error("Failed to delete file");
    }
  }
}
