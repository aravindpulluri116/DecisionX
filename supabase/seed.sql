-- Seed projects and default scenarios (run after migration)

-- Projects
insert into projects (id, slug, title, status, impact_score, risk_level, project_type, location) values
  ('11111111-1111-1111-1111-111111111101', 'metro-expansion-hyderabad', 'Metro Expansion Hyderabad', 'active', 78, 'medium', 'Infrastructure', 'Hyderabad'),
  ('11111111-1111-1111-1111-111111111102', 'new-industrial-zone', 'New Industrial Zone', 'review', 65, 'high', 'Land Use', 'Telangana'),
  ('11111111-1111-1111-1111-111111111103', 'airport-development', 'Airport Development', 'active', 82, 'medium', 'Infrastructure', 'Hyderabad'),
  ('11111111-1111-1111-1111-111111111104', 'bus-fare-increase', 'Bus Fare Increase', 'draft', 45, 'high', 'Transit Policy', 'Hyderabad'),
  ('11111111-1111-1111-1111-111111111105', 'flyover-construction', 'Flyover Construction', 'active', 71, 'low', 'Infrastructure', 'Hyderabad');

-- Default scenarios (one per project, active)
insert into scenarios (id, project_id, title, is_active, params, impact_scores) values
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101', 'Baseline Route A', true,
   '{"budget":1200,"population":2.4,"location":"Hyderabad","timeline":"10 years","projectType":"Infrastructure","policyType":"Transit"}'::jsonb,
   '{"economic":78,"social":72,"environmental":58,"infrastructure":85,"politicalRisk":42,"publicAcceptance":68}'::jsonb),
  ('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111102', 'Zone Phase 1', true,
   '{"budget":800,"population":1.2,"location":"Telangana","timeline":"5 years","projectType":"Land Use","policyType":"Industrial"}'::jsonb,
   '{"economic":70,"social":55,"environmental":48,"infrastructure":62,"politicalRisk":58,"publicAcceptance":52}'::jsonb),
  ('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111103', 'Terminal Expansion', true,
   '{"budget":2400,"population":3.1,"location":"Hyderabad","timeline":"15 years","projectType":"Infrastructure","policyType":"Aviation"}'::jsonb,
   '{"economic":88,"social":64,"environmental":52,"infrastructure":90,"politicalRisk":38,"publicAcceptance":74}'::jsonb),
  ('22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111104', 'Fare +15%', true,
   '{"budget":120,"population":2.4,"location":"Hyderabad","timeline":"2 years","projectType":"Transit Policy","policyType":"Pricing"}'::jsonb,
   '{"economic":55,"social":48,"environmental":62,"infrastructure":45,"politicalRisk":72,"publicAcceptance":38}'::jsonb),
  ('22222222-2222-2222-2222-222222222205', '11111111-1111-1111-1111-111111111105', 'ORR Connector', true,
   '{"budget":650,"population":2.4,"location":"Hyderabad","timeline":"7 years","projectType":"Infrastructure","policyType":"Roads"}'::jsonb,
   '{"economic":74,"social":68,"environmental":44,"infrastructure":80,"politicalRisk":35,"publicAcceptance":71}'::jsonb);

-- Metro scenario graph nodes
insert into canvas_nodes (id, scenario_id, type, label, description, position, parent_id) values
  ('33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222201', 'decision', 'Build Metro', 'Construct 42km metro corridor connecting IT corridor to old city.', '{"x":80,"y":200}', null),
  ('33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222201', 'impact', 'Traffic Reduction', 'Peak-hour congestion drops 28% along corridor within 18 months.', '{"x":320,"y":120}', '33333333-3333-3333-3333-333333333301'),
  ('33333333-3333-3333-3333-333333333303', '22222222-2222-2222-2222-222222222201', 'impact', 'Property Growth', 'Land values rise 12–18% within 2km of stations.', '{"x":320,"y":280}', '33333333-3333-3333-3333-333333333301'),
  ('33333333-3333-3333-3333-333333333304', '22222222-2222-2222-2222-222222222201', 'risk', 'Rental Inflation', 'Low-income renters face 15% rent increase near stations.', '{"x":560,"y":120}', '33333333-3333-3333-3333-333333333303'),
  ('33333333-3333-3333-3333-333333333305', '22222222-2222-2222-2222-222222222201', 'stakeholder', 'Commuter Cohorts', 'Daily riders shift from private vehicles to metro.', '{"x":560,"y":200}', '33333333-3333-3333-3333-333333333302'),
  ('33333333-3333-3333-3333-333333333306', '22222222-2222-2222-2222-222222222201', 'environmental', 'Emissions Offset', 'Net CO₂ reduction of 180K tonnes/year by year 5.', '{"x":560,"y":280}', '33333333-3333-3333-3333-333333333302'),
  ('33333333-3333-3333-3333-333333333307', '22222222-2222-2222-2222-222222222201', 'risk', 'Displacement Risk', '3,200 households at risk of involuntary relocation.', '{"x":800,"y":200}', '33333333-3333-3333-3333-333333333304');

