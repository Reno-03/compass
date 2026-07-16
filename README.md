# COMPASS

**C**entralized **O**nline **M**onitoring of **P**rograms, **A**ctivities, and **S**chool **S**ubmissions

A web-based compliance monitoring system built for SIGISDAC (DepEd) to track school activities, compliance rates, and report submissions across Admin and School Head roles.

![Version](https://img.shields.io/badge/version-v0.1.0--beta-blue)

---

## Overview

COMPASS replaces manual, back-and-forth compliance tracking with a single dashboard where:

- **Admins (PDOs)** create activities, assign them to schools, monitor compliance in real time, and review submitted documentation.
- **School Heads** update the status of their assigned activities, attach supporting documents, and add remarks — all from their own dashboard.

Built with **React**, **Tailwind CSS**, **Supabase** (Auth, Database, RLS), and **Recharts**.

---

## Features (v0.1.0-beta)

### Dashboards
- Dedicated Admin Dashboard and School Head Dashboard, each with their own color theme and layout
- Compliance overview with donut charts (Completed / Ongoing / Not Started)
- Stat cards with icons for at-a-glance activity counts
- Per-school tabs on the Admin Dashboard, with a mini compliance donut for all schools combined

### Activity Management
- **Create Activity** modal — name, due date, and multi-school assignment, with full form validation
- **Edit Activity** modal — update status, due date, date conducted, and remarks
- Activities table sorted by status first, then due date
- Delete Activity, with confirmation prompt
- Filter activity listing by **Month** and **Year**, defaulting to the current month/year, with an "All" option to clear the filter

### Google Drive Integration
- Google Drive link field on both Create and Edit Activity, for attaching compliance documentation
- Drive link column in the Admin activity table, rendered as a clickable icon that opens in a new tab

### UI/UX
- Modal backdrop blur (50% black) on Create/Edit Activity
- Modals close on outside click
- Hover and translate-up animation on primary CTA buttons
- Logout button with icon
- DepEd sidebar branding (logo + app name)
- COMPASS logo, favicon, and app icon
- Redesigned login page: split-panel layout with branding, feature checklist, and a blue gradient background, using email/password sign-in

---

## Tech Stack

| Layer      | Tech                                  |
|------------|----------------------------------------|
| Frontend   | React, Tailwind CSS, lucide-react      |
| Charts     | Recharts                               |
| Backend    | Supabase (Postgres, Auth, RLS)         |
| Hosting    | Vercel                                 |

---

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
# .env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Run locally
npm run dev
```