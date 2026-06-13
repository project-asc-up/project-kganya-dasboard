# Knowledge Base

## Purpose

Central place to collect and verify **public University of Pretoria** information that will be seeded into the Neon database.

---

## Knowledge Base databases (in Notion)

This page now contains a Notion database called **🧩 UP Knowledge Base (Notion)** with these tables:

- **Faculties**
- **ASC Coaches**
- **Programmes**
- **Resources**
- **FAQs**

### Relationships (as implemented in Notion)

- **Faculties ↔ ASC Coaches** (each coach links to exactly 1 faculty)
- **Faculties ↔ Programmes** (each programme links to exactly 1 faculty)
- **Faculties ↔ Resources** (each resource can optionally link to 1 faculty)
- **Faculties ↔ FAQs** (each FAQ can optionally link to 1 faculty)

### Property mapping notes (important)

- In the **Resources** table, the link field is named **URL** (Notion stores it internally as `userDefined:URL`).
- Use **Source URL** to capture the public page you extracted the info from (so you can re-verify later).
- Use **Last verified** whenever you confirm a row is still accurate.

---

## How this maps to the Neon DB

The Notion tables mirror the Neon schema closely to make seeding easy:

- Notion **Faculties** → Neon `faculties`
- Notion **ASC Coaches** → Neon `asc_coaches`
- Notion **Programmes** → Neon `programmes`
- Notion **Resources** → Neon `resources`
- Notion **FAQs** → Neon `faqs`

When you’re ready to seed Neon, the minimum required set is:

1) Faculties  

2) ASC Coaches (linked to Faculty)  

3) Resources + FAQs (general + faculty-specific)

## What goes here (MVP)

- **Faculties**: official names, codes, links
- **Academic Success Coaches**: per faculty (and cluster/level if applicable)
- **General UP resources**: counselling, study skills, wellness, etc.
- **FAQs**: common questions + official links where possible

## Source links (starting set)

- General ASC overview: [https://www.up.ac.za/teaching-and-learning/academic-success-coaches](https://www.up.ac.za/teaching-and-learning/academic-success-coaches)
- EBIT: [https://www.up.ac.za/ebit-academic-success-coaches](https://www.up.ac.za/ebit-academic-success-coaches)
- NAS: [https://www.up.ac.za/teaching-and-learning/nas-support-services](https://www.up.ac.za/teaching-and-learning/nas-support-services)
- Humanities: [https://www.up.ac.za/faculty-of-humanities/academic-success-coaches](https://www.up.ac.za/faculty-of-humanities/academic-success-coaches)
- Health Sciences: [https://www.up.ac.za/faculty-of-health-sciences/academic-success-coaches](https://www.up.ac.za/faculty-of-health-sciences/academic-success-coaches)
- Theology: [https://www.up.ac.za/teaching-and-learning/theology-religion-support-service](https://www.up.ac.za/teaching-and-learning/theology-religion-support-service)
- Education: [https://www.up.ac.za/teaching-and-learning/education-support-service](https://www.up.ac.za/teaching-and-learning/education-support-service)
- Veterinary: [https://www.up.ac.za/teaching-and-learning/veterinary-science-support-service](https://www.up.ac.za/teaching-and-learning/veterinary-science-support-service)
- Law: [https://www.up.ac.za/teaching-and-learning/law-support-service](https://www.up.ac.za/teaching-and-learning/law-support-service)

## Data capture checklist (for each faculty)

- [ ]  Faculty name + code
- [ ]  Official faculty page URL
- [ ]  List of ASC coaches (name, role/title, email, phone, office, appointment link)
- [ ]  Notes on responsibilities / level / cluster (if listed)
- [ ]  Faculty-specific resources (if any)

[UP Knowledge Base (Notion)](UP%20Knowledge%20Base%20(Notion)%20d97aa964e13a4788b12a930f3be10531_Faculties%2006e2aebc07094582a53a44cbeaa8f262.csv)