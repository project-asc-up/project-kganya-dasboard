import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { MetricCard } from "@/components/metric-card";
import { getCoachDirectoryStats } from "@/components/coach-directory";

test("MetricCard renders overflow-safe, balanced markup", () => {
  const html = renderToStaticMarkup(
    <MetricCard
      label="A very long metric label that should wrap instead of clipping"
      value={1234567}
      detail="A long supporting description that must remain readable at common zoom levels."
      meta={<span>Meta</span>}
      compact
    />,
  );

  assert.match(html, /break-words/);
  assert.match(html, /tabular-nums/);
  assert.match(html, /Meta/);
  assert.match(html, /rounded-\[1\.5rem\]/);
});

test("CoachDirectory removes the search tips panel", () => {
  const source = readFileSync(join(process.cwd(), "src/components/coach-directory.tsx"), "utf8");

  assert.doesNotMatch(source, /Search tips/);
  assert.doesNotMatch(source, /Type to jump faster/);
  assert.doesNotMatch(source, /Quick checks/);
});

test("CoachDirectory uses wider metric cards for coach stats", () => {
  const source = readFileSync(join(process.cwd(), "src/components/coach-directory.tsx"), "utf8");

  assert.doesNotMatch(source, /xl:grid-cols-4/);
  assert.match(source, /minmax\(14rem,1fr\)/);
});

test("CoachDirectory metrics can be calculated from a selected faculty dataset", () => {
  const stats = getCoachDirectoryStats([
    { isActive: true, verificationStatus: "verified-single-source", phone: "012", cell: null },
    { isActive: false, verificationStatus: "needs-review", phone: null, cell: "082" },
  ]);

  assert.deepEqual(stats, {
    active: 1,
    inactive: 1,
    verified: 1,
    withPhone: 2,
  });
});

test("CoachDirectory marks filter tabs as pressed for active-state feedback", () => {
  const source = readFileSync(join(process.cwd(), "src/components/coach-directory.tsx"), "utf8");

  assert.match(source, /aria-pressed=\{statusFilter === item\.key\}/);
  assert.match(source, /aria-pressed=\{facultyFilter === "all"\}/);
  assert.match(source, /aria-pressed=\{facultyFilter === faculty\.id\}/);
});
