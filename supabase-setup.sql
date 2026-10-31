-- Run this entire script in Supabase Dashboard > SQL Editor.
create table if not exists public.notices (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 140),
  category text not null check (category in ('সাধারণ','পরীক্ষা','ছুটি','জরুরি')),
  class_name text not null default 'সকল শ্রেণি',
  date date not null default current_date,
  expires date,
  body text not null check (char_length(body) between 1 and 5000),
  important boolean not null default false,
  pdf_url text,
  created_at timestamptz not null default now()
);
create table if not exists public.school_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
-- Explicit schema/table grants are required when automatic table exposure/grants are disabled.
grant usage on schema public to anon, authenticated;
grant select on table public.notices to anon, authenticated;
grant insert, update, delete on table public.notices to authenticated;

alter table public.notices enable row level security;
alter table public.school_admins enable row level security;

create or replace function public.is_school_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.school_admins
    where user_id = (select auth.uid())
  );
$$;
revoke all on function public.is_school_admin() from public;
grant execute on function public.is_school_admin() to anon, authenticated;

drop policy if exists "Anyone can read notices" on public.notices;
create policy "Anyone can read notices" on public.notices for select to anon, authenticated using (true);
drop policy if exists "Admins can create notices" on public.notices;
create policy "Admins can create notices" on public.notices for insert to authenticated with check (public.is_school_admin());
drop policy if exists "Admins can update notices" on public.notices;
create policy "Admins can update notices" on public.notices for update to authenticated using (public.is_school_admin()) with check (public.is_school_admin());
drop policy if exists "Admins can delete notices" on public.notices;
create policy "Admins can delete notices" on public.notices for delete to authenticated using (public.is_school_admin());

-- PDF bucket: public read links; only logged-in school admins can upload/delete.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('notice-pdfs','notice-pdfs',true,10485760,array['application/pdf'])
on conflict (id) do update set public=true, file_size_limit=10485760, allowed_mime_types=array['application/pdf'];
drop policy if exists "Public can read notice PDFs" on storage.objects;
create policy "Public can read notice PDFs" on storage.objects for select to anon, authenticated using (bucket_id='notice-pdfs');
drop policy if exists "School admins upload notice PDFs" on storage.objects;
create policy "School admins upload notice PDFs" on storage.objects for insert to authenticated with check (bucket_id='notice-pdfs' and public.is_school_admin());
drop policy if exists "School admins delete notice PDFs" on storage.objects;
create policy "School admins delete notice PDFs" on storage.objects for delete to authenticated using (bucket_id='notice-pdfs' and public.is_school_admin());

-- IMPORTANT: create your admin user in Authentication > Users first, then run:
-- insert into public.school_admins(user_id)
-- select id from auth.users where email = 'YOUR_ADMIN_EMAIL';
-- Use the exact email you registered. Do not make school_admins publicly readable.
