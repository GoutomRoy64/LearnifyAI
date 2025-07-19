'use server';

/**
 * @fileOverview Provides an AI-powered study buddy for students.
 *
 * - studyBuddy - A function that answers a student's question about a specific subject.
 * - StudyBuddyInput - The input type for the studyBuddy function.
 * - StudyBuddyOutput - The return type for the studyBuddy function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StudyBuddyInputSchema = z.object({
  subject: z.string().describe('The subject the student is asking about.'),
  question: z.string().describe('The student\'s question.'),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.array(z.object({
        text: z.string()
    }))
  })).optional().describe('The conversation history.'),
});
export type StudyBuddyInput = z.infer<typeof StudyBuddyInputSchema>;

const StudyBuddyOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer to the student\'s question.'),
});
export type StudyBuddyOutput = z.infer<typeof StudyBuddyOutputSchema>;

export async function studyBuddy(input: StudyBuddyInput): Promise<StudyBuddyOutput> {
  return studyBuddyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'studyBuddyPrompt',
  input: {schema: z.object({
    subject: StudyBuddyInputSchema.shape.subject,
    question: StudyBuddyInputSchema.shape.question,
    formattedHistory: z.string().optional(),
  })},
  output: {schema: StudyBuddyOutputSchema},
  prompt: `You are Learnify, a friendly and encouraging AI study buddy. Your goal is to help students understand concepts without giving them direct answers to test questions.

  The student is currently studying: {{{subject}}}.

  Your persona:
  - You are patient, supportive, and knowledgeable.
  - You break down complex topics into simple, easy-to-understand explanations.
  - You use analogies and real-world examples.
  - You NEVER give away answers to quiz or test questions. Instead, you guide the student to think for themselves by asking leading questions.
  - Keep your responses concise and conversational.

  Here is the conversation history:
  {{{formattedHistory}}}

  Student's latest question: {{{question}}}

  Your task is to provide a helpful response that aligns with your persona.
  `,
});

const studyBuddyFlow = ai.defineFlow(
  {
    name: 'studyBuddyFlow',
    inputSchema: StudyBuddyInputSchema,
    outputSchema: StudyBuddyOutputSchema,
  },
  async (input) => {
    
    const formattedHistory = (input.history || []).map(message => {
        if (message.role === 'user') {
            return `Student: ${message.content[0].text}`;
        }
        return `You: ${message.content[0].text}`;
    }).join('\n');

    const {output} = await prompt({
      subject: input.subject,
      question: input.question,
      formattedHistory,
    });
    return { answer: output!.answer };
  }
);
