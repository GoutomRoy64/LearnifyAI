"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Wand2, Loader2, FileText, Youtube, Pilcrow } from "lucide-react";
import { generateQuizQuestions } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import * as pdfjsLib from 'pdfjs-dist';

// Configure the PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

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
  sourceType: z.enum(['text', 'pdf', 'youtube']),
  textContent: z.string().optional(),
  youtubeUrl: z.string().optional(),
  pdfFile: z.any().optional(),
  numQuestions: z.coerce.number().int().min(1).max(10),
});

type GeneratorFormValues = z.infer<typeof generatorSchema>;

export function AiQuizGenerator({ onQuestionsGenerated, skillLevel }: AiQuizGeneratorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [pdfText, setPdfText] = useState('');
    const [isParsingPdf, setIsParsingPdf] = useState(false);
    const { toast } = useToast();

    const form = useForm<GeneratorFormValues>({
        // No resolver needed as validation is manual
        defaultValues: {
            sourceType: 'text',
            textContent: "",
            youtubeUrl: "",
            numQuestions: 5,
        }
    });

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type === 'application/pdf') {
            setIsParsingPdf(true);
            setPdfText('');
            toast({ title: 'Parsing PDF...', description: 'Please wait while we extract the text.' });
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);
                    const pdf = await pdfjsLib.getDocument(typedArray).promise;
                    let fullText = '';
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const content = await page.getTextContent();
                        fullText += content.items.map((item: any) => item.str).join(' ');
                    }
                    setPdfText(fullText);
                    toast({ title: 'PDF Parsed!', description: 'You can now generate questions from this PDF.' });
                } catch (error) {
                    console.error("Failed to parse PDF", error);
                    toast({ variant: 'destructive', title: 'PDF Parsing Failed', description: 'Could not read the selected PDF file.' });
                } finally {
                    setIsParsingPdf(false);
                }
            };
            reader.readAsArrayBuffer(file);
        } else if(file) {
            toast({ variant: 'destructive', title: 'Invalid File Type', description: 'Please select a PDF file.' });
        }
    };

    const onSubmit = async (data: GeneratorFormValues) => {
        let inputPayload: any = {
            numQuestions: data.numQuestions,
            skillLevel,
        };

        if (data.sourceType === 'text') {
            if (!data.textContent || data.textContent.length < 10) {
                toast({ variant: 'destructive', title: 'Input Error', description: 'Please provide more content to generate questions from.' });
                return;
            }
            inputPayload.textContent = data.textContent;
        } else if (data.sourceType === 'pdf') {
            if (!pdfText) {
                toast({ variant: 'destructive', title: 'Input Error', description: 'Please select and wait for a PDF to be parsed.' });
                return;
            }
            inputPayload.textContent = pdfText;
        } else if (data.sourceType === 'youtube') {
            if (!data.youtubeUrl || !z.string().url().safeParse(data.youtubeUrl).success) {
                toast({ variant: 'destructive', title: 'Input Error', description: 'Please provide a valid YouTube URL.' });
                return;
            }
            inputPayload.youtubeUrl = data.youtubeUrl;
        }

        setIsLoading(true);
        const result = await generateQuizQuestions(inputPayload);
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
            form.reset();
            setPdfText('');
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
                        Generate questions from text, a PDF, or a YouTube video. The AI will use the "Skill Level" you've set for the quiz.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <Tabs defaultValue="text" className="w-full" onValueChange={(v) => form.setValue('sourceType', v as 'text' | 'pdf' | 'youtube')}>
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="text"><Pilcrow className="mr-2 h-4 w-4" /> Text</TabsTrigger>
                            <TabsTrigger value="pdf"><FileText className="mr-2 h-4 w-4" /> PDF</TabsTrigger>
                            <TabsTrigger value="youtube"><Youtube className="mr-2 h-4 w-4" /> YouTube</TabsTrigger>
                        </TabsList>
                        <TabsContent value="text" className="mt-4">
                            <div className="space-y-2">
                                <Label htmlFor="text-content">Topic or Text Content</Label>
                                <Textarea 
                                    id="text-content" 
                                    {...form.register("textContent")} 
                                    placeholder="Enter a topic (e.g., The American Revolution) or paste a larger block of text here..." 
                                    rows={8}
                                />
                            </div>
                        </TabsContent>
                        <TabsContent value="pdf" className="mt-4">
                             <div className="space-y-2">
                                <Label htmlFor="pdf-file">Upload PDF</Label>
                                <Input id="pdf-file" type="file" accept=".pdf" onChange={handleFileChange} disabled={isParsingPdf} />
                                {isParsingPdf && <p className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="animate-spin h-4 w-4" /> Parsing PDF...</p>}
                                {pdfText && <p className="text-sm text-green-600">PDF processed successfully!</p>}
                            </div>
                        </TabsContent>
                        <TabsContent value="youtube" className="mt-4">
                             <div className="space-y-2">
                                <Label htmlFor="youtube-url">YouTube Video URL</Label>
                                <Input id="youtube-url" {...form.register("youtubeUrl")} placeholder="https://www.youtube.com/watch?v=..." />
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
                        <Button type="submit" disabled={isLoading || isParsingPdf} className="w-full">
                            {isLoading ? <Loader2 className="animate-spin" /> : "Generate Questions"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
