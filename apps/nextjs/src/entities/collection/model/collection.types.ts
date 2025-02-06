import type { z } from "zod";

import type { CollectionSchema } from "./collection.schema";

export type TCollection = z.infer<typeof CollectionSchema>;
