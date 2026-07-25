-- Supabase SQL to allow public read access for the public dashboard
-- Run these in the SQL editor of your Supabase project.

alter table public.schools enable row level security;
alter table public.submissions enable row level security;
alter table public.report_submissions enable row level security;

create policy if not exists "Allow public read access to schools"
  on public.schools
  for select
  using (true);

create policy if not exists "Allow public read access to submissions"
  on public.submissions
  for select
  using (true);

create policy if not exists "Allow public read access to report_submissions"
  on public.report_submissions
  for select
  using (true);
