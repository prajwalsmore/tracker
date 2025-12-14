import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "@/components/DashboardClient";
import { Task, TaskLog, HabitLog, TaskWithLogs } from "@/types";
import { format, subDays, isSameDay, parseISO } from "date-fns";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const today = format(new Date(), "yyyy-MM-dd");

  // Fetch all tasks/habits for the user
  const { data: tasksData, error: tasksError } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (tasksError) {
    console.error("Error fetching tasks:", tasksError);
    return <div>Error loading tasks</div>;
  }

  const tasks = tasksData as Task[];

  // Fetch logs for today (to check completion)
  const { data: taskLogsData } = await supabase
    .from("task_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", today);

  const { data: habitLogsData } = await supabase
    .from("habit_logs")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", format(subDays(new Date(), 30), "yyyy-MM-dd")); // Fetch last 30 days for streak calc

  const taskLogs = (taskLogsData || []) as TaskLog[];
  const habitLogs = (habitLogsData || []) as HabitLog[];

  // Combine data
  const tasksWithLogs: TaskWithLogs[] = tasks.map((task) => {
    if (task.type === "task") {
      const isCompleted = taskLogs.some((log) => log.task_id === task.id);
      return {
        ...task,
        completed_today: isCompleted,
      };
    } else {
      // Calculate streak for habits
      // Simple streak calculation: count consecutive days backwards from yesterday (or today if completed)
      const habitLogsForTask = habitLogs.filter((log) => log.habit_id === task.id);
      const isCompletedToday = habitLogsForTask.some((log) => log.date === today && log.completed);

      let streak = 0;
      let currentCheckDate = isCompletedToday ? new Date() : subDays(new Date(), 1);

      // If not completed today, check if completed yesterday to maintain streak
      // If completed today, streak starts from today

      // Actually, standard streak logic:
      // If completed today, streak = 1 + streak up to yesterday
      // If not completed today, streak = streak up to yesterday (if yesterday was completed)
      // BUT if yesterday was NOT completed, streak is 0 (unless we allow skip days, but let's be strict)

      // Let's simplify: Just count consecutive days present in logs
      // We need to check day by day backwards

      let checkDate = isCompletedToday ? new Date() : subDays(new Date(), 1);

      // If not completed today, we check yesterday. If yesterday is missing, streak is 0.
      // If completed today, we count 1 and check yesterday.

      if (isCompletedToday) streak++;

      // Loop backwards
      for (let i = 1; i <= 365; i++) { // Check up to a year back
        const d = subDays(new Date(), i);
        const dateStr = format(d, "yyyy-MM-dd");
        const hasLog = habitLogsForTask.some(l => l.date === dateStr && l.completed);

        if (hasLog) {
          streak++;
        } else {
          // Streak broken
          // Wait, if we are checking "yesterday" and it's missing, streak breaks.
          // But if we started checking from today (completed), we continue.
          // If we started checking from yesterday (today not completed), we continue.

          // Correct logic:
          // 1. Check today. If yes, streak++.
          // 2. Check yesterday. If yes, streak++.
          // 3. Check day before...
          // STOP at first missing day.

          // My loop logic above:
          // If completed today, streak is 1. Then loop i=1 (yesterday). If hasLog, streak++. Else break.
          // If NOT completed today, streak is 0. Loop i=1 (yesterday). If hasLog, streak++. Else break.
          // This seems correct.
          break;
        }
      }

      return {
        ...task,
        completed_today: isCompletedToday,
        streak,
      };
    }
  });

  return <DashboardClient initialTasks={tasksWithLogs} userId={user.id} />;
}
