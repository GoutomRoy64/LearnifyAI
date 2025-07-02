"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { 
    getClassroomsFromStorage, 
    getJoinRequestsFromStorage, 
    setJoinRequestsToStorage, 
    setClassroomsToStorage,
    getUsersFromStorage 
} from "@/lib/mock-data";
import type { Classroom, JoinRequest, User } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Users, Mail, Check, X, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TeacherClassroomsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [requests, setRequests] = useState<JoinRequest[]>([]);
    const [students, setStudents] = useState<User[]>([]);
    const [_, setForceRender] = useState(0); // Helper to force re-render on state change

    useEffect(() => {
        if (user) {
            const allUsers = getUsersFromStorage();
            setStudents(allUsers.filter(u => u.role === 'student'));

            const allClassrooms = getClassroomsFromStorage();
            const myClassrooms = allClassrooms.filter(c => c.createdBy === user.id);
            setClassrooms(myClassrooms);

            const allRequests = getJoinRequestsFromStorage();
            const myClassroomIds = myClassrooms.map(c => c.id);
            const myRequests = allRequests.filter(r => myClassroomIds.includes(r.classroomId));
            setRequests(myRequests);
        }
    }, [user]);

    const getStudentName = (studentId: string) => {
        return students.find(s => s.id === studentId)?.name || 'Unknown Student';
    };

    const handleRequest = (requestId: string, newStatus: 'approved' | 'denied') => {
        const allRequests = getJoinRequestsFromStorage();
        const requestToUpdate = allRequests.find(r => r.id === requestId);

        if (!requestToUpdate) return;
        
        requestToUpdate.status = newStatus;

        if (newStatus === 'approved') {
            const allClassrooms = getClassroomsFromStorage();
            const classroomToUpdate = allClassrooms.find(c => c.id === requestToUpdate.classroomId);
            if (classroomToUpdate && !classroomToUpdate.studentIds.includes(requestToUpdate.studentId)) {
                classroomToUpdate.studentIds.push(requestToUpdate.studentId);
                setClassroomsToStorage(allClassrooms);
            }
        }
        
        setJoinRequestsToStorage(allRequests);
        setRequests(allRequests.filter(r => classrooms.map(c=>c.id).includes(r.classroomId)));
        setForceRender(val => val + 1); // Force re-render
        
        toast({ title: `Request ${newStatus}.` });
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-headline text-3xl md:text-4xl font-bold">My Classrooms</h1>
                    <p className="text-muted-foreground text-lg">Manage your classrooms and student requests.</p>
                </div>
                <Button asChild>
                    <Link href="/teacher/classrooms/create">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Classroom
                    </Link>
                </Button>
            </div>
            
            {classrooms.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {classrooms.map(c => {
                        const pendingRequests = requests.filter(r => r.classroomId === c.id && r.status === 'pending');
                        const memberCount = c.studentIds.length;
                        return (
                             <Card key={c.id} className="flex flex-col">
                                <CardHeader>
                                    <CardTitle>{c.name}</CardTitle>
                                    <CardDescription>{c.subject}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow space-y-4">
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Users className="h-4 w-4 mr-2" /> {memberCount} student(s)
                                    </div>
                                     <div>
                                        <h4 className="font-semibold text-sm flex items-center gap-2 mb-2"><Mail className="h-4 w-4" /> Join Requests ({pendingRequests.length})</h4>
                                        {pendingRequests.length > 0 ? (
                                            <ul className="space-y-2">
                                                {pendingRequests.map(r => (
                                                    <li key={r.id} className="flex items-center justify-between text-sm">
                                                        <span>{getStudentName(r.studentId)}</span>
                                                        <div className="flex items-center gap-2">
                                                            <Button size="icon" variant="outline" className="h-7 w-7 bg-green-50 hover:bg-green-100" onClick={() => handleRequest(r.id, 'approved')}>
                                                                <Check className="h-4 w-4 text-green-600"/>
                                                            </Button>
                                                             <Button size="icon" variant="outline" className="h-7 w-7 bg-red-50 hover:bg-red-100" onClick={() => handleRequest(r.id, 'denied')}>
                                                                <X className="h-4 w-4 text-red-600"/>
                                                            </Button>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : <p className="text-sm text-muted-foreground">No pending requests.</p>}
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button asChild className="w-full">
                                        <Link href={`/teacher/classrooms/${c.id}`}>
                                            <Eye className="mr-2 h-4 w-4" /> View Classroom
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <h3 className="font-headline text-xl">No Classrooms Yet</h3>
                    <p className="text-muted-foreground mt-2">Click "Create Classroom" to get started.</p>
                </div>
            )}
        </div>
    );
}
