import { getPrismaClient } from "./prisma";
import { createDifyDocument, updateDifyDocument, deleteDifyDocument } from "./dify-knowledge";
import { buildFacultyText, buildCoachText, buildProgrammeText, buildResourceTextContent, buildFaqText } from "./dify-doc-builders";

export async function syncFaculty(id: string, action: "create" | "update" | "delete") {
  const prisma = getPrismaClient();
  if (action === "delete") return;

  const faculty = await prisma.faculty.findUnique({ where: { id } });
  if (!faculty) return;

  const text = buildFacultyText(faculty);
  if (faculty.difyDocumentId) {
    try {
      await updateDifyDocument(faculty.difyDocumentId, faculty.name, text);
    } catch (e) {
      const newId = await createDifyDocument(faculty.name, text);
      await prisma.faculty.update({ where: { id }, data: { difyDocumentId: newId } });
    }
  } else {
    const newId = await createDifyDocument(faculty.name, text);
    await prisma.faculty.update({ where: { id }, data: { difyDocumentId: newId } });
  }
}

export async function syncCoach(id: string, action: "create" | "update" | "delete") {
  const prisma = getPrismaClient();
  if (action === "delete") return;

  const coach = await prisma.ascCoach.findUnique({
    where: { id },
    include: { faculty: true },
  });
  if (!coach) return;

  const text = buildCoachText({
    ...coach,
    facultyName: coach.faculty.name,
    facultyCode: coach.faculty.code,
  });

  if (coach.difyDocumentId) {
    try {
      await updateDifyDocument(coach.difyDocumentId, coach.name, text);
    } catch (e) {
      const newId = await createDifyDocument(coach.name, text);
      await prisma.ascCoach.update({ where: { id }, data: { difyDocumentId: newId } });
    }
  } else {
    const newId = await createDifyDocument(coach.name, text);
    await prisma.ascCoach.update({ where: { id }, data: { difyDocumentId: newId } });
  }
}

export async function syncProgramme(id: string, action: "create" | "update" | "delete") {
  const prisma = getPrismaClient();
  if (action === "delete") return;

  const programme = await prisma.programme.findUnique({
    where: { id },
    include: { courseModules: true },
  });
  if (!programme) return;

  const text = buildProgrammeText(programme, programme.courseModules);
  if (programme.difyDocumentId) {
    try {
      await updateDifyDocument(programme.difyDocumentId, programme.programmeName, text);
    } catch (e) {
      const newId = await createDifyDocument(programme.programmeName, text);
      await prisma.programme.update({ where: { id }, data: { difyDocumentId: newId } });
    }
  } else {
    const newId = await createDifyDocument(programme.programmeName, text);
    await prisma.programme.update({ where: { id }, data: { difyDocumentId: newId } });
  }
}

export async function syncCourseModule(id: string, action: "create" | "update" | "delete", programmeId?: string) {
  const prisma = getPrismaClient();
  let progId = programmeId;
  if (!progId) {
    const mod = await prisma.courseModule.findUnique({ where: { id } });
    if (!mod) return;
    progId = mod.programmeId;
  }

  await syncProgramme(progId, "update");
}

export async function syncResource(id: string, action: "create" | "update" | "delete") {
  const prisma = getPrismaClient();
  if (action === "delete") return;

  const resource = await prisma.resource.findUnique({ where: { id } });
  if (!resource) return;

  if (resource.resourceType === "document") return;

  const text = buildResourceTextContent(resource);
  if (resource.difyDocumentId) {
    try {
      await updateDifyDocument(resource.difyDocumentId, resource.title, text);
    } catch (e) {
      const newId = await createDifyDocument(resource.title, text);
      await prisma.resource.update({ where: { id }, data: { difyDocumentId: newId } });
    }
  } else {
    const newId = await createDifyDocument(resource.title, text);
    await prisma.resource.update({ where: { id }, data: { difyDocumentId: newId } });
  }
}

export async function syncFaq(id: string, action: "create" | "update" | "delete") {
  const prisma = getPrismaClient();
  if (action === "delete") return;

  const faq = await prisma.faq.findUnique({ where: { id } });
  if (!faq) return;

  const text = buildFaqText(faq);
  if (faq.difyDocumentId) {
    try {
      await updateDifyDocument(faq.difyDocumentId, faq.question, text);
    } catch (e) {
      const newId = await createDifyDocument(faq.question, text);
      await prisma.faq.update({ where: { id }, data: { difyDocumentId: newId } });
    }
  } else {
    const newId = await createDifyDocument(faq.question, text);
    await prisma.faq.update({ where: { id }, data: { difyDocumentId: newId } });
  }
}
