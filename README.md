# COMPASS v0.2.0-beta

**C**entralized **O**nline **M**onitoring of **P**rograms, **A**ctivities, and **S**chool **S**ubmissions

COMPASS is a web-based compliance monitoring platform designed to help administrators and school heads track activities, monitor submission progress, and review compliance data from a single dashboard.

![Version](https://img.shields.io/badge/version-v0.2.0--beta-blue)

---

## Overview

This beta release focuses on the core workflow for monitoring school submissions and activity compliance:

- Admin/PDO users can create activities, assign them to schools, and monitor progress.
- School Heads can view assigned activities, update statuses, add remarks, and submit supporting information.
- Dashboards provide quick visibility into overall compliance through summary cards and charts.

Built with React, Vite, Tailwind CSS, Supabase, and Recharts.

---

## What's New in v0.2.0-beta

- 📅 New Calendar View for activities and reports
- 📄 Complete Reports Management module
- 📊 Consolidated Reports dashboard
- 🔍 Expandable Activities and Reports tables
- 📱 Improved mobile responsiveness
- 📅 Report submission date tracking
- 🎨 Dashboard layout and UX improvements
- ⚖️ MIT License added

## Key Features

### Admin Dashboard
- Overview of all schools and activity performance
- Per-school tabs for focused monitoring
- Compliance summary cards and donut charts
- Filtering by month and year
- Activity creation and management tools

### Activity Management
- Create new activities with validation
- Edit existing activity details and status
- Assign activities to multiple schools
- Add remarks and update completion state
- Delete activities with confirmation

### Submission Tracking
- Track activity progress by status: Completed, Ongoing, and Not Started
- View supporting links for documentation
- Monitor school-level submission activity in one place

### User Experience
- Clean dashboard layout with sidebar navigation
- Responsive tables and cards
- Modal-based forms with clear feedback
- Role-based views for Admin and School Head users

---

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, lucide-react
- Charts: Recharts
- Backend/Auth: Supabase
- Styling: Tailwind CSS

---

## Project Structure

- src/App.jsx — main application UI and dashboard logic
- src/useAuth.js — authentication flow
- src/supabaseClient.js — Supabase client configuration
- public/images — branding and app assets

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a .env file in the project root:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Run the app locally

```bash
npm run dev
```

The development server will start and usually be available at http://localhost:5173.

---

## Available Scripts

```bash
npm run dev     # start the Vite development server
npm run build   # build the production bundle
npm run preview # preview the production build locally
npm run lint    # run static checks
```

---

## Notes

This is a beta release intended for testing and refinement of the core monitoring workflow. Supabase authentication, database tables, and row-level security should be configured in your own project environment before use.

