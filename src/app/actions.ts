'use server';

import { generateExplanation } from '@/ai/flows/generate-explanation';
import type { GenerateExplanationInput } from '@/ai/flows/generate-explanation';
import { generateQuiz } from '@/ai/flows/generate-quiz-flow';
import type { GenerateQuizInput, GenerateQuizOutput } from '@/ai/flows/generate-quiz-flow';

export async function getAiExplanation(input: GenerateExplanationInput) {
  try {
    const output = await generateExplanation(input);
    return { explanation: output.explanation, error: null };
  } catch (error) {
    console.error('Error generating AI explanation:', error);
    return { explanation: null, error: 'Failed to generate explanation. Please try again later.' };
  }
}

export async function generateQuizQuestions(input: GenerateQuizInput): Promise<{ questions: GenerateQuizOutput['questions']; error: string | null; }> {
    try {
        const output = await generateQuiz(input);
        return { questions: output.questions, error: null };
    } catch (error) {
        console.error('Error generating quiz questions:', error);
        return { questions: [], error: 'Failed to generate quiz questions. Please try again later.' };
    }
}
