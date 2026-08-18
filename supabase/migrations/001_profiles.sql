-- Открой Россию — базовая таблица профилей пользователей.
-- Выполнить один раз в Supabase SQL Editor.

create table if not exists public.profiles (
  id uuid primary key
    references auth.users(id)
    on delete cascade,

  display_name text,
  avatar_url text,
  auth_provider text,

  level integer not null default 1
    check (level >= 1),

  points integer not null default 0
    check (points >= 0),

  routes_completed integer not null default 0
    check (routes_completed >= 0),

  tasks_completed integer not null default 0
    check (tasks_completed >= 0),

  photos_uploaded integer not null default 0
    check (photos_uploaded >= 0),

  reviews_left integer not null default 0
    check (reviews_left >= 0),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  enable row level security;

drop policy if exists
  "Users can read own profile"
  on public.profiles;

create policy
  "Users can read own profile"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists
  "Users can update own profile"
  on public.profiles;

create policy
  "Users can update own profile"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

grant select, update
  on table public.profiles
  to authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists
  set_profiles_updated_at
  on public.profiles;

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id,
    display_name,
    avatar_url,
    auth_provider
  )
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      new.raw_user_meta_data ->> 'display_name',
      'Путешественник'
    ),
    coalesce(
      new.raw_user_meta_data ->> 'avatar_url',
      new.raw_user_meta_data ->> 'picture'
    ),
    coalesce(
      new.raw_app_meta_data ->> 'provider',
      'unknown'
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists
  on_auth_user_created
  on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();
