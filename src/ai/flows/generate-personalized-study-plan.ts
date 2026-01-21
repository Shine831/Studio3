'use server';
/**
 * @fileOverview Generates a personalized study plan for a student based on their diagnostic pre-test results.
 *
 * - generatePersonalizedStudyPlan - A function that generates the personalized study plan.
 * - GeneratePersonalizedStudyPlanInput - The input type for the generatePersonalizedStudyPlan function.
 * - GeneratePersonalizedStudyPlanOutput - The return type for the generatePersonalizedStudyPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GeneratePersonalizedStudyPlanInputSchema = z.object({
  studentId: z.string().describe('The ID of the student.'),
  preTestResults: z.record(z.string(), z.number()).describe('A map of subject to score from the pre-test results.'),
  subjects: z.array(z.string()).describe('The subjects the student is studying.'),
  gradeLevel: z.string().describe('The grade level of the student (e.g., Seconde, Premiere, Terminale).'),
  learningGoals: z.string().describe('Specific learning goals or areas the student wants to improve in.'),
});
export type GeneratePersonalizedStudyPlanInput = z.infer<typeof GeneratePersonalizedStudyPlanInputSchema>;

const StudyPlanItemSchema = z.object({
    title: z.string().describe("The concise title of the lesson or chapter."),
    description: z.string().describe("A brief, one-sentence description of what this lesson covers."),
    duration: z.number().describe("Estimated time in minutes to complete the lesson."),
});

const GeneratePersonalizedStudyPlanOutputSchema = z.object({
  plan: z.array(StudyPlanItemSchema).describe("The array of lessons in the study plan, ordered logically."),
});

export type GeneratePersonalizedStudyPlanOutput = z.infer<typeof GeneratePersonalizedStudyPlanOutputSchema>;

export async function generatePersonalizedStudyPlan(input: GeneratePersonalizedStudyPlanInput): Promise<GeneratePersonalizedStudyPlanOutput> {
  return generatePersonalizedStudyPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePersonalizedStudyPlanPrompt',
  input: {schema: GeneratePersonalizedStudyPlanInputSchema},
  output: {schema: GeneratePersonalizedStudyPlanOutputSchema},
  prompt: `You are an expert instructional designer tasked with creating a personalized study plan for a high school student in Cameroon. Your response must be in the structured JSON format defined in the output schema.

Based on the provided information, generate a realistic and actionable study plan. The plan should be a sequence of lessons or topics. For each item in the plan, provide a title, a short description, and an estimated duration in minutes.

The plan should be tailored to the Cameroonian curriculum for the specified grade level and subjects. The student's learning goals should be the primary driver for the plan's content.

Student Information:
- Grade Level: {{{gradeLevel}}}
- Subject(s): {{#each subjects}}{{{this}}}{{/each}}
- Learning Goals: {{{learningGoals}}}
- Pre-Test Results (for context, may be empty): {{{preTestResults}}}

Generate the study plan now.
`,
});

const generatePersonalizedStudyPlanFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedStudyPlanFlow',
    inputSchema: GeneratePersonalizedStudyPlanInputSchema,
    outputSchema: GeneratePersonalizedStudyPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
