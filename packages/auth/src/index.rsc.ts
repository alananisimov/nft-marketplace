import { cache } from "react";

import { auth as defaultAuth } from "./server";

export * from "./server";
export * from "./types";
export * from "./constants";

export const auth = cache(defaultAuth);
