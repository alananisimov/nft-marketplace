import { H2 } from "@acme/ui/typography";

import { BackButton } from "~/shared/ui/back-button";

export function CollectionsHeader() {
  return (
    <div className="flex flex-row gap-x-4">
      <BackButton />
      <H2>Collections</H2>
    </div>
  );
}
