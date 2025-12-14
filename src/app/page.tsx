import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "@/components/DashboardClient";
import { Task, TaskLog, HabitLog, TaskWithLogs } from "@/types";
import { format, subDays } from "date-fns";
import { cookies } from "next/headers";
import { logout } from "@/app/actions/auth";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_session")?.value;

  if (!userId) {
    redirect("/login");
  }

  const supabase = await createClient();
  const today = format(new Date(), "yyyy-MM-dd");

  // Fetch all tasks/habits for the user
  const { data: tasksData, error: tasksError } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (tasksError) {
    console.error("Error fetching tasks:", tasksError);
    // If error is due to invalid user_id (e.g. deleted user), logout
    if (tasksError.code === "PGRST116" || tasksError.message.includes("uuid")) {
      await logout();
    }
    return <div>Error loading tasks</div>;
  }

  const tasks = tasksData as Task[];

  // Fetch logs for today (to check completion)
  const { data: taskLogsData } = await supabase
    .from("task_logs")
    .select("*")
    .eq("user_id", userId)
    .eq("date", today);

  const { data: habitLogsData } = await supabase
    .from("habit_logs")
    .select("*")
    .eq("user_id", userId)
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
      const habitLogsForTask = habitLogs.filter((log) => log.habit_id === task.id);
      const isCompletedToday = habitLogsForTask.some((log) => log.date === today && log.completed);

      let streak = 0;

      // Standard streak logic:
      // If completed today, streak = 1 + streak up to yesterday
      // If not completed today, streak = streak up to yesterday (if yesterday was completed)

      if (isCompletedToday) streak++;

      // Loop backwards
      for (let i = 1; i <= 365; i++) { // Check up to a year back
        const d = subDays(new Date(), i);
        const dateStr = format(d, "yyyy-MM-dd");
        const hasLog = habitLogsForTask.some(l => l.date === dateStr && l.completed);

        if (hasLog) {
          streak++;
        } else {
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

  return <DashboardClient initialTasks={tasksWithLogs} userId={userId} />;
}
