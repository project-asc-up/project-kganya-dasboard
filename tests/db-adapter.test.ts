import test from "node:test";
import assert from "node:assert/strict";

import {
  createDatabaseAdapter,
  resolveDatabaseTransport,
} from "../src/lib/db-adapter";

test("Neon hosts use the serverless transport instead of blocked raw TCP", () => {
  assert.equal(
    resolveDatabaseTransport(
      "postgresql://user:password@ep-example-pooler.us-east-1.aws.neon.tech/neondb",
    ),
    "neon",
  );
});

test("non-Neon PostgreSQL hosts keep the pg transport", () => {
  assert.equal(
    resolveDatabaseTransport(
      "postgresql://user:password@localhost:5432/project_kganya",
    ),
    "pg",
  );
});

test("Neon transport limits the local pool to one concurrent connection", () => {
  const adapter = createDatabaseAdapter(
    "postgresql://user:password@ep-example-pooler.us-east-1.aws.neon.tech/neondb",
  );

  assert.equal(
    (adapter as unknown as { config: { max?: number } }).config.max,
    1,
  );
});
