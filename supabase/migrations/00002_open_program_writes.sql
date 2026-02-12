-- Migration: Allow unauthenticated inserts/updates/deletes on programs, modules, lessons
-- This is a temporary open policy so the app can sync training programs to Supabase
-- without requiring the user to be logged in.
-- TODO: Replace with RLS scoped to an author/creator column before production.

-- Programs: allow anyone to insert, update, delete
create policy "Anon insert programs"
  on public.programs for insert
  with check (true);

create policy "Anon update programs"
  on public.programs for update
  using (true);

create policy "Anon delete programs"
  on public.programs for delete
  using (true);

-- Modules: allow anyone to insert, update, delete
create policy "Anon insert modules"
  on public.modules for insert
  with check (true);

create policy "Anon update modules"
  on public.modules for update
  using (true);

create policy "Anon delete modules"
  on public.modules for delete
  using (true);

-- Lessons: allow anyone to insert, update, delete
create policy "Anon insert lessons"
  on public.lessons for insert
  with check (true);

create policy "Anon update lessons"
  on public.lessons for update
  using (true);

create policy "Anon delete lessons"
  on public.lessons for delete
  using (true);