insert into canvas_edges (id, scenario_id, source, target) values
  ('44444444-4444-4444-4444-444444444401', '22222222-2222-2222-2222-222222222201', '33333333-3333-3333-3333-333333333301', '33333333-3333-3333-3333-333333333302'),
  ('44444444-4444-4444-4444-444444444402', '22222222-2222-2222-2222-222222222201', '33333333-3333-3333-3333-333333333301', '33333333-3333-3333-3333-333333333303'),
  ('44444444-4444-4444-4444-444444444403', '22222222-2222-2222-2222-222222222201', '33333333-3333-3333-3333-333333333303', '33333333-3333-3333-3333-333333333304'),
  ('44444444-4444-4444-4444-444444444404', '22222222-2222-2222-2222-222222222201', '33333333-3333-3333-3333-333333333302', '33333333-3333-3333-3333-333333333305'),
  ('44444444-4444-4444-4444-444444444405', '22222222-2222-2222-2222-222222222201', '33333333-3333-3333-3333-333333333302', '33333333-3333-3333-3333-333333333306'),
  ('44444444-4444-4444-4444-444444444406', '22222222-2222-2222-2222-222222222201', '33333333-3333-3333-3333-333333333304', '33333333-3333-3333-3333-333333333307');

insert into node_intelligence (node_id, impact_strength, confidence, stakeholders, timeline, mitigation) values
  ('33333333-3333-3333-3333-333333333301', 92, 88, '["State Govt","Metro Corp","Urban Planners"]', '[{"year":"Y1","event":"Land acquisition begins"},{"year":"Y3","event":"Phase 1 operational"},{"year":"Y10","event":"Full corridor live"}]', '["Phased rollout","Community consultation","Affordable housing mandate"]'),
  ('33333333-3333-3333-3333-333333333302', 82, 85, '["Commuters","Auto unions","Traffic police"]', '[{"year":"Y1","event":"Construction disruption"},{"year":"Y2","event":"First ridership data"},{"year":"Y5","event":"Peak reduction measurable"}]', '["Bus feeder integration","Park-and-ride hubs"]'),
  ('33333333-3333-3333-3333-333333333303', 74, 79, '["Property developers","Homeowners","Banks"]', '[{"year":"Y2","event":"Station TOD zones"},{"year":"Y5","event":"Price plateau risk"}]', '["Inclusionary zoning","Rent stabilization pilot"]'),
  ('33333333-3333-3333-3333-333333333304', 61, 72, '["Renters","Landlords","NGOs"]', '[{"year":"Y3","event":"Rent spike near stations"}]', '["Rent caps in corridor","Voucher program"]'),
  ('33333333-3333-3333-3333-333333333305', 68, 81, '["Daily commuters","IT workforce","Students"]', '[{"year":"Y1","event":"Mode shift begins"}]', '["Last-mile connectivity","Off-peak pricing"]'),
  ('33333333-3333-3333-3333-333333333306', 76, 83, '["Environmental agencies","Health dept"]', '[{"year":"Y5","event":"Net emissions positive"}]', '["Green energy for stations","Tree canopy program"]'),
  ('33333333-3333-3333-3333-333333333307', 42, 68, '["Slum communities","Resettlement boards"]', '[{"year":"Y2","event":"Relocation notices"}]', '["In-situ upgrading","Compensation at market rate"]');
