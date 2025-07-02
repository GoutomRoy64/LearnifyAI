"use client";

import { useForm, useFieldArray, Controller, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Quiz, Classroom } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, PlusCircle, CalendarIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { useAuth } from '@/hooks/use-auth';
import { getQuizzesFromStorage, setQuizzesToStorage, getClassroomsFromStorage } from '@/lib/mock-data';
import { useEffect, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

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
  classroomId: z.string().optional(),
  dueDate: z.date().optional(),
});

type QuizFormValues = z.infer<typeof quizSchema>;

type GeneratedQuestion = {
    id?: string;
    text: string;
    options: string[];
    correctAnswer: string;
}

interface QuizFormProps {
  initialData?: Quiz;
  classroomId?: string;
  generatedQuestions?: GeneratedQuestion[];
  onSkillLevelChange?: (level: 'Beginner' | 'Intermediate' | 'Advanced') => void;
}


const QuestionCard = ({ index, remove, canRemove }: { index: number; remove: (index: number) => void; canRemove: boolean }) => {
  const { control, register, watch, formState: { errors } } = useFormContext<QuizFormValues>();
  
  const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({
    control,
    name: `questions.${index}.options`
  });

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-headline text-xl">Question {index + 1}</CardTitle>
        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={!canRemove}>
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
                {optionFields.map((optionField, optionIndex) => (
                  <div key={optionField.id} className="flex items-center gap-2">
                    <RadioGroupItem value={watch(`questions.${index}.options.${optionIndex}`)} id={`q${index}-o${optionIndex}-radio`} />
                    <Input {...register(`questions.${index}.options.${optionIndex}`)} placeholder={`Option ${optionIndex + 1}`} />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(optionIndex)} disabled={optionFields.length <= 2}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </RadioGroup>
            )}
          />
          <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendOption('')}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Option
          </Button>
          {errors.questions?.[index]?.correctAnswer && <p className="text-sm text-destructive">{errors.questions[index]?.correctAnswer?.message}</p>}
          {errors.questions?.[index]?.options && <p className="text-sm text-destructive">{errors.questions[index]?.options?.message}</p>}
        </div>
      </CardContent>
    </Card>
  );
};


export function QuizForm({ initialData, classroomId: classroomIdFromUrl, generatedQuestions, onSkillLevelChange }: QuizFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);

  const methods = useForm<QuizFormValues>({
    resolver: zodResolver(quizSchema),
    defaultValues: initialData ? {
        ...initialData,
        timer: initialData.timer || undefined,
        dueDate: initialData.dueDate ? new Date(initialData.dueDate) : undefined,
        questions: initialData.questions.map(q => ({...q, options: [...q.options]})),
        classroomId: initialData.classroomId || "public",
    } : {
      title: '',
      subject: '',
      skillLevel: 'Beginner',
      questions: [{ id: 'q1', text: '', options: ['', ''], correctAnswer: '' }],
      timer: undefined,
      dueDate: undefined,
      classroomId: classroomIdFromUrl || "public",
    },
  });

  const { control, handleSubmit, formState: { errors }, watch, replace } = methods;
  
  const selectedClassroomId = watch('classroomId');
  const skillLevel = watch('skillLevel');
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  });

  useEffect(() => {
    if(onSkillLevelChange) {
        onSkillLevelChange(skillLevel);
    }
  }, [skillLevel, onSkillLevelChange]);

  useEffect(() => {
    if (generatedQuestions && generatedQuestions.length > 0) {
      replace(generatedQuestions);
    }
  }, [generatedQuestions, replace]);

  useEffect(() => {
    if (user) {
        const allClassrooms = getClassroomsFromStorage();
        const myClassrooms = allClassrooms.filter(c => c.createdBy === user.id);
        setClassrooms(myClassrooms);
    }
  }, [user]);
  
  const onSubmit = (data: QuizFormValues) => {
    if (!user) {
      toast({ variant: "destructive", title: "Not logged in", description: "You need to be logged in to manage quizzes." });
      return;
    }
    const allQuizzes = getQuizzesFromStorage();

    const quizData = {
        ...data,
        timer: data.timer && data.timer > 0 ? data.timer : undefined,
        classroomId: data.classroomId === 'public' ? undefined : data.classroomId,
        dueDate: data.classroomId !== 'public' && data.classroomId ? data.dueDate : undefined,
    }

    if (initialData) {
      // Editing existing quiz
      const updatedQuizzes = allQuizzes.map(q => q.id === initialData.id ? { ...initialData, ...quizData } : q);
      setQuizzesToStorage(updatedQuizzes);
    } else {
      // Creating new quiz
      const allQuestionIds = allQuizzes.flatMap(q => q.questions).map(q => parseInt(q.id, 10)).filter(id => !isNaN(id));
      let nextQuestionId = Math.max(0, ...allQuestionIds) + 1;
      
      const allQuizIds = allQuizzes.map(q => parseInt(q.id, 10)).filter(id => !isNaN(id));
      const newQuizId = (Math.max(0, ...allQuizIds) + 1).toString();

      const newQuiz: Quiz = {
        ...quizData,
        id: newQuizId,
        createdBy: user.id,
        questions: data.questions.map((q) => ({ ...q, id: (nextQuestionId++).toString() })),
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
    <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card>
            <CardHeader>
            <CardTitle className="font-headline">Quiz Details</CardTitle>
            <CardDescription>Provide basic information for your quiz.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label htmlFor="title">Quiz Title</Label>
                <Input id="title" {...methods.register('title')} />
                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" {...methods.register('subject')} />
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
                <Input id="timer" type="number" {...methods.register('timer')} placeholder="e.g., 10" />
                <p className="text-sm text-muted-foreground">Leave blank or 0 for no time limit.</p>
                {errors.timer && <p className="text-sm text-destructive">{errors.timer.message}</p>}
            </div>
            <div className="space-y-2">
                <Label>Classroom (Optional)</Label>
                <Controller
                    control={control}
                    name="classroomId"
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value || 'public'} disabled={!!classroomIdFromUrl}>
                            <SelectTrigger>
                                <SelectValue placeholder="Assign to a classroom" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="public">Public (No classroom)</SelectItem>
                                {classrooms.map(c => (
                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
                <p className="text-sm text-muted-foreground">If assigned, this quiz will only be visible to students in that classroom.</p>
            </div>
            {selectedClassroomId && selectedClassroomId !== 'public' && (
                <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date (Optional)</Label>
                    <Controller
                        control={control}
                        name="dueDate"
                        render={({ field }) => (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !field.value && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        )}
                    />
                    <p className="text-sm text-muted-foreground">The quiz won't be accessible after this date.</p>
                </div>
            )}
            </CardContent>
        </Card>

        <div>
            <h2 className="font-headline text-2xl mb-4">Questions</h2>
            {fields.map((field, index) => (
                <QuestionCard key={field.id} index={index} remove={remove} canRemove={fields.length > 1} />
            ))}
            <Button type="button" variant="outline" onClick={() => append({ id: `new-${Date.now()}`, text: '', options: ['', ''], correctAnswer: '' })}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Question
            </Button>
        </div>

        <div className="flex justify-end">
            <Button type="submit" size="lg">{initialData ? 'Update Quiz' : 'Create Quiz'}</Button>
        </div>
        </form>
    </FormProvider>
  );
}
