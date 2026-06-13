# Engineering & Technical Documentation

## Architecture (end-to-end)

### Core components

- **Neon Postgres (source of truth)**
    
    Stores all factual content the bot returns: faculties, ASC coaches, programmes, resources, FAQs, and bot knowledge.
    
- **Next.js Admin UI (Vercel + Clerk)**
    
    Internal tool for the dev team to manage the Neon DB via authenticated CRUD operations.
    
- **Next.js API (same deployment)**
    
    The single API surface used by:
    
    - the Admin UI (CRUD + admin queries)
    - Botpress (read-only “runtime” queries for conversations)
- **Botpress Studio**
    
    Orchestrates conversation flow and calls the Next.js API to retrieve matching coaches/resources/FAQs.
    

### Data flow (high level)

1. **Content ingestion**
    - Team extracts public UP info into Notion Knowledge Base (optional staging)
    - Team seeds Neon and keeps it updated via Admin UI
2. **Runtime bot query**
    - Student provides faculty/programme/year (as needed)
    - Botpress calls **Next.js API runtime endpoints**
    - API queries Neon, applies matching logic, returns structured JSON
    - Botpress formats a human-friendly response with tone rules

---

## Relationships & connections (DB ↔ API ↔ UI ↔ Bot)

### Neon DB relationships (MVP)

- `faculties (1) → (many) asc_coaches`
- `faculties (1) → (many) programmes`
- `programmes (1) → (many) courses_modules` (optional)
- `faculties (0/1) → (many) resources` (resources can be general)
- `faculties (0/1) → (many) faqs` (FAQs can be general)

### Service boundaries (important design rule)

- **Admin UI never talks directly to Neon** from the browser.
- **All DB access goes through the Next.js API layer**, which enforces:
    - authentication (Clerk)
    - authorization (admin-only routes)
    - input validation
    - rate limits (optional)
    - consistent query/matching logic

---

## API design principles (efficient + scalable)

### Split endpoints by use-case

- **Admin endpoints** (CRUD): require Clerk session + admin role.
- **Runtime endpoints** (Botpress): read-only, fast, stable response shape.

### Efficiency tactics

- Use indexed lookups:
    - `asc_coaches.faculty_id`
    - `faculties.code` (unique)
    - optional: `faculties.aliases` in a separate table or JSONB column
- Prefer **1 aggregated runtime call** per student query:
    - `GET /api/runtime/coach-assignment?faculty=...&programme=...`
- Cache aggressively (safe, public-ish content):
    - Server-side cache (e.g., `stale-while-revalidate`)
    - Short TTL for frequently accessed “assignment” endpoint
- Return **minimal payloads** for runtime responses (only what Botpress needs)

### Matching strategy (faculty/programme)

- Normalize user input:
    - trim, lowercase, remove punctuation
- Match priority:
    1. exact `faculty.code`
    2. exact faculty name
    3. alias match (optional, recommended)
    4. fuzzy/contains match (fallback)
- If multiple matches: return `needs_clarification: true` + candidate faculties.

---

## Authentication & security

### Admin UI + Admin API

- Clerk authentication required for all `/api/admin/*`
- Authorization options:
    - simplest MVP: allowlist by email domain or explicit list of emails
    - scalable: Clerk organizations/roles, check `publicMetadata.role = "admin"`

### Botpress runtime access

- Use a **separate API key** for Botpress runtime calls:
    - Botpress sends `Authorization: Bearer <BOTPRESS_API_KEY>`
    - Next.js validates against a secret env var
- Rate-limit runtime endpoints to reduce abuse.

---

## Endpoints (by service)

## 1) Next.js API (Admin: CRUD)

Base: `/api/admin`

### Faculties

- `GET /api/admin/faculties`
    - list faculties (supports pagination + search)
- `POST /api/admin/faculties`
    - create faculty
- `GET /api/admin/faculties/:id`
- `PATCH /api/admin/faculties/:id`
- `DELETE /api/admin/faculties/:id` (optional; prefer soft-delete via `is_active` if added)

Recommended fields for request/response:

- `name`, `code`, `description`, `official_page_url`, `undergrad_focus_areas`, `postgrad_focus_areas`

### ASC Coaches

- `GET /api/admin/coaches?facultyId=...`
- `POST /api/admin/coaches`
- `GET /api/admin/coaches/:id`
- `PATCH /api/admin/coaches/:id`
- `DELETE /api/admin/coaches/:id` (or `PATCH is_active=false`)

Recommended:

- enforce `faculty_id` required
- validate email format

### Programmes

