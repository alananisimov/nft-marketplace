import type { z } from "zod";

import type { NFTSchema } from "./nft.schema";

export type TNFT = z.infer<typeof NFTSchema>;
