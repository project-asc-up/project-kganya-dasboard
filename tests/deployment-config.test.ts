import test from "node:test";
import assert from "node:assert/strict";

import { deploymentConfig } from "@/lib/deployment-config";

function withEnv<T>(env: NodeJS.ProcessEnv, callback: () => T) {
  const previous = {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_GIT_COMMIT_REF: process.env.VERCEL_GIT_COMMIT_REF,
    VERCEL_URL: process.env.VERCEL_URL,
  };

  Object.assign(process.env, env);

  try {
    return callback();
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

test("deployment config allows production deployments from main", () => {
  withEnv(
    {
      NODE_ENV: "production",
      VERCEL_ENV: "production",
      VERCEL_GIT_COMMIT_REF: "main",
      VERCEL_URL: "project-asc.vercel.app",
    },
    () => {
      assert.equal(deploymentConfig.isDeploymentAllowed(), true);
      assert.doesNotThrow(() => deploymentConfig.validateDeployment());
    },
  );
});

test("deployment config still allows preview branch deployments", () => {
  withEnv(
    {
      NODE_ENV: "production",
      VERCEL_ENV: "preview",
      VERCEL_GIT_COMMIT_REF: "feature/my-change",
      VERCEL_URL: "project-asc-git-feature-my-change.vercel.app",
    },
    () => {
      assert.equal(deploymentConfig.isDeploymentAllowed(), true);
      assert.equal(deploymentConfig.getEnvironment(), "preview");
    },
  );
});
