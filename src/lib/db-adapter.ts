import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { execSync } from "node:child_process";

function isLocalHost(hostname: string) {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1"
  );
}

function resolveHostnameSync(hostname: string): string {
  if (isLocalHost(hostname)) {
    return hostname;
  }

  // Only resolve Neon database hostnames to IPv4 synchronously to avoid IPv6 routing ETIMEDOUT on local dev machines
  if (!hostname.endsWith(".neon.tech")) {
    return hostname;
  }

  try {
    const cmd = `node -e "require('node:dns').resolve4('${hostname}', (err, addrs) => console.log(addrs ? addrs[0] : ''))"`;
    const ip = execSync(cmd, { encoding: "utf8" }).trim();
    if (ip && ip.match(/^\d+\.\d+\.\d+\.\d+$/)) {
      return ip;
    }
  } catch (e) {
    console.error(`[Prisma Database Adapter] Synchronous DNS resolution failed for hostname ${hostname}:`, e);
  }
  return hostname;
}

export function resolveDatabaseTransport(
  connectionString: string,
): "neon" | "pg" {
  const { hostname } = new URL(connectionString);
  return hostname.endsWith(".neon.tech") ? "neon" : "pg";
}

export function createDatabaseAdapter(connectionString: string) {
  const url = new URL(connectionString);
  const originalHostname = url.hostname;

  // Resolve to IPv4 synchronously if it's a Neon hostname
  const resolvedIp = resolveHostnameSync(originalHostname);

  const parsed = new URL(connectionString);
  
  // Remove channel_binding because pg driver doesn't support it
  parsed.searchParams.delete("channel_binding");
  // Remove sslmode from connection string when using an IP to prevent pg from overriding our ssl config
  if (resolvedIp !== originalHostname) {
    parsed.searchParams.delete("sslmode");
    parsed.hostname = resolvedIp;
  }

  if (isLocalHost(parsed.hostname)) {
    parsed.searchParams.delete("sslmode");
  }

  const normalizedConnectionString = parsed.toString();

  // Create pg pool
  const pool = new pg.Pool({
    connectionString: normalizedConnectionString,
    ssl: resolvedIp !== originalHostname ? {
      servername: originalHostname,
    } : undefined
  });

  return new PrismaPg(pool);
}
