import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { PgQueryResultHKT, PgTransaction } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/node-postgres";

import { env } from "../env";
import * as schema from "./schema";

export const db = drizzle(env.POSTGRES_URL, { schema, casing: "snake_case" });

type Transaction = PgTransaction<
  PgQueryResultHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;

export type { Transaction };
