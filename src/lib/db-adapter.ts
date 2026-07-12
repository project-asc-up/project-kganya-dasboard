import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";

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
    return new PrismaNeon({
      connectionString: normalizedConnectionString,
      max: 1,
    });
  }

  return new PrismaPg({ connectionString: normalizedConnectionString });
}
