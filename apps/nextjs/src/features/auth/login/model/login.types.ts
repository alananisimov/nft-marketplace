import type { z } from "zod";

import type { LoginSchema } from "./login.schema";

export type TLogin = z.infer<typeof LoginSchema>;
