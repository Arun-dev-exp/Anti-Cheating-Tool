-- ============================================================================
-- Sentinel Zero — Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================================

-- 1. Sessions table
create table if not exists sessions (
  id uuid default gen_random_uuid() primary key,
  interviewer_id uuid references auth.users(id) on delete cascade not null,
  code text unique not null,
  title text not null,
  interviewer_name text not null default 'Interviewer',
  max_candidates int default 30,
  duration_minutes int default 120,
  sensitivity text default 'high' check (sensitivity in ('low', 'medium', 'high')),
  modules jsonb default '["keystroke","gaze","process","liveness","network"]',
  status text default 'waiting' check (status in ('waiting', 'active', 'ended')),
  created_at timestamptz default now()
);

-- 2. Participants table
create table if not exists participants (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references sessions(id) on delete cascade not null,
  candidate_name text not null,
  integrity_score int default 100,
  status text default 'waiting' check (status in ('waiting', 'active', 'breached', 'completed')),
  risk_factors jsonb default '{"keystroke":0,"gaze":0,"process":0,"liveness":0,"network":0}',
  joined_at timestamptz default now()
);

-- 3. Enable Realtime for both tables
alter publication supabase_realtime add table sessions;
alter publication supabase_realtime add table participants;

-- 4. Row Level Security — tightened for authentication
alter table sessions enable row level security;
alter table participants enable row level security;

-- Sessions: Interviewers can manage their own sessions, but candidates can read any session if they have the code.
create policy "Interviewers can manage their own sessions" on sessions for all using (auth.uid() = interviewer_id);
create policy "Anyone can read sessions" on sessions for select using (true);

-- Participants: Anyone can join (insert) and read (select) for the candidate flows, interviewers can manage via their session.
create policy "Allow all on participants" on participants for all using (true) with check (true);

-- 5. Indexes for fast lookups
create index if not exists idx_sessions_code on sessions(code);
create index if not exists idx_sessions_interviewer on sessions(interviewer_id);
create index if not exists idx_sessions_status on sessions(status);
create index if not exists idx_participants_session on participants(session_id);
