"use server";

import { createClient } from "@/lib/supabase/server";
import { verifySession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function createTask(data: any) {
    const { userId } = await verifySession();
    const supabase = await createClient();

    const payload: any = {
        user_id: userId,
        title: data.title,
        type: data.type || "task",
        frequency: data.frequency || "once",
        is_bad: data.is_bad || false,
        reminder_time: data.reminder_time || null,
    };

    // Only add days_of_week if it has values to avoid error if column is missing (backward compatibility)
    if (data.days_of_week && data.days_of_week.length > 0) {
        payload.days_of_week = data.days_of_week;
    }

    const { error } = await supabase.from("tasks").insert(payload);

    if (error) {
        console.error("Create Task Error:", error);
        // Check for Foreign Key Violation (Postgres code 23503)
        // This usually means the User ID in your cookie doesn't exist in the database 
        // (common after resetting DB but keeping cookies)
        if (error.code === '23503') {
            return { error: "Session invalid. Please Log Out and Register/Login again." };
        }
        // Check for Missing Column (Postgres code 42703)
        if (error.code === '42703') {
            return { error: "Database outdated. Please run the SQL Update script." };
        }
        return { error: error.message };
    }

    revalidatePath("/");
    return { success: true };
}

export async function updateTask(id: string, data: any) {
    const { userId } = await verifySession();
    const supabase = await createClient();

    const payload: any = {
        title: data.title,
        frequency: data.frequency,
        reminder_time: data.reminder_time || null,
    };

    if (data.days_of_week && data.days_of_week.length > 0) {
        payload.days_of_week = data.days_of_week;
    } else {
        // Explicitly set to null if we want to clear it, but checking if column exists is hard.
        // If we send null and column is missing -> Error.
        // If we don't send it, we can't clear it.
        // Tradeoff: If empty, we try sending null. If it fails, we catch? 
        // No, let's just assume if they are Editing, they might have run the schema.
        // Or better: try to update with everything, if it fails, try without days_of_week?
        // For now, let's keep it robust for the "Add" case which is most critical.
        // We will include it as null if it's explicitly cleared, but risking the error.
        // Actually, let's default to NOT sending it if it's undefined/null to be safe against schema mismatch.
        // But then we can't uncheck all days using this logic.
        // Let's rely on the user running the SQL for full features.
        // But to prevent "Everything Broken", let's try-catch?
        // Simpler: Just send it. If update fails, it fails. 
        // But for CREATE, it allows new users to start.
        payload.days_of_week = data.days_of_week || null;
    }

    // Actually, let's try to be safe. If we create a dynamic payload:
    // If the user hasn't run the migration, 'days_of_week' column is missing.
    // If we send 'days_of_week: null', it errors.
    // So we should omit it if it's null/undefined.
    // This means we can't "clear" the field if the column exists but we send nothing.
    // But that's a better failure mode than "Can't update anything".
    const safePayload: any = { ...payload };
    if (data.days_of_week === undefined || data.days_of_week === null) {
        delete safePayload.days_of_week;
    }

    const { error } = await supabase
        .from("tasks")
        .update(safePayload)
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
