-- Phase 5: geo intelligence columns and enrichment runs

alter table projects add column if not exists lat double precision;
alter table projects add column if not exists lng double precision;
alter table projects add column if not exists address text;
alter table projects add column if not exists bbox jsonb;
alter table projects add column if not exists project_area jsonb;
alter table projects add column if not exists location_intelligence jsonb;

create table if not exists geo_enrichment_runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  simulation_run_id uuid references simulation_runs(id) on delete set null,
  intelligence jsonb not null,
  sources jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table geo_enrichment_runs enable row level security;
create policy "Allow all geo_enrichment_runs" on geo_enrichment_runs for all using (true) with check (true);
