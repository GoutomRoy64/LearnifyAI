"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { getAiExplanation } from '@/app/actions';
import type { Question, Quiz } from '@/lib/types';
import { Lightbulb, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface AiExplanationProps {
  quiz: Quiz;
  question: Question;
  studentAnswer: string;
}

export function AiExplanation({ quiz, question, studentAnswer }: AiExplanationProps) {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetExplanation = async () => {
    setIsLoading(true);
    setError(null);
    const result = await getAiExplanation({
      question: question.text,
      studentAnswer: studentAnswer,
      correctAnswer: question.correctAnswer,
      topic: quiz.subject,
    });
    setIsLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setExplanation(result.explanation);
    }
  };

  return (
    <div className="mt-4">
      <Button onClick={handleGetExplanation} disabled={isLoading} size="sm" variant="outline">
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Lightbulb className="mr-2 h-4 w-4" />
        )}
        Get AI Explanation
      </Button>

      {error && (
        <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {explanation && (
        <div className="mt-4 p-4 bg-primary/5 border-l-4 border-primary rounded-r-lg">
          <h4 className="font-headline text-md font-semibold flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            AI Tutor Explanation
          </h4>
          <p className="mt-2 text-sm text-foreground/80">{explanation}</p>
        </div>
      )}
    </div>
  );
}
