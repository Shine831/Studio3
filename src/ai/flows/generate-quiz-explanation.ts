'use server';

/**
 * @fileOverview An AI agent to generate detailed explanations for quiz answers.
 *
 * - generateQuizExplanation - A function that generates explanations for quiz answers.
 * - GenerateQuizExplanationInput - The input type for the generateQuizExplanation function.
 * - GenerateQuizExplanationOutput - The return type for the generateQuizExplanation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuizExplanationInputSchema = z.object({
  question: z.string().describe('The quiz question.'),
  answer: z.string().describe('The user\'s answer to the question.'),
  isCorrect: z.boolean().describe('Whether the answer is correct or not.'),
  correctAnswer: z.string().optional().describe('The correct answer, if the user\'s answer is incorrect.'),
});
export type GenerateQuizExplanationInput = z.infer<typeof GenerateQuizExplanationInputSchema>;

const GenerateQuizExplanationOutputSchema = z.object({
  explanation: z.string().describe('The AI-generated explanation for the answer.'),
});
export type GenerateQuizExplanationOutput = z.infer<typeof GenerateQuizExplanationOutputSchema>;

export async function generateQuizExplanation(input: GenerateQuizExplanationInput): Promise<GenerateQuizExplanationOutput> {
  return generateQuizExplanationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizExplanationPrompt',
  input: {schema: GenerateQuizExplanationInputSchema},
  output: {schema: GenerateQuizExplanationOutputSchema},
  prompt: `You are an expert tutor, skilled at explaining complex concepts in a simple and easy-to-understand way.

  A student has answered the following quiz question:
  Question: {{{question}}}
  Answer: {{{answer}}}
  Correct: {{{isCorrect}}}
  {{#if correctAnswer}}
  Correct Answer: {{{correctAnswer}}}
  {{/if}}

  Provide a detailed explanation of why the answer is correct or incorrect. Focus on the underlying concepts and provide examples where appropriate. Ensure the explanation is helpful and encourages learning.
  `,
});

const generateQuizExplanationFlow = ai.defineFlow(
  {
    name: 'generateQuizExplanationFlow',
    inputSchema: GenerateQuizExplanationInputSchema,
    outputSchema: GenerateQuizExplanationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
