-- Supabase schema for Aurelis (formerly TA Portal)

create extension if not exists pgcrypto;

create table if not exists public.teachers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  created_at timestamp with time zone default now()
);

create table if not exists public.ta_profiles (
  id uuid primary key,
  ta_name text not null,
  sir_name text,
  course text not null,
  email text not null unique,
  class_link_token text unique,
  google_sheet_url text,
  created_at timestamp with time zone default now()
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  ta_id uuid not null references public.ta_profiles(id) on delete cascade,
  name text not null,
  roll_no text not null,
  email text,
  status text not null default 'pending',
  created_at timestamp with time zone default now(),
  unique(ta_id, roll_no)
);

create table if not exists public.pending_tas (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid,
  ta_name text not null,
  ta_email text not null,
  sir_name text,
  teacher_email text not null,
  course text not null,
  approval_token text not null unique,
  status text not null default 'pending',
  created_at timestamp with time zone default now()
);

create table if not exists public.mark_categories (
  id uuid primary key default gen_random_uuid(),
  ta_id uuid not null references public.ta_profiles(id) on delete cascade,
  name text not null,
  total numeric not null default 20,
  created_at timestamp with time zone default now()
);

create table if not exists public.marks (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  ta_id uuid not null references public.ta_profiles(id) on delete cascade,
  category_id uuid references public.mark_categories(id),
  subject text,
  marks numeric,
  total numeric,
  remarks text,
  created_at timestamp with time zone default now(),
  unique(student_id, category_id, subject)
);

create or replace function public.generate_approval_token()
returns text language sql stable as $$
  select encode(gen_random_bytes(16), 'hex');
$$;

create or replace function public.generate_class_token()
returns text language sql stable as $$
  select encode(gen_random_bytes(16), 'hex');
$$;
