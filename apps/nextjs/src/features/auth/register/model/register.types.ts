import type { z } from "zod";

import type { RegisterSchema } from "./register.schema";

export type TRegister = z.infer<typeof RegisterSchema>;
