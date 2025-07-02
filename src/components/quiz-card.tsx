import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Quiz } from "@/lib/types";
import { BookOpen, BarChart, ChevronRight, Clock, CalendarClock, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface QuizCardProps {
  quiz: Quiz;
  isAttempted?: boolean;
}

export function QuizCard({ quiz, isAttempted }: QuizCardProps) {
  const skillLevelColors = {
    Beginner: "bg-green-100 text-green-800 border-green-200",
    Intermediate: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Advanced: "bg-red-100 text-red-800 border-red-200",
  };
  
  const isPastDue = quiz.dueDate && new Date() > new Date(quiz.dueDate);

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="font-headline text-xl mb-2">{quiz.title}</CardTitle>
          <Badge variant="outline" className={skillLevelColors[quiz.skillLevel]}>{quiz.skillLevel}</Badge>
        </div>
        <CardDescription className="flex items-center gap-2 text-muted-foreground">
          <BookOpen className="h-4 w-4" />
          <span>{quiz.subject}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BarChart className="h-4 w-4" />
          <span>{quiz.questions.length} Questions</span>
        </div>
        {quiz.timer && quiz.timer > 0 && (
           <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{quiz.timer} minutes</span>
          </div>
        )}
        {quiz.dueDate && (
           <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarClock className="h-4 w-4" />
            <span>Due by {format(new Date(quiz.dueDate), "PPP")}</span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {isPastDue ? (
            <Button className="w-full" disabled>Past Due</Button>
        ) : isAttempted ? (
            <Button asChild className="w-full" variant="outline">
              <Link href={`/student/quiz/${quiz.id}/results`}>
                <Eye className="mr-2 h-4 w-4" />
                View Results
              </Link>
            </Button>
        ) : (
            <Button asChild className="w-full">
              <Link href={`/student/quiz/${quiz.id}`}>
                Start Quiz
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}
