import type { z } from "zod";

import type { RewardSchema } from "./reward.schema";

export type TReward = z.infer<typeof RewardSchema>;
