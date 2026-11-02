
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "own profile select" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "own profile insert" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "own profile update" on public.profiles for update to authenticated using (auth.uid() = id);

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  target_amount numeric(14,2) not null default 500000 check (target_amount > 0),
  start_date date not null default '2026-11-02',
  end_date date not null default '2026-12-31',
  currency text not null default 'NGN',
  daily_pitch_target int not null default 10,
  daily_followup_target int not null default 5,
  stage_probabilities jsonb not null default '{"new_lead":5,"contacted":10,"interested":25,"discovery_call":40,"proposal_sent":60,"negotiation":80,"won":100,"lost":0}',
  created_at timestamptz not null default now(),
  check (end_date >= start_date)
);
grant select, insert, update, delete on public.goals to authenticated;
grant all on public.goals to service_role;
alter table public.goals enable row level security;
create policy "own goals" on public.goals for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.income_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  client_name text not null,
  project_name text not null default '',
  category text not null check (category in ('website','automation','masterclass','other')),
  deal_value numeric(14,2) not null default 0 check (deal_value >= 0),
  amount_received numeric(14,2) not null default 0 check (amount_received >= 0),
  payment_status text not null check (payment_status in ('paid','partial','pending')),
  payment_date date not null,
  notes text,
  created_at timestamptz not null default now(),
  check (amount_received <= deal_value)
);
create index on public.income_records (user_id, payment_date);
grant select, insert, update, delete on public.income_records to authenticated;
grant all on public.income_records to service_role;
alter table public.income_records enable row level security;
create policy "own income" on public.income_records for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.deals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  client_name text not null,
  contact_information text,
  industry text,
  service_type text not null default '',
  estimated_value numeric(14,2) not null default 0 check (estimated_value >= 0),
  stage text not null default 'new_lead' check (stage in ('new_lead','contacted','interested','discovery_call','proposal_sent','negotiation','won','lost')),
  expected_close_date date,
  next_follow_up_date date,
  notes text,
  created_at timestamptz not null default now()
);
create index on public.deals (user_id, stage);
grant select, insert, update, delete on public.deals to authenticated;
grant all on public.deals to service_role;
alter table public.deals enable row level security;
create policy "own deals" on public.deals for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  description text not null,
  amount numeric(14,2) not null check (amount > 0),
  category text not null check (category in ('tools','ads','data','transport','education','misc')),
  roi_classification text not null default 'essential' check (roi_classification in ('essential','non_essential')),
  expense_date date not null,
  notes text,
  created_at timestamptz not null default now()
);
create index on public.expenses (user_id, expense_date);
grant select, insert, update, delete on public.expenses to authenticated;
grant all on public.expenses to service_role;
alter table public.expenses enable row level security;
create policy "own expenses" on public.expenses for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.daily_activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  activity_date date not null,
  researched_businesses int not null default 0 check (researched_businesses >= 0),
  pitches_sent int not null default 0 check (pitches_sent >= 0),
  followups_sent int not null default 0 check (followups_sent >= 0),
  calls_completed int not null default 0 check (calls_completed >= 0),
  proposals_sent int not null default 0 check (proposals_sent >= 0),
  deals_closed int not null default 0 check (deals_closed >= 0),
  content_published int not null default 0 check (content_published >= 0),
  client_work_completed int not null default 0 check (client_work_completed >= 0),
  accomplished text, went_wrong text, learned text, improve text,
  created_at timestamptz not null default now(),
  unique (user_id, activity_date)
);
grant select, insert, update, delete on public.daily_activities to authenticated;
grant all on public.daily_activities to service_role;
alter table public.daily_activities enable row level security;
create policy "own activities" on public.daily_activities for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'));
  insert into public.goals (user_id) values (new.id) on conflict do nothing;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
