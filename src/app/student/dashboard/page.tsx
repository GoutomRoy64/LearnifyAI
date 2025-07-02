"use client";

import { useState, useEffect } from "react";
import { getQuizzesFromStorage, getQuizAttemptsFromStorage, getClassroomsFromStorage, getJoinRequestsFromStorage, setJoinRequestsToStorage } from "@/lib/mock-data";
import { QuizCard } from "@/components/quiz-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import type { Quiz, QuizAttempt, Classroom, JoinRequest } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

function QuizzesTab({ quizzes, attempts }: { quizzes: Quiz[], attempts: QuizAttempt[] }) {
    const [search, setSearch] = useState("");
    const [subject, setSubject] = useState("all");
    const [skillLevel, setSkillLevel] = useState("all");

    const subjects = ["all", ...Array.from(new Set(quizzes.map(q => q.subject)))];
    const skillLevels = ["all", "Beginner", "Intermediate", "Advanced"];

    const filteredQuizzes = quizzes.filter(quiz => {
        return (
            quiz.title.toLowerCase().includes(search.toLowerCase()) &&
            (subject === "all" || quiz.subject === subject) &&
            (skillLevel === "all" || quiz.skillLevel === skillLevel)
        );
    });

    const getQuizTitle = (quizId: string) => {
        return quizzes.find(q => q.id === quizId)?.title || "Unknown Quiz";
    };

    return (
        <div>
            <div className="mb-8 p-6 rounded-lg border bg-card shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="search">Search Quiz</Label>
                        <Input id="search" placeholder="Search by title..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="subject">Filter by Subject</Label>
                        <Select value={subject} onValueChange={setSubject}>
                            <SelectTrigger id="subject"><SelectValue placeholder="All Subjects" /></SelectTrigger>
                            <SelectContent>{subjects.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="skill">Filter by Skill Level</Label>
                        <Select value={skillLevel} onValueChange={setSkillLevel}>
                            <SelectTrigger id="skill"><SelectValue placeholder="All Skill Levels" /></SelectTrigger>
                            <SelectContent>{skillLevels.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <h2 className="font-headline text-2xl font-bold mt-12 mb-6">Available Quizzes</h2>
            {filteredQuizzes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredQuizzes.map(quiz => <QuizCard key={quiz.id} quiz={quiz} />)}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <h3 className="font-headline text-xl">No Quizzes Found</h3>
                    <p className="text-muted-foreground mt-2">Try adjusting your search or filter criteria.</p>
                </div>
            )}

            <div className="mt-12">
                <h2 className="font-headline text-2xl font-bold mb-6">My Quiz History</h2>
                {attempts.length > 0 ? (
                    <div className="border rounded-lg bg-card">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Quiz</TableHead>
                                    <TableHead>Score</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {attempts.map(attempt => (
                                    <TableRow key={attempt.id}>
                                        <TableCell className="font-medium">{getQuizTitle(attempt.quizId)}</TableCell>
                                        <TableCell>{Math.round(attempt.score)}%</TableCell>
                                        <TableCell>{format(new Date(attempt.submittedAt), "PPP")}</TableCell>
                                        <TableCell className="text-right">
                                            <Button asChild variant="outline" size="sm"><Link href={`/student/quiz/${attempt.quizId}/results`}>View Results</Link></Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="text-center py-16 border-2 border-dashed rounded-lg">
                        <h3 className="font-headline text-xl">No Quiz History</h3>
                        <p className="text-muted-foreground mt-2">Your completed quizzes will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

function ClassroomsTab({ user }) {
    const [joinCode, setJoinCode] = useState('');
    const { toast } = useToast();
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [requests, setRequests] = useState<JoinRequest[]>([]);
    
    useEffect(() => {
        const allClassrooms = getClassroomsFromStorage();
        const allRequests = getJoinRequestsFromStorage();

        const myRequests = allRequests.filter(r => r.studentId === user.id);
        setRequests(myRequests);
        
        const myClassroomIds = myRequests.filter(r => r.status === 'approved').map(r => r.classroomId);
        const myClassrooms = allClassrooms.filter(c => myClassroomIds.includes(c.id));
        setClassrooms(myClassrooms);
    }, [user.id]);

    const handleJoinRequest = (e: React.FormEvent) => {
        e.preventDefault();
        if (!joinCode.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please enter a join code.' });
            return;
        }

        const allClassrooms = getClassroomsFromStorage();
        const targetClassroom = allClassrooms.find(c => c.joinCode === joinCode.trim());

        if (!targetClassroom) {
            toast({ variant: 'destructive', title: 'Error', description: 'Classroom not found.' });
            return;
        }

        const allRequests = getJoinRequestsFromStorage();
        const existingRequest = allRequests.find(r => r.studentId === user.id && r.classroomId === targetClassroom.id);

        if (existingRequest) {
            toast({ title: 'Request already sent', description: 'You have already requested to join this classroom.' });
            return;
        }

        const newRequest: JoinRequest = {
            id: `req-${Date.now()}`,
            classroomId: targetClassroom.id,
            studentId: user.id,
            status: 'pending',
            requestedAt: new Date(),
        };

        setJoinRequestsToStorage([...allRequests, newRequest]);
        setRequests(prev => [...prev, newRequest]);
        setJoinCode('');
        toast({ title: 'Success!', description: 'Your request to join the classroom has been sent.' });
    }
    
    const getRequestStatusBadge = (status: JoinRequest['status']) => {
        switch(status) {
            case 'pending': return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
            case 'approved': return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
            case 'denied': return <Badge variant="destructive">Denied</Badge>;
            default: return null;
        }
    }
    
    const requestedClassrooms = requests.map(r => ({
        ...r,
        classroomName: getClassroomsFromStorage().find(c => c.id === r.classroomId)?.name || 'Unknown Classroom'
    }));

    return (
        <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
                 <Card>
                    <CardHeader><CardTitle>My Classrooms</CardTitle></CardHeader>
                    <CardContent>
                        {classrooms.length > 0 ? (
                            <ul className="space-y-3">
                                {classrooms.map(c => (
                                    <li key={c.id} className="p-4 border rounded-md flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold">{c.name}</p>
                                            <p className="text-sm text-muted-foreground">{c.subject}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-muted-foreground">You haven't joined any classrooms yet.</p>}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>My Join Requests</CardTitle></CardHeader>
                    <CardContent>
                        {requestedClassrooms.length > 0 ? (
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Classroom</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {requestedClassrooms.map(r => (
                                        <TableRow key={r.id}>
                                            <TableCell>{r.classroomName}</TableCell>
                                            <TableCell>{format(new Date(r.requestedAt), "PPP")}</TableCell>
                                            <TableCell>{getRequestStatusBadge(r.status)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : <p className="text-muted-foreground">You have no pending join requests.</p>}
                    </CardContent>
                </Card>
            </div>
            <div>
                 <Card>
                    <CardHeader>
                        <CardTitle>Join a Classroom</CardTitle>
                        <CardDescription>Enter the join code provided by your teacher.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleJoinRequest} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="join-code">Join Code</Label>
                                <Input id="join-code" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} />
                            </div>
                            <Button type="submit" className="w-full">Send Join Request</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);

  useEffect(() => {
    const allQuizzes = getQuizzesFromStorage();
    setQuizzes(allQuizzes);
    if (user) {
      const allAttempts = getQuizAttemptsFromStorage();
      const userAttempts = allAttempts
        .filter(a => a.studentId === user.id)
        .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      setAttempts(userAttempts);
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl font-bold">Welcome, {user.name.split(' ')[0]}!</h1>
        <p className="text-muted-foreground text-lg">Ready to test your knowledge or check on your classrooms?</p>
      </div>

      <Tabs defaultValue="quizzes" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          <TabsTrigger value="classrooms">Classrooms</TabsTrigger>
        </TabsList>
        <TabsContent value="quizzes" className="mt-8">
            <QuizzesTab quizzes={quizzes} attempts={attempts}/>
        </TabsContent>
        <TabsContent value="classrooms" className="mt-8">
            <ClassroomsTab user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
