'use server';
/**
 * @fileOverview Generates quiz questions based on a given topic or text content.
 *
 * - generateQuiz - A function that generates quiz questions.
 * - GenerateQuizInput - The input type for the generateQuiz function.
 * - GenerateQuizOutput - The return type for the generateQuiz function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QuestionSchema = z.object({
  text: z.string().describe('The question text.'),
  options: z.array(z.string()).describe('An array of 4-5 potential answers.'),
  correctAnswer: z.string().describe('The correct answer from the options array.'),
});

const GenerateQuizInputSchema = z.object({
  sourceContent: z.string().describe('The topic or text content for the quiz.'),
  numQuestions: z.coerce.number().int().min(1).max(10).describe('The number of questions to generate.'),
  skillLevel: z.enum(['Beginner', 'Intermediate', 'Advanced']).describe('The skill level for the quiz questions.'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const GenerateQuizOutputSchema = z.object({
  questions: z.array(QuestionSchema).describe('The array of generated quiz questions.'),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;

export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  return generateQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: {schema: GenerateQuizInputSchema},
  output: {schema: GenerateQuizOutputSchema},
  prompt: `You are an expert educator and quiz creator. Your task is to generate a multiple-choice quiz based on the provided content.

  Quiz Details:
  - Skill Level: {{{skillLevel}}}
  - Number of Questions: {{{numQuestions}}}

  Generate the quiz based on the following content, which may be a simple topic or a larger block of text:
  "{{{sourceContent}}}"

  For each question, provide the question text, a list of 4-5 options (including one correct answer and several plausible distractors), and specify the correct answer. Ensure the questions are relevant to the provided content and appropriate for the specified skill level.
  `,
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
