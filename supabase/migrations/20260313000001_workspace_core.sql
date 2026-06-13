-- DecisionX workspace core schema

create type project_status as enum ('active', 'review', 'draft', 'archived');
create type risk_level as enum ('low', 'medium', 'high', 'critical');
create type node_type as enum ('decision', 'impact', 'risk', 'stakeholder', 'environmental');

create table projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  status project_status not null default 'active',
  impact_score integer not null default 0 check (impact_score >= 0 and impact_score <= 100),
  risk_level risk_level not null default 'medium',
  project_type text not null default 'Infrastructure',
  location text not null default 'Hyderabad',
  created_at timestamptz not null default now()
);

create table scenarios (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  is_active boolean not null default false,
  params jsonb not null default '{}'::jsonb,
  impact_scores jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table canvas_nodes (
  id uuid primary key default gen_random_uuid(),
  scenario_id uuid not null references scenarios(id) on delete cascade,
  type node_type not null,
  label text not null,
  description text,
  position jsonb not null default '{"x":0,"y":0}'::jsonb,
  data jsonb not null default '{}'::jsonb,
  parent_id uuid references canvas_nodes(id) on delete set null
);

create table canvas_edges (
  id uuid primary key default gen_random_uuid(),
  scenario_id uuid not null references scenarios(id) on delete cascade,
  source uuid not null references canvas_nodes(id) on delete cascade,
  target uuid not null references canvas_nodes(id) on delete cascade,
  data jsonb not null default '{}'::jsonb
);

create table node_intelligence (
  node_id uuid primary key references canvas_nodes(id) on delete cascade,
  impact_strength integer not null default 50 check (impact_strength >= 0 and impact_strength <= 100),
  confidence integer not null default 70 check (confidence >= 0 and confidence <= 100),
  stakeholders jsonb not null default '[]'::jsonb,
  timeline jsonb not null default '[]'::jsonb,
  mitigation jsonb not null default '[]'::jsonb
);

create index idx_scenarios_project on scenarios(project_id);
create index idx_canvas_nodes_scenario on canvas_nodes(scenario_id);
create index idx_canvas_edges_scenario on canvas_edges(scenario_id);

alter table projects enable row level security;
alter table scenarios enable row level security;
alter table canvas_nodes enable row level security;
alter table canvas_edges enable row level security;
alter table node_intelligence enable row level security;

create policy "Allow all projects" on projects for all using (true) with check (true);
create policy "Allow all scenarios" on scenarios for all using (true) with check (true);
create policy "Allow all canvas_nodes" on canvas_nodes for all using (true) with check (true);
create policy "Allow all canvas_edges" on canvas_edges for all using (true) with check (true);
create policy "Allow all node_intelligence" on node_intelligence for all using (true) with check (true);
