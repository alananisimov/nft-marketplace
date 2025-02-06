import type { z } from "zod";

import type { VerificationSchema } from "./verification.schema";

export type TVerification = z.infer<typeof VerificationSchema>;
