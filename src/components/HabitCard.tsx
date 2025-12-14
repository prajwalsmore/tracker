"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TaskWithLogs } from "@/types";
import { Check, Flame, X } from "lucide-react";

interface HabitCardProps {
    habit: TaskWithLogs;
    onToggle: (habitId: string) => void;
    onDelete: (habitId: string) => void;
}

export function HabitCard({ habit, onToggle, onDelete }: HabitCardProps) {
    const isCompleted = habit.completed_today;
    const isBad = habit.is_bad;

    return (
        <Card className="transition-all hover:shadow-sm group">
            <CardContent className="flex items-center justify-between p-4">
                <div className="flex flex-col space-y-1 flex-1">
                    <div className="flex items-center justify-between mr-4">
                        <span className="font-medium">{habit.title}</span>
                        <button
                            onClick={() => onDelete(habit.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <span className="sr-only">Delete</span>
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                        <Flame className="mr-1 h-3 w-3 text-orange-500" />
                        {habit.streak || 0} day streak
                    </div>
                </div>
                <Button
                    variant={isCompleted ? "default" : "outline"}
                    size="icon"
                    className={cn(
                        "h-10 w-10 rounded-full transition-colors",
                        isCompleted && !isBad && "bg-green-500 hover:bg-green-600 border-green-500",
                        isCompleted && isBad && "bg-red-500 hover:bg-red-600 border-red-500",
                        !isCompleted && isBad && "hover:border-red-500 hover:text-red-500",
                        !isCompleted && !isBad && "hover:border-green-500 hover:text-green-500"
                    )}
                    onClick={() => onToggle(habit.id)}
                >
                    {isCompleted ? <Check className="h-5 w-5" /> : <div className="h-5 w-5" />}
                </Button>
            </CardContent>
        </Card>
    );
}
