"use client";

import type { ImageProps as NextImageProps } from "next/image";
import NextImage from "next/image";

import { env } from "~/app/config/env";

interface ImageProps extends Omit<NextImageProps, "loader"> {
  quality?: number;
}

export function Image(props: ImageProps) {
  // const [imageUrl, setImageUrl] = useState<string | null>(null);

  // const { data: imageData } = api.image.getUrl.useQuery(
  //   {
  //     filename: src,
  //   },
  //   {
  //     staleTime: 1000 * 60 * 60,
  //   },
  // );

  // useEffect(() => {
  //   if (imageData?.url) {
  //     setImageUrl(imageData.url);
  //   }
  // }, [imageData]);

  // if (!imageUrl) {
  //   return (
  //     <Skeleton
  //       className={`h-[${props.height ?? 64}px] w-[${props.width ?? 64}px]`}
  //     />
  //   );
  // }

  return <NextImage {...props} loader={minioLoader} />;
}

function minioLoader({ src }: { src: string }): string {
  return `${env.NEXT_PUBLIC_MINIO_URL}/images/${src}`;
}
