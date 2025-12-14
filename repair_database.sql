-- MASTER FIX SCRIPT
-- Run this entire script in Supabase SQL Editor to fix all structural issues.

BEGIN;

-- 1. Ensure public.users exists
CREATE TABLE IF NOT EXISTS public.users (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  password text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Add 'days_of_week' column if missing
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS days_of_week integer[];

-- 3. Update Frequency Check Constraint
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_frequency_check;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_frequency_check 
  CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly', 'once'));

-- 4. FIX FOREIGN KEYS (The most critical part)
-- We drop existing constraints to ensure we aren't pointing to the wrong users table (auth.users)
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_user_id_fkey;
ALTER TABLE public.task_logs DROP CONSTRAINT IF EXISTS task_logs_user_id_fkey;
ALTER TABLE public.habit_logs DROP CONSTRAINT IF EXISTS habit_logs_user_id_fkey;

-- Re-add them pointing strictly to PUBLIC.users
ALTER TABLE public.tasks
  ADD CONSTRAINT tasks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.task_logs
  ADD CONSTRAINT task_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.habit_logs
  ADD CONSTRAINT habit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- 5. Disable RLS (Since we use custom auth + server actions)
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs DISABLE ROW LEVEL SECURITY;

COMMIT;
