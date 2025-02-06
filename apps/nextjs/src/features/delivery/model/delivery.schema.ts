import { z } from "zod";

import { DeliveryResponseWithNFT } from "@acme/api/modules/delivery/application/dto";

export const DeliveryFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "It must be valid email",
  }),
  address: z.string().min(2, {
    message: "Address must be at least 2 characters.",
  }),
  additionalAddress: z
    .string()
    .min(2, {
      message: "Address must be at least 2 characters.",
    })
    .optional(),
  state: z.string().min(2, {
    message: "State must be at least 2 characters.",
  }),
  additionalState: z.string().optional(),
  postalCode: z.string().min(1),
  countryCode: z.string().min(1, {
    message: "Country code must be at least 1 character.",
  }),
});

export const DeliveryItemSchema = DeliveryResponseWithNFT;
