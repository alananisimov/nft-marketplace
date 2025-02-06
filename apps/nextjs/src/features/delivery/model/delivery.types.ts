import type { z } from "zod";

import type { DeliveryFormSchema, DeliveryItemSchema } from "./delivery.schema";

export type TDeliveryForm = z.infer<typeof DeliveryFormSchema>;

export type TDeliveryItem = z.infer<typeof DeliveryItemSchema>;
