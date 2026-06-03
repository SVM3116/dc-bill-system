-- supabase_schema.sql
-- Run this in your Supabase SQL Editor to set up the database tables.

-- 1. Create the public.users table
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  email text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on users
alter table public.users enable row level security;

-- Policies for public.users
create policy "Allow authenticated users full access to users profiles"
  on public.users
  for all
  to authenticated
  using (true)
  with check (true);

-- 2. Create the public.dc_bills table
create table public.dc_bills (
  id uuid default gen_random_uuid() primary key,
  dc_bill_number text not null,
  cheque_number text not null unique,
  cheque_date date not null,
  payee_name text not null,
  payee_address text not null,
  amount numeric(12, 2) not null default 0.00,
  amount_in_words text not null,
  items jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'generated')),
  created_by uuid references public.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on dc_bills
alter table public.dc_bills enable row level security;

-- Policies for public.dc_bills
create policy "Allow authenticated users full access to dc_bills"
  on public.dc_bills
  for all
  to authenticated
  using (true)
  with check (true);

-- 3. Automatic Trigger for Syncing auth.users with public.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Admin User'),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
