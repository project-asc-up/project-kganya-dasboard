import { processPendingDifySyncJobs } from "@/lib/dify-sync";

function getLimit(argv: string[]) {
  const index = argv.indexOf("--limit");
  if (index === -1) return 10;
  const value = Number(argv[index + 1]);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 10;
}

async function main() {
  const limit = getLimit(process.argv.slice(2));
  const results = await processPendingDifySyncJobs(limit);
  const completed = results.filter((result) => result.status === "completed").length;
  const pending = results.filter((result) => result.status === "pending").length;
  const failed = results.filter((result) => result.status === "failed").length;

  console.log(JSON.stringify({ limit, completed, pending, failed, results }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
