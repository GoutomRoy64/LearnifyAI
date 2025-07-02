"use client";

import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Quiz } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { useAuth } from '@/hooks/use-auth';
import { getQuizzesFromStorage, setQuizzesToStorage } from '@/lib/mock-data';

const questionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, 'Question text is required.'),
  options: z.array(z.string().min(1, 'Option text cannot be empty.')).min(2, 'At least two options are required.'),
  correctAnswer: z.string().min(1, 'A correct answer must be selected.'),
});

const quizSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  subject: z.string().min(1, 'Subject is required.'),
  skillLevel: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  questions: z.array(questionSchema).min(1, 'At least one question is required.'),
  timer: z.coerce.number().min(0, "Timer can't be negative.").optional(),
});

type QuizFormValues = z.infer<typeof quizSchema>;

interface QuizFormProps {
  initialData?: Quiz;
}

export function QuizForm({ initialData }: QuizFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const { register, control, handleSubmit, formState: { errors }, watch } = useForm<QuizFormValues>({
    resolver: zodResolver(quizSchema),
    defaultValues: initialData ? {
        ...initialData,
        timer: initialData.timer || undefined,
        questions: initialData.questions.map(q => ({...q, options: [...q.options]}))
    } : {
      title: '',
      subject: '',
      skillLevel: 'Beginner',
      questions: [{ text: '', options: ['', ''], correctAnswer: '' }],
      timer: undefined,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  });
  
  const onSubmit = (data: QuizFormValues) => {
    if (!user) {
      toast({ variant: "destructive", title: "Not logged in", description: "You need to be logged in to manage quizzes." });
      return;
    }
    const allQuizzes = getQuizzesFromStorage();

    const quizData = {
        ...data,
        timer: data.timer && data.timer > 0 ? data.timer : undefined,
    }

    if (initialData) {
      // Editing existing quiz
      const updatedQuizzes = allQuizzes.map(q => q.id === initialData.id ? { ...initialData, ...quizData } : q);
      setQuizzesToStorage(updatedQuizzes);
    } else {
      // Creating new quiz
      const newQuiz: Quiz = {
        ...quizData,
        id: crypto.randomUUID(),
        createdBy: user.id,
        questions: data.questions.map((q) => ({ ...q, id: crypto.randomUUID() })),
      };
      setQuizzesToStorage([...allQuizzes, newQuiz]);
    }
    
    toast({
      title: `Quiz ${initialData ? 'Updated' : 'Created'}!`,
      description: `The quiz "${data.title}" has been saved successfully.`,
    });
    router.push('/teacher/dashboard');
    router.refresh();
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Quiz Details</CardTitle>
          <CardDescription>Provide basic information for your quiz.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="title">Quiz Title</Label>
            <Input id="title" {...register('title')} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" {...register('subject')} />
            {errors.subject && <p className="text-sm text-destructive">{errors.subject.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Skill Level</Label>
            <Controller
                control={control}
                name="skillLevel"
                render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Beginner">Beginner</SelectItem>
                            <SelectItem value="Intermediate">Intermediate</SelectItem>
                            <SelectItem value="Advanced">Advanced</SelectItem>
                        </SelectContent>
                    </Select>
                )}
            />
          </div>
          <div className="space-y-2">
             <Label htmlFor="timer">Timer (minutes)</Label>
             <Input id="timer" type="number" {...register('timer')} placeholder="e.g., 10" />
             <p className="text-sm text-muted-foreground">Leave blank or 0 for no time limit.</p>
             {errors.timer && <p className="text-sm text-destructive">{errors.timer.message}</p>}
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="font-headline text-2xl mb-4">Questions</h2>
        {fields.map((field, index) => {
          const questionValues = watch(`questions.${index}`);
          return (
          <Card key={field.id} className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-headline text-xl">Question {index + 1}</CardTitle>
              <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                <Trash2 className="h-5 w-5 text-destructive" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Question Text</Label>
                <Input {...register(`questions.${index}.text`)} />
                {errors.questions?.[index]?.text && <p className="text-sm text-destructive">{errors.questions?.[index]?.text?.message}</p>}
              </div>
              <div>
                <Label>Options</Label>
                <p className="text-sm text-muted-foreground">Select the correct answer.</p>
                <Controller
                  control={control}
                  name={`questions.${index}.correctAnswer`}
                  render={({ field: controllerField }) => (
                    <RadioGroup onValueChange={controllerField.onChange} value={controllerField.value} className="mt-2 space-y-2">
                      {questionValues.options.map((_, optionIndex) => (
                        <div key={optionIndex} className="flex items-center gap-2">
                          <RadioGroupItem value={watch(`questions.${index}.options.${optionIndex}`)} id={`q${index}-o${optionIndex}-radio`} />
                          <Input {...register(`questions.${index}.options.${optionIndex}`)} placeholder={`Option ${optionIndex + 1}`} />
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                />
                 {errors.questions?.[index]?.correctAnswer && <p className="text-sm text-destructive">{errors.questions[index].correctAnswer.message}</p>}
                 {errors.questions?.[index]?.options && <p className="text-sm text-destructive">{errors.questions[index].options.message}</p>}
              </div>
            </CardContent>
          </Card>
        )})}
        <Button type="button" variant="outline" onClick={() => append({ text: '', options: ['', ''], correctAnswer: '' })}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Question
        </Button>
      </div>

      <div className="flex justify-end">
        <Button type="submit" size="lg">{initialData ? 'Update Quiz' : 'Create Quiz'}</Button>
      </div>
    </form>
  );
}
