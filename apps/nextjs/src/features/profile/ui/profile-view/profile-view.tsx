import type { ComponentProps } from "react";
import { Suspense } from "react";

import { cn } from "@acme/ui";
import { H2 } from "@acme/ui/typography";

import { DeliveryFlow } from "~/features/delivery/ui/delivery-flow";
import { DeliverySkeleton } from "~/features/delivery/ui/delivery-flow/skeleton";
import { dmSans } from "~/fonts/dm-sans";
import { ProfileTabs } from "../profile-tabs";

type ProfileProps = ComponentProps<"div">;

export function ProfileView(props: ProfileProps) {
  return (
    <div
      className={cn("flex flex-col gap-y-[36px]", props.className)}
      {...props}
    >
      <ProfileTabs />
      <div className="mt-4 flex flex-col gap-y-3">
        <H2 className={dmSans.className}>Delivery</H2>
        <Suspense fallback={<DeliverySkeleton />}>
          <DeliveryFlow />
        </Suspense>
      </div>
    </div>
  );
}
