"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const taskSchema = z.object({
    title: z.string().min(1, "Title is required"),
    frequency: z.enum(["once", "daily", "weekly", "monthly", "yearly"]),
    reminder_time: z.string().optional(),
    days_of_week: z.array(z.number()).optional(), // 0-6 for Sun-Sat
});

const habitSchema = z.object({
    title: z.string().min(1, "Title is required"),
    type: z.enum(["good", "bad"]),
});

interface AddItemModalProps {
    onAddTask: (data: z.infer<typeof taskSchema>) => void;
    onAddHabit: (data: z.infer<typeof habitSchema>) => void;
    onUpdateTask?: (id: string, data: z.infer<typeof taskSchema>) => void;
    initialData?: any; // For editing
    mode?: "create" | "edit";
    isOpen?: boolean;
    onClose?: () => void;
}

const DAYS = [
    { label: "S", value: 0 },
    { label: "M", value: 1 },
    { label: "T", value: 2 },
    { label: "W", value: 3 },
    { label: "T", value: 4 },
    { label: "F", value: 5 },
    { label: "S", value: 6 },
];

export function AddItemModal({
    onAddTask,
    onAddHabit,
    onUpdateTask,
    initialData,
    mode = "create",
    isOpen,
    onClose
}: AddItemModalProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const open = isOpen !== undefined ? isOpen : internalOpen;
    const setOpen = onClose || setInternalOpen;

    // Determine active tab based on initialData or default
    const [activeTab, setActiveTab] = useState(
        initialData?.type === "habit" ? "habit" : "task"
    );

    const taskForm = useForm<z.infer<typeof taskSchema>>({
        resolver: zodResolver(taskSchema),
        defaultValues: {
            title: initialData?.title || "",
            frequency: initialData?.frequency || "once",
            reminder_time: initialData?.reminder_time || "",
            days_of_week: initialData?.days_of_week || [],
        },
    });

    const habitForm = useForm<z.infer<typeof habitSchema>>({
        resolver: zodResolver(habitSchema),
        defaultValues: {
            title: initialData?.title || "",
            type: initialData?.is_bad ? "bad" : "good",
        },
    });

    // Watch frequency to show/hide days selector
    const frequency = taskForm.watch("frequency");

    const handleClose = () => {
        if (onClose) {
            onClose();
        } else {
            setInternalOpen(false);
        }
    };

    const onTaskSubmit = (data: z.infer<typeof taskSchema>) => {
        if (mode === "edit" && onUpdateTask && initialData) {
            onUpdateTask(initialData.id, data);
        } else {
            onAddTask(data);
        }
        handleClose();
        if (mode === "create") {
            taskForm.reset();
        }
    };

    const onHabitSubmit = (data: z.infer<typeof habitSchema>) => {
        // Habits are just tasks with special types in this app's logic
        // If we are editing, we reuse the same update logic? 
        // Actually the current app separates them. Let's assume onAddHabit handles create.
        // For edit, we might route to onUpdateTask as well if the backend unifies them, 
        // but for now let's keep it simple.
        onAddHabit(data);
        handleClose();
        if (mode === "create") {
            habitForm.reset();
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
            {mode === "create" && (
                <DialogTrigger asChild>
                    <Button className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg" size="icon">
                        <Plus className="h-6 w-6" />
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{mode === "edit" ? "Edit Item" : "Add New Item"}</DialogTitle>
                    <DialogDescription>
                        {mode === "edit" ? "Make changes to your item." : "Create a new task or habit to track."}
                    </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="task" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="task">Task</TabsTrigger>
                        <TabsTrigger value="habit">Habit</TabsTrigger>
                    </TabsList>

                    <TabsContent value="task">
                        <Form {...taskForm}>
                            <form onSubmit={taskForm.handleSubmit(onTaskSubmit)} className="space-y-4">
                                <FormField
                                    control={taskForm.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Title</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Buy groceries" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={taskForm.control}
                                    name="frequency"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Frequency</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select frequency" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="once">One-time</SelectItem>
                                                    <SelectItem value="daily">Daily</SelectItem>
                                                    <SelectItem value="weekly">Weekly</SelectItem>
                                                    <SelectItem value="monthly">Monthly</SelectItem>
                                                    <SelectItem value="yearly">Yearly</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {frequency === "weekly" && (
                                    <FormField
                                        control={taskForm.control}
                                        name="days_of_week"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Repeat On</FormLabel>
                                                <div className="flex justify-between gap-1">
                                                    {DAYS.map((day) => {
                                                        const isSelected = field.value?.includes(day.value);
                                                        return (
                                                            <div
                                                                key={day.value}
                                                                className={`
                                                                    flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-xs font-semibold border
                                                                    ${isSelected ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted'}
                                                                `}
                                                                onClick={() => {
                                                                    const current = field.value || [];
                                                                    const next = current.includes(day.value)
                                                                        ? current.filter(d => d !== day.value)
                                                                        : [...current, day.value];
                                                                    field.onChange(next);
                                                                }}
                                                            >
                                                                {day.label}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                                <FormField
                                    control={taskForm.control}
                                    name="reminder_time"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Reminder Time (Optional)</FormLabel>
                                            <FormControl>
                                                <Input type="time" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full">
                                    {mode === "edit" ? "Save Changes" : "Create Task"}
                                </Button>
                            </form>
                        </Form>
                    </TabsContent>

                    <TabsContent value="habit">
                        <Form {...habitForm}>
                            <form onSubmit={habitForm.handleSubmit(onHabitSubmit)} className="space-y-4">
                                <FormField
                                    control={habitForm.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Title</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Read 10 pages" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={habitForm.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Type</FormLabel>
                                            <FormControl>
                                                <RadioGroup
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    className="flex space-x-4"
                                                >
                                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value="good" />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">
                                                            Good Habit
                                                        </FormLabel>
                                                    </FormItem>
                                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value="bad" />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">
                                                            Bad Habit
                                                        </FormLabel>
                                                    </FormItem>
                                                </RadioGroup>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full">
                                    {mode === "edit" ? "Save Changes" : "Create Habit"}
                                </Button>
                            </form>
                        </Form>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
