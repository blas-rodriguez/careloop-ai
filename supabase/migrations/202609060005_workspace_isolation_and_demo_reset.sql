-- Isolate every clinical workspace by authenticated owner and provide an atomic,
-- fictional demo reset. Existing records are assigned to the oldest account.

alter table public.specialties add column owner_id uuid references auth.users(id) on delete cascade;
alter table public.doctors add column owner_id uuid references auth.users(id) on delete cascade;
alter table public.patients add column owner_id uuid references auth.users(id) on delete cascade;

do $$
declare
  first_user uuid;
begin
  select id into first_user from auth.users order by created_at limit 1;
  if first_user is not null then
    update public.specialties set owner_id = first_user where owner_id is null;
    update public.doctors set owner_id = first_user where owner_id is null;
    update public.patients set owner_id = first_user where owner_id is null;
  else
    delete from public.patients where owner_id is null;
    delete from public.doctors where owner_id is null;
    delete from public.specialties where owner_id is null;
  end if;
end $$;

alter table public.specialties alter column owner_id set default auth.uid();
alter table public.specialties alter column owner_id set not null;
alter table public.doctors alter column owner_id set default auth.uid();
alter table public.doctors alter column owner_id set not null;
alter table public.patients alter column owner_id set default auth.uid();
alter table public.patients alter column owner_id set not null;

alter table public.specialties drop constraint if exists specialties_name_key;
alter table public.specialties add constraint specialties_owner_name_key unique (owner_id, name);
create index doctors_owner_idx on public.doctors(owner_id);
create index patients_owner_idx on public.patients(owner_id);

drop policy if exists "authenticated staff read profiles" on public.profiles;
drop policy if exists "authenticated staff manage specialties" on public.specialties;
drop policy if exists "authenticated staff manage doctors" on public.doctors;
drop policy if exists "authenticated staff manage patients" on public.patients;
drop policy if exists "authenticated staff manage consultations" on public.consultations;
drop policy if exists "authenticated staff manage recommendations" on public.consultation_recommendations;
drop policy if exists "authenticated staff manage appointments" on public.appointments;
drop policy if exists "authenticated staff manage followups" on public.followups;
drop policy if exists "authenticated staff manage calls" on public.followup_calls;
drop policy if exists "authenticated staff manage results" on public.call_results;

create policy "users read own profile" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);

create policy "users manage own specialties" on public.specialties
  for all to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create policy "users manage own doctors" on public.doctors
  for all to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create policy "users manage own patients" on public.patients
  for all to authenticated
  using ((select auth.uid()) = owner_id)
  with check (
    (select auth.uid()) = owner_id
    and (primary_doctor_id is null or exists (
      select 1 from public.doctors d where d.id = primary_doctor_id and d.owner_id = (select auth.uid())
    ))
  );

create policy "users manage own consultations" on public.consultations
  for all to authenticated
  using (exists (select 1 from public.patients p where p.id = patient_id and p.owner_id = (select auth.uid())))
  with check (
    exists (select 1 from public.patients p where p.id = patient_id and p.owner_id = (select auth.uid()))
    and exists (select 1 from public.doctors d where d.id = doctor_id and d.owner_id = (select auth.uid()))
  );

create policy "users manage own recommendations" on public.consultation_recommendations
  for all to authenticated
  using (exists (
    select 1 from public.consultations c join public.patients p on p.id = c.patient_id
    where c.id = consultation_id and p.owner_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.consultations c join public.patients p on p.id = c.patient_id
    where c.id = consultation_id and p.owner_id = (select auth.uid())
  ));

create policy "users manage own appointments" on public.appointments
  for all to authenticated
  using (exists (select 1 from public.patients p where p.id = patient_id and p.owner_id = (select auth.uid())))
  with check (
    exists (select 1 from public.patients p where p.id = patient_id and p.owner_id = (select auth.uid()))
    and exists (select 1 from public.doctors d where d.id = doctor_id and d.owner_id = (select auth.uid()))
  );

create policy "users manage own followups" on public.followups
  for all to authenticated
  using (exists (
    select 1 from public.consultations c join public.patients p on p.id = c.patient_id
    where c.id = consultation_id and p.owner_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.consultations c join public.patients p on p.id = c.patient_id
    where c.id = consultation_id and p.owner_id = (select auth.uid())
  ));

