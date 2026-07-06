import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function loadEnvFile(filePath: string) {
  if (!existsSync(filePath)) {
    return;
  }

  const content = readFileSync(filePath, "utf8");

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const cleaned = line.startsWith("export ") ? line.slice(7).trim() : line;
    const separatorIndex = cleaned.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = cleaned.slice(0, separatorIndex).trim();
    let value = cleaned.slice(separatorIndex + 1).trim();

    if (!key || process.env[key] !== undefined) {
      continue;
    }

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

export function loadRepoEnv() {
  const repoRoot = process.cwd();
  loadEnvFile(join(repoRoot, ".env.local"));
  loadEnvFile(join(repoRoot, ".env"));
}
