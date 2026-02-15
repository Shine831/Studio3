
'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { doc, updateDoc, DocumentReference, addDoc, collection, serverTimestamp, Firestore, increment } from 'firebase/firestore';
import type { User } from 'firebase/auth';

import {
  generateQuiz,
  type GenerateQuizOutput,
} from '@/ai/flows/generate-quiz';
import {
  generateLessonContent,
} from '@/ai/flows/generate-lesson-content';
import { useLanguage } from '@/context/language-context';
import { useFirestore, useUser, useDoc, FirestorePermissionError, errorEmitter } from '@/firebase';
import type { SavedStudyPlan, WithId, Lesson, UserProfile } from '@/lib/types';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import { RoleGuard } from '@/components/role-guard';
import { AiCreditAlert } from '@/components/ai-credit-alert';
import { hasUnlimitedAccess } from '@/lib/utils';

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
            <CardDescription className="text-2xl font-bold">{`${t.yourScore}: ${score.toFixed(0)}%`}</CardDescription>
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

function LessonContent({ lesson, subject, language, plan, lessonIndex, planRef, user, firestore, userProfile, userProfileRef }: { lesson: Lesson, subject: string, language: 'fr' | 'en', plan: WithId<SavedStudyPlan>, lessonIndex: number, planRef: DocumentReference | null, user: User | null, firestore: Firestore | null, userProfile: UserProfile | null, userProfileRef: DocumentReference | null }) {
    const [isContentLoading, setIsContentLoading] = useState(false);
    const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [quizScore, setQuizScore] = useState<number | null>(null);
    const [userAnswers, setUserAnswers] = useState<Answer[]>([]);
    const [showCreditError, setShowCreditError] = useState(false);

    const t = {
        fr: {
            generateLesson: "Générer la leçon (1 crédit)",
            generatingLesson: "Génération de la leçon...",
            takeQuiz: "Faire le Quiz (1 crédit)",
            generatingQuiz: "Génération du quiz...",
            quizError: "Une erreur est survenue lors de la génération du quiz. Veuillez réessayer.",
            contentError: "Impossible de charger le contenu de la leçon. Veuillez réessayer.",
            errorTitle: "Erreur"
        },
        en: {
            generateLesson: "Generate Lesson (1 credit)",
            generatingLesson: "Generating lesson...",
            takeQuiz: "Take the Quiz (1 credit)",
            generatingQuiz: "Generating quiz...",
            quizError: "An error occurred while generating the quiz. Please try again.",
            contentError: "Could not load lesson content. Please try again.",
            errorTitle: "Error"
        }
    }[language];

    const checkCredits = () => {
        if (!userProfile) return false;
        const isUnlimited = hasUnlimitedAccess(userProfile);
        
        if (isUnlimited || (userProfile.aiCredits || 0) > 0) {
            return true;
        }
        setShowCreditError(true);
        return false;
    }

    const handleGenerateContent = async () => {
        if (!planRef || !userProfileRef || !checkCredits()) return;
        setIsContentLoading(true);
        setError(null);
        try {
            const result = await generateLessonContent({ courseTitle: lesson.title, subject, language });
            const newLessons = [...plan.lessons];
            newLessons[lessonIndex].content = result.lessonContent;
            
            updateDoc(planRef, { lessons: newLessons }).catch((error) => {
                errorEmitter.emit('permission-error', new FirestorePermissionError({
                    path: planRef.path,
                    operation: 'update',
                    requestResourceData: { lessons: '[...]' }
                }));
            });

            if (!hasUnlimitedAccess(userProfile)) {
                updateDoc(userProfileRef, { aiCredits: increment(-1) }).catch((error) => {
                    errorEmitter.emit('permission-error', new FirestorePermissionError({
                        path: userProfileRef.path,
                        operation: 'update',
                        requestResourceData: { aiCredits: 'increment(-1)' }
                    }));
                });
            }
        } catch (e) {
            console.error(e);
            setError(t.contentError);
        } finally {
            setIsContentLoading(false);
        }
    };

    const handleGenerateQuiz = async () => {
        if (!planRef || !userProfileRef || !checkCredits()) return;
        setIsLoadingQuiz(true);
        setError(null);
        setQuizScore(null);
        setUserAnswers([]);
        try {
            const result = await generateQuiz({ subject, courseTitle: lesson.title });
            if (result && result.questions.length > 0) {
                const newLessons = [...plan.lessons];
                newLessons[lessonIndex].quiz = result.questions;
                
                updateDoc(planRef, { lessons: newLessons }).catch(error => {
                     errorEmitter.emit('permission-error', new FirestorePermissionError({
                        path: planRef.path,
                        operation: 'update',
                        requestResourceData: { lessons: '[...]' }
                    }));
                });

                if (!hasUnlimitedAccess(userProfile)) {
                    updateDoc(userProfileRef, { aiCredits: increment(-1) }).catch(error => {
                        errorEmitter.emit('permission-error', new FirestorePermissionError({
                            path: userProfileRef.path,
                            operation: 'update',
                            requestResourceData: { aiCredits: 'increment(-1)' }
                        }));
                    });
                }
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
    
        if (!planRef || !user || !firestore) return;
    
        const quizResultData = {
          studentId: user.uid,
          planId: plan.id,
          planSubject: plan.subject,
          lessonTitle: lesson.title,
          score: score,
          completionDate: serverTimestamp(),
          answers: answers,
        };
    
        const quizResultsCollectionRef = collection(firestore, 'users', user.uid, 'quizResults');
        addDoc(quizResultsCollectionRef, quizResultData).catch(error => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: quizResultsCollectionRef.path,
                operation: 'create',
                requestResourceData: quizResultData,
            }));
        });
    };

    const handleRestartQuiz = () => {
        setQuizScore(null);
        setUserAnswers([]);
        setShowCreditError(false);
    };

    if (showCreditError) {
        return (
            <div className="p-4">
                <AiCreditAlert language={language} />
            </div>
        )
    }

    if (!lesson.content) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                <p className="text-muted-foreground">{lesson.description}</p>
                <Button onClick={handleGenerateContent} disabled={isContentLoading}>
                    {isContentLoading ? <Loader2 className="animate-spin mr-2" /> : null}
                    {isContentLoading ? t.generatingLesson : t.generateLesson}
                </Button>
                {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
        );
    }

    const quizData = lesson.quiz ? { questions: lesson.quiz } : null;

    return (
        <div className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown>{lesson.content}</ReactMarkdown>
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
                        <AlertTitle>{t.errorTitle}</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                {!isLoadingQuiz && !quizData && quizScore === null && (
                    <Button onClick={handleGenerateQuiz} size="lg">
                        {t.takeQuiz}
                    </Button>
                )}
                {quizData && quizScore === null && (
                    <QuizDisplay quiz={quizData} onComplete={handleQuizComplete} />
                )}
                {quizData && quizScore !== null && (
                    <QuizResults quiz={quizData} score={quizScore} userAnswers={userAnswers} onRestart={handleRestartQuiz} />
                )}
            </div>
        </div>
    );
}

