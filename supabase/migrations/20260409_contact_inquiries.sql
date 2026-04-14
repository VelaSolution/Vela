-- Contact inquiry form submissions
create table if not exists contact_inquiries (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  message    text not null,
  created_at timestamptz not null default now()
);

-- Allow inserts from service role (the API route uses service role key)
-- No RLS needed since this table is only written by the server.
alter table contact_inquiries enable row level security;
