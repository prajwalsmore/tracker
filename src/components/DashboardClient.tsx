"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { TaskCard } from "@/components/TaskCard";
import { HabitCard } from "@/components/HabitCard";
import { AddItemModal } from "@/components/AddItemModal";
import { TaskWithLogs, Task, TaskLog, HabitLog } from "@/types";
import { format } from "date-fns";

import { logout } from "@/app/actions/auth";
import { createTask, updateTask, deleteTask, toggleTask, toggleHabit } from "@/app/actions/tasks";
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

    // We don't need router.refresh() as much if we update local state optimistically or revalidatePath handles it
    // But keeping router for now
    const router = useRouter();
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

        const result = await toggleTask(taskId, completed, todayDate);
        if (result.error) {
            console.error(result.error);
            // Revert on error?
        }
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

        const result = await toggleHabit(habitId, newCompleted, todayDate);
        if (result.error) {
            console.error(result.error);
        }
    };

    const handleAddTask = async (data: any) => {
        const result = await createTask({
            ...data,
            type: "task"
        });

        if (result.success) {
            router.refresh();
            // Force reload to be safe until we trust revalidation fully
            window.location.reload();
        } else {
            alert("Failed to add task: " + result.error);
        }
    };

    const handleAddHabit = async (data: any) => {
        console.log("DashboardClient: Adding Habit", data);
        try {
            const result = await createTask({
                ...data,
                type: "habit",
                frequency: "daily",
                is_bad: data.type === "bad"
            });

            console.log("DashboardClient: Result", result);

            if (result.success) {
                router.refresh();
                window.location.reload();
            } else {
                alert("Failed to add habit: " + result.error);
            }
        } catch (e: any) {
            console.error("DashboardClient: Exception", e);
            alert("An unexpected error occurred: " + e.message);
        }
    };

    const handleUpdateTask = async (id: string, data: any) => {
        const result = await updateTask(id, data);

        if (result.success) {
            setEditingTask(null);
            setIsEditOpen(false);
            router.refresh();
            window.location.reload();
        } else {
            alert("Failed to update: " + result.error);
        }
    };

    const openEditModal = (task: TaskWithLogs) => {
        setEditingTask(task);
        setIsEditOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this item?")) return;

        // Optimistic
        setTasks((prev) => prev.filter((t) => t.id !== id));

        const result = await deleteTask(id);
        if (result.error) {
            alert("Failed to delete: " + result.error);
            // Revert optimistic update?
            router.refresh();
        } else {
            router.refresh();
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
