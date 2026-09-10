-- CareLoop AI initial schema. All clinical records used by the demo are fictional.
create extension if not exists "pgcrypto";

create type public.app_role as enum ('clinic_admin', 'clinician', 'coordinator');
create type public.followup_status as enum ('scheduled', 'in_progress', 'completed', 'failed', 'cancelled');
create type public.patient_outcome as enum ('improving', 'unchanged', 'worsening', 'unknown');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.app_role not null default 'coordinator',
  created_at timestamptz not null default now()
);

create table public.specialties (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table public.doctors (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  specialty_id uuid references public.specialties(id),
  email text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.patients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  birth_date date,
  phone text not null,
  consent_to_automated_calls boolean not null default false,
  consent_recorded_at timestamptz,
  primary_doctor_id uuid references public.doctors(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint consent_timestamp_required check (not consent_to_automated_calls or consent_recorded_at is not null)
);

create table public.consultations (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  doctor_id uuid not null references public.doctors(id),
  occurred_at timestamptz not null,
  reason text not null,
  followup_notes text,
  created_at timestamptz not null default now()
);

create table public.consultation_recommendations (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid not null references public.consultations(id) on delete cascade,
  recommendation text not null,
  position smallint not null default 0
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  doctor_id uuid not null references public.doctors(id),
  starts_at timestamptz not null,
  status text not null default 'scheduled' check (status in ('requested', 'scheduled', 'completed', 'cancelled')),
  source text not null default 'staff' check (source in ('staff', 'followup')),
  created_at timestamptz not null default now()
);

create table public.followups (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid not null references public.consultations(id) on delete cascade,
  scheduled_for timestamptz not null,
  status public.followup_status not null default 'scheduled',
  assigned_to uuid references public.profiles(id),
  attempt_count smallint not null default 0 check (attempt_count between 0 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.followup_calls (
  id uuid primary key default gen_random_uuid(),
  followup_id uuid not null references public.followups(id) on delete cascade,
  provider text not null default 'mock',
  provider_call_id text unique,
  status text not null default 'queued' check (status in ('queued', 'ringing', 'connected', 'completed', 'failed')),
  started_at timestamptz,
  completed_at timestamptz,
  failure_reason text,
  created_at timestamptz not null default now()
);

create table public.call_results (
  id uuid primary key default gen_random_uuid(),
  call_id uuid not null unique references public.followup_calls(id) on delete cascade,
  recommendations_followed boolean,
  outcome public.patient_outcome not null default 'unknown',
  new_symptoms text,
  needs_human_review boolean not null default false,
  appointment_requested boolean not null default false,
  doctor_rating smallint check (doctor_rating between 1 and 5),
  patient_comments text,
  summary text,
  transcript text,
  structured_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index consultations_patient_idx on public.consultations(patient_id, occurred_at desc);
create index followups_schedule_idx on public.followups(status, scheduled_for);
create index appointments_patient_idx on public.appointments(patient_id, starts_at desc);

alter table public.profiles enable row level security;
alter table public.specialties enable row level security;
alter table public.doctors enable row level security;
alter table public.patients enable row level security;
alter table public.consultations enable row level security;
alter table public.consultation_recommendations enable row level security;
alter table public.appointments enable row level security;
alter table public.followups enable row level security;
alter table public.followup_calls enable row level security;
alter table public.call_results enable row level security;

-- Hackathon MVP: authenticated clinic staff share one workspace.
-- Multi-clinic tenancy will add clinic_id to every policy in a later migration.
create policy "authenticated staff read profiles" on public.profiles for select to authenticated using (true);
create policy "authenticated staff manage specialties" on public.specialties for all to authenticated using (true) with check (true);
create policy "authenticated staff manage doctors" on public.doctors for all to authenticated using (true) with check (true);
create policy "authenticated staff manage patients" on public.patients for all to authenticated using (true) with check (true);
create policy "authenticated staff manage consultations" on public.consultations for all to authenticated using (true) with check (true);
create policy "authenticated staff manage recommendations" on public.consultation_recommendations for all to authenticated using (true) with check (true);
create policy "authenticated staff manage appointments" on public.appointments for all to authenticated using (true) with check (true);
create policy "authenticated staff manage followups" on public.followups for all to authenticated using (true) with check (true);
create policy "authenticated staff manage calls" on public.followup_calls for all to authenticated using (true) with check (true);
create policy "authenticated staff manage results" on public.call_results for all to authenticated using (true) with check (true);
