"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { createSession, deleteSession } from "@/lib/session";

export async function login(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { error: "Email and password are required" };
    }

    const supabase = await createClient();

    // Fetch user from public.users
    const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

    if (error || !user) {
        return { error: "Invalid credentials" };
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        return { error: "Invalid credentials" };
    }

    // Create secure session
    await createSession(user.id);

    redirect("/");
}

export async function register(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { error: "Email and password are required" };
    }

    const supabase = await createClient();

    // Check if user exists
    const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single();

    if (existingUser) {
        return { error: "User already exists" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const { data: newUser, error } = await supabase
        .from("users")
        .insert({
            email,
            password: hashedPassword,
        })
        .select()
        .single();

    if (error) {
        return { error: "Failed to create user" };
    }

    // Create secure session
    await createSession(newUser.id);

    redirect("/");
}

export async function logout() {
    await deleteSession();
    redirect("/login");
}
