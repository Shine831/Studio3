'use client';
import Link from 'next/link';
import Image from 'next/image';
import {
  BookOpen,
  BrainCircuit,
  LayoutDashboard,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Icons } from '@/components/icons';
import { placeholderImages } from '@/lib/data';
import { useLanguage } from '@/context/language-context';

export default function LandingPage() {
  const { language } = useLanguage();

  const features = [
    {
      icon: <BookOpen className="h-10 w-10" />,
      title: {
        fr: 'Contenu Pédagogique Bilingue',
        en: 'Bilingual Educational Content',
      },
      description: {
        fr: 'Accédez à des cours et quiz structurés pour le système camerounais, en français et en anglais.',
        en: 'Access structured courses and quizzes for the Cameroonian system, in both French and English.',
      },
    },
    {
      icon: <BrainCircuit className="h-10 w-10" />,
      title: {
        fr: 'Quiz Interactifs & IA',
        en: 'Interactive Quizzes & AI',
      },
      description: {
        fr: 'Testez vos connaissances avec des retours instantanés et des explications générées par IA.',
        en: 'Test your knowledge with instant feedback and AI-generated explanations.',
      },
    },
    {
      icon: <Users className="h-10 w-10" />,
      title: {
        fr: 'Répétiteurs Qualifiés',
        en: 'Qualified Tutors',
      },
      description: {
        fr: 'Trouvez et réservez des sessions avec les meilleurs répétiteurs vérifiés.',
        en: 'Find and book sessions with the best verified tutors.',
      },
    },
    {
      icon: <LayoutDashboard className="h-10 w-10" />,
      title: {
        fr: 'Suivi Personnalisé',
        en: 'Personalized Tracking',
      },
      description: {
        fr: 'Suivez vos progrès avec un tableau de bord et un plan d’étude adapté à vos besoins.',
        en: 'Track your progress with a dashboard and a study plan tailored to your needs.',
      },
    },
  ];

  const content = {
    fr: {
      tagline: 'Cours, quiz et répétiteurs pour réussir votre lycée au Cameroun.',
      getStarted: 'Commencer',
      browseCourses: 'Parcourir les cours',
      everythingYouNeed: 'Tout ce dont vous avez besoin pour réussir',
      platformDescription: 'Une plateforme conçue pour les élèves camerounais.',
      features: 'Fonctionnalités',
      courses: 'Cours',
      tutors: 'Répétiteurs',
      login: 'Se connecter',
      signup: 'S\'inscrire',
      terms: 'Conditions',
      privacy: 'Confidentialité'
    },
    en: {
      tagline: 'Lessons, quizzes and tutors to succeed in Cameroonian high school.',
      getStarted: 'Get Started',
      browseCourses: 'Browse Courses',
      everythingYouNeed: 'Everything you need to succeed',
      platformDescription: 'A platform designed for Cameroonian students.',
      features: 'Features',
      courses: 'Courses',
      tutors: 'Tutors',
      login: 'Log In',
      signup: 'Sign Up',
      terms: 'Terms',
      privacy: 'Privacy'
    }
  };

  const t = content[language];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Icons.logo className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold font-headline text-foreground">
              RéviseCamer
            </span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {t.features}
            </Link>
            <Link
              href="/courses"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {t.courses}
            </Link>
            <Link
              href="/tutors"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {t.tutors}
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Button variant="ghost" asChild>
              <Link href="/login">{t.login}</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">{t.signup}</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="relative py-20 md:py-32">
          <div
            aria-hidden="true"
            className="absolute inset-0 top-0 -z-10 h-1/2 w-full bg-gradient-to-b from-primary/10 to-background"
          ></div>
          <Image
            src={placeholderImages[0].imageUrl}
            alt="Hero background"
            fill
            className="-z-20 object-cover opacity-5"
            data-ai-hint="classroom student"
          />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              RéviseCamer
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              {content.fr.tagline}
              <br />
              <span className="italic">
                {content.en.tagline}
              </span>
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="lg" asChild>
                <Link href="/signup">{t.getStarted}</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/courses">{t.browseCourses}</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 md:py-24 bg-card">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="font-headline text-3xl font-bold text-foreground">
                {t.everythingYouNeed}
              </h2>
              <p className="mt-4 text-muted-foreground">
                {t.platformDescription}
              </p>
            </div>
            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <Card key={index} className="bg-background/50">
                  <CardHeader>
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {feature.icon}
                    </div>
                    <CardTitle className="pt-4 font-headline text-lg">
                      {feature.title[language]}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {feature.description[language]}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-card">
        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="flex items-center gap-2">
              <Icons.logo className="h-6 w-6 text-primary" />
              <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} RéviseCamer. All rights
                reserved.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-6 md:mt-0">
              <Link
                href="/terms"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {t.terms}
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {t.privacy}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
