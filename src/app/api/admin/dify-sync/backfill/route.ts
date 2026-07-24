import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";
import { getDifyDocuments } from "@/lib/dify-knowledge";
import { syncFaculty, syncCoach, syncProgramme, syncResource, syncFaq } from "@/lib/dify-inline-sync";

async function runReconcileAndBackfill() {
  const prisma = getPrismaClient();

  // 1. Fetch Dify documents
  console.log("Fetching Dify documents...");
  const difyDocs = await getDifyDocuments();
  const difyDocsMap = new Map<string, string>(); // name -> documentId
  for (const doc of difyDocs) {
    difyDocsMap.set(doc.name, doc.id);
  }

  // 2. Reconcile Faculties
  const faculties = await prisma.faculty.findMany();
  for (const f of faculties) {
    const docId = difyDocsMap.get(f.name);
    if (docId) {
      await prisma.faculty.update({ where: { id: f.id }, data: { difyDocumentId: docId } });
    }
  }

  // 3. Reconcile Coaches
  const coaches = await prisma.ascCoach.findMany();
  for (const c of coaches) {
    const docId = difyDocsMap.get(c.name);
    if (docId) {
      await prisma.ascCoach.update({ where: { id: c.id }, data: { difyDocumentId: docId } });
    }
  }

  // 4. Reconcile Programmes
  const programmes = await prisma.programme.findMany();
  for (const p of programmes) {
    const docId = difyDocsMap.get(p.programmeName);
    if (docId) {
      await prisma.programme.update({ where: { id: p.id }, data: { difyDocumentId: docId } });
    }
  }

  // 5. Reconcile Resources
  const resources = await prisma.resource.findMany();
  for (const r of resources) {
    const docId = difyDocsMap.get(r.title);
    if (docId) {
      await prisma.resource.update({ where: { id: r.id }, data: { difyDocumentId: docId } });
    }
  }

  // 6. Reconcile FAQs
  const faqs = await prisma.faq.findMany();
  for (const f of faqs) {
    const docId = difyDocsMap.get(f.question);
    if (docId) {
      await prisma.faq.update({ where: { id: f.id }, data: { difyDocumentId: docId } });
    }
  }

  // Now run inline sync for any record that still does not have a difyDocumentId
  console.log("Backfilling missing records to Dify...");
  let syncedCounts = { faculties: 0, coaches: 0, programmes: 0, resources: 0, faqs: 0 };

  // Synced Faculties
  const pendingFaculties = await prisma.faculty.findMany({ where: { difyDocumentId: null } });
  for (const f of pendingFaculties) {
    await syncFaculty(f.id, "create");
    syncedCounts.faculties++;
  }

  // Synced Coaches
  const pendingCoaches = await prisma.ascCoach.findMany({ where: { difyDocumentId: null } });
  for (const c of pendingCoaches) {
    await syncCoach(c.id, "create");
    syncedCounts.coaches++;
  }

  // Synced Programmes
  const pendingProgrammes = await prisma.programme.findMany({ where: { difyDocumentId: null } });
  for (const p of pendingProgrammes) {
    await syncProgramme(p.id, "create");
    syncedCounts.programmes++;
  }

  // Synced Resources
  const pendingResources = await prisma.resource.findMany({ where: { difyDocumentId: null } });
  for (const r of pendingResources) {
    await syncResource(r.id, "create");
    syncedCounts.resources++;
  }

  // Synced FAQs
  const pendingFaqs = await prisma.faq.findMany({ where: { difyDocumentId: null } });
  for (const f of pendingFaqs) {
    await syncFaq(f.id, "create");
    syncedCounts.faqs++;
  }

  return {
    reconciledDifyDocsCount: difyDocs.length,
    backfilled: syncedCounts
  };
}

export async function GET(request: Request) {
  try {
    const results = await runReconcileAndBackfill();
    return NextResponse.json({ ok: true, ...results });
  } catch (error) {
    console.error("GET Backfill/Reconciliation failed:", error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const results = await runReconcileAndBackfill();
    return NextResponse.json({ ok: true, ...results });
  } catch (error) {
    console.error("POST Backfill/Reconciliation failed:", error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
