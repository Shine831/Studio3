'use server';

/**
 * @fileOverview An AI agent to generate detailed lesson content for a course.
 *
 * - generateLessonContent - A function that generates lesson content.
 * - GenerateLessonContentInput - The input type for the generateLessonContent function.
 * - GenerateLessonContentOutput - The return type for the generateLessonContent function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateLessonContentInputSchema = z.object({
  courseTitle: z.string().describe("The title of the course."),
  subject: z.string().describe("The subject of the course."),
  language: z.enum(['fr', 'en']).describe("The language for the lesson content."),
});

export type GenerateLessonContentInput = z.infer<typeof GenerateLessonContentInputSchema>;

const GenerateLessonContentOutputSchema = z.object({
  lessonContent: z.string().describe("The detailed lesson content in well-structured Markdown format."),
});

export type GenerateLessonContentOutput = z.infer<typeof GenerateLessonContentOutputSchema>;

export async function generateLessonContent(
  input: GenerateLessonContentInput
): Promise<GenerateLessonContentOutput> {
  return generateLessonContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLessonContentPrompt',
  input: { schema: GenerateLessonContentInputSchema },
  output: { schema: GenerateLessonContentOutputSchema },
  prompt: `You are an expert teacher creating a lesson for a student in the Cameroonian education system. The lesson must be in valid Markdown format.

The lesson should include:
- An introduction.
- An explanation of the core concepts with examples.
- A summary.

Generate the lesson content for:
- Subject: {{{subject}}}
- Course Title: {{{courseTitle}}}
- Language: {{{language}}}

The content must be in {{{language}}}.`,
});

const generateLessonContentFlow = ai.defineFlow(
  {
    name: 'generateLessonContentFlow',
    inputSchema: GenerateLessonContentInputSchema,
    outputSchema: GenerateLessonContentOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
