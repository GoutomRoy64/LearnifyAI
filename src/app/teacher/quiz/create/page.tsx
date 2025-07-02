"use client";

import { QuizForm } from "@/components/quiz-form";
import { useSearchParams } from 'next/navigation';

export default function CreateQuizPage() {
  const searchParams = useSearchParams();
  const classroomId = searchParams.get('classroomId');

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="font-headline text-3xl md:text-4xl font-bold">Create a New Quiz</h1>
        <p className="text-muted-foreground text-lg">Fill out the details below to build your quiz.</p>
      </div>
      <QuizForm classroomId={classroomId || undefined} />
    </div>
  );
}
