alter table public.call_results
  add column reviewed_at timestamptz,
  add column reviewed_by uuid references public.profiles(id);

create index call_results_pending_review_idx
  on public.call_results(created_at desc)
  where needs_human_review = true and reviewed_at is null;
