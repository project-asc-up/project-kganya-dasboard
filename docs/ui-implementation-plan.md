# Project ASC UI Implementation Plan

## Purpose

This document turns the existing project docs into a practical UI plan for the Next.js admin app.

It uses three inputs:

1. `design.md` for the University of Pretoria visual language.
2. The engineering notes for app structure, admin CRUD, and runtime boundaries.
3. `prisma/schema.prisma` for the exact fields the database expects.

The goal is to build an admin interface that is:

- fast to understand
- easy to operate for non-technical editors
- visually aligned with UP branding
- safe for structured data entry
- scalable enough to support future bot/runtime features

---

## 1. Project Understanding

### Current repo shape

The repository currently contains:

- a Next.js 16 App Router app
- a basic home page
- a `/api/health` endpoint
- a Prisma schema for the core content models
- seed data and import scripts
- supporting documentation for design, database, and engineering decisions

### Product direction

This is not a public marketing site. It is an internal content administration workspace for:

- faculties
- ASC coaches
- programmes
- course modules
- resources
- FAQs

The admin UI should make it simple to:

- create and edit records
- review linked relationships
- verify and update source information
- search and filter large datasets
- deactivate or correct stale entries safely
- keep the database aligned with public UP information

---

## 2. Design Direction

### Visual system to follow

Use the UP identity from `design.md` as the base system:

- Primary blue: `#003B7A`
- Accent red: `#C8102E`
- Ochre: `#C77B2E`
- Footer/dark navy: `#002050`
- White and light grey surfaces
- Clean sans-serif body text
- Serif display style only for selective hero or highlight moments

### How the design should feel

For an internal admin tool, the UI should be:

- authoritative
- calm
- structured
- information-dense without feeling cramped
- polished but not decorative

### Adaptation for admin work

The public-site patterns in `design.md` should be translated into an admin-friendly system:

- keep the blue/navy identity
- use white card surfaces and light grey section backgrounds
- use ochre for subtle emphasis, field markers, and active chips
- use red only for destructive actions, validation errors, and urgent alerts
- prioritize readability over large imagery

### Layout principles

- fixed top application bar
- left navigation for entity sections
- content area with strong page headings
- filter and action row at the top of every list page
- card or table-based data presentation depending on density
- side drawer or modal for create/edit flows
- sticky form actions on long edit screens

---

## 3. Information Architecture

### Primary navigation

1. Dashboard
2. Faculties
3. ASC Coaches
4. Programmes
5. Course Modules
6. Resources
7. FAQs
8. Health and Sync

### Secondary utilities

- global search
- quick add
- seed/import status
- last sync indicator
- user account menu

### Recommended route structure

- `/admin`
- `/admin/faculties`
- `/admin/faculties/[id]`
- `/admin/coaches`
- `/admin/coaches/[id]`
- `/admin/programmes`
- `/admin/programmes/[id]`
- `/admin/course-modules`
- `/admin/course-modules/[id]`
- `/admin/resources`
- `/admin/resources/[id]`
- `/admin/faqs`
- `/admin/faqs/[id]`
- `/admin/health`
- `/admin/imports`

---

## 4. Core UX Patterns

### Global shell

The app shell should include:

- UP-branded top bar
- compact logo area
- left sidebar navigation
- content header with breadcrumbs
- persistent search
- user/session controls

### List page pattern

Every CRUD list page should follow the same structure:

- page title and short helper text
- primary action button: `Add new ...`
- filter row
- sortable table or responsive cards
- row actions: view, edit, deactivate/delete
- pagination or infinite loading depending on dataset size
- bulk actions where appropriate

### Detail page pattern

Each entity detail view should provide:

- summary header
- key metadata chips
- linked relations
- verification status
- source information
- edit action
- delete/deactivate action

### Create/edit pattern

Use a side drawer for quick edits and a full page for long or complex forms.

Recommended interaction:

- create opens in a full-height drawer on desktop
- long forms use sectioned layout with sticky save controls
- destructive actions require confirmation
- validation happens inline and on submit

