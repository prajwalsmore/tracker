"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TaskWithLogs } from "@/types";
import { Clock } from "lucide-react";

interface TaskCardProps {
    task: TaskWithLogs;
    onToggle: (taskId: string, completed: boolean) => void;
    onDelete: (taskId: string) => void;
}

export function TaskCard({ task, onToggle, onDelete }: TaskCardProps) {
    return (
        <Card className={cn("transition-all hover:shadow-sm group", task.completed_today && "opacity-60")}>
            <CardContent className="flex items-center p-4 space-x-4">
                <Checkbox
                    checked={task.completed_today}
                    onCheckedChange={(checked) => onToggle(task.id, checked as boolean)}
                    className="h-6 w-6 rounded-full"
                />
                <div className="flex-1 space-y-1">
                    <p className={cn("font-medium leading-none", task.completed_today && "line-through text-muted-foreground")}>
                        {task.title}
                    </p>
                    {task.reminder_time && (
                        <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="mr-1 h-3 w-3" />
                            {task.reminder_time}
                        </div>
                    )}
                </div>
                <button
                    onClick={() => onDelete(task.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                >
                    <span className="sr-only">Delete</span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                </button>
            </CardContent>
        </Card>
    );
}
