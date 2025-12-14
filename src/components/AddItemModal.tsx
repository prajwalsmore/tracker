"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus } from "lucide-react";

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
    frequency: z.enum(["once", "daily", "weekly", "monthly"]),
    reminder_time: z.string().optional(),
});

const habitSchema = z.object({
    title: z.string().min(1, "Title is required"),
    type: z.enum(["good", "bad"]),
});

interface AddItemModalProps {
    onAddTask: (data: z.infer<typeof taskSchema>) => void;
    onAddHabit: (data: z.infer<typeof habitSchema>) => void;
}

export function AddItemModal({ onAddTask, onAddHabit }: AddItemModalProps) {
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("task");

    const taskForm = useForm<z.infer<typeof taskSchema>>({
        resolver: zodResolver(taskSchema),
        defaultValues: {
            title: "",
            frequency: "once",
            reminder_time: "",
        },
    });

    const habitForm = useForm<z.infer<typeof habitSchema>>({
        resolver: zodResolver(habitSchema),
        defaultValues: {
            title: "",
            type: "good",
        },
    });

    const onTaskSubmit = (data: z.infer<typeof taskSchema>) => {
        onAddTask(data);
        setOpen(false);
        taskForm.reset();
    };

    const onHabitSubmit = (data: z.infer<typeof habitSchema>) => {
        onAddHabit(data);
        setOpen(false);
        habitForm.reset();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg" size="icon">
                    <Plus className="h-6 w-6" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Item</DialogTitle>
                    <DialogDescription>
                        Create a new task or habit to track.
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
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
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
                                <Button type="submit" className="w-full">Create Task</Button>
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
                                <Button type="submit" className="w-full">Create Habit</Button>
                            </form>
                        </Form>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
