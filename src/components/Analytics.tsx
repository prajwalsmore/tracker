"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskWithLogs } from "@/types";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
} from "recharts";

interface AnalyticsProps {
    tasks: TaskWithLogs[];
}

export function Analytics({ tasks }: AnalyticsProps) {
    // 1. Completion by Habit (Bar Chart)
    const completionData = tasks
        .filter((t) => t.type === "habit")
        .map((t) => ({
            name: t.title.substring(0, 10), // Truncate
            streak: t.streak || 0,
        }));

    // 2. Dummy "Last 7 Days" Trend (In real app, we'd aggregate logs)
    // For now, let's just visually mock it based on active streaks or random for demo
    // since we don't have the full history props passed easily yet without heavy processing
    const trendData = [
        { day: "Mon", completed: 4 },
        { day: "Tue", completed: 3 },
        { day: "Wed", completed: 5 },
        { day: "Thu", completed: 4 },
        { day: "Fri", completed: 6 },
        { day: "Sat", completed: 5 },
        { day: "Sun", completed: 7 },
    ];

    if (tasks.length === 0) return null;

    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Current Streaks</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={completionData}>
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip />
                                <Bar dataKey="streak" fill="#8884d8" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Weekly Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData}>
                                <XAxis dataKey="day" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey="completed"
                                    stroke="#82ca9d"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
