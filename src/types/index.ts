export type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'once';
export type TaskType = 'task' | 'habit';

export interface Task {
    id: string;
    user_id: string;
    title: string;
    description?: string;
    type: TaskType;
    frequency: Frequency;
    days_of_week?: number[]; // 0=Sun, 1=Mon, etc.
    is_bad: boolean;
    reminder_time?: string;
    created_at: string;
}

export interface TaskLog {
    id: string;
    task_id: string;
    user_id: string;
    completed_at: string;
    date: string;
}

export interface HabitLog {
    id: string;
    habit_id: string;
    user_id: string;
    date: string;
    completed: boolean;
    created_at: string;
}

export interface TaskWithLogs extends Task {
    logs?: TaskLog[];
    habit_logs?: HabitLog[];
    streak?: number;
    completed_today?: boolean;
}
