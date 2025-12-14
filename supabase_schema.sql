-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create tasks table
create table public.tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  type text check (type in ('task', 'habit')) not null,
  frequency text check (frequency in ('daily', 'weekly', 'monthly', 'once')) default 'once',
  is_bad boolean default false, -- For habits: true if it's a bad habit
  reminder_time time,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create task_logs table (for one-time tasks or recurring tasks completion history)
create table public.task_logs (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  date date default current_date not null
);

-- Create habit_logs table (specifically for daily habit tracking)
create table public.habit_logs (
  id uuid default uuid_generate_v4() primary key,
  habit_id uuid references public.tasks(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date default current_date not null,
  completed boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(habit_id, date)
);

-- Enable Row Level Security (RLS)
alter table public.tasks enable row level security;
alter table public.task_logs enable row level security;
alter table public.habit_logs enable row level security;

-- Create Policies
-- Tasks
create policy "Users can view their own tasks" on public.tasks
  for select using (auth.uid() = user_id);

create policy "Users can insert their own tasks" on public.tasks
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own tasks" on public.tasks
  for update using (auth.uid() = user_id);

create policy "Users can delete their own tasks" on public.tasks
  for delete using (auth.uid() = user_id);

-- Task Logs
create policy "Users can view their own task logs" on public.task_logs
  for select using (auth.uid() = user_id);

create policy "Users can insert their own task logs" on public.task_logs
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own task logs" on public.task_logs
  for update using (auth.uid() = user_id);

create policy "Users can delete their own task logs" on public.task_logs
  for delete using (auth.uid() = user_id);

-- Habit Logs
create policy "Users can view their own habit logs" on public.habit_logs
  for select using (auth.uid() = user_id);

create policy "Users can insert their own habit logs" on public.habit_logs
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own habit logs" on public.habit_logs
  for update using (auth.uid() = user_id);

create policy "Users can delete their own habit logs" on public.habit_logs
  for delete using (auth.uid() = user_id);
