import { env } from "~/app/config/env";

interface ImageLoaderProps {
  src: string;
}

export const imageLoader = ({ src }: ImageLoaderProps): string => {
  if (src.includes("X-Amz")) {
    return src;
  }

  const baseUrl = env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  return `${baseUrl}/api/images/${src}`;
};
