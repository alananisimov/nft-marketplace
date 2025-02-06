import { CollectionView } from "~/features/collection/ui/collection-view";
import { CollectionLayout } from "~/widgets/layouts/collection-layout/index";

interface CollectionPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const collectionId = (await params).id;

  return (
    <CollectionLayout>
      <CollectionView id={collectionId} />
    </CollectionLayout>
  );
}