- `GET /api/admin/programmes?facultyId=...`
- `POST /api/admin/programmes`
- `GET /api/admin/programmes/:id`
- `PATCH /api/admin/programmes/:id`
- `DELETE /api/admin/programmes/:id` (optional)

### Resources

- `GET /api/admin/resources?facultyId=...` (optional filter; null facultyId = general)
- `POST /api/admin/resources`
- `GET /api/admin/resources/:id`
- `PATCH /api/admin/resources/:id`
- `DELETE /api/admin/resources/:id` (optional)

### FAQs

- `GET /api/admin/faqs?facultyId=...&category=...`
- `POST /api/admin/faqs`
- `GET /api/admin/faqs/:id`
- `PATCH /api/admin/faqs/:id`
- `DELETE /api/admin/faqs/:id` (optional)

### Bot knowledge

- `GET /api/admin/bot-knowledge?tag=...`
- `POST /api/admin/bot-knowledge`
- `GET /api/admin/bot-knowledge/:id`
- `PATCH /api/admin/bot-knowledge/:id`
- `DELETE /api/admin/bot-knowledge/:id` (optional)

### Admin utility (optional but useful)

- `POST /api/admin/seed`
    - seeds baseline faculties/coaches/resources (protected)
- `POST /api/admin/revalidate`
    - triggers cache revalidation for runtime endpoints

---

## 2) Next.js API (Runtime: Botpress)

Base: `/api/runtime`  

Auth: `Authorization: Bearer <BOTPRESS_API_KEY>`

### Primary “one-call” endpoint (recommended)

- `GET /api/runtime/coach-assignment?faculty=...&programme=...&level=undergrad|postgrad`

Response (suggested shape):

- `status`: `"ok" | "needs_clarification" | "not_found"`
- `faculty`: `{ id, name, code } | null`
- `candidates`: `Array<{ id, name, code }>` (when clarification needed)
- `coaches`: `Array<{ id, name, title_role, email, phone, office_location, appointment_link, responsibilities, cluster, level }>`
- `resources`: `Array<{ id, title, category, url }>`
- `faqs`: `Array<{ id, question, answer, category }>`
- `messageHints`: `{ shouldUseEmpathy: boolean }` (optional—Botpress can also decide)

### Supporting runtime endpoints (optional)

- `GET /api/runtime/faculties` (for “please choose your faculty”)
- `GET /api/runtime/faculties/:code` (details)
- `GET /api/runtime/coaches?facultyCode=EBIT`
- `GET /api/runtime/resources?facultyCode=EBIT&category=...`
- `GET /api/runtime/faqs?facultyCode=EBIT&category=...`
- `GET /api/runtime/knowledge?topic=...` (fallback guidance)

---

## 3) Next.js Admin UI (pages/screens)

Routes (suggested):

- `/admin` (overview dashboard)
- `/admin/faculties`
- `/admin/coaches`
- `/admin/programmes`
- `/admin/resources`
- `/admin/faqs`
- `/admin/bot-knowledge`

CRUD behavior (recommended UX)

- List → Create → Edit drawer/modal → Delete/Deactivate
- Relationship selects:
    - Coach form includes `faculty_id` dropdown
    - Programme form includes `faculty_id` dropdown
    - Resource/FAQ form includes optional `faculty_id` dropdown + “General” toggle (null)

---

## 4) Botpress (how it queries + uses results)

### Botpress-to-API call pattern

- On faculty capture/confirmation:
    1. Call `GET /api/runtime/coach-assignment?...`
    2. If `needs_clarification`: present `candidates` to student and re-ask
    3. If `ok`: format response:
        - coach contact block
        - 1–3 resources
        - 0–2 FAQs (only if relevant)
        - motivational/empathetic closing

### Bot response composition rules (MVP)

- Always show at least 1 coach if available; if multiple, show top 1–2 and offer “Would you like the full list?”
- Prefer faculty-specific resources; fallback to general resources.
- When stressed language detected:
    - short validation line
    - encourage reaching out to ASC
    - optionally include counselling/wellness resource if present

---

## Implementation plan (efficient + scalable)

1. **Implement DB schema + indexes (Neon)**
2. **Implement Admin API CRUD** with validation + authorization
3. **Implement Admin UI** (forms + relational selects)
4. **Implement runtime “coach-assignment” endpoint**
    - matching + aggregation in one query path
5. **Integrate Botpress**
    - minimal number of calls, stable response shape
6. **Add caching + revalidation**
    - especially for runtime endpoints
7. **Add alias/fuzzy matching improvements** (as needed)