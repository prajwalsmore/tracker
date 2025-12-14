"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";
import { useEffect, useState } from "react";

const QUOTES = [
    "Success is the sum of small efforts, repeated day in and day out.",
    "The secret of your future is hidden in your daily routine.",
    "Don't watch the clock; do what it does. Keep going.",
    "First we make our habits, then our habits make us.",
    "Motivation is what gets you started. Habit is what keeps you going.",
    "It does not matter how slowly you go as long as you do not stop.",
    "Discipline is doing what needs to be done, even if you don't want to.",
];

export function QuoteCard() {
    const [quote, setQuote] = useState("");

    useEffect(() => {
        // Pick a random quote daily (seeded by date ideally, but random is fine for now)
        const randomIndex = Math.floor(Math.random() * QUOTES.length);
        setQuote(QUOTES[randomIndex]);
    }, []);

    return (
        <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 border-none text-white">
            <CardContent className="p-6 flex items-start space-x-4">
                <Quote className="h-8 w-8 opacity-50 shrink-0" />
                <p className="text-lg font-medium italic leading-relaxed">
                    "{quote}"
                </p>
            </CardContent>
        </Card>
    );
}
