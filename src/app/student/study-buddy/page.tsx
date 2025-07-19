"use client";

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { askStudyBuddy } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, BrainCircuit, User, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

const chatSchema = z.object({
  subject: z.string().min(1, 'Please select a subject.'),
  question: z.string().min(1, 'Please enter a question.'),
});

type ChatFormValues = z.infer<typeof chatSchema>;

type Message = {
  role: 'user' | 'model';
  content: string;
}

const subjects = ["Math", "Science", "History", "English", "Computer Science", "Art", "General"];

export default function StudyBuddyPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const form = useForm<ChatFormValues>({
    resolver: zodResolver(chatSchema),
    defaultValues: { subject: '', question: '' },
  });

  const { subject: selectedSubject } = form.getValues();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const onSubmit = async (data: ChatFormValues) => {
    const userMessage: Message = { role: 'user', content: data.question };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    form.reset({ ...data, question: '' });

    const historyForApi = messages.map(msg => ({
        role: msg.role,
        content: [{ text: msg.content }]
    }));

    const result = await askStudyBuddy({
      subject: data.subject,
      question: data.question,
      history: historyForApi
    });

    setIsLoading(false);

    if (result.error || !result.answer) {
      const errorMessage: Message = { role: 'model', content: result.error || 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    } else {
      const modelMessage: Message = { role: 'model', content: result.answer };
      setMessages(prev => [...prev, modelMessage]);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl py-8 flex flex-col h-[calc(100vh-80px)]">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
             <BrainCircuit className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="font-headline text-2xl">AI Study Buddy</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
             {messages.length === 0 ? (
                 <div className="text-center text-muted-foreground h-full flex flex-col justify-center items-center">
                    <p>Select a subject and ask a question to get started!</p>
                    <p className="text-sm mt-2">e.g., "Explain photosynthesis like I'm 10."</p>
                 </div>
             ) : (
                <div className="space-y-6">
                    {messages.map((message, index) => (
                        <div key={index} className={cn('flex items-start gap-4', message.role === 'user' ? 'justify-end' : 'justify-start')}>
                            {message.role === 'model' && (
                                <Avatar className="w-8 h-8 border">
                                    <AvatarFallback><BrainCircuit className="h-4 w-4" /></AvatarFallback>
                                </Avatar>
                            )}
                             <div className={cn('max-w-md rounded-lg p-3', message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            </div>
                             {message.role === 'user' && (
                                <Avatar className="w-8 h-8 border">
                                    <AvatarFallback>{user?.name.charAt(0) || <User className="h-4 w-4" />}</AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-4 justify-start">
                             <Avatar className="w-8 h-8 border">
                                <AvatarFallback><BrainCircuit className="h-4 w-4" /></AvatarFallback>
                            </Avatar>
                            <div className="max-w-md rounded-lg p-3 bg-muted">
                               <Loader2 className="h-5 w-5 animate-spin" />
                            </div>
                        </div>
                    )}
                </div>
             )}
          </ScrollArea>
        </CardContent>
        <CardFooter>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex items-start gap-2">
             <Select onValueChange={(value) => form.setValue('subject', value)} defaultValue={form.getValues('subject')}>
              <SelectTrigger className="w-[180px]" disabled={messages.length > 0}>
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="flex-1 relative">
                <Input
                    {...form.register('question')}
                    placeholder={selectedSubject ? `Ask about ${selectedSubject}...` : 'Select a subject first...'}
                    disabled={!selectedSubject || isLoading}
                    autoComplete="off"
                />
            </div>
            <Button type="submit" disabled={isLoading || !selectedSubject} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
