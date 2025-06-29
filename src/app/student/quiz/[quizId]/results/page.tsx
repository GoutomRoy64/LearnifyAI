"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getQuizzesFromStorage } from '@/lib/mock-data';
import type { Quiz, QuizAttempt } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Award } from 'lucide-react';
import { AiExplanation } from '@/components/ai-explanation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ResultsPage() {
  const params = useParams();
  const quizId = params.quizId as string;
  const [attempt, setAttempt] = useState<Omit<QuizAttempt, 'id' | 'studentId' | 'submittedAt'> | null>(null);
  const [quiz, setQuiz] = useState<Quiz | undefined>();

  useEffect(() => {
    const allQuizzes = getQuizzesFromStorage();
    setQuiz(allQuizzes.find(q => q.id === quizId));
  }, [quizId]);

  useEffect(() => {
    const savedAttempt = localStorage.getItem(`quiz_attempt_${quizId}`);
    if (savedAttempt && quiz) {
      const answers = JSON.parse(savedAttempt);
      let score = 0;
      quiz.questions.forEach(q => {
        if (answers[q.id] === q.correctAnswer) {
          score++;
        }
      });
      setAttempt({
        quizId,
        answers,
        score: (score / quiz.questions.length) * 100,
      });
    }
  }, [quizId, quiz]);

  if (!quiz || !attempt) {
    return (
       <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
            <p className="text-muted-foreground">Loading results or results not found...</p>
            <Button asChild variant="link" className="mt-4">
                <Link href="/student/dashboard">Back to Dashboard</Link>
            </Button>
        </div>
      </div>
    )
  }

  const scoreColor = attempt.score >= 80 ? 'text-green-500' : attempt.score >= 50 ? 'text-yellow-500' : 'text-red-500';

  return (
    <div className="container mx-auto max-w-3xl py-12">
      <Card className="mb-8 shadow-lg">
        <CardHeader className="text-center items-center">
          <div className={`p-4 rounded-full bg-primary/10 w-max`}>
             <Award className={`h-12 w-12 ${scoreColor}`} strokeWidth={1.5} />
          </div>
          <CardTitle className="font-headline text-4xl mt-4">Quiz Results</CardTitle>
          <CardDescription className="text-lg">{quiz.title}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">Your Score</p>
          <p className={`font-bold text-6xl ${scoreColor}`}>{Math.round(attempt.score)}%</p>
        </CardContent>
      </Card>
      
      <div className="space-y-6">
        <h2 className="font-headline text-2xl font-bold">Review Your Answers</h2>
        {quiz.questions.map((question, index) => {
          const studentAnswer = attempt.answers[question.id];
          const isCorrect = studentAnswer === question.correctAnswer;
          return (
            <Card key={question.id} className={isCorrect ? "border-green-200" : "border-red-200"}>
              <CardHeader>
                <CardTitle className="flex items-start gap-3">
                  {isCorrect ? <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" /> : <XCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />}
                  <span>{index + 1}. {question.text}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <p><strong>Your answer:</strong> <Badge variant={isCorrect ? "default" : "destructive"} className={isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>{studentAnswer || 'Not answered'}</Badge></p>
                  <p><strong>Correct answer:</strong> <Badge variant="outline" className="bg-gray-100 text-gray-800">{question.correctAnswer}</Badge></p>
                </div>
                {!isCorrect && <AiExplanation quiz={quiz} question={question} studentAnswer={studentAnswer || ''} />}
              </CardContent>
            </Card>
          );
        })}
      </div>
       <div className="mt-8 text-center">
         <Button asChild>
           <Link href="/student/dashboard">Back to Dashboard</Link>
         </Button>
       </div>
    </div>
  );
}
