-- OperaVoce Initial Schema Migration

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  voice_type text check (voice_type in ('soprano','mezzo_soprano','contralto','tenor','baritone','bass')),
  experience_level text check (experience_level in ('beginner','intermediate','advanced')),
  practice_days_per_week int default 3,
  preferred_practice_time time default '18:00',
  timezone text default 'UTC',
  streak_current int default 0,
  streak_longest int default 0,
  total_practice_minutes int default 0,
  subscription_tier text default 'free' check (subscription_tier in ('free','premium','lifetime')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "Users read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Programs
create table public.programs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  level text check (level in ('beginner','intermediate','advanced')),
  duration_weeks int,
  thumbnail_url text,
  is_free boolean default false,
  sort_order int default 0,
  created_at timestamptz default now()
);

alter table public.programs enable row level security;
create policy "Public read programs" on public.programs for select using (true);

-- Modules
create table public.modules (
  id uuid primary key default gen_random_uuid(),
  program_id uuid references public.programs(id) on delete cascade,
  title text not null,
  sort_order int default 0
);

alter table public.modules enable row level security;
create policy "Public read modules" on public.modules for select using (true);

-- Lessons
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references public.modules(id) on delete cascade,
  title text not null,
  type text check (type in ('text','exercise','audio','quiz','video')),
  content jsonb not null default '{}',
  audio_url text,
  video_url text,
  duration_estimate_min int,
  sort_order int default 0
);

alter table public.lessons enable row level security;
create policy "Public read lessons" on public.lessons for select using (true);

-- User Programs (enrollment)
create table public.user_programs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  program_id uuid references public.programs(id) on delete cascade,
  status text default 'active' check (status in ('active','completed','paused','abandoned')),
  start_date date default current_date,
  target_end_date date,
  current_module_id uuid references public.modules(id),
  current_lesson_id uuid references public.lessons(id),
  percent_complete numeric(5,2) default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, program_id)
);

alter table public.user_programs enable row level security;
create policy "Users read own enrollments" on public.user_programs for select using (auth.uid() = user_id);
create policy "Users insert own enrollments" on public.user_programs for insert with check (auth.uid() = user_id);
create policy "Users update own enrollments" on public.user_programs for update using (auth.uid() = user_id);

-- Lesson Completions
create table public.lesson_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete cascade,
  completed_at timestamptz default now(),
  unique(user_id, lesson_id)
);

alter table public.lesson_completions enable row level security;
create policy "Users read own completions" on public.lesson_completions for select using (auth.uid() = user_id);
create policy "Users insert own completions" on public.lesson_completions for insert with check (auth.uid() = user_id);

-- Sessions
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  scheduled_date date not null,
  scheduled_time time,
  status text default 'upcoming' check (status in ('upcoming','completed','skipped')),
  user_program_id uuid references public.user_programs(id) on delete set null,
  linked_lesson_ids uuid[] default '{}',
  actual_duration_min int,
  self_rating int check (self_rating between 1 and 5),
  journal_note text,
  completed_at timestamptz,
  created_at timestamptz default now()
);

alter table public.sessions enable row level security;
create policy "Users read own sessions" on public.sessions for select using (auth.uid() = user_id);
create policy "Users insert own sessions" on public.sessions for insert with check (auth.uid() = user_id);
create policy "Users update own sessions" on public.sessions for update using (auth.uid() = user_id);
create policy "Users delete own sessions" on public.sessions for delete using (auth.uid() = user_id);

-- Session Goals
create table public.session_goals (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.sessions(id) on delete cascade,
  type text check (type in ('duration','exercise','custom')),
  description text,
  target_value text,
  actual_value text,
  met boolean default false
);

alter table public.session_goals enable row level security;
create policy "Users read own goals" on public.session_goals for select
  using (exists (select 1 from public.sessions s where s.id = session_id and s.user_id = auth.uid()));
create policy "Users insert own goals" on public.session_goals for insert
  with check (exists (select 1 from public.sessions s where s.id = session_id and s.user_id = auth.uid()));
create policy "Users update own goals" on public.session_goals for update
  using (exists (select 1 from public.sessions s where s.id = session_id and s.user_id = auth.uid()));

-- Notification Preferences
create table public.notification_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  daily_reminder_enabled boolean default true,
  daily_reminder_offset_min int default 30,
  streak_reminder_enabled boolean default true,
  streak_reminder_time time default '20:00',
  weekly_summary_enabled boolean default true,
  weekly_summary_day int default 0,
  weekly_summary_time time default '10:00',
  milestone_notifications boolean default true,
  expo_push_token text,
  updated_at timestamptz default now()
);

alter table public.notification_preferences enable row level security;
create policy "Users read own notif prefs" on public.notification_preferences for select using (auth.uid() = user_id);
create policy "Users upsert own notif prefs" on public.notification_preferences for insert with check (auth.uid() = user_id);
create policy "Users update own notif prefs" on public.notification_preferences for update using (auth.uid() = user_id);

-- Indexes for performance
create index idx_sessions_user_date on public.sessions(user_id, scheduled_date);
create index idx_user_programs_user on public.user_programs(user_id);
create index idx_lesson_completions_user on public.lesson_completions(user_id);
create index idx_modules_program on public.modules(program_id);
create index idx_lessons_module on public.lessons(module_id);

-- Updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_profiles_updated before update on public.profiles
  for each row execute function public.handle_updated_at();
create trigger on_user_programs_updated before update on public.user_programs
  for each row execute function public.handle_updated_at();
create trigger on_notification_preferences_updated before update on public.notification_preferences
  for each row execute function public.handle_updated_at();
