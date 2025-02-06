import type { z } from "zod";

import type { CollectionSchema } from "~/entities/collection/model/collection.schema";

export type Collection = z.infer<typeof CollectionSchema>;
