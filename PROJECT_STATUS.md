# Project ASC: Current Status & Recent Updates
**Date**: July 13, 2026
**Status**: Transitioning to Kganya Operating System Model

## 1. Authentication & Security
*   **Clerk Integration**: Authentication is now handled entirely through Clerk.
*   **Login Page**: Redundant "Continue with Google" and "or use your Clerk account" text removed.
*   **RBAC**: Role-based access control is active, governing visibility and actions across the admin portal.

## 2. Admin Portal Updates
### Faculties, Programmes, & Course Modules
*   **Creation Restricted**: The "Create" buttons have been removed from these pages to focus on source-driven ingestion rather than manual entry.
*   **Structural Fixes**: Corrected syntax errors (e.g., unclosed components) in the Faculties page.

### ASC Coaches & FAQs
*   **UX Improvements**: Added a `ClientActionButton` component to handle form submission states.
*   **Loading Indicators**: Buttons now display "Creating..." or "Saving Changes..." and are disabled during processing.
*   **Success Redirects**: Both Coaches and FAQs now automatically redirect to their respective list pages (`/admin/coaches` and `/admin/faqs`) upon successful creation or update.

## 3. Data & Ingestion
*   **Resource Management**: Fixed `PrismaClientValidationError` in `getResourceRowsCached` by removing invalid fields (`resourceType`, etc.) that were out of sync with the generated client.
*   **Upload UX**: Fixed a React console error in `CreateResourceDocumentModal` by removing the redundant `encType="multipart/form-data"` from the form when using a server action.
*   **Database**: Connecting to Neon Postgres via Prisma 7.

## 4. Immediate Technical Priorities
*   Consolidate tenant identity around Clerk Organizations (`organization_id`).
*   Align database schema with the Kganya source-record and derived-chunk model.
*   Implement ingestion job visibility and approval workflows.
