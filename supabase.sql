-- Run this once in Supabase → SQL Editor
create table if not exists public.notebook (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.notebook enable row level security;
create policy "own row select" on public.notebook for select using (auth.uid() = user_id);
create policy "own row insert" on public.notebook for insert with check (auth.uid() = user_id);
create policy "own row update" on public.notebook for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own row delete" on public.notebook for delete using (auth.uid() = user_id);
