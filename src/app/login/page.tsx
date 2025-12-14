"use client";

import { useState } from "react";
import { login, register } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        setError(null);

        const action = isLogin ? login : register;
        const result = await action(formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
        // If success, it redirects, so no need to set loading false
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>{isLogin ? "Welcome Back" : "Create Account"}</CardTitle>
                    <CardDescription>
                        {isLogin
                            ? "Sign in to your daily tracker"
                            : "Start tracking your habits today"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                name="email"
                                type="email"
                                placeholder="Email"
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                name="password"
                                type="password"
                                placeholder="Password"
                                required
                                disabled={loading}
                                minLength={6}
                            />
                        </div>
                        {error && <div className="text-sm text-red-600">{error}</div>}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {isLogin ? "Sign In" : "Create Account"}
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError(null);
                            }}
                            className="text-primary hover:underline"
                        >
                            {isLogin
                                ? "Need an account? Register"
                                : "Already have an account? Sign in"}
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
