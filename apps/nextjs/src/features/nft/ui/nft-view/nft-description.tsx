import type { TNFT } from "~/entities/nft/model/nft.types";

interface NFTDescriptionProps {
  nft: TNFT;
}

export function NFTDescription({ nft }: NFTDescriptionProps) {
  return (
    <div className="flex flex-col gap-y-1">
      <h3 className="text-[20px] font-semibold">Description</h3>
      <p>{nft.description}</p>
    </div>
  );
}
