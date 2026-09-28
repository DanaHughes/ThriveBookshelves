-- =====================================================================
-- Thrive Academy: Curriculum tab tables
-- Run once in the Supabase SQL editor. Safe to re-run.
--
--   curriculum_admins          who may edit the curriculum
--   curriculum                 one row: workbooks, grade shelves, apps, shelf text
--   curriculum_student_shelf   per-student changes (workbooks added or hidden)
--   tts_clips                  read-aloud clip for every spoken line, by text hash
--   storage bucket "tts"       the MP3 files themselves (public read)
-- =====================================================================

create table if not exists public.curriculum_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  added_at timestamptz not null default now()
);

create or replace function public.is_curriculum_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.curriculum_admins where user_id = auth.uid());
$$;

-- One shared document. "version" goes up on every save so two admins
-- editing at once cannot silently overwrite each other (see the adapter).
create table if not exists public.curriculum (
  id text primary key default 'thrive',
  content jsonb not null,
  version integer not null default 1,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id)
);

-- Per-student changes. student_id is the student's auth user id.
-- added and hidden hold workbook ids from curriculum.content.workbooks.
create table if not exists public.curriculum_student_shelf (
  student_id uuid primary key references auth.users (id) on delete cascade,
  added text[] not null default '{}',
  hidden text[] not null default '{}',
  updated_at timestamptz not null default now()
);

-- status: queued -> rendering -> ready | failed
-- failed rows carry the reason, for example a word missing from the
-- pronunciation dictionary (the voice never guesses a pronunciation).
create table if not exists public.tts_clips (
  hash text primary key,
  text text not null,
  profile text not null default 'hfc_female-production',
  status text not null default 'queued' check (status in ('queued','rendering','ready','failed')),
  storage_path text,
  public_url text,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tts_clips_status_idx on public.tts_clips (status);

alter table public.curriculum_admins enable row level security;
alter table public.curriculum enable row level security;
alter table public.curriculum_student_shelf enable row level security;
alter table public.tts_clips enable row level security;

-- Admin list: admins can see it; changes are made in the dashboard SQL editor.
drop policy if exists "admins read admin list" on public.curriculum_admins;
create policy "admins read admin list" on public.curriculum_admins
  for select to authenticated using (public.is_curriculum_admin());

-- Curriculum: every signed-in user reads it (students need it for their shelf); admins write.
drop policy if exists "signed-in read curriculum" on public.curriculum;
create policy "signed-in read curriculum" on public.curriculum
  for select to authenticated using (true);
drop policy if exists "admins insert curriculum" on public.curriculum;
create policy "admins insert curriculum" on public.curriculum
  for insert to authenticated with check (public.is_curriculum_admin());
drop policy if exists "admins update curriculum" on public.curriculum;
create policy "admins update curriculum" on public.curriculum
  for update to authenticated using (public.is_curriculum_admin()) with check (public.is_curriculum_admin());

-- Student changes: a student reads only their own row; admins read and write all.
drop policy if exists "student reads own shelf changes" on public.curriculum_student_shelf;
create policy "student reads own shelf changes" on public.curriculum_student_shelf
  for select to authenticated using (student_id = auth.uid() or public.is_curriculum_admin());
drop policy if exists "admins write shelf changes" on public.curriculum_student_shelf;
create policy "admins write shelf changes" on public.curriculum_student_shelf
  for all to authenticated using (public.is_curriculum_admin()) with check (public.is_curriculum_admin());

-- Clips: everyone signed in reads status; admins may queue new lines.
-- Only the audio worker (service role key, server only) marks rows ready or failed.
drop policy if exists "signed-in read clips" on public.tts_clips;
create policy "signed-in read clips" on public.tts_clips
  for select to authenticated using (true);
drop policy if exists "admins queue clips" on public.tts_clips;
create policy "admins queue clips" on public.tts_clips
  for insert to authenticated with check (public.is_curriculum_admin() and status = 'queued');
drop policy if exists "admins requeue failed clips" on public.tts_clips;
create policy "admins requeue failed clips" on public.tts_clips
  for update to authenticated using (public.is_curriculum_admin() and status = 'failed') with check (status = 'queued');

-- Save with a version check. Returns the new version, or raises if someone saved first.
create or replace function public.save_curriculum(p_content jsonb, p_expected_version integer)
returns integer language plpgsql security definer set search_path = public as $$
declare v integer;
begin
  if not public.is_curriculum_admin() then raise exception 'not allowed'; end if;
  insert into public.curriculum (id, content, version, updated_by)
    values ('thrive', p_content, 1, auth.uid())
    on conflict (id) do nothing;
  if found then return 1; end if;
  update public.curriculum
     set content = p_content, version = version + 1, updated_at = now(), updated_by = auth.uid()
   where id = 'thrive' and version = p_expected_version
  returning version into v;
  if v is null then raise exception 'curriculum_changed' using hint = 'Someone else saved first. Reload to see their changes.'; end if;
  return v;
end $$;
grant execute on function public.save_curriculum(jsonb, integer) to authenticated;

-- Public bucket for the MP3s (file names are hashes, nothing personal).
insert into storage.buckets (id, name, public) values ('tts', 'tts', true)
  on conflict (id) do nothing;

-- After running this file, make Dana an admin (replace the email):
-- insert into public.curriculum_admins (user_id)
--   select id from auth.users where email = 'danahughes@learnatthrive.com';
