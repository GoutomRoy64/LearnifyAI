"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getQuizzesFromStorage, getQuizAttemptsFromStorage, setQuizAttemptsToStorage } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import type { Quiz, QuizAttempt } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';


const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.quizId as string;
  const { user } = useAuth();
  const { toast } = useToast();

  const [quiz, setQuiz] = useState<Quiz | undefined>();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const handleSubmit = useCallback(() => {
    if (!user || !quiz || isSubmitted) return;

    setIsSubmitted(true);

    // Calculate score
    let score = 0;
    quiz.questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        score++;
      }
    });
    const finalScore = (score / quiz.questions.length) * 100;

    const allAttempts = getQuizAttemptsFromStorage();
    const existingIds = allAttempts.map(a => parseInt(a.id, 10)).filter(id => !isNaN(id));
    const newAttemptId = (Math.max(0, ...existingIds) + 1).toString();

    const newAttempt: QuizAttempt = {
      id: newAttemptId,
      quizId: quiz.id,
      studentId: user.id,
      answers: answers,
      score: finalScore,
      submittedAt: new Date(),
    };

    
    setQuizAttemptsToStorage([...allAttempts, newAttempt]);
    
    router.push(`/student/quiz/${quizId}/results`);
  }, [user, quiz, answers, router, quizId, isSubmitted]);
  
  useEffect(() => {
    if (user && quizId) {
        const allAttempts = getQuizAttemptsFromStorage();
        const hasAttempted = allAttempts.some(a => a.quizId === quizId && a.studentId === user.id);
        if (hasAttempted) {
            router.push(`/student/quiz/${quizId}/results`);
            return;
        }
    }

    const allQuizzes = getQuizzesFromStorage();
    const currentQuiz = allQuizzes.find(q => q.id === quizId);
    setQuiz(currentQuiz);
  }, [quizId, user, router]);

  useEffect(() => {
    if (quiz?.timer && quiz.timer > 0) {
      setTimeLeft(quiz.timer * 60);
    }
  }, [quiz]);

  useEffect(() => {
    if (timeLeft === null || isSubmitted) return;

    if (timeLeft <= 0) {
      toast({
        variant: "destructive",
        title: "Time's up!",
        description: "Your quiz is being submitted automatically.",
      });
      handleSubmit();
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft(prev => (prev ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft, handleSubmit, isSubmitted, toast]);

  if (!quiz) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Quiz not found or is loading...</p>
      </div>
    );
  }

  const isPastDue = quiz.dueDate && new Date() > new Date(quiz.dueDate);

  if (isPastDue) {
    return (
        <div className="container mx-auto max-w-2xl py-12 text-center">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Quiz Overdue</CardTitle>
                    <CardDescription>The due date for this quiz has passed.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="/student/dashboard">Back to Dashboard</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
  }

  const progressValue = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const currentQuestion = quiz.questions[currentQuestionIndex];

  const handleOptionChange = (value: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
  };

  const goToNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl py-12">
      <Card className="shadow-xl">
        <CardHeader>
            <div className="flex justify-between items-center mb-4 gap-4">
                <Progress value={progressValue} className="w-full" />
                {timeLeft !== null && (
                    <div className="flex items-center gap-2 font-mono text-lg font-semibold shrink-0"
                        title="Time Remaining">
                        <Clock className="h-5 w-5" />
                        <span className={timeLeft < 60 ? "text-destructive" : ""}>{formatTime(timeLeft)}</span>
                    </div>
                )}
            </div>
          <CardDescription>Question {currentQuestionIndex + 1} of {quiz.questions.length}</CardDescription>
          <CardTitle className="font-headline text-2xl pt-2">{currentQuestion.text}</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={answers[currentQuestion.id] || ''}
            onValueChange={handleOptionChange}
            className="space-y-4"
          >
            {currentQuestion.options.map((option, index) => (
              <Label key={index} className="flex items-center gap-4 p-4 rounded-lg border has-[:checked]:bg-primary/10 has-[:checked]:border-primary cursor-pointer transition-colors">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <span>{option}</span>
              </Label>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={goToPrevious} disabled={currentQuestionIndex === 0}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          {currentQuestionIndex < quiz.questions.length - 1 ? (
            <Button onClick={goToNext}>
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button>Submit Quiz</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to submit?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You cannot change your answers after submitting.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSubmit}>Submit</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
