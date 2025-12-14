-- Add days_of_week column to tasks
alter table public.tasks 
add column if not exists days_of_week integer[];

-- Drop the old check constraint for frequency
alter table public.tasks 
drop constraint if exists tasks_frequency_check;

-- Add the new check constraint including 'yearly'
alter table public.tasks 
add constraint tasks_frequency_check 
check (frequency in ('daily', 'weekly', 'monthly', 'yearly', 'once'));