### Feedback system

Provide consistent UI states:

- success toast
- validation state
- empty state
- loading skeleton
- retry state
- permission denied state
- not-found state

---

## 5. Schema-to-UI Mapping

The UI should be designed around the actual Prisma schema, not the simplified draft model.

### Faculties

Database fields:

- `name`
- `code`
- `codeStatus`
- `officialPageUrl`
- `supportPageUrl`
- `sourceUrl`
- `lastVerified`
- `notes`
- `aliases`

UI needs:

- faculty directory table
- badge for code status
- alias preview
- link previews for official/support pages
- source and verification metadata
- notes field for editorial context

### ASC Coaches

Database fields:

- `facultyId`
- `name`
- `titleRole`
- `email`
- `phone`
- `cell`
- `officeLocation`
- `building`
- `appointmentLink`
- `level`
- `cluster`
- `responsibilities`
- `isActive`
- `sourceUrl`
- `lastVerified`
- `verificationStatus`
- `notes`

UI needs:

- faculty-linked roster view
- active/inactive toggle
- email and phone validation
- level selector
- office and building fields grouped together
- responsibilities as a multi-line field
- verification badge

### Programmes

Database fields:

- `facultyId`
- `sourceFacultyCode`
- `programmeCode`
- `programmeName`
- `degreeName`
- `academicLevel`
- `qualificationType`
- `programmeCredits`
- `durationYears`
- `yearLevels`
- `sourceFile`
- `lastVerified`
- `notes`

UI needs:

- faculty-linked programme list
- code search
- degree/qualification metadata
- year level presentation
- curriculum provenance reference
- note field for editorial context

### Course Modules

Database fields:

- `programmeId`
- `facultyCode`
- `sourceFacultyCode`
- `programmeCode`
- `programmeName`
- `yearLevelRaw`
- `yearLevelSort`
- `moduleCode`
- `moduleName`
- `moduleType`
- `moduleUnits`
- `sourceFile`
- `lastVerified`
- `notes`

UI needs:

- nested table under programme detail
- module code search
- year grouping and sort logic
- module unit display
- module type tags
- imported source file reference

### Resources

Database fields:

- `seedKey`
- `facultyId`
- `category`
- `title`
- `description`
- `url`
- `sourceUrl`
- `lastVerified`
- `notes`

UI needs:

- category filters
- general vs faculty-specific toggle
- rich URL preview
- optional description preview
- verification metadata
- seed key display in advanced mode

### FAQs

Database fields:

- `seedKey`
- `facultyId`
- `question`
- `answer`
- `category`
- `priority`
- `sourceUrl`
- `lastVerified`
- `notes`

UI needs:

- searchable Q&A list
- accordion preview in the table or detail page
- priority sorting
- category filtering
- faculty association filter

---

## 6. Page-by-Page UX Plan

### 6.1 Dashboard

Purpose:

- give editors a quick operational overview

Content:

- total records by entity
- records needing review
- inactive coaches
- recent edits
- missing verification dates
- import/health status

Components:

- metric cards
- recent activity timeline
- "needs attention" panel
- quick actions panel
- search shortcut

Visual treatment:

- navy hero strip or header block
- white cards
- small ochre accent bars
- red only for warnings

### 6.2 Faculties

Purpose:

- manage the master faculty directory

List view:

- faculty name and code
- code status badge
- official/support URLs
- last verified date
- row actions

Detail view:

- summary header
- aliases
- source information
- linked coaches
- linked programmes
- linked resources and FAQs

Form:

- name
- code
- code status
- official/support URLs
- source URL
- last verified date
- aliases
- notes

Design notes:

- code should be shown as a strong visual badge
- aliases should appear as compact chips
- linked counts should help editors see impact before editing

### 6.3 ASC Coaches

Purpose:

- manage faculty coach assignments and contacts

List view:

- coach name
- faculty
- level
- active status
- email
- phone/cell
- verification status

