alter table simulation_runs add column if not exists time_machine_snapshot jsonb;
alter table scenarios add column if not exists time_machine_snapshot jsonb;
