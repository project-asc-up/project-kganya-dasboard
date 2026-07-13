import test from "node:test";
import assert from "node:assert/strict";

import { resolveDatabaseUrl } from "../src/lib/prisma";

test("development prefers the pooled runtime connection", () => {
  const url = resolveDatabaseUrl({
    NODE_ENV: "development",
    DATABASE_URL: "postgresql://pooler.example/db",
    DATABASE_URL_UNPOOLED: "postgresql://direct.example/db",
  });

  assert.equal(url, "postgresql://pooler.example/db");
});

test("a non-Vercel local process without NODE_ENV prefers the pooled runtime connection", () => {
  const url = resolveDatabaseUrl({
    DATABASE_URL: "postgresql://pooler.example/db",
    DATABASE_URL_UNPOOLED: "postgresql://direct.example/db",
  });

  assert.equal(url, "postgresql://pooler.example/db");
});

test("production keeps the pooled database connection as the primary URL", () => {
  const url = resolveDatabaseUrl({
    NODE_ENV: "production",
    DATABASE_URL: "postgresql://pooler.example/db",
    DATABASE_URL_UNPOOLED: "postgresql://direct.example/db",
  });

  assert.equal(url, "postgresql://pooler.example/db");
});
