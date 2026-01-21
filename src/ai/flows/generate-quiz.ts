'use server';

/**
 * @fileOverview An AI agent to generate quizzes for a course.
 *
 * - generateQuiz - A function that generates a quiz.
 * - GenerateQuizInput - The input type for the generateQuiz function.
 * - GenerateQuizOutput - The return type for the generateQuiz function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateQuizInputSchema = z.object({
  subject: z.string().describe('The subject of the course.'),
  courseTitle: z
    .string()
    .describe('The title of the course/lesson to generate a quiz for.'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const QuestionSchema = z.object({
  questionText: z
    .string()
    .describe('The text of the multiple-choice question.'),
  options: z.array(z.string()).describe('An array of 4 possible answers.'),
  correctAnswer: z
    .string()
    .describe('The correct answer from the options array.'),
  explanation: z
    .string()
    .describe('A brief explanation of why the answer is correct.'),
});
export type Question = z.infer<typeof QuestionSchema>;

const GenerateQuizOutputSchema = z.object({
  questions: z.array(QuestionSchema).describe('An array of quiz questions.'),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;

export async function generateQuiz(
  input: GenerateQuizInput
): Promise<GenerateQuizOutput> {
  return generateQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: { schema: GenerateQuizInputSchema },
  output: { schema: GenerateQuizOutputSchema },
  prompt: `You are an expert teacher designing a quiz for a student in the Cameroonian education system.
    Generate a multiple-choice quiz with a few questions based on the following course details.
    For each question, provide 4 options, identify the correct answer, and give a short explanation.
    The number of questions should be between 3 and 5.

    Subject: {{{subject}}}
    Course Title: {{{courseTitle}}}

    Generate the quiz now in the specified JSON format.`,
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
