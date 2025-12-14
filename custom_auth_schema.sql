-- Create users table in public schema
create table public.users (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  password text not null, -- Storing hashed password
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Drop existing foreign key constraints if they exist (to replace them)
alter table public.tasks drop constraint if exists tasks_user_id_fkey;
alter table public.task_logs drop constraint if exists task_logs_user_id_fkey;
alter table public.habit_logs drop constraint if exists habit_logs_user_id_fkey;

-- Add new foreign key constraints referencing public.users
alter table public.tasks
  add constraint tasks_user_id_fkey foreign key (user_id) references public.users(id) on delete cascade;

alter table public.task_logs
  add constraint task_logs_user_id_fkey foreign key (user_id) references public.users(id) on delete cascade;

alter table public.habit_logs
  add constraint habit_logs_user_id_fkey foreign key (user_id) references public.users(id) on delete cascade;

-- Disable RLS for now as we are handling auth manually via server actions
alter table public.tasks disable row level security;
alter table public.task_logs disable row level security;
alter table public.habit_logs disable row level security;
