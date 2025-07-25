'use server';

import { generateExplanation } from '@/ai/flows/generate-explanation';
import type { GenerateExplanationInput } from '@/ai/flows/generate-explanation';
import { generateQuiz } from '@/ai/flows/generate-quiz-flow';
import type { GenerateQuizInput, GenerateQuizOutput } from '@/ai/flows/generate-quiz-flow';
import { studyBuddy } from '@/ai/flows/study-buddy-flow';
import type { StudyBuddyInput } from '@/ai/flows/study-buddy-flow';

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
    } catch (error: any) {
        console.error('Error generating quiz questions:', error);
        return { questions: [], error: error.message || 'Failed to generate quiz questions. Please try again later.' };
    }
}

export async function askStudyBuddy(input: StudyBuddyInput) {
    try {
        const output = await studyBuddy(input);
        return { answer: output.answer, error: null };
    } catch (error: any) {
        console.error('Error asking study buddy:', error);
        return { answer: null, error: error.message || 'The AI Study Buddy is not available right now. Please try again later.' };
    }
}
