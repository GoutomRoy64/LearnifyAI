"use client";

import { QuizForm } from "@/components/quiz-form";
import { getQuizzesFromStorage } from "@/lib/mock-data";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Quiz } from "@/lib/types";

export default function EditQuizPage() {
  const params = useParams();
  const quizId = params.quizId as string;
  const [quiz, setQuiz] = useState<Quiz | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const allQuizzes = getQuizzesFromStorage();
    const foundQuiz = allQuizzes.find(q => q.id === quizId);
    setQuiz(foundQuiz);
    setLoading(false);
  }, [quizId]);

  if (loading) {
    return <div className="container text-center py-12">Loading quiz...</div>;
  }
  
  if (!quiz) {
    return <div className="container text-center py-12">Quiz not found.</div>;
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="font-headline text-3xl md:text-4xl font-bold">Edit Quiz</h1>
        <p className="text-muted-foreground text-lg">Update the details for "{quiz.title}".</p>
      </div>
      <QuizForm initialData={quiz} />
    </div>
  );
}
