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
  subject: z.string().describe('The subject the student wants to study.'),
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
  plan: z
    .array(StudyPlanItemSchema)
    .describe("The array of lessons in the study plan, ordered logically. Should be empty if the request is not related to an academic subject."),
  isRefusal: z
    .boolean()
    .describe("Set to true if the user's request is not an academic subject and a plan cannot be generated."),
  refusalMessage: z
    .string()
    .optional()
    .describe("A polite message explaining why the plan could not be generated, to be used when isRefusal is true."),
});

export type GeneratePersonalizedStudyPlanOutput = z.infer<typeof GeneratePersonalizedStudyPlanOutputSchema>;

export async function generatePersonalizedStudyPlan(input: GeneratePersonalizedStudyPlanInput): Promise<GeneratePersonalizedStudyPlanOutput> {
  return generatePersonalizedStudyPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePersonalizedStudyPlanPrompt',
  input: {schema: GeneratePersonalizedStudyPlanInputSchema},
  output: {schema: GeneratePersonalizedStudyPlanOutputSchema},
  prompt: `You are an expert instructional designer creating a study plan for a high school student in Cameroon. Your response must be in the structured JSON format.

First, evaluate if the requested 'subject' is a valid academic topic for the specified 'gradeLevel' within the Cameroonian curriculum.
- If the subject IS NOT academic or relevant (e.g., 'learning to cook', 'sports', 'video games'), you MUST set 'isRefusal' to true and provide a polite 'refusalMessage' in French. The message should state that plans can only be generated for academic subjects. The 'plan' array must be empty.
- If the subject IS academic, set 'isRefusal' to false and proceed.

Generate a realistic, actionable study plan based on the student's information. The plan should be a sequence of lessons. For each item, provide a title, a short description, and an estimated duration in minutes.

Student Information:
- Grade Level: {{{gradeLevel}}}
- Subject: {{{subject}}}
- Learning Goals: {{{learningGoals}}}

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
