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
  prompt: `You are an expert teacher creating a detailed lesson for a student in the Cameroonian education system. The lesson should be comprehensive, well-structured, and follow a clear pedagogical approach. The entire output must be in valid Markdown format.

The lesson structure should be as follows:
1.  **# Main Title of the Lesson**
2.  **## Introduction**: A brief, engaging overview of the topic.
3.  **## Core Concepts**: One or more sections explaining the main ideas. Use subheadings (###), bullet points (\`-\`), and bold text (\`**...**\`) to clarify key terms.
4.  **## Examples**: Provide concrete examples to illustrate the concepts.
5.  **## Summary**: A conclusion that recaps the most important points of the lesson.

Generate the lesson content for:
  - Subject: {{{subject}}}
  - Course Title: {{{courseTitle}}}
  - Language: {{{language}}}

The content must be in {{{language}}}. Do not include any text or formatting outside of the Markdown content itself.`,
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
