-- Run this in your Supabase SQL Editor (supabase.com → project → SQL Editor)

create table if not exists audits (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  email       text not null,
  name        text,
  account_name text,
  vertical    text,
  market      text,
  language    text default 'english',
  date_range  text,
  metrics     text,
  additional_context text,
  report      text
);

-- Index for admin queries
create index on audits (created_at desc);
create index on audits (email);

-- Disable RLS so service role can write freely
alter table audits disable row level security;
