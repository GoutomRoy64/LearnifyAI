'use server';

import { generateExplanation } from '@/ai/flows/generate-explanation';
import type { GenerateExplanationInput } from '@/ai/flows/generate-explanation';

export async function getAiExplanation(input: GenerateExplanationInput) {
  try {
    const output = await generateExplanation(input);
    return { explanation: output.explanation, error: null };
  } catch (error) {
    console.error('Error generating AI explanation:', error);
    return { explanation: null, error: 'Failed to generate explanation. Please try again later.' };
  }
}
