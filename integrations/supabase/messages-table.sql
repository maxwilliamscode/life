-- Drop existing table if it exists
drop table if exists public.messages;

-- Create messages table with all required columns
create table public.messages (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    email text not null,
    subject text,
    message text not null,
    read boolean default false,
    archived boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.messages enable row level security;

-- Allow anyone to insert messages
create policy "Anyone can insert messages"
on public.messages for insert
to authenticated, anon
with check (true);

-- Only admins can view messages
create policy "Only admins can view messages"
on public.messages for select
to authenticated
using (
    auth.uid() in (
        select user_id from admin_users
    )
);

-- Only admins can update messages
create policy "Only admins can update messages"
on public.messages for update
to authenticated
using (
    auth.uid() in (
        select user_id from admin_users
    )
);

-- Only admins can delete messages
create policy "Only admins can delete messages"
on public.messages for delete
to authenticated
using (
    auth.uid() in (
        select user_id from admin_users
    )
);

-- Grant necessary permissions
grant all on public.messages to authenticated;
grant all on public.messages to anon;