export default function StudyPlanDetailPage() {
  const { planId } = useParams();
  const { user } = useUser();
  const firestore = useFirestore();
  const { language } = useLanguage();

  const planRef = useMemo(
    () => (user && planId ? doc(firestore, 'users', user.uid, 'studyPlans', planId as string) : null),
    [firestore, user, planId]
  );
  const { data: plan, isLoading: isPlanLoading, error: planError } = useDoc<WithId<SavedStudyPlan>>(planRef);

  const userProfileRef = useMemo(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

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
  
  const isLoading = isPlanLoading || isProfileLoading;

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

  if (planError) {
    return <Alert variant="destructive">{t.error}</Alert>
  }

  if (!plan) {
    return <Alert>{t.notFound}</Alert>
  }

  return (
    <RoleGuard allowedRoles={['student', 'admin']}>
        <div className="space-y-6">
            <div>
                <Button asChild variant="ghost" className="mb-4 -ml-4">
                    <Link href="/study-plan">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {t.back}
                    </Link>
                </Button>
                <h1 className="text-2xl md:text-3xl font-bold font-headline flex items-center gap-3">
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
                            <LessonContent 
                                lesson={lesson} 
                                subject={plan.subject} 
                                language={language} 
                                plan={plan} 
                                lessonIndex={index} 
                                planRef={planRef} 
                                user={user} 
                                firestore={firestore}
                                userProfile={userProfile}
                                userProfileRef={userProfileRef}
                            />
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>

        </div>
    </RoleGuard>
  );
}
