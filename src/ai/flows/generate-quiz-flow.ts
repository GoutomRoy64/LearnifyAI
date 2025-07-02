'use server';
/**
 * @fileOverview Generates quiz questions based on a given topic, text content, or YouTube URL.
 *
 * - generateQuiz - A function that generates quiz questions.
 * - GenerateQuizInput - The input type for the generateQuiz function.
 * - GenerateQuizOutput - The return type for the generateQuiz function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {YoutubeTranscript} from 'youtube-transcript';

const QuestionSchema = z.object({
  text: z.string().describe('The question text.'),
  options: z.array(z.string()).describe('An array of 4-5 potential answers.'),
  correctAnswer: z.string().describe('The correct answer from the options array.'),
});

// The input schema now accepts either text content or a youtube URL
const GenerateQuizInputSchema = z.object({
  textContent: z.string().optional(),
  youtubeUrl: z.string().url().optional(),
  numQuestions: z.coerce.number().int().min(1).max(10).describe('The number of questions to generate.'),
  skillLevel: z.enum(['Beginner', 'Intermediate', 'Advanced']).describe('The skill level for the quiz questions.'),
}).refine(data => data.textContent || data.youtubeUrl, {
  message: 'Either textContent or youtubeUrl must be provided.',
  path: ['textContent'],
});

export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const GenerateQuizOutputSchema = z.object({
  questions: z.array(QuestionSchema).describe('The array of generated quiz questions.'),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;

export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  return generateQuizFlow(input);
}

// Prompt definition remains the same, but it expects `sourceContent`
const prompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: {
    schema: z.object({
        sourceContent: z.string(),
        numQuestions: z.coerce.number(),
        skillLevel: z.string(),
    })
  },
  output: {schema: GenerateQuizOutputSchema},
  prompt: `You are an expert educator and quiz creator. Your task is to generate a multiple-choice quiz based on the provided content.

  Quiz Details:
  - Skill Level: {{{skillLevel}}}
  - Number of Questions: {{{numQuestions}}}

  Generate the quiz based on the following content, which may be a simple topic, a larger block of text, or a video transcript:
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
    let sourceContent = '';

    if (input.textContent) {
      sourceContent = input.textContent;
    } else if (input.youtubeUrl) {
      try {
        const transcript = await YoutubeTranscript.fetchTranscript(input.youtubeUrl);
        sourceContent = transcript.map(t => t.text).join(' ');
        if (!sourceContent) {
            throw new Error('Could not fetch transcript from the YouTube URL. The video might not have captions enabled.');
        }
      } catch (e: any) {
        console.error('YouTube transcript fetch failed', e);
        throw new Error('Failed to get transcript. The video may not have captions, or the URL is invalid.');
      }
    }

    if (!sourceContent) {
        throw new Error('No source content available to generate quiz.');
    }

    const {output} = await prompt({
        sourceContent,
        numQuestions: input.numQuestions,
        skillLevel: input.skillLevel,
    });
    return output!;
  }
);
