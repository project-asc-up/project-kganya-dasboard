import assert from "node:assert/strict";
import test from "node:test";

import {
  buildKganyaImportBundle,
  buildMarkdownImport,
  chunkMarkdownBody,
  parseFaqGoldSetCsv,
  parseSourceInventoryCsv,
} from "@/lib/kganya-import";

const markdownSample = `---
title: Registration
slug: registration
category: registration
audience: students and support staff
last_verified: 2026-07-05
source_priority: official
tags: [registration, portal, holds, acceptance]
related_files: [fees.md, student-portal.md, login-and-access.md]
---

# Registration

Status: completed
Last edited: 2026-07-05

## Official answer
UP tells students to register online where possible.
`;

const sourceInventoryCsv = `"id","category","title","url","claim_type","note","verified_date","status","last_edited"
"S001","registration","Registration","https://www.up.ac.za/registration","official support page","Core registration flow","2026-07-05","completed","2026-07-05"`;

const faqGoldSetCsv = `"prompt_id","prompt","expected_category","expected_answer_trait","source","status","last_edited"
"F001","How do I register online at UP?","registration","step-by-step portal guidance","https://www.up.ac.za/registration","completed","2026-07-05"`;

test("buildMarkdownImport keeps the source content and frontmatter", () => {
  const draft = buildMarkdownImport(
    "C:/Users/sewar/repos/Project Kganya/kganya-operating-system/knowledge-base/registration.md",
    markdownSample,
  );

  assert.equal(draft.knowledgeSource.sourceKey, "knowledge-base-registration");
  assert.equal(draft.knowledgeSource.sourceFamily, "registration");
  assert.equal(draft.sourceRecord.recordKey, "document");
  assert.equal(draft.sourceRecord.topic, "registration");
  assert.equal(draft.sourceRecord.title, "Registration");
  assert.equal(draft.sourceRecord.bodyMarkdown?.includes("Official answer"), true);
  assert.equal(draft.documentChunks.length > 0, true);
  assert.equal(draft.chunks.length > 0, true);
});

test("parseSourceInventoryCsv maps the file into a row-level structured import", () => {
  const draft = parseSourceInventoryCsv(
    "C:/Users/sewar/repos/Project Kganya/kganya-operating-system/knowledge-base/source_inventory.csv",
    sourceInventoryCsv,
  );

  assert.equal(draft.knowledgeSource.sourceFamily, "inventory");
  assert.equal(draft.sourceRecords.length, 1);
  assert.equal(draft.sourceRecords[0].recordKey, "s001");
  assert.equal(draft.sourceRecords[0].topic, "registration");
  assert.equal(draft.sourceRecordFields.length > 0, true);
  assert.equal(draft.documentChunks.length > 0, true);
});

test("parseFaqGoldSetCsv maps gold questions into evaluation cases", () => {
  const bundle = parseFaqGoldSetCsv(
    "C:/Users/sewar/repos/Project Kganya/kganya-operating-system/knowledge-base/faq_gold_set.csv",
    faqGoldSetCsv,
  );

  assert.equal(bundle.evaluationSet.name, "FAQ Gold Set");
  assert.equal(bundle.evaluationSet.cases.length, 1);
  assert.equal(bundle.evaluationSet.cases[0].expectedCategory, "registration");
  assert.equal(bundle.evaluationSet.cases[0].promptText, "How do I register online at UP?");
});

test("buildKganyaImportBundle combines markdown and csv sources", () => {
  const bundle = buildKganyaImportBundle([
    {
      path: "C:/Users/sewar/repos/Project Kganya/kganya-operating-system/knowledge-base/registration.md",
      contents: markdownSample,
    },
    {
      path: "C:/Users/sewar/repos/Project Kganya/kganya-operating-system/knowledge-base/source_inventory.csv",
      contents: sourceInventoryCsv,
    },
    {
      path: "C:/Users/sewar/repos/Project Kganya/kganya-operating-system/knowledge-base/faq_gold_set.csv",
      contents: faqGoldSetCsv,
    },
  ]);

  assert.equal(bundle.knowledgeSources.length, 3);
  assert.equal(bundle.sourceRecords.length, 3);
  assert.equal(bundle.sourceRecordFields.length > 0, true);
  assert.equal(bundle.documentChunks.length > 0, true);
  assert.equal(bundle.evaluationSets.length, 1);
  assert.equal(bundle.evaluationSets[0].cases.length, 1);
});

test("chunkMarkdownBody splits markdown on blank lines", () => {
  const chunks = chunkMarkdownBody("One.\n\nTwo.\n\nThree.");
  assert.deepEqual(chunks, ["One.", "Two.", "Three."]);
});
