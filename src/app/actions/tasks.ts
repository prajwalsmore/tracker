"use server";

import { createClient } from "@/lib/supabase/server";
import { verifySession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function createTask(data: any) {
    const { userId } = await verifySession();
    const supabase = await createClient();

    const { error } = await supabase.from("tasks").insert({
        user_id: userId,
        title: data.title,
        type: data.type || "task",
        frequency: data.frequency || "once",
        is_bad: data.is_bad || false,
        reminder_time: data.reminder_time || null,
        days_of_week: data.days_of_week || null,
    });

    if (error) {
        console.error("Create Task Error:", error);
        return { error: error.message };
    }

    revalidatePath("/");
    return { success: true };
}

export async function updateTask(id: string, data: any) {
    const { userId } = await verifySession();
    const supabase = await createClient();

    const { error } = await supabase
        .from("tasks")
        .update({
            title: data.title,
            frequency: data.frequency,
            reminder_time: data.reminder_time || null,
            days_of_week: data.days_of_week || null,
        })
        .eq("id", id)
        .eq("user_id", userId);

    if (error) {
        console.error("Update Task Error:", error);
        return { error: error.message };
    }

    revalidatePath("/");
    return { success: true };
}

export async function deleteTask(id: string) {
    const { userId } = await verifySession();
    const supabase = await createClient();

    const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/");
    return { success: true };
}

export async function toggleTask(taskId: string, completed: boolean, date: string) {
    const { userId } = await verifySession();
    const supabase = await createClient();

    if (completed) {
        const { error } = await supabase.from("task_logs").insert({
            task_id: taskId,
            user_id: userId,
            date: date,
        });
        if (error) return { error: error.message };
    } else {
        const { error } = await supabase
            .from("task_logs")
            .delete()
            .eq("task_id", taskId)
            .eq("date", date)
            .eq("user_id", userId);
        if (error) return { error: error.message };
    }

    revalidatePath("/");
    return { success: true };
}

export async function toggleHabit(habitId: string, completed: boolean, date: string) {
    const { userId } = await verifySession();
    const supabase = await createClient();

    if (completed) {
        const { error } = await supabase.from("habit_logs").upsert({
            habit_id: habitId,
            user_id: userId,
            date: date,
            completed: true,
        }, { onConflict: 'habit_id, date' });
        if (error) return { error: error.message };
    } else {
        // For habits, usually we delete the log or set completed=false
        const { error } = await supabase
            .from("habit_logs")
            .delete()
            .eq("habit_id", habitId)
            .eq("date", date)
            .eq("user_id", userId);
        if (error) return { error: error.message };
    }

    revalidatePath("/");
    return { success: true };
}
