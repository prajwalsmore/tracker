"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Header } from "@/components/Header";
import { TaskCard } from "@/components/TaskCard";
import { HabitCard } from "@/components/HabitCard";
import { AddItemModal } from "@/components/AddItemModal";
import { TaskWithLogs, Task, TaskLog, HabitLog } from "@/types";
import { format } from "date-fns";

import { logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { LogOut, PieChart } from "lucide-react";
import { QuoteCard } from "@/components/QuoteCard";
import { Analytics } from "@/components/Analytics";

interface DashboardClientProps {
    initialTasks: TaskWithLogs[];
    userId: string;
}

export function DashboardClient({ initialTasks, userId }: DashboardClientProps) {
    const [tasks, setTasks] = useState<TaskWithLogs[]>(initialTasks);
    const [editingTask, setEditingTask] = useState<TaskWithLogs | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);

    const router = useRouter();
    const supabase = createClient();
    const todayDate = format(new Date(), "yyyy-MM-dd");

    const completedCount = tasks.filter((t) => t.completed_today).length;
    const totalCount = tasks.length;

    const handleToggleTask = async (taskId: string, completed: boolean) => {
        // Optimistic update
        setTasks((prev) =>
            prev.map((t) =>
                t.id === taskId ? { ...t, completed_today: completed } : t
            )
        );

        if (completed) {
            await supabase.from("task_logs").insert({
                task_id: taskId,
                user_id: userId,
                date: todayDate,
            });
        } else {
            await supabase
                .from("task_logs")
                .delete()
                .eq("task_id", taskId)
                .eq("date", todayDate);
        }
        router.refresh();
    };

    const handleToggleHabit = async (habitId: string) => {
        const habit = tasks.find((t) => t.id === habitId);
        if (!habit) return;

        const newCompleted = !habit.completed_today;

        // Optimistic update
        setTasks((prev) =>
            prev.map((t) =>
                t.id === habitId
                    ? {
                        ...t,
                        completed_today: newCompleted,
                        streak: newCompleted ? (t.streak || 0) + 1 : (t.streak || 0) - 1,
                    }
                    : t
            )
        );

        if (newCompleted) {
            await supabase.from("habit_logs").insert({
                habit_id: habitId,
                user_id: userId,
                date: todayDate,
                completed: true,
            });
        } else {
            await supabase
                .from("habit_logs")
                .delete()
                .eq("habit_id", habitId)
                .eq("date", todayDate);
        }
        router.refresh();
    };

    const handleAddTask = async (data: any) => {
        const { error } = await supabase.from("tasks").insert({
            user_id: userId,
            title: data.title,
            type: "task",
            frequency: data.frequency,
            reminder_time: data.reminder_time || null,
        });

        if (!error) {
            router.refresh();
            // Ideally we'd fetch the new task here or wait for refresh
            // For simplicity, we rely on router.refresh() to re-fetch server data
            // But to make it instant, we could reload the page or fetch manually
            window.location.reload();
        }
    };

    const handleAddHabit = async (data: any) => {
        const { error } = await supabase.from("tasks").insert({
            user_id: userId,
            title: data.title,
            type: "habit",
            is_bad: data.type === "bad",
            frequency: "daily",
        });

        if (!error) {
            window.location.reload();
        }
    };

    const handleUpdateTask = async (id: string, data: any) => {
        const { error } = await supabase
            .from("tasks")
            .update({
                title: data.title,
                frequency: data.frequency,
                reminder_time: data.reminder_time || null,
                days_of_week: data.days_of_week || null,
            })
            .eq("id", id);

        if (!error) {
            setEditingTask(null);
            setIsEditOpen(false);
            window.location.reload();
        }
    };

    const openEditModal = (task: TaskWithLogs) => {
        setEditingTask(task);
        setIsEditOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this item?")) return;

        const { error } = await supabase.from("tasks").delete().eq("id", id);
        if (!error) {
            router.refresh();
            // Optimistic update could be done here too
            setTasks((prev) => prev.filter((t) => t.id !== id));
        }
    };

    const oneTimeTasks = tasks.filter((t) => t.type === "task");
    const habits = tasks.filter((t) => t.type === "habit");

    return (
        <div className="container max-w-md mx-auto p-4 pb-24">
            <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                    <Header completedCount={completedCount} totalCount={totalCount} />
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setShowAnalytics(!showAnalytics)}>
                        <PieChart className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => logout()}>
                        <LogOut className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            <div className="mb-8">
                <QuoteCard />
            </div>

            {showAnalytics && (
                <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                    <Analytics tasks={tasks} />
                </div>
            )}

            <div className="space-y-8">
                {oneTimeTasks.length > 0 && (
                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold tracking-tight">Tasks</h2>
                        <div className="space-y-3">
                            {oneTimeTasks.map((task) => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    onToggle={handleToggleTask}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {habits.length > 0 && (
                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold tracking-tight">Habits</h2>
                        <div className="grid gap-3">
                            {habits.map((habit) => (
                                <HabitCard
                                    key={habit.id}
                                    habit={habit}
                                    onToggle={handleToggleHabit}
                                    onDelete={handleDelete}
                                    onEdit={() => openEditModal(habit)}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {tasks.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>No items yet. Add one to get started!</p>
                    </div>
                )}
            </div>

            <AddItemModal onAddTask={handleAddTask} onAddHabit={handleAddHabit} />

            {editingTask && (
                <AddItemModal
                    mode="edit"
                    isOpen={isEditOpen}
                    onClose={() => setIsEditOpen(false)}
                    initialData={editingTask}
                    onAddTask={() => { }} // Not used in edit mode
                    onAddHabit={() => { }} // Not used in edit mode
                    onUpdateTask={handleUpdateTask}
                />
            )}
        </div>
    );
}