create policy "users manage own calls" on public.followup_calls
  for all to authenticated
  using (exists (
    select 1 from public.followups f join public.consultations c on c.id = f.consultation_id
      join public.patients p on p.id = c.patient_id
    where f.id = followup_id and p.owner_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.followups f join public.consultations c on c.id = f.consultation_id
      join public.patients p on p.id = c.patient_id
    where f.id = followup_id and p.owner_id = (select auth.uid())
  ));

create policy "users manage own results" on public.call_results
  for all to authenticated
  using (exists (
    select 1 from public.followup_calls fc join public.followups f on f.id = fc.followup_id
      join public.consultations c on c.id = f.consultation_id join public.patients p on p.id = c.patient_id
    where fc.id = call_id and p.owner_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.followup_calls fc join public.followups f on f.id = fc.followup_id
      join public.consultations c on c.id = f.consultation_id join public.patients p on p.id = c.patient_id
    where fc.id = call_id and p.owner_id = (select auth.uid())
  ));

create or replace function public.reset_demo_workspace()
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  general_id uuid := gen_random_uuid();
  cardio_id uuid := gen_random_uuid();
  trauma_id uuid := gen_random_uuid();
  doctor_a uuid := gen_random_uuid();
  doctor_b uuid := gen_random_uuid();
  doctor_c uuid := gen_random_uuid();
  patient_a uuid := gen_random_uuid();
  patient_b uuid := gen_random_uuid();
  patient_c uuid := gen_random_uuid();
  patient_d uuid := gen_random_uuid();
  patient_e uuid := gen_random_uuid();
  consultation_one uuid := gen_random_uuid();
  consultation_two uuid := gen_random_uuid();
  consultation_three uuid := gen_random_uuid();
  consultation_four uuid := gen_random_uuid();
  consultation_five uuid := gen_random_uuid();
  followup_one uuid := gen_random_uuid();
  followup_two uuid := gen_random_uuid();
  followup_three uuid := gen_random_uuid();
  followup_four uuid := gen_random_uuid();
  followup_five uuid := gen_random_uuid();
  call_one uuid := gen_random_uuid();
  call_two uuid := gen_random_uuid();
  call_three uuid := gen_random_uuid();
