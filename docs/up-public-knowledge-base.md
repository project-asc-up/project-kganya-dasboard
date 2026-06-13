# UP Public Knowledge Base Seed

Last verified: 2026-06-13

## Purpose

This document consolidates public University of Pretoria source material into a database-ready seed set for the ASC MVP. It is intended to support:

- Neon table design and seeding
- Admin UI CRUD scope
- Bot runtime routing and response composition

## What The Source Documents Define

The local Notion exports and README establish a clear MVP boundary:

- Route a student to the correct Academic Success Coach by faculty, with programme/year disambiguation later if needed.
- Return structured coach contact details.
- Return 1-3 relevant resources and concise FAQ answers.
- Keep Neon as the source of truth, with Next.js API between the database, admin UI, and Botpress.

## Public Source Set Used

- General ASC overview:
  [https://www.up.ac.za/teaching-and-learning/academic-success-coaches](https://www.up.ac.za/teaching-and-learning/academic-success-coaches)
- EBIT support service:
  [https://www.up.ac.za/teaching-and-learning/ebit-support-service](https://www.up.ac.za/teaching-and-learning/ebit-support-service)
- EBIT ASC landing page:
  [https://www.up.ac.za/ebit-academic-success-coaches](https://www.up.ac.za/ebit-academic-success-coaches)
- EMS support service:
  [https://www.up.ac.za/teaching-and-learning/ems-support-service](https://www.up.ac.za/teaching-and-learning/ems-support-service)
- EMS ASC page:
  [https://www.up.ac.za/faculty-of-economic-and-management-sciences/academic-success-coaches-ascs](https://www.up.ac.za/faculty-of-economic-and-management-sciences/academic-success-coaches-ascs)
- EMS office page:
  [https://www.up.ac.za/faculty-of-economic-and-management-sciences/office-of-dean](https://www.up.ac.za/faculty-of-economic-and-management-sciences/office-of-dean)
- NAS support service:
  [https://www.up.ac.za/teaching-and-learning/nas-support-services](https://www.up.ac.za/teaching-and-learning/nas-support-services)
- Humanities ASC page:
  [https://www.up.ac.za/faculty-of-humanities/academic-success-coaches](https://www.up.ac.za/faculty-of-humanities/academic-success-coaches)
- Humanities office page:
  [https://www.up.ac.za/faculty-of-humanities/office-of-dean](https://www.up.ac.za/faculty-of-humanities/office-of-dean)
- Health Sciences support service:
  [https://www.up.ac.za/teaching-and-learning/health-sciences-support-service](https://www.up.ac.za/teaching-and-learning/health-sciences-support-service)
- Health Sciences ASC page:
  [https://www.up.ac.za/faculty-of-health-sciences/academic-success-coaches](https://www.up.ac.za/faculty-of-health-sciences/academic-success-coaches)
- Theology and Religion support service:
  [https://www.up.ac.za/teaching-and-learning/theology-religion-support-service](https://www.up.ac.za/teaching-and-learning/theology-religion-support-service)
- Education support service:
  [https://www.up.ac.za/teaching-and-learning/education-support-service](https://www.up.ac.za/teaching-and-learning/education-support-service)
- Veterinary Science support service:
  [https://www.up.ac.za/teaching-and-learning/veterinary-science-support-service](https://www.up.ac.za/teaching-and-learning/veterinary-science-support-service)
- Faculty of Law ASC page:
  [https://www.up.ac.za/faculty-of-law/academic-success-coaches](https://www.up.ac.za/faculty-of-law/academic-success-coaches)

## Supported Faculties In Scope

- Engineering, Built Environment and Information Technology
- Economic and Management Sciences
- Natural and Agricultural Sciences
- Humanities
- Health Sciences
- Gordon Institute of Business Science
- Theology and Religion
- Education
- Veterinary Science
- Law

## Extraction Outcome

- Faculties captured: 10
- ASC records prepared: 30
- Programmes prepared: 262
- Course-module rows prepared: 14,643
- Resource records prepared: 9
- FAQ records prepared: 6

## Seed Files Ready

- `docs/seed-faculties.csv`
- `docs/seed-asc-coaches.csv`
- `docs/seed-programmes.csv`
- `docs/seed-course-modules.csv`
- `docs/seed-resources.csv`
- `docs/seed-faqs.csv`

## Curriculum Mapping Rules Used

- Source faculty codes were normalized as follows:
  - `SCI -> NAS`
  - `MED -> FHS`
  - `THEO -> THR`
  - `GIBS -> GIBS`
- `programme_code` was kept as the canonical identifier because visible programme names repeat across multiple codes.
- `module_name` is intentionally blank in the seed because the source CSV only provides module codes.
- In `seed-course-modules.csv`, `year_level_sort` resolves `FIN` to the programme's computed final-year number rather than using a sentinel value.

## Important Data Quality Notes

- EMS has live source inconsistencies.
  - The support service page lists `Ncumisa November` with email `zukiswa.november@up.ac.za`.
  - The EMS office page lists `Ncumisa Zukiswa November` with the same email.
  - The support service page lists `Lesedi Mosime` with email `otsile.mosime@up.ac.za`.
  - The EMS office page lists `Otsile Mosime` with that email.
  - For seed purposes, the email-owning names were preferred and the conflicts are preserved in the CSV notes.
- Law has source drift between the Teaching and Learning support page and the Faculty of Law page.
  - The faculty page was treated as the more current authority for coach roster.
- Health Sciences has richer contact details on the faculty page than on the Teaching and Learning support page.
  - The merged seed uses the support page for current roster and the faculty page for deeper contact detail where available.
- Curriculum data is structurally denormalized.
  - `University_of_Pretoria_Curriculumn_Data.csv` is a row-per-programme-year-module extract, not a programme master list.
  - Multiple `programme_code` values can share the same visible programme name.
  - Treat `programme_code` as the unique programme key in the database.
  - Treat module rows as offerings attached to a programme and year marker.
- Programme duration cannot be treated as fully authoritative from the curriculum CSV alone.
  - The generated seed stores `year_levels` for each programme and a derived `duration_years`.
  - `duration_years` is calculated as the count of distinct `Prog Year` markers per unique `programme_code`.
  - `FIN` is treated as the final-year marker and counts as a programme year for this dataset.
- Faculty short codes in `docs/seed-faculties.csv` are internal routing codes where the official public code was not explicit on the inspected page.
  - `EBIT`, `EMS`, and `NAS` are publicly evident.
  - `HUM`, `FHS`, `EDU`, `LAW`, `THR`, and `VET` should be treated as internal canonical codes unless later verified from UP material.
  - `GIBS` is publicly evident from UP programme and business-school pages.

## Recommendation Before Seeding Neon

- Seed `faculties`, `asc_coaches`, `programmes`, `courses_modules`, `resources`, and `faqs`.
- Add `source_url`, `last_verified`, and `verification_notes` columns or metadata support in the admin layer.
- Keep one coach record per unique email. This avoids duplicating the EMS name mismatch records.
- Keep `programme_code` unique and do not deduplicate programmes by visible name alone.
- Keep `module_name` nullable for now; the source CSV only provides module codes.

## Next Build Step

Use the CSVs in `docs/` as the first seed dataset, then scaffold the Next.js + Prisma + Neon project around `faculties`, `asc_coaches`, `programmes`, `courses_modules`, `resources`, and `faqs`.
