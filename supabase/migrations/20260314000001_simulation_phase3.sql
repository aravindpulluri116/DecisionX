-- Phase 3: simulation runs and extended project fields

alter table projects
  add column if not exists description text default '',
  add column if not exists category text default 'Transportation',
  add column if not exists stakeholders jsonb default '[]'::jsonb,
  add column if not exists budget integer default 0,
  add column if not exists timeline text default '10 years';

create table if not exists simulation_runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  scenario_id uuid references scenarios(id) on delete set null,
  status text not null default 'pending',
  agent_states jsonb not null default '[]'::jsonb,
  report jsonb,
  created_at timestamptz not null default now()
);

create table if not exists decision_reports (
  id uuid primary key default gen_random_uuid(),
  simulation_run_id uuid references simulation_runs(id) on delete cascade,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table simulation_runs enable row level security;
alter table decision_reports enable row level security;

create policy "Allow all simulation_runs" on simulation_runs for all using (true) with check (true);
create policy "Allow all decision_reports" on decision_reports for all using (true) with check (true);

alter table node_intelligence
  add column if not exists evidence jsonb default '[]'::jsonb;
