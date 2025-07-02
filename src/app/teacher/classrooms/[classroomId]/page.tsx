"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
    getClassroomsFromStorage, 
    setClassroomsToStorage, 
    getUsersFromStorage,
    getQuizzesFromStorage,
    getQuizAttemptsFromStorage
} from "@/lib/mock-data";
import type { Classroom, User, Post, Quiz, QuizAttempt } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Users, PlusCircle, BarChart2, CalendarClock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from "date-fns";

export default function TeacherClassroomDetailPage() {
  const params = useParams();
  const classroomId = params.classroomId as string;
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [classroomQuizzes, setClassroomQuizzes] = useState<Quiz[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);

  useEffect(() => {
    if (user && classroomId) {
      const allClassrooms = getClassroomsFromStorage();
      const currentClassroom = allClassrooms.find(c => c.id === classroomId);
      
      if (!currentClassroom || currentClassroom.createdBy !== user.id) {
        router.push("/teacher/classrooms"); // Redirect if not the owner
        return;
      }
      setClassroom(currentClassroom);

      const allUsers = getUsersFromStorage();
      setMembers(allUsers.filter(u => currentClassroom.studentIds.includes(u.id)));
      
      const allQuizzes = getQuizzesFromStorage();
      setClassroomQuizzes(allQuizzes.filter(q => q.classroomId === classroomId));

      const allAttempts = getQuizAttemptsFromStorage();
      setQuizAttempts(allAttempts);

      setLoading(false);
    }
  }, [user, classroomId, router]);
  
  const handleCreatePost = () => {
    if (!newPostContent.trim() || !classroom || !user) return;

    const allClassrooms = getClassroomsFromStorage();
    const classroomToUpdate = allClassrooms.find(c => c.id === classroomId);

    if (classroomToUpdate) {
        const newPost: Post = {
            id: (Math.max(0, ...classroomToUpdate.posts.map(p => parseInt(p.id))) + 1).toString(),
            content: newPostContent,
            createdAt: new Date(),
            authorName: user.name,
        };
        classroomToUpdate.posts.push(newPost);
        setClassroomsToStorage(allClassrooms);
        setClassroom({ ...classroomToUpdate }); // Update local state to re-render
        setNewPostContent("");
        toast({ title: "Post created!" });
    }
  };

  const getAttemptCount = (quizId: string) => {
    return quizAttempts.filter(a => a.quizId === quizId).length;
  };

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
          <Link href="/teacher/classrooms">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Classrooms
          </Link>
        </Button>
      </div>

      <header className="mb-8">
        <h1 className="font-headline text-4xl font-bold">{classroom.name}</h1>
        <p className="text-lg text-muted-foreground">{classroom.subject}</p>
      </header>
      
      <div className="grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-2 space-y-8">
            <Card>
                <CardHeader><CardTitle>Create a Post</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <Textarea 
                        placeholder="Share an announcement or update with your class..."
                        value={newPostContent}
                        onChange={e => setNewPostContent(e.target.value)}
                        rows={4}
                    />
                    <div className="flex justify-end">
                        <Button onClick={handleCreatePost} disabled={!newPostContent.trim()}>Post</Button>
                    </div>
                </CardContent>
            </Card>
            <section>
                <h2 className="font-headline text-2xl mb-4">Classroom Quizzes</h2>
                {classroomQuizzes.length > 0 ? (
                    <div className="space-y-4">
                        {classroomQuizzes.map(quiz => {
                            const attemptCount = getAttemptCount(quiz.id);
                            return (
                                <Card key={quiz.id}>
                                    <CardHeader>
                                        <CardTitle>{quiz.title}</CardTitle>
                                        <CardDescription className="flex flex-col gap-2 pt-2">
                                            <span>{quiz.questions.length} questions</span>
                                            {quiz.dueDate && (
                                                <span className="flex items-center gap-2 text-sm">
                                                    <CalendarClock className="h-4 w-4" />
                                                    Due by {format(new Date(quiz.dueDate), "PPP")}
                                                </span>
                                            )}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">{attemptCount} attempt(s)</p>
                                    </CardContent>
                                    <CardFooter>
                                        <Button asChild variant="outline" size="sm" disabled={attemptCount === 0}>
                                            <Link href={`/teacher/quiz/${quiz.id}/results`}>
                                                <BarChart2 className="mr-2 h-4 w-4" /> View Results
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            )
                        })}
                    </div>
                ) : (
                    <Card className="text-center py-8">
                        <CardContent className="flex flex-col items-center gap-2">
                            <p className="text-muted-foreground">No quizzes have been created for this class yet.</p>
                            <Button asChild variant="link">
                                <Link href={`/teacher/quiz/create?classroomId=${classroomId}`}>
                                    Create one now
                                </Link>
                            </Button>
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
                                 <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
                               </Avatar>
                               <div>
                                <CardTitle className="text-base font-semibold">{post.authorName}</CardTitle>
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
        <aside className="space-y-6 sticky top-24">
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5"/> Members ({members.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3">
                       {members.map(member => (
                         <li key={member.id} className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm font-medium">{member.name}</p>
                                <p className="text-xs text-muted-foreground">ID: {member.id}</p>
                            </div>
                         </li>
                       ))}
                       {members.length === 0 && <p className="text-sm text-muted-foreground text-center">No students have joined yet.</p>}
                    </ul>
                </CardContent>
             </Card>
              <Card>
                <CardHeader><CardTitle>Classroom Actions</CardTitle></CardHeader>
                <CardContent>
                    <Button asChild className="w-full">
                        <Link href={`/teacher/quiz/create?classroomId=${classroomId}`}>
                            <PlusCircle /> Create Quiz for this Class
                        </Link>
                    </Button>
                </CardContent>
              </Card>
        </aside>
      </div>
    </div>
  );
}
