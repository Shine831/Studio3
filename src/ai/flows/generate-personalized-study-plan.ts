// src/ai/flows/generate-personalized-study-plan.ts
'use server';
/**
 * @fileOverview Generates a personalized study plan for a student based on their diagnostic pre-test results.
 *
 * - generatePersonalizedStudyPlan - A function that generates the personalized study plan.
 * - GeneratePersonalizedStudyPlanInput - The input type for the generatePersonalizedStudyPlan function.
 * - GeneratePersonalizedStudyPlanOutput - The return type for the generatePersonalizedStudyPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePersonalizedStudyPlanInputSchema = z.object({
  studentId: z.string().describe('The ID of the student.'),
  preTestResults: z.record(z.string(), z.number()).describe('A map of subject to score from the pre-test results.'),
  subjects: z.array(z.string()).describe('The subjects the student is studying.'),
  gradeLevel: z.string().describe('The grade level of the student (e.g., Seconde, Premiere, Terminale).'),
  learningGoals: z.string().describe('Specific learning goals or areas the student wants to improve in.'),
});
export type GeneratePersonalizedStudyPlanInput = z.infer<typeof GeneratePersonalizedStudyPlanInputSchema>;

const GeneratePersonalizedStudyPlanOutputSchema = z.object({
  studyPlan: z.string().describe('A personalized study plan for the student.'),
});
export type GeneratePersonalizedStudyPlanOutput = z.infer<typeof GeneratePersonalizedStudyPlanOutputSchema>;

export async function generatePersonalizedStudyPlan(input: GeneratePersonalizedStudyPlanInput): Promise<GeneratePersonalizedStudyPlanOutput> {
  return generatePersonalizedStudyPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePersonalizedStudyPlanPrompt',
  input: {schema: GeneratePersonalizedStudyPlanInputSchema},
  output: {schema: GeneratePersonalizedStudyPlanOutputSchema},
  prompt: `You are an AI study plan generator. Generate a personalized study plan for a high school student in Cameroon, based on their pre-test results, grade level, subjects, and learning goals. The study plan should be detailed, actionable, and include specific topics to study, resources to use, and practice quizzes or exercises. Consider the Cameroonian curriculum and educational context.

Student ID: {{{studentId}}}
Pre-Test Results: {{{preTestResults}}}
Subjects: {{{subjects}}}
Grade Level: {{{gradeLevel}}}
Learning Goals: {{{learningGoals}}}

Here is the study plan:
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
