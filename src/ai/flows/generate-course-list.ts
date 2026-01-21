'use server';

/**
 * @fileOverview An AI agent to generate a list of courses.
 *
 * - generateCourseList - A function that generates a course list.
 * - GenerateCourseListInput - The input type for the generateCourseList function.
 * - GenerateCourseListOutput - The return type for the generateCourseList function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateCourseListInputSchema = z.object({
  language: z.enum(['fr', 'en']).describe("The language for the course content."),
  count: z.number().min(4).max(8).describe("The number of courses to generate."),
});

export type GenerateCourseListInput = z.infer<typeof GenerateCourseListInputSchema>;

const CourseSchema = z.object({
    id: z.string().describe("A unique slug-like ID for the course, e.g., 'algebra-fundamentals'."),
    title: z.string().describe("The engaging title of the course."),
    subject: z.string().describe("The academic subject (e.g., Mathematics, Physics, History)."),
    language: z.enum(['fr', 'en']).describe("The language of the course, must match the input language."),
    description: z.string().describe("A brief, one-sentence description of the course content."),
    lessonsCount: z.number().min(8).max(20).describe("The number of lessons in the course."),
});

const GenerateCourseListOutputSchema = z.object({
  courses: z.array(CourseSchema),
});

export type GenerateCourseListOutput = z.infer<typeof GenerateCourseListOutputSchema>;

export async function generateCourseList(
  input: GenerateCourseListInput
): Promise<GenerateCourseListOutput> {
  return generateCourseListFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCourseListPrompt',
  input: { schema: GenerateCourseListInputSchema },
  output: { schema: GenerateCourseListOutputSchema },
  prompt: `You are an expert curriculum designer for the Cameroonian education system, covering both francophone and anglophone subsystems.

  Generate a list of {{{count}}} original and diverse course ideas. The courses should be in {{{language}}}.

  For each course, provide:
  - A unique, slug-style 'id'.
  - A compelling 'title'.
  - A relevant academic 'subject'.
  - The course 'language' (must be '{{{language}}}').
  - A concise 'description'.
  - A realistic 'lessonsCount' between 8 and 20.

  Ensure the list is varied in subjects. Do not repeat courses. Generate the list now in the specified JSON format.`,
});

const generateCourseListFlow = ai.defineFlow(
  {
    name: 'generateCourseListFlow',
    inputSchema: GenerateCourseListInputSchema,
    outputSchema: GenerateCourseListOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
