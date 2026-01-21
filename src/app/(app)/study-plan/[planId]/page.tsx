'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { doc } from 'firebase/firestore';

import {
  generateQuiz,
  type GenerateQuizOutput,
  type Question,
} from '@/ai/flows/generate-quiz';
import {
  generateLessonContent,
} from '@/ai/flows/generate-lesson-content';
import { useLanguage } from '@/context/language-context';
import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import type { SavedStudyPlan, WithId } from '@/lib/types';


import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, BookCopy, ArrowLeft } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';

interface Answer {
  questionIndex: number;
  answer: string;
}

function QuizDisplay({
  quiz,
  onComplete,
}: {
  quiz: GenerateQuizOutput;
  onComplete: (score: number, userAnswers: Answer[]) => void;
}) {
  const { language } = useLanguage();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Answer[]>([]);
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;

  const handleAnswerSelect = (answer: string) => {
    const existingAnswerIndex = selectedAnswers.findIndex(
      (a) => a.questionIndex === currentQuestionIndex
    );
    const newAnswers = [...selectedAnswers];
    if (existingAnswerIndex > -1) {
      newAnswers[existingAnswerIndex] = {
        questionIndex: currentQuestionIndex,
        answer,
      };
    } else {
      newAnswers.push({ questionIndex: currentQuestionIndex, answer });
    }
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    let score = 0;
    quiz.questions.forEach((q, index) => {
      const userAnswer = selectedAnswers.find((a) => a.questionIndex === index);
      if (userAnswer && userAnswer.answer === q.correctAnswer) {
        score++;
      }
    });
    onComplete((score / totalQuestions) * 100, selectedAnswers);
  };

  const selectedValue =
    selectedAnswers.find((a) => a.questionIndex === currentQuestionIndex)
      ?.answer || '';
      
  const t = {
    fr: {
        question: "Question",
        of: "sur",
        back: "Précédent",
        next: "Suivant",
        submit: "Terminer le quiz",
    },
    en: {
        question: "Question",
        of: "of",
        back: "Back",
        next: "Next",
        submit: "Submit Quiz",
    }
  }[language];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{`${t.question} ${currentQuestionIndex + 1} ${t.of} ${totalQuestions}`}</CardTitle>
        <Progress value={((currentQuestionIndex + 1) / totalQuestions) * 100} className="mt-2" />
        <CardDescription className="pt-4 text-lg">{currentQuestion.questionText}</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedValue}
          onValueChange={handleAnswerSelect}
          className="space-y-4"
        >
          {currentQuestion.options.map((option, i) => (
            <div key={i} className="flex items-center space-x-2">
              <RadioGroupItem value={option} id={`q${currentQuestionIndex}-o${i}`} />
              <Label htmlFor={`q${currentQuestionIndex}-o${i}`} className="text-base">
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
      <div className="flex justify-between p-6">
        <Button onClick={handleBack} disabled={currentQuestionIndex === 0} variant="outline">
          {t.back}
        </Button>
        {currentQuestionIndex < totalQuestions - 1 ? (
          <Button onClick={handleNext}>{t.next}</Button>
        ) : (
          <Button onClick={handleSubmit} disabled={selectedAnswers.length !== totalQuestions}>{t.submit}</Button>
        )}
      </div>
    </Card>
  );
}

function QuizResults({
  quiz,
  score,
  userAnswers,
  onRestart,
}: {
  quiz: GenerateQuizOutput;
  score: number;
  userAnswers: Answer[];
  onRestart: () => void;
}) {
  const { language } = useLanguage();
  const t = {
    fr: {
        resultsTitle: "Résultats du Quiz",
        yourScore: "Votre score",
        review: "Revue des réponses",
        yourAnswer: "Votre réponse",
        correctAnswer: "Réponse correcte",
        explanation: "Explication",
        retakeQuiz: "Refaire le quiz",
    },
    en: {
        resultsTitle: "Quiz Results",
        yourScore: "Your score",
        review: "Answer Review",
        yourAnswer: "Your Answer",
        correctAnswer: "Correct Answer",
        explanation: "Explanation",
        retakeQuiz: "Retake Quiz",
    }
  }[language];

  return (
     <Card>
        <CardHeader>
            <CardTitle>{t.resultsTitle}</CardTitle>
            <CardDescription>{`${t.yourScore}: ${score.toFixed(0)}%`}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <h3 className="font-bold text-lg">{t.review}</h3>
            {quiz.questions.map((q, index) => {
                const userAnswer = userAnswers.find(a => a.questionIndex === index)?.answer;
                const isCorrect = userAnswer === q.correctAnswer;
                return (
                    <div key={index} className="space-y-2">
                        <p className="font-semibold">{index + 1}. {q.questionText}</p>
                        <div className={`flex items-center gap-2 p-2 rounded-md text-sm ${isCorrect ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
                           {isCorrect ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
                           <span>{t.yourAnswer}: {userAnswer || "N/A"}</span>
                        </div>
                         {!isCorrect && (
                             <div className="flex items-center gap-2 p-2 rounded-md text-sm bg-blue-100 dark:bg-blue-900/50">
                                <CheckCircle className="h-5 w-5 text-blue-600" />
                                <span>{t.correctAnswer}: {q.correctAnswer}</span>
                             </div>
                         )}
                        <Alert>
                          <AlertTitle>{t.explanation}</AlertTitle>
                          <AlertDescription>{q.explanation}</AlertDescription>
                        </Alert>
                    </div>
                )
            })}
             <Button onClick={onRestart} className="w-full">{t.retakeQuiz}</Button>
        </CardContent>
     </Card>
  )
}

function LessonContent({ lesson, subject, language }: { lesson: { title: string, description: string, duration: number }, subject: string, language: 'fr' | 'en' }) {
    const [isContentLoading, setIsContentLoading] = useState(false);
    const [content, setContent] = useState<string | null>(null);
    const [quiz, setQuiz] = useState<GenerateQuizOutput | null>(null);
    const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [quizScore, setQuizScore] = useState<number | null>(null);
    const [userAnswers, setUserAnswers] = useState<Answer[]>([]);

    const t = {
        fr: {
            generateLesson: "Générer la leçon",
            takeQuiz: "Faire le Quiz",
            generatingQuiz: "Génération du quiz...",
            quizError: "Une erreur est survenue lors de la génération du quiz. Veuillez réessayer.",
            contentError: "Impossible de charger le contenu de la leçon. Veuillez réessayer.",
        },
        en: {
            generateLesson: "Generate Lesson",
            takeQuiz: "Take the Quiz",
            generatingQuiz: "Generating quiz...",
            quizError: "An error occurred while generating the quiz. Please try again.",
            contentError: "Could not load lesson content. Please try again.",
        }
    }[language];

    const handleGenerateContent = async () => {
        setIsContentLoading(true);
        try {
            const result = await generateLessonContent({ courseTitle: lesson.title, subject, language });
            setContent(result.lessonContent);
        } catch (e) {
            console.error(e);
            setError(t.contentError);
        } finally {
            setIsContentLoading(false);
        }
    };

    const handleGenerateQuiz = async () => {
        setIsLoadingQuiz(true);
        setError(null);
        setQuiz(null);
        setQuizScore(null);
        setUserAnswers([]);
        try {
            const result = await generateQuiz({ subject, courseTitle: lesson.title });
            if (result && result.questions.length > 0) {
                setQuiz(result);
            } else {
                setError(t.quizError);
            }
        } catch (e) {
            console.error(e);
            setError(t.quizError);
        } finally {
            setIsLoadingQuiz(false);
        }
    };

    const handleQuizComplete = (score: number, answers: Answer[]) => {
        setQuizScore(score);
        setUserAnswers(answers);
    };

    const handleRestartQuiz = () => {
        setQuiz(null);
        setQuizScore(null);
        setUserAnswers([]);
    };
    
    if (!content) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center">
                <p className="text-muted-foreground">{lesson.description}</p>
                <Button onClick={handleGenerateContent} disabled={isContentLoading} className="mt-4">
                    {isContentLoading ? <Loader2 className="animate-spin" /> : t.generateLesson}
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown>{content}</ReactMarkdown>
            </div>
            <Separator />
            <div className="flex flex-col items-center justify-center space-y-4">
                {isLoadingQuiz && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="animate-spin h-5 w-5" />
                        <span>{t.generatingQuiz}</span>
                    </div>
                )}
                {error && (
                    <Alert variant="destructive">
                        <AlertTitle>Erreur</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                {!isLoadingQuiz && !quiz && quizScore === null && (
                    <Button onClick={handleGenerateQuiz} size="lg">
                        {t.takeQuiz}
                    </Button>
                )}
                {quiz && quizScore === null && (
                    <QuizDisplay quiz={quiz} onComplete={handleQuizComplete} />
                )}
                {quiz && quizScore !== null && (
                    <QuizResults quiz={quiz} score={quizScore} userAnswers={userAnswers} onRestart={handleRestartQuiz} />
                )}
            </div>
        </div>
    )
}

export default function StudyPlanDetailPage() {
  const { planId } = useParams();
  const { user } = useUser();
  const firestore = useFirestore();
  const { language } = useLanguage();

  const planRef = useMemoFirebase(
    () => (user && planId ? doc(firestore, 'users', user.uid, 'studyPlans', planId as string) : null),
    [firestore, user, planId]
  );
  const { data: plan, isLoading, error } = useDoc<SavedStudyPlan>(planRef);

  const t = {
      fr: {
          loading: "Chargement du plan d'étude...",
          notFound: "Plan d'étude non trouvé.",
          error: "Erreur lors du chargement du plan.",
          back: "Retour à mes plans",
          lessons: "Leçons"
      },
      en: {
          loading: "Loading study plan...",
          notFound: "Study plan not found.",
          error: "Error loading plan.",
          back: "Back to my plans",
          lessons: "Lessons"
      }
  }[language];
  

  if (isLoading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-10 w-1/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
            <Separator />
            <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        </div>
    );
  }

  if (error) {
    return <Alert variant="destructive">{t.error}</Alert>
  }

  if (!plan) {
    return <Alert>{t.notFound}</Alert>
  }

  return (
    <div className="space-y-6">
        <div>
            <Button asChild variant="ghost" className="mb-4">
                <Link href="/study-plan">
                    <ArrowLeft className="mr-2" />
                    {t.back}
                </Link>
            </Button>
            <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
                <BookCopy className="h-8 w-8 text-primary" />
                {plan.subject}
            </h1>
            <p className="text-muted-foreground mt-2">{plan.learningGoals}</p>
        </div>
        <Separator />

         <Accordion type="single" collapsible className="w-full">
            {plan.lessons.map((lesson, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger>
                        <div className='flex items-center gap-4 text-left'>
                             <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">{index + 1}</span>
                            <div>
                                <p className='font-semibold'>{lesson.title}</p>
                                <p className='text-sm text-muted-foreground font-normal'>{lesson.description}</p>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <LessonContent lesson={lesson} subject={plan.subject} language={language} />
                    </AccordionContent>
                </AccordionItem>
            ))}
         </Accordion>

    </div>
  );
}