Form:

- faculty selector
- name
- title/role
- email
- phone
- cell
- office location
- building
- appointment link
- level
- cluster
- responsibilities
- active toggle
- source URL
- last verified
- verification status
- notes

UX rules:

- require faculty selection before saving
- visually separate contact, location, and verification sections
- mark active/inactive clearly with color and text

### 6.4 Programmes

Purpose:

- manage degree/programme records by faculty

List view:

- programme code
- programme name
- faculty
- qualification type
- duration
- credits
- last verified

Detail view:

- programme summary
- linked course modules
- source file / provenance
- notes

Form:

- faculty
- source faculty code
- programme code
- programme name
- degree name
- academic level
- qualification type
- credits
- duration years
- year levels
- source file
- last verified
- notes

UX rules:

- make programme code prominent
- support large data entry with grouped sections
- show curriculum provenance near the top

### 6.5 Course Modules

Purpose:

- manage the curriculum-level modules linked to programmes

List view:

- module code
- module name
- programme
- year level
- module type
- units
- source file

Detail view:

- module metadata
- programme relation
- year sort and raw year label
- notes

Form:

- programme
- faculty code
- source faculty code
- programme code
- programme name
- year level raw
- year level sort
- module code
- module name
- module type
- module units
- source file
- last verified
- notes

UX rules:

- group by programme and year
- provide a compact bulk-edit path if the dataset is large
- make sorting logic visible to editors to avoid incorrect ordering

### 6.6 Resources

Purpose:

- manage support resources surfaced to students and bots

List view:

- title
- category
- faculty scope
- URL
- last verified

Form:

- seed key
- faculty scope or general
- category
- title
- description
- URL
- source URL
- last verified
- notes

UX rules:

- allow quick filtering by general vs faculty-specific
- make external links easy to inspect and copy
- display the public resource source clearly

### 6.7 FAQs

Purpose:

- manage short-answer content used in support flows

List view:

- question
- category
- faculty scope
- priority
- last verified

Form:

- seed key
- faculty scope or general
- question
- answer
- category
- priority
- source URL
- last verified
- notes

UX rules:

- use an accordion or expandable row for answer preview
- make priority easy to adjust
- keep answers readable in a wide editor

### 6.8 Health and Sync

Purpose:

- give admins confidence that data and imports are healthy

Content:

- database connection status
- record counts by table
- last import timestamp
- validation warnings
- missing sources or verification dates

Tools:

- run health check
- trigger revalidation
- review import logs
- open seed/import instructions

---

## 7. Form Design Standards

### Section layout

Use sectioned forms with clear grouping:

- identity
- relationship
- contact
- academic metadata
- source and verification
- notes

### Field behavior

- required fields marked clearly
- optional fields visually de-emphasized
- select inputs for enums
- URL fields with validation and external-link affordance
- date inputs formatted consistently
- multiline fields sized for real content

### Validation strategy

- inline validation for required fields
- schema-aware error messages
- save disabled until minimum required data is valid
- summary error banner at top of form when needed

### Relationship handling

- use searchable dropdowns for foreign keys
- show related entity metadata in the picker
- avoid raw UUID exposure in the form UI
- if a faculty is selected, pre-filter related programme and coach options

---

## 8. Visual System for the Admin App

### Color usage

- primary blue for nav, page headers, primary buttons
- ochre for active chips, section dividers, and emphasis
- red for destructive actions and error state
- grey for metadata and secondary text

### Typography usage

- use sans-serif for almost everything in the admin app
- use the serif display style only for a landing hero or brand banner if needed
- maintain a clear type hierarchy:
  - page title
  - section title
  - table labels
  - body text
  - metadata

### Components

- cards with soft borders and subtle shadow
- compact badges for status fields
- clearly labeled buttons
- tabular data with strong row spacing
- drawers or modals with sticky action bars

### Motion and interaction

- subtle transitions only
- no flashy animation
- fast feedback for save/delete actions
- respect `prefers-reduced-motion`

