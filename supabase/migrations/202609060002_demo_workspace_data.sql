-- Expand the fictional dataset so every hackathon demo view has meaningful content.
insert into public.consultations (id, patient_id, doctor_id, occurred_at, reason, followup_notes) values
  ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', now() - interval '1 day', 'Seasonal respiratory symptoms', 'Check symptom progression and adherence.'),
  ('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', now() - interval '4 days', 'Palpitations follow-up', 'Confirm improvement and ask about warning signs.'),
  ('40000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', now() - interval '5 days', 'Blood pressure review', 'Ask whether a new appointment is needed.'),
  ('40000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000003', now() - interval '6 days', 'Knee pain recovery', 'Review mobility and pain progression.')
on conflict (id) do nothing;

insert into public.followups (id, consultation_id, scheduled_for, status, attempt_count) values
  ('50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', now() + interval '2 hours', 'scheduled', 0),
  ('50000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000003', now() - interval '3 hours', 'completed', 1),
  ('50000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000004', now() - interval '1 day', 'completed', 1),
  ('50000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000005', now() + interval '1 day', 'failed', 1)
on conflict (id) do nothing;

insert into public.followup_calls (id, followup_id, provider, provider_call_id, status, started_at, completed_at, failure_reason) values
  ('60000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000003', 'mock', 'demo-call-003', 'completed', now() - interval '3 hours', now() - interval '2 hours 56 minutes', null),
  ('60000000-0000-0000-0000-000000000004', '50000000-0000-0000-0000-000000000004', 'mock', 'demo-call-004', 'completed', now() - interval '1 day', now() - interval '23 hours 55 minutes', null),
  ('60000000-0000-0000-0000-000000000005', '50000000-0000-0000-0000-000000000005', 'mock', 'demo-call-005', 'failed', now() - interval '2 hours', now() - interval '2 hours', 'No answer')
on conflict (id) do nothing;

insert into public.call_results (call_id, recommendations_followed, outcome, new_symptoms, needs_human_review, appointment_requested, doctor_rating, summary) values
  ('60000000-0000-0000-0000-000000000003', true, 'improving', null, false, false, 5, 'Patient reports steady improvement and no new symptoms.'),
  ('60000000-0000-0000-0000-000000000004', true, 'unchanged', null, false, true, 4, 'Patient requested another appointment with the care team.')
on conflict (call_id) do nothing;

insert into public.appointments (id, patient_id, doctor_id, starts_at, status, source) values
  ('70000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', now() + interval '2 days', 'scheduled', 'followup'),
  ('70000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', now() + interval '3 days', 'requested', 'followup'),
  ('70000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', now() - interval '2 days', 'completed', 'staff')
on conflict (id) do nothing;
