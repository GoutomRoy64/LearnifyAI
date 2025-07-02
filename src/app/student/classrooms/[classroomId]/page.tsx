
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getClassroomsFromStorage, getUsersFromStorage, getQuizzesFromStorage } from "@/lib/mock-data";
import type { Classroom, User, Post, Quiz } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, BookOpen, Clock, Users } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { QuizCard } from "@/components/quiz-card";

export default function StudentClassroomDetailPage() {
  const params = useParams();
  const classroomId = params.classroomId as string;
  const { user } = useAuth();
  const router = useRouter();

  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [teacher, setTeacher] = useState<User | null>(null);
  const [classroomQuizzes, setClassroomQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && classroomId) {
      const allClassrooms = getClassroomsFromStorage();
      const currentClassroom = allClassrooms.find(c => c.id === classroomId);

      if (!currentClassroom || !currentClassroom.studentIds.includes(user.id)) {
        router.push("/student/dashboard"); // Redirect if not a member
        return;
      }
      setClassroom(currentClassroom);

      const allUsers = getUsersFromStorage();
      setTeacher(allUsers.find(u => u.id === currentClassroom.createdBy) || null);
      setMembers(allUsers.filter(u => currentClassroom.studentIds.includes(u.id)));
      
      const allQuizzes = getQuizzesFromStorage();
      setClassroomQuizzes(allQuizzes.filter(q => q.classroomId === classroomId));

      setLoading(false);
    }
  }, [user, classroomId, router]);

  if (loading || !classroom) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const sortedPosts = classroom.posts.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-6">
        <Button asChild variant="outline" size="sm">
          <Link href="/student/dashboard?tab=classrooms">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <header className="mb-8">
        <h1 className="font-headline text-4xl font-bold">{classroom.name}</h1>
        <p className="text-lg text-muted-foreground">{classroom.subject} - Taught by {teacher?.name}</p>
      </header>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
            <section>
                 <h2 className="font-headline text-2xl mb-4">Classroom Quizzes</h2>
                 {classroomQuizzes.length > 0 ? (
                    <div className="grid sm:grid-cols-2 gap-4">
                        {classroomQuizzes.map(quiz => <QuizCard key={quiz.id} quiz={quiz}/>)}
                    </div>
                 ) : (
                    <Card className="text-center py-8">
                        <CardContent>
                            <p className="text-muted-foreground">No quizzes have been posted for this class yet.</p>
                        </CardContent>
                    </Card>
                 )}
            </section>
             <section>
                <h2 className="font-headline text-2xl mb-4">Classroom Posts</h2>
                <div className="space-y-4">
                    {sortedPosts.map(post => (
                        <Card key={post.id}>
                            <CardHeader className="flex flex-row items-center gap-4">
                               <Avatar>
                                 <AvatarFallback>{teacher?.name.charAt(0)}</AvatarFallback>
                               </Avatar>
                               <div>
                                <CardTitle className="text-base font-semibold">{teacher?.name}</CardTitle>
                                <CardDescription>{formatDistanceToNow(post.createdAt, { addSuffix: true })}</CardDescription>
                               </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                            </CardContent>
                        </Card>
                    ))}
                    {sortedPosts.length === 0 && (
                         <Card className="text-center py-8">
                            <CardContent>
                                <p className="text-muted-foreground">No posts in this classroom yet.</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </section>
        </div>
        <aside className="space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5"/> Class Members ({members.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3">
                       {members.map(member => (
                         <li key={member.id} className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{member.name}</span>
                         </li>
                       ))}
                    </ul>
                </CardContent>
             </Card>
        </aside>
      </div>

    </div>
  );
}
