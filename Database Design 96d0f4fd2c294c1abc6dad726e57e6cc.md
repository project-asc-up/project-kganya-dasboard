# Database Design

## Purpose

The **Neon Postgres database** is the single source of truth for all factual information used by the bot (coaches, resources, FAQs, programmes, etc.).  

The **Next.js Admin UI** is the only place the team updates that data.  

**Botpress** queries the data via API to produce accurate, up-to-date responses.

---

## MVP data model (Neon / Postgres)

Include standard fields on every table:

- `id` (UUID, PK)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### 1) `faculties` (main table)

Fields:

- `id` (UUID, PK)
- `name` (e.g., "Faculty of Engineering, Built Environment and Information Technology (EBIT)")
- `code` (short code, e.g., "EBIT")
- `description`
- `official_page_url`
- `undergrad_focus_areas`
- `postgrad_focus_areas`

### 2) `asc_coaches` (Academic Success Coaches)

Fields:

- `id` (UUID, PK)
- `faculty_id` (FK → `faculties.id`)
- `name`
- `title_role`
- `email`
- `phone`
- `office_location`
- `responsibilities` (text or JSON)
- `cluster`
- `level` ("Undergraduate" / "Postgraduate" / "Both")
- `appointment_link` (nullable)
- `is_active` (boolean)

### 3) `programmes`

Fields:

- `id` (UUID, PK)
- `faculty_id` (FK → `faculties.id`)
- `name`
- `qualification_type` ("Undergrad" / "Postgrad" / "Diploma")
- `duration_years`
- `description`
- `entry_requirements` (text or JSON)
- `career_paths`

### 4) `courses_modules` (optional but useful)

Fields:

- `id` (UUID, PK)
- `programme_id` (FK → `programmes.id`) **or** `faculty_id` (nullable FK → `faculties.id`)
- `code` (e.g., "COS 110")
- `name`
- `description`
- `year_level`
- `prerequisites`

### 5) `resources`

Fields:

- `id` (UUID, PK)
- `category` (e.g., "Study Skills", "Student Counselling", "Health Services", "Faculty Specific", "General UP")
- `title`
- `description`
- `url`
- `faculty_id` (nullable FK → `faculties.id`)
- `tags` (array or JSON)

### 6) `faqs`

Fields:

- `id` (UUID, PK)
- `question`
- `answer`
- `category` (e.g., "Coach Referral", "Study Tips", "Registration", "Stress Management")
- `faculty_id` (nullable FK → `faculties.id`)
- `priority` (integer)

### 7) `bot_knowledge` (general / fallback)

Fields:

- `id` (UUID, PK)
- `topic` (e.g., "Time Management", "Exam Preparation", "Adjustment to University")
- `content` (markdown / rich text)
- `tags`

---

## Relationships (MVP)

- **One faculty → many coaches**
- **One faculty → many programmes**
- **One programme → many courses/modules**
- **One courses/modules → many programme**
- Resources and FAQs can be **faculty-specific** or **general** (nullable `faculty_id`)

---

## Implementation notes

- Add indexes on:
    - `asc_coaches.faculty_id`
    - `programmes.faculty_id`
    - `resources.faculty_id`
    - `faqs.faculty_id`
- Consider a `search_vector` later if you want Postgres full-text search for resources/FAQs/knowledge.

---

## How this maps to bot behavior (MVP)

1. Student provides **faculty** (and optionally programme/year).
2. Bot queries API → DB:
    - Find `faculties` match
    - Return active `asc_coaches` for that faculty
    - Return top `resources` and `faqs` (faculty-specific first, then general)
3. Bot formats:
    - Coach referral with contact details + appointment link
    - 1–3 relevant resources
    - A short motivational message (tone rule based on student sentiment)

---

## Future growth (not required for MVP)

- Coach availability / preferred contact
- Referral protocols (escalation to counselling, financial aid, etc.)
- Student query logs (analytics)