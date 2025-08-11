
-- Create a table to store saved quotes
create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  email text not null,
  contact_name text,
  company text,
  phone text,
  title text,

  pricing_model text not null, -- 'fixed' | 'subscription' | 'bogof'
  ad_size_id uuid,
  duration_id uuid,

  -- Selected areas
  selected_area_ids uuid[] default '{}',
  bogof_paid_area_ids uuid[] default '{}',
  bogof_free_area_ids uuid[] default '{}',

  -- Pricing summary fields for quick display
  monthly_price numeric not null default 0,
  subtotal numeric,
  final_total numeric,
  duration_multiplier integer,
  total_circulation integer,
  volume_discount_percent numeric,
  duration_discount_percent numeric,

  -- Full snapshots to future-proof pricing changes
  pricing_breakdown jsonb not null default '{}'::jsonb,
  selections jsonb not null default '{}'::jsonb,

  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.quotes enable row level security;

-- Admin full access
create policy "Admin full access to quotes"
  on public.quotes
  for all
  using (has_role(auth.uid(), 'admin'::app_role))
  with check (has_role(auth.uid(), 'admin'::app_role));

-- Users can view their own quotes
create policy "Users can view their own quotes"
  on public.quotes
  for select
  using (auth.uid() = user_id);

-- Users can create their own quotes
create policy "Users can create their own quotes"
  on public.quotes
  for insert
  with check (auth.uid() = user_id);

-- Users can update their own quotes
create policy "Users can update their own quotes"
  on public.quotes
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Users can delete their own quotes
create policy "Users can delete their own quotes"
  on public.quotes
  for delete
  using (auth.uid() = user_id);

-- Keep updated_at current
create trigger quotes_set_timestamp
before update on public.quotes
for each row
execute function public.update_updated_at_column();
