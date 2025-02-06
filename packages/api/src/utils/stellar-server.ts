import { Horizon } from "@stellar/stellar-sdk";
import { env } from "../env";

function createStellarServer() {
  const config = {
    allowHttp: env.NODE_ENV === "development",
    rejectUnauthorized: env.NODE_ENV === "production",
    retry: {
      maxAttempts: 3,
      baseTimeout: 2000,
    },
  };

  const server = new Horizon.Server(env.STELLAR_HORIZON_URL, config);

  return server;
}

export const server = createStellarServer();
