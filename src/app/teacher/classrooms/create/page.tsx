"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { setClassroomsToStorage, getClassroomsFromStorage } from "@/lib/mock-data";
import type { Classroom } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";


const classroomSchema = z.object({
  name: z.string().min(3, "Classroom name must be at least 3 characters."),
  subject: z.string().min(2, "Subject must be at least 2 characters."),
});

type ClassroomFormValues = z.infer<typeof classroomSchema>;

// Helper to generate a random code
const generateJoinCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export default function CreateClassroomPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const { register, handleSubmit, formState: { errors } } = useForm<ClassroomFormValues>({
        resolver: zodResolver(classroomSchema),
        defaultValues: { name: "", subject: "" },
    });

    const onSubmit = (data: ClassroomFormValues) => {
        if (!user) {
            toast({ variant: "destructive", title: "Error", description: "You must be logged in." });
            return;
        }

        const allClassrooms = getClassroomsFromStorage();
        const existingIds = allClassrooms.map(c => parseInt(c.id, 10)).filter(id => !isNaN(id));
        const newClassroomId = (Math.max(0, ...existingIds) + 1).toString();

        const newClassroom: Classroom = {
            id: newClassroomId,
            createdBy: user.id,
            joinCode: generateJoinCode(),
            studentIds: [],
            posts: [],
            ...data
        };
        
        setClassroomsToStorage([...allClassrooms, newClassroom]);
        
        toast({ title: "Success!", description: "Classroom created successfully." });
        router.push('/teacher/classrooms');
    };

    return (
        <div className="container mx-auto max-w-2xl py-8">
            <div className="mb-6">
                <Button asChild variant="outline" size="sm">
                    <Link href="/teacher/classrooms">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Classrooms
                    </Link>
                </Button>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Create New Classroom</CardTitle>
                    <CardDescription>Fill in the details to create a new classroom.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Classroom Name</Label>
                            <Input id="name" {...register("name")} placeholder="e.g., Grade 10 Math" />
                            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input id="subject" {...register("subject")} placeholder="e.g., Algebra" />
                            {errors.subject && <p className="text-sm text-destructive">{errors.subject.message}</p>}
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit">Create Classroom</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
