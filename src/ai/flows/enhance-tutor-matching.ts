'use server';

/**
 * @fileOverview Enhances tutor matching by leveraging AI to consider student's learning style, preferred teaching methods, and academic goals.
 *
 * - enhanceTutorMatching - A function that enhances tutor matching process.
 * - EnhanceTutorMatchingInput - The input type for the enhanceTutorMatching function.
 * - EnhanceTutorMatchingOutput - The return type for the enhanceTutorMatching function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceTutorMatchingInputSchema = z.object({
  studentLearningStyle: z
    .string()
    .describe('The learning style of the student (e.g., visual, auditory, kinesthetic).'),
  preferredTeachingMethods: z
    .string()
    .describe('The preferred teaching methods of the student (e.g., lectures, discussions, hands-on activities).'),
  academicGoals: z
    .string()
    .describe('The academic goals of the student (e.g., improve grades, prepare for exams, learn new concepts).'),
  tutorProfiles: z
    .string()
    .describe('A list of tutor profiles to evaluate for matching with the student.'),
});

export type EnhanceTutorMatchingInput = z.infer<typeof EnhanceTutorMatchingInputSchema>;

const EnhanceTutorMatchingOutputSchema = z.object({
  rankedTutorProfiles: z
    .string()
    .describe('A list of tutor profiles ranked based on compatibility with the student.'),
});

export type EnhanceTutorMatchingOutput = z.infer<typeof EnhanceTutorMatchingOutputSchema>;

export async function enhanceTutorMatching(input: EnhanceTutorMatchingInput): Promise<EnhanceTutorMatchingOutput> {
  return enhanceTutorMatchingFlow(input);
}

const enhanceTutorMatchingPrompt = ai.definePrompt({
  name: 'enhanceTutorMatchingPrompt',
  input: {schema: EnhanceTutorMatchingInputSchema},
  output: {schema: EnhanceTutorMatchingOutputSchema},
  prompt: `You are an AI assistant designed to enhance tutor matching for students.

  Based on the student's learning style, preferred teaching methods, and academic goals, rank the tutor profiles in terms of compatibility.

  Student Learning Style: {{{studentLearningStyle}}}
  Preferred Teaching Methods: {{{preferredTeachingMethods}}}
  Academic Goals: {{{academicGoals}}}
  Tutor Profiles: {{{tutorProfiles}}}

  Ranked Tutor Profiles:`,
});

const enhanceTutorMatchingFlow = ai.defineFlow(
  {
    name: 'enhanceTutorMatchingFlow',
    inputSchema: EnhanceTutorMatchingInputSchema,
    outputSchema: EnhanceTutorMatchingOutputSchema,
  },
  async input => {
    const {output} = await enhanceTutorMatchingPrompt(input);
    return output!;
  }
);