### Accessibility

- 4.5:1 contrast minimum
- keyboard navigable menus
- visible focus ring
- semantic headings
- screen-reader labels for icon buttons
- descriptive empty states

---

## 9. Phase Implementation Plan

## Phase 0: Discovery and Structure Alignment

Goal:

- confirm the UI plan against the actual data model and repo structure

Deliverables:

- final page inventory
- field mapping document
- navigation map
- design token inventory
- CRUD interaction rules

Exit criteria:

- each schema model has a defined UI surface
- each screen has a clear create/edit/list/detail pattern
- the current repo routes are understood

## Phase 1: Design System and App Shell

Goal:

- establish the visual and interaction foundation

Deliverables:

- UP-branded theme tokens in CSS
- layout shell
- navigation sidebar
- top bar
- breadcrumbs
- button styles
- form styles
- badges and alert states
- loading and empty-state components

Exit criteria:

- the app feels like one coherent product
- pages can be added without inventing new styles

## Phase 2: Core Master Data CRUD

Goal:

- ship the highest-value content management screens first

Deliverables:

- faculties CRUD
- ASC coaches CRUD
- programmes CRUD
- list filtering and search
- detail pages with linked counts

Why this comes first:

- these are the foundational tables
- the rest of the content depends on them
- they have the strongest relationship structure

Exit criteria:

- editors can fully manage faculty, coach, and programme data
- validation and relationship selection work reliably

## Phase 3: Curriculum and Content Libraries

Goal:

- support the larger content tables and support content used by the bot

Deliverables:

- course modules CRUD
- resources CRUD
- FAQs CRUD
- faculty-linked filtering
- priority sorting for FAQs
- better search and pagination for high-volume tables

Exit criteria:

- all remaining schema tables are editable
- content can be filtered by faculty, category, and status

## Phase 4: Operational and Verification Tools

Goal:

- make the admin tool trustworthy for ongoing maintenance

Deliverables:

- health dashboard
- record count overview
- missing verification flags
- source URL visibility
- import status view
- quick revalidation actions
- inactive record management

Exit criteria:

- editors can see stale data quickly
- the app supports safe maintenance and auditability

## Phase 5: UX Refinement and Accessibility Hardening

Goal:

- polish the experience so it is fast, clear, and accessible

Deliverables:

- keyboard navigation improvements
- better empty states
- better loading states
- better success/error feedback
- responsive refinements
- table density tuning
- mobile-safe drawers and forms
- accessible labels and focus states

Exit criteria:

- the interface is usable on desktop and tablet
- important actions are reachable with keyboard only
- visual hierarchy is clear in all major screens

## Phase 6: Launch Readiness

Goal:

- prepare the system for active editorial use

Deliverables:

- smoke test checklist
- QA on CRUD flows
- seed data verification
- permission checks
- production readiness review
- content update workflow notes

Exit criteria:

- the team can confidently create, edit, verify, and maintain data

---

## 10. Recommended Build Order

If the team wants the most efficient path, build in this order:

1. App shell and design system
2. Faculties CRUD
3. ASC Coaches CRUD
4. Programmes CRUD
5. Course Modules CRUD
6. Resources CRUD
7. FAQs CRUD
8. Health and sync dashboard
9. Accessibility and polish pass

This order reduces rework because every later screen depends on the shared shell, shared forms, and shared relationship selectors.

---

## 11. Key UX Decisions To Keep

- Use UP blue as the dominant brand color.
- Keep the interface clean and institutional, not playful.
- Make relationships obvious in the UI.
- Put verification and source metadata close to the content.
- Use drawers/modals for quick edits, full pages for complex forms.
- Prefer searchable selects over free-text where the database expects linked records.
- Show counts, status, and freshness everywhere editors make decisions.

---

## 12. Future Extensions

After the MVP is stable, consider adding:

- bot knowledge management
- audit history
- change comparison
- bulk import/export tools
- alias management for faculty and programme matching
- role-based permissions beyond basic admin access
