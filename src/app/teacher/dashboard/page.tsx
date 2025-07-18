"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getQuizzesFromStorage, setQuizzesToStorage, getQuizAttemptsFromStorage, getClassroomsFromStorage } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, Edit, Trash2, BarChart2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import type { Quiz, QuizAttempt, Classroom } from "@/lib/types";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);

  useEffect(() => {
    const allAttempts = getQuizAttemptsFromStorage();
    setQuizAttempts(allAttempts);
    if (user) {
      const allQuizzes = getQuizzesFromStorage();
      setQuizzes(allQuizzes.filter(q => q.createdBy === user.id));
      const allClassrooms = getClassroomsFromStorage();
      setClassrooms(allClassrooms.filter(c => c.createdBy === user.id));
    }
  }, [user]);

  const handleDelete = (quizId: string) => {
    const allQuizzes = getQuizzesFromStorage();
    const updatedQuizzes = allQuizzes.filter(q => q.id !== quizId);
    setQuizzesToStorage(updatedQuizzes);
    setQuizzes(currentQuizzes => currentQuizzes.filter(q => q.id !== quizId));
  };
  
  const getAttemptCount = (quizId: string) => {
    return quizAttempts.filter(a => a.quizId === quizId).length;
  };

  const getQuizClassroomName = (classroomId?: string) => {
    if (!classroomId) return 'Public';
    const classroom = classrooms.find(c => c.id === classroomId);
    return classroom ? classroom.name : 'Unknown Classroom';
  }

  const skillLevelColors = {
    Beginner: "bg-green-100 text-green-800 border-green-200",
    Intermediate: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Advanced: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl font-bold">My Quizzes</h1>
          <p className="text-muted-foreground text-lg">Manage, edit, and view results for your quizzes.</p>
          {user && <p className="text-sm text-muted-foreground pt-1">Your ID: <code className="bg-muted px-1.5 py-1 rounded-sm">{user.id}</code></p>}
        </div>
        <Button asChild>
          <Link href="/teacher/quiz/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Quiz
          </Link>
        </Button>
      </div>
      
      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Skill Level</TableHead>
              <TableHead>Classroom</TableHead>
              <TableHead>Questions</TableHead>
              <TableHead>Attempts</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quizzes.length > 0 ? quizzes.map(quiz => (
              <TableRow key={quiz.id}>
                <TableCell className="font-medium">{quiz.title}</TableCell>
                <TableCell>{quiz.subject}</TableCell>
                <TableCell><Badge variant="outline" className={skillLevelColors[quiz.skillLevel]}>{quiz.skillLevel}</Badge></TableCell>
                <TableCell>{getQuizClassroomName(quiz.classroomId)}</TableCell>
                <TableCell>{quiz.questions.length}</TableCell>
                <TableCell>{getAttemptCount(quiz.id)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/teacher/quiz/${quiz.id}/edit`)} className="cursor-pointer">
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/teacher/quiz/${quiz.id}/results`)} className="cursor-pointer" disabled={getAttemptCount(quiz.id) === 0}>
                        <BarChart2 className="mr-2 h-4 w-4" /> View Results
                      </DropdownMenuItem>
                      <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" className="w-full justify-start text-sm p-2 text-red-500 hover:text-red-500 hover:bg-red-50 rounded-sm font-normal relative h-auto">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                              <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>This action cannot be undone. This will permanently delete the quiz.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(quiz.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                              </AlertDialogFooter>
                          </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No quizzes created yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
