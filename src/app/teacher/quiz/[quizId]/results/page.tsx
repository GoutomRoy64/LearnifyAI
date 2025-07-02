"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getQuizzesFromStorage, getQuizAttemptsFromStorage, getUsersFromStorage } from "@/lib/mock-data";
import type { Quiz, QuizAttempt, User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";

export default function TeacherQuizResultsPage() {
  const params = useParams();
  const quizId = params.quizId as string;
  const router = useRouter();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const allQuizzes = getQuizzesFromStorage();
    const currentQuiz = allQuizzes.find(q => q.id === quizId) || null;
    setQuiz(currentQuiz);

    const allAttempts = getQuizAttemptsFromStorage();
    const quizAttempts = allAttempts.filter(a => a.quizId === quizId)
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    setAttempts(quizAttempts);
    
    const allUsers = getUsersFromStorage();
    setUsers(allUsers);
    
    setLoading(false);
  }, [quizId]);

  const getStudentName = (studentId: string) => {
    return users.find(u => u.id === studentId)?.name || "Unknown Student";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h2 className="font-headline text-2xl font-bold">Quiz Not Found</h2>
        <p className="text-muted-foreground mt-2">The quiz you are looking for does not exist.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/teacher/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
        </Button>
      </div>
    );
  }
  
  const averageScore = attempts.length > 0 ? attempts.reduce((acc, a) => acc + a.score, 0) / attempts.length : 0;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Button variant="outline" size="sm" onClick={() => router.push('/teacher/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
        </Button>
        <h1 className="font-headline text-3xl md:text-4xl font-bold mt-4">Results for "{quiz.title}"</h1>
        <p className="text-muted-foreground text-lg">See how students performed on this quiz.</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
            <CardHeader>
                <CardTitle>Total Attempts</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-4xl font-bold">{attempts.length}</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Average Score</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-4xl font-bold">{Math.round(averageScore)}%</p>
            </CardContent>
        </Card>
      </div>

      <h2 className="font-headline text-2xl font-bold mb-6">Individual Results</h2>
      {attempts.length > 0 ? (
        <div className="border rounded-lg bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Date Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attempts.map(attempt => (
                <TableRow key={attempt.id}>
                  <TableCell className="font-medium">{getStudentName(attempt.studentId)}</TableCell>
                  <TableCell>{Math.round(attempt.score)}%</TableCell>
                  <TableCell>{format(new Date(attempt.submittedAt), "PPP p")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h3 className="font-headline text-xl">No Attempts Yet</h3>
          <p className="text-muted-foreground mt-2">When students complete this quiz, their results will appear here.</p>
        </div>
      )}
    </div>
  );
}
