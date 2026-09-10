create table public.call_webhook_events (
  event_id text primary key,
  provider_call_id text not null,
  event_type text not null,
  payload jsonb not null,
  processed_at timestamptz not null default now()
);

create index call_webhook_events_provider_idx on public.call_webhook_events(provider_call_id, processed_at desc);

alter table public.call_webhook_events enable row level security;

-- No client policies: webhook events are only accessed with the server-side secret key.