begin
  if uid is null then raise exception 'Authentication required'; end if;

  delete from public.patients where owner_id = uid;
  delete from public.doctors where owner_id = uid;
  delete from public.specialties where owner_id = uid;

  insert into public.specialties (id, owner_id, name) values
    (general_id, uid, 'General Medicine'), (cardio_id, uid, 'Cardiology'),
    (trauma_id, uid, 'Traumatology');
  insert into public.doctors (id, owner_id, full_name, specialty_id, email) values
    (doctor_a, uid, 'Demo Clinician A', general_id, 'clinician-a@example.invalid'),
    (doctor_b, uid, 'Demo Clinician B', cardio_id, 'clinician-b@example.invalid'),
    (doctor_c, uid, 'Demo Clinician C', trauma_id, 'clinician-c@example.invalid');
  insert into public.patients (id, owner_id, full_name, birth_date, phone, consent_to_automated_calls, consent_recorded_at, primary_doctor_id) values
    (patient_a, uid, 'Demo Patient A', '1992-04-18', '+12025550100', true, now() - interval '30 days', doctor_a),
    (patient_b, uid, 'Demo Patient B', '1980-08-07', '+12025550101', true, now() - interval '25 days', doctor_a),
    (patient_c, uid, 'Demo Patient C', '1997-01-21', '+12025550102', true, now() - interval '20 days', doctor_b),
    (patient_d, uid, 'Demo Patient D', '1968-11-03', '+12025550103', true, now() - interval '15 days', doctor_b),
    (patient_e, uid, 'Demo Patient E', '1985-06-12', '+12025550104', true, now() - interval '12 days', doctor_c);
  insert into public.consultations (id, patient_id, doctor_id, occurred_at, reason, followup_notes) values
    (consultation_one, patient_a, doctor_a, now() - interval '2 days', 'Synthetic recovery scenario A', 'Demo-only prompt: ask about progress and new concerns.'),
    (consultation_two, patient_b, doctor_a, now() - interval '1 day', 'Synthetic recovery scenario B', 'Demo-only prompt: check progress.'),
    (consultation_three, patient_c, doctor_b, now() - interval '4 days', 'Synthetic review scenario C', 'Demo-only prompt: ask about changes.'),
    (consultation_four, patient_d, doctor_b, now() - interval '5 days', 'Synthetic review scenario D', 'Demo-only prompt: ask whether another appointment is wanted.'),
    (consultation_five, patient_e, doctor_c, now() - interval '6 days', 'Synthetic recovery scenario E', 'Demo-only prompt: review general progress.');
  insert into public.consultation_recommendations (consultation_id, recommendation, position) values
    (consultation_one, 'Synthetic demo recommendation A1.', 1),
    (consultation_one, 'Synthetic demo recommendation A2.', 2),
    (consultation_two, 'Synthetic demo recommendation B1.', 1),
    (consultation_three, 'Synthetic demo recommendation C1.', 1),
    (consultation_four, 'Synthetic demo recommendation D1.', 1),
    (consultation_five, 'Synthetic demo recommendation E1.', 1);
  insert into public.followups (id, consultation_id, scheduled_for, status, attempt_count) values
    (followup_one, consultation_one, now() - interval '1 hour', 'completed', 1),
    (followup_two, consultation_two, now() + interval '2 hours', 'scheduled', 0),
    (followup_three, consultation_three, now() - interval '3 hours', 'completed', 1),
    (followup_four, consultation_four, now() - interval '1 day', 'completed', 1),
    (followup_five, consultation_five, now() + interval '1 day', 'failed', 1);
  insert into public.followup_calls (id, followup_id, provider, provider_call_id, status, started_at, completed_at, failure_reason) values
    (call_one, followup_one, 'mock', 'demo-' || call_one, 'completed', now() - interval '1 hour', now() - interval '56 minutes', null),
    (call_two, followup_three, 'mock', 'demo-' || call_two, 'completed', now() - interval '3 hours', now() - interval '2 hours 56 minutes', null),
    (call_three, followup_four, 'mock', 'demo-' || call_three, 'completed', now() - interval '1 day', now() - interval '23 hours 55 minutes', null);
  insert into public.call_results (call_id, recommendations_followed, outcome, new_symptoms, needs_human_review, appointment_requested, doctor_rating, patient_comments, summary, transcript, structured_payload) values
    (call_one, true, 'improving', 'Synthetic symptom A', true, false, 5, 'Synthetic demo comment A.', 'Synthetic scenario A routes an uncertain report to human review.', 'CareLoop demo: How is the synthetic scenario progressing?\nDemo recipient: A new concern should be reviewed.\nCareLoop demo: This synthetic result will be routed to the demo care team.', '{"simulation":true,"synthetic":true,"scenario":"clinical_review"}'),
    (call_two, true, 'improving', null, false, false, 5, 'Synthetic demo comment B.', 'Synthetic scenario B records routine improvement.', 'CareLoop demo: How is the synthetic scenario progressing?\nDemo recipient: It is improving.', '{"simulation":true,"synthetic":true,"scenario":"routine"}'),
    (call_three, true, 'unchanged', null, false, true, 4, 'Synthetic demo appointment request.', 'Synthetic scenario C requests a demonstration appointment.', 'CareLoop demo: Should the demo clinic schedule a follow-up?\nDemo recipient: Yes, create a demonstration appointment.', '{"simulation":true,"synthetic":true,"scenario":"appointment"}');
  insert into public.appointments (patient_id, doctor_id, starts_at, status, source) values
    (patient_d, doctor_b, now() + interval '2 days', 'scheduled', 'followup'),
    (patient_a, doctor_a, now() + interval '3 days', 'requested', 'followup'),
    (patient_c, doctor_b, now() - interval '2 days', 'completed', 'staff');

  return jsonb_build_object('patients', 5, 'doctors', 3, 'followups', 5, 'appointments', 3);
end;
$$;

revoke all on function public.reset_demo_workspace() from public, anon;
grant execute on function public.reset_demo_workspace() to authenticated;
