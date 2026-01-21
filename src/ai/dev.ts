'use client';
import { config } from 'dotenv';
config();

import '@/ai/flows/enhance-tutor-matching.ts';
import '@/ai/flows/generate-personalized-study-plan.ts';
import '@/ai/flows/generate-quiz-explanation.ts';
import '@/ai/flows/generate-quiz.ts';
import '@/ai/flows/generate-course-list.ts';
