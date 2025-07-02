"use client";

import { QuizForm } from "@/components/quiz-form";
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { AiQuizGenerator } from '@/components/ai-quiz-generator';

type GeneratedQuestion = {
  id?: string;
  text: string;
  options: string[];
  correctAnswer: string;
}

export default function CreateQuizPage() {
  const searchParams = useSearchParams();
  const classroomId = searchParams.get('classroomId');
  
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[] | undefined>(undefined);
  const [skillLevel, setSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');

  const handleQuestionsGenerated = (questions: GeneratedQuestion[]) => {
    const questionsWithIds = questions.map((q, index) => ({
      ...q,
      id: `gen-${index}-${Date.now()}`,
    }));
    setGeneratedQuestions(questionsWithIds);
  };

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-4">
        <h1 className="font-headline text-3xl md:text-4xl font-bold">Create a New Quiz</h1>
        <p className="text-muted-foreground text-lg">Fill out the details below, or generate questions with AI.</p>
      </div>

      <div className="mb-8">
        <AiQuizGenerator onQuestionsGenerated={handleQuestionsGenerated} skillLevel={skillLevel} />
      </div>

      <QuizForm 
        classroomId={classroomId || undefined}
        generatedQuestions={generatedQuestions}
        onSkillLevelChange={setSkillLevel}
      />
    </div>
  );
}
