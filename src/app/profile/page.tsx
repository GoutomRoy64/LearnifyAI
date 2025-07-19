"use client";

import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getClassroomsFromStorage, getQuizzesFromStorage, getQuizAttemptsFromStorage } from "@/lib/mock-data";
import type { Classroom, Quiz, QuizAttempt } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, User, BookOpen, GraduationCap, CheckCircle } from "lucide-react";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }

    if (user) {
      if (user.role === 'student') {
        const allClasses = getClassroomsFromStorage();
        setClassrooms(allClasses.filter(c => c.studentIds.includes(user.id)));
        const allAttempts = getQuizAttemptsFromStorage();
        setQuizAttempts(allAttempts.filter(a => a.studentId === user.id));
      } else if (user.role === 'teacher') {
        const allClasses = getClassroomsFromStorage();
        setClassrooms(allClasses.filter(c => c.createdBy === user.id));
        const allQuizzes = getQuizzesFromStorage();
        setQuizzes(allQuizzes.filter(q => q.createdBy === user.id));
      }
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const averageScore = quizAttempts.length > 0
    ? quizAttempts.reduce((acc, a) => acc + a.score, 0) / quizAttempts.length
    : 0;

  return (
    <div className="container mx-auto max-w-4xl py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="items-center text-center">
              <Avatar className="w-24 h-24 mb-4">
                <AvatarFallback className="text-4xl">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <CardTitle className="font-headline text-2xl">{user.name}</CardTitle>
              <CardDescription className="capitalize">{user.role}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-4 w-4" />
                <span>User ID: <code className="bg-muted px-1 rounded-sm">{user.id}</code></span>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              {user.role === 'student' && (
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 bg-primary/5 rounded-lg">
                    <h3 className="font-semibold flex items-center gap-2 mb-2"><GraduationCap className="h-5 w-5"/> Classrooms</h3>
                    <p className="text-3xl font-bold">{classrooms.length}</p>
                  </div>
                  <div className="p-4 bg-primary/5 rounded-lg">
                    <h3 className="font-semibold flex items-center gap-2 mb-2"><CheckCircle className="h-5 w-5"/> Quizzes Taken</h3>
                    <p className="text-3xl font-bold">{quizAttempts.length}</p>
                  </div>
                   <div className="p-4 bg-primary/5 rounded-lg col-span-2">
                    <h3 className="font-semibold flex items-center gap-2 mb-2"><BookOpen className="h-5 w-5"/> Average Score</h3>
                    <p className="text-3xl font-bold">{Math.round(averageScore)}%</p>
                  </div>
                </div>
              )}
              {user.role === 'teacher' && (
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 bg-primary/5 rounded-lg">
                    <h3 className="font-semibold flex items-center gap-2 mb-2"><GraduationCap className="h-5 w-5"/> Classrooms Created</h3>
                    <p className="text-3xl font-bold">{classrooms.length}</p>
                  </div>
                  <div className="p-4 bg-primary/5 rounded-lg">
                    <h3 className="font-semibold flex items-center gap-2 mb-2"><BookOpen className="h-5 w-5"/> Quizzes Created</h3>
                    <p className="text-3xl font-bold">{quizzes.length}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
