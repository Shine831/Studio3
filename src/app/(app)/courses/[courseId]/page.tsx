'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import {
  generateQuiz,
  type GenerateQuizOutput,
  type Question,
} from '@/ai/flows/generate-quiz';
import {
  generateLessonContent,
  type GenerateLessonContentOutput,
} from '@/ai/flows/generate-lesson-content';
import { useLanguage } from '@/context/language-context';

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
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

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

export default function CourseDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { courseId } = params;
  const { language } = useLanguage();
  
  const course = useMemo(() => {
    if (!searchParams.get('title')) {
        return null;
    }
    return {
        id: courseId as string,
        title: searchParams.get('title') || '',
        subject: searchParams.get('subject') || '',
        level: searchParams.get('level') || '',
        language: (searchParams.get('language') as 'fr' | 'en') || 'fr',
        description: searchParams.get('description') || '',
    };
  }, [courseId, searchParams]);

  const [lessonContent, setLessonContent] = useState<string | null>(null);
  const [isContentLoading, setIsContentLoading] = useState(true);
  const [quiz, setQuiz] = useState<GenerateQuizOutput | null>(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<Answer[]>([]);

  const t = {
    fr: {
        courseNotFound: "Cours non trouvé",
        lessonContent: "Contenu de la leçon",
        takeQuiz: "Faire le Quiz",
        generatingQuiz: "Génération du quiz...",
        quizError: "Une erreur est survenue lors de la génération du quiz. Veuillez réessayer.",
        contentError: "Impossible de charger le contenu de la leçon. Veuillez réessayer.",
    },
    en: {
        courseNotFound: "Course not found",
        lessonContent: "Lesson Content",
        takeQuiz: "Take the Quiz",
        generatingQuiz: "Generating quiz...",
        quizError: "An error occurred while generating the quiz. Please try again.",
        contentError: "Could not load lesson content. Please try again.",
    }
  }[language];

  useEffect(() => {
    if (!course) return;

    const fetchContent = async () => {
        setIsContentLoading(true);
        try {
            const result = await generateLessonContent({
                courseTitle: course.title,
                subject: course.subject,
                level: course.level,
                language: course.language,
            });
            setLessonContent(result.lessonContent);
        } catch (e) {
            console.error(e);
            setLessonContent(t.contentError);
        } finally {
            setIsContentLoading(false);
        }
    };

    fetchContent();
  }, [course, language, t.contentError]);


  if (!course) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>{t.courseNotFound}</p>
      </div>
    );
  }

  const handleGenerateQuiz = async () => {
    setIsLoadingQuiz(true);
    setError(null);
    setQuiz(null);
    setQuizScore(null);
    setUserAnswers([]);

    try {
      const result = await generateQuiz({
        subject: course.subject,
        level: course.level,
        courseTitle: course.title,
      });
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
  }

  const handleRestartQuiz = () => {
      setQuiz(null);
      setQuizScore(null);
      setUserAnswers([]);
      // Optional: re-fetch lesson content or just show quiz button again
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-4xl font-headline">{course.title}</CardTitle>
          <CardDescription className="text-lg">{course.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary" className="mb-2">
            {course.subject}
          </Badge>
          <Badge variant="outline" className="ml-2">
            {course.level}
          </Badge>
          <Badge variant="outline" className="ml-2">
            {course.language.toUpperCase()}
          </Badge>
        </CardContent>
      </Card>
      
      <Separator />

      <div className="space-y-4">
        <h2 className="text-2xl font-bold font-headline">{t.lessonContent}</h2>
        {isContentLoading ? (
             <div className="space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <br/>
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
             </div>
        ) : (
            <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown>{lessonContent || ''}</ReactMarkdown>
            </div>
        )}
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
            <Button onClick={handleGenerateQuiz} disabled={isContentLoading} size="lg">
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
  );
}
