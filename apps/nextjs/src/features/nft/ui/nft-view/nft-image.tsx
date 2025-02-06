import type { TNFT } from "~/entities/nft/model/nft.types";
import { Image } from "~/shared/ui/image";

interface NFTImageProps {
  nft: TNFT;
}

export function NFTImage({ nft }: NFTImageProps) {
  return (
    <Image
      src={nft.image}
      alt={nft.name}
      width={300}
      height={400}
      className="max-h-[480px] w-full rounded-lg border-2 border-black object-contain"
    />
  );
}
