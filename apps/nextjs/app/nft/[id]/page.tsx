import { NFTView } from "~/features/nft/ui/nft-view";
import { NFTLayout } from "~/widgets/layouts/nft-layout";

interface NFTParams {
  params: Promise<{
    id: string;
  }>;
}

export default async function NFTPage({ params }: NFTParams) {
  const nftId = (await params).id;

  return (
    <NFTLayout>
      <NFTView nftId={nftId} />
    </NFTLayout>
  );
}
