"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Wand2, Loader2 } from "lucide-react";
import { generateQuizQuestions } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

type GeneratedQuestion = {
    text: string;
    options: string[];
    correctAnswer: string;
}

interface AiQuizGeneratorProps {
    onQuestionsGenerated: (questions: GeneratedQuestion[]) => void;
    skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
}

const generatorSchema = z.object({
  sourceType: z.enum(['topic', 'text']),
  sourceContent: z.string().min(10, 'Please provide more content to generate questions from.'),
  numQuestions: z.coerce.number().int().min(1).max(10),
});

type GeneratorFormValues = z.infer<typeof generatorSchema>;

export function AiQuizGenerator({ onQuestionsGenerated, skillLevel }: AiQuizGeneratorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const form = useForm<GeneratorFormValues>({
        resolver: zodResolver(generatorSchema),
        defaultValues: {
            sourceType: "topic",
            sourceContent: "",
            numQuestions: 5,
        }
    });
    
    const sourceType = form.watch("sourceType");

    const onSubmit = async (data: GeneratorFormValues) => {
        setIsLoading(true);
        const result = await generateQuizQuestions({ ...data, skillLevel });
        setIsLoading(false);

        if (result.error || result.questions.length === 0) {
            toast({
                variant: 'destructive',
                title: 'Generation Failed',
                description: result.error || 'The AI could not generate questions from the provided content. Please try again.'
            });
        } else {
            toast({
                title: 'Success!',
                description: `${result.questions.length} questions have been generated.`
            });
            onQuestionsGenerated(result.questions);
            setIsOpen(false);
        }
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Wand2 className="mr-2" />
                    Generate with AI
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>AI-Assisted Quiz Generation</DialogTitle>
                    <DialogDescription>
                        Generate quiz questions from a topic or text. The AI will use the "Skill Level" you've set for the quiz.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                     <Tabs defaultValue="topic" className="w-full" onValueChange={(value) => form.setValue("sourceType", value as 'topic' | 'text')}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="topic">From Topic</TabsTrigger>
                            <TabsTrigger value="text">From Text</TabsTrigger>
                        </TabsList>
                        <TabsContent value="topic" className="pt-4">
                             <div className="space-y-2">
                                <Label htmlFor="topic-content">Topic</Label>
                                <Input id="topic-content" {...form.register("sourceContent")} placeholder="e.g., The American Revolution" />
                                {form.formState.errors.sourceContent && sourceType === 'topic' && <p className="text-sm text-destructive">{form.formState.errors.sourceContent.message}</p>}
                            </div>
                        </TabsContent>
                        <TabsContent value="text" className="pt-4">
                             <div className="space-y-2">
                                <Label htmlFor="text-content">Text Content</Label>
                                <Textarea id="text-content" {...form.register("sourceContent")} placeholder="Paste a chapter or an article here..." rows={8}/>
                                {form.formState.errors.sourceContent && sourceType === 'text' && <p className="text-sm text-destructive">{form.formState.errors.sourceContent.message}</p>}
                            </div>
                        </TabsContent>
                    </Tabs>

                    <div className="space-y-2">
                        <Label>Number of Questions</Label>
                        <Select
                            defaultValue={form.getValues("numQuestions").toString()}
                            onValueChange={(value) => form.setValue("numQuestions", parseInt(value, 10))}
                        >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {[...Array(10)].map((_, i) => (
                                    <SelectItem key={i+1} value={(i+1).toString()}>{i+1}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     <DialogFooter>
                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? <Loader2 className="animate-spin" /> : "Generate Questions"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
