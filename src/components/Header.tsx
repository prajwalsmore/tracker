"use client";

import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";

interface HeaderProps {
    completedCount: number;
    totalCount: number;
}

export function Header({ completedCount, totalCount }: HeaderProps) {
    const today = new Date();
    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return (
        <header className="mb-8 space-y-4">
            <div className="flex flex-col space-y-1">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    {format(today, "EEEE, MMMM do")}
                </h1>
                <p className="text-muted-foreground">
                    You have completed {completedCount} of {totalCount} items today.
                </p>
            </div>
            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="font-medium">Daily Progress</span>
                    <span className="text-muted-foreground">{percentage}%</span>
                </div>
                <Progress value={percentage} className="h-2" />
            </div>
        </header>
    );
}
