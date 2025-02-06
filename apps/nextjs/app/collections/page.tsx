import { CollectionsView } from "~/features/collection/ui/collections-view";
import { CollectionsLayout } from "~/widgets/layouts/collections-layout";

export default function Collections() {
  return (
    <CollectionsLayout>
      <CollectionsView />
    </CollectionsLayout>
  );
}
