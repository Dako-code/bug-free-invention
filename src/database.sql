-- ============================================================
-- COACHPRO — Schéma de base de données Supabase
-- Copiez-collez ce code dans : Supabase > SQL Editor > Run
-- ============================================================

-- ---- EXTENSIONS ----
create extension if not exists "uuid-ossp";

-- ---- COACHES (profils utilisateurs) ----
create table coaches (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  email text unique not null,
  phone text,
  avatar_url text,
  plan text default 'free', -- free | pro | club
  created_at timestamptz default now()
);

-- ---- TEAMS ----
create table teams (
  id uuid default uuid_generate_v4() primary key,
  coach_id uuid references coaches(id) on delete cascade not null,
  name text not null,
  category text default 'Senior A',
  season text default '2025/2026',
  logo_url text,
  created_at timestamptz default now()
);

-- ---- PLAYERS ----
create table players (
  id uuid default uuid_generate_v4() primary key,
  team_id uuid references teams(id) on delete cascade not null,
  full_name text not null,
  position text check (position in ('GK','DEF','MID','ATT')) not null,
  jersey_number int,
  age int,
  phone text,
  email text,
  status text default 'active' check (status in ('active','injured','inactive','new')),
  avatar_color text default '#3DFF7A',
  goals int default 0,
  assists int default 0,
  created_at timestamptz default now()
);

-- ---- SESSIONS ----
create table sessions (
  id uuid default uuid_generate_v4() primary key,
  team_id uuid references teams(id) on delete cascade not null,
  title text not null,
  type text default 'training' check (type in ('training','match','meeting','tournament')),
  scheduled_at timestamptz not null,
  duration_minutes int default 90,
  location text,
  notes text,
  opponent text, -- pour les matchs
  score_home int, -- pour les matchs
  score_away int, -- pour les matchs
  status text default 'planned' check (status in ('planned','completed','cancelled')),
  avg_rating numeric(3,1),
  created_at timestamptz default now()
);

-- ---- ATTENDANCE ----
create table attendance (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid references sessions(id) on delete cascade not null,
  player_id uuid references players(id) on delete cascade not null,
  status text default 'present' check (status in ('present','absent','late')),
  rating numeric(3,1), -- note individuelle du joueur pour cette session
  coach_note text,
  created_at timestamptz default now(),
  unique(session_id, player_id)
);

-- ---- PLAYER STATS (agrégées par saison) ----
create table player_stats (
  id uuid default uuid_generate_v4() primary key,
  player_id uuid references players(id) on delete cascade not null,
  season text not null,
  goals int default 0,
  assists int default 0,
  yellow_cards int default 0,
  red_cards int default 0,
  minutes_played int default 0,
  avg_rating numeric(3,1),
  unique(player_id, season)
);

-- ---- PAYMENTS ----
create table payments (
  id uuid default uuid_generate_v4() primary key,
  team_id uuid references teams(id) on delete cascade not null,
  player_id uuid references players(id) on delete cascade not null,
  label text not null,
  amount numeric(10,2) not null,
  due_date date not null,
  paid_at timestamptz,
  status text default 'pending' check (status in ('pending','paid','late')),
  created_at timestamptz default now()
);

-- ---- MESSAGES ----
create table messages (
  id uuid default uuid_generate_v4() primary key,
  team_id uuid references teams(id) on delete cascade not null,
  sender_id uuid references coaches(id) on delete cascade not null,
  recipient_player_id uuid references players(id) on delete set null,
  is_group boolean default false,
  content text not null,
  read_at timestamptz,
  created_at timestamptz default now()
);

-- ---- EVENTS (calendrier) ----
create table events (
  id uuid default uuid_generate_v4() primary key,
  team_id uuid references teams(id) on delete cascade not null,
  title text not null,
  type text default 'training' check (type in ('training','match','meeting')),
  event_date date not null,
  event_time time,
  location text,
  notes text,
  created_at timestamptz default now()
);

-- ============================================================
-- SÉCURITÉ : Row Level Security (RLS)
-- Chaque coach ne voit QUE ses propres données
-- ============================================================

alter table coaches enable row level security;
alter table teams enable row level security;
alter table players enable row level security;
alter table sessions enable row level security;
alter table attendance enable row level security;
alter table player_stats enable row level security;
alter table payments enable row level security;
alter table messages enable row level security;
alter table events enable row level security;

-- Coaches : lecture/écriture sur son propre profil
create policy "coaches_own" on coaches for all using (auth.uid() = id);

-- Teams : coach voit ses équipes
create policy "teams_own" on teams for all using (auth.uid() = coach_id);

-- Players : via team du coach
create policy "players_own" on players for all using (
  team_id in (select id from teams where coach_id = auth.uid())
);

-- Sessions
create policy "sessions_own" on sessions for all using (
  team_id in (select id from teams where coach_id = auth.uid())
);

-- Attendance
create policy "attendance_own" on attendance for all using (
  session_id in (
    select s.id from sessions s
    join teams t on s.team_id = t.id
    where t.coach_id = auth.uid()
  )
);

-- Player stats
create policy "stats_own" on player_stats for all using (
  player_id in (
    select p.id from players p
    join teams t on p.team_id = t.id
    where t.coach_id = auth.uid()
  )
);

-- Payments
create policy "payments_own" on payments for all using (
  team_id in (select id from teams where coach_id = auth.uid())
);

-- Messages
create policy "messages_own" on messages for all using (
  team_id in (select id from teams where coach_id = auth.uid())
);

-- Events
create policy "events_own" on events for all using (
  team_id in (select id from teams where coach_id = auth.uid())
);

-- ============================================================
-- FONCTION : créer le profil coach automatiquement à l'inscription
-- ============================================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into coaches (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Coach'),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================================
-- DONNÉES DE TEST (optionnel - à supprimer en production)
-- ============================================================
-- Ces données s'insèrent automatiquement après votre première connexion
-- via le trigger ci-dessus. Créez votre compte d'abord, puis
-- insérez vos équipes et joueurs via l'interface de l'appli.
