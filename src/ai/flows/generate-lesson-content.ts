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
  level: z.string().describe("The student's grade level in the Cameroonian system."),
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
  prompt: `You are an expert teacher creating a detailed lesson for a student in the Cameroonian education system. The lesson should be comprehensive, well-structured, and follow a clear pedagogical approach suitable for the specified level. The entire output must be in valid Markdown format.

  - Subject: {{{subject}}}
  - Level: {{{level}}}
  - Course Title: {{{courseTitle}}}
  - Language: {{{language}}}

  Generate the lesson content now. It should include headings (e.g., #, ##), lists (e.g., *, -), bold text (e.g., **text**), and clear explanations to make it easy to understand. The content must be in {{{language}}}. Do not include any text or formatting outside of the Markdown content itself.`,
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
