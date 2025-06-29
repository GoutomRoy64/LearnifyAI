"use client";

import { useState } from "react";
import { mockQuizzes } from "@/lib/mock-data";
import { QuizCard } from "@/components/quiz-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("all");
  const [skillLevel, setSkillLevel] = useState("all");

  const subjects = ["all", ...Array.from(new Set(mockQuizzes.map(q => q.subject)))];
  const skillLevels = ["all", "Beginner", "Intermediate", "Advanced"];

  const filteredQuizzes = mockQuizzes.filter(quiz => {
    return (
      quiz.title.toLowerCase().includes(search.toLowerCase()) &&
      (subject === "all" || quiz.subject === subject) &&
      (skillLevel === "all" || quiz.skillLevel === skillLevel)
    );
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl font-bold">Welcome, {user?.name.split(' ')[0]}!</h1>
        <p className="text-muted-foreground text-lg">Ready to test your knowledge? Choose a quiz to get started.</p>
      </div>

      <div className="mb-8 p-6 rounded-lg border bg-card shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="search">Search Quiz</Label>
            <Input
              id="search"
              placeholder="Search by title..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Filter by Subject</Label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger id="subject">
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="skill">Filter by Skill Level</Label>
            <Select value={skillLevel} onValueChange={setSkillLevel}>
              <SelectTrigger id="skill">
                <SelectValue placeholder="All Skill Levels" />
              </SelectTrigger>
              <SelectContent>
                {skillLevels.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {filteredQuizzes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredQuizzes.map(quiz => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h3 className="font-headline text-xl">No Quizzes Found</h3>
            <p className="text-muted-foreground mt-2">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
}
