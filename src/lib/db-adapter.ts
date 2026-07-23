import { neonConfig, Pool } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

function isLocalHost(hostname: string) {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1"
  );
}

function normalizeConnectionString(connectionString: string) {
  const url = new URL(connectionString);

  if (isLocalHost(url.hostname)) {
    url.searchParams.delete("sslmode");
  }

  // pg driver does not support channel_binding
  url.searchParams.delete("channel_binding");

  return url.toString();
}

export function resolveDatabaseTransport(
  connectionString: string,
): "neon" | "pg" {
  const { hostname } = new URL(connectionString);

  return hostname.endsWith(".neon.tech") ? "neon" : "pg";
}

export function createDatabaseAdapter(connectionString: string) {
  const normalizedConnectionString = normalizeConnectionString(connectionString);

  if (resolveDatabaseTransport(normalizedConnectionString) === "neon") {
    const pool = new Pool({ connectionString: normalizedConnectionString });
    return new PrismaNeon(pool);
  }

  return new PrismaPg({ connectionString: normalizedConnectionString });
}
