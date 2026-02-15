'use client';
import Link from 'next/link';
import Image from 'next/image';
import {
  BrainCircuit,
  BookCopy,
  BarChart3,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Icons } from '@/components/icons';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useLanguage } from '@/context/language-context';

export default function LandingPage() {
  const { language } = useLanguage();

  const features = [
    {
      icon: <BrainCircuit className="h-8 w-8" />,
      title: {
        fr: "Plans d'Étude sur Mesure",
        en: 'Custom Study Plans',
      },
      description: {
        fr: "Décrivez vos objectifs et notre IA vous crée un plan d'étude personnalisé et structuré.",
        en: 'Describe your goals and our AI will create a personalized and structured study plan for you.',
      },
    },
    {
      icon: <BookCopy className="h-8 w-8" />,
      title: {
        fr: 'Leçons et Quiz à la Demande',
        en: 'On-Demand Lessons & Quizzes',
      },
      description: {
        fr: "Générez des leçons complètes et des quiz interactifs pour chaque chapitre de votre plan.",
        en: 'Generate complete lessons and interactive quizzes for each chapter of your plan.',
      },
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: {
        fr: 'Suivi de Votre Progression',
        en: 'Track Your Progress',
      },
      description: {
        fr: "Visualisez votre progression, vos scores aux quiz et le temps d'étude sur votre tableau de bord.",
        en: 'Visualize your progress, quiz scores, and study time on your dashboard.',
      },
    },
    {
        icon: <Sparkles className="h-8 w-8" />,
        title: {
          fr: 'Apprentissage Autonome',
          en: 'Autonomous Learning',
        },
        description: {
          fr: "Prenez en main votre réussite scolaire avec des outils conçus pour l'auto-apprentissage.",
          en: 'Take control of your academic success with tools designed for self-directed learning.',
        },
      },
  ];

  const content = {
    fr: {
      headline: "Votre partenaire IA pour la réussite scolaire au Cameroun",
      tagline: "Générez des plans d'étude, des leçons et des quiz. Maîtrisez n'importe quel sujet à votre rythme.",
      getStarted: 'Commencer gratuitement',
      featuresTitle: "Des Outils Puissants pour Votre Réussite",
      featuresDescription: "Prenez en main votre apprentissage avec une suite d'outils intelligents conçus pour vous.",
      features: 'Fonctionnalités',
      login: 'Se connecter',
      signup: 'S\'inscrire',
      terms: 'Conditions',
      privacy: 'Confidentialité'
    },
    en: {
      headline: "Your AI Partner for Academic Success in Cameroon",
      tagline: 'Generate study plans, lessons, and quizzes. Master any subject at your own pace.',
      getStarted: 'Get Started for Free',
      features: 'Features',
      featuresTitle: "Powerful Tools for Your Success",
      featuresDescription: "Take control of your learning with a suite of intelligent tools designed for you.",
      login: 'Log In',
      signup: 'Sign Up',
      terms: 'Terms',
      privacy: 'Privacy'
    }
  };

  const t = content[language];
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-1');

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="container z-10 mx-auto px-4 sm:px-6 lg:px-8">
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
          </nav>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="/login">{t.login}</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">{t.getStarted}</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="relative py-24 md:py-32">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 h-full w-full bg-gradient-to-b from-primary/5 to-background"
          />
          {heroImage && <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            priority
            className="-z-20 object-cover opacity-[0.02]"
            data-ai-hint={heroImage.imageHint}
          />}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
             <div className="mb-6">
                <a href="#features" className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm font-medium">
                    <Sparkles className="h-4 w-4 text-primary mr-2" />
                    <span>{t.features}</span>
                </a>
            </div>
            <h1 className="font-headline text-4xl font-bold tracking-tighter text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
              {t.headline}
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
              {t.tagline}
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-4">
              <Button size="lg" asChild>
                <Link href="/signup">{t.getStarted}</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="sm:hidden">
                 <Link href="/login">{t.login}</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="py-24 bg-card/40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
                <h2 className="text-base font-semibold leading-7 text-primary">{t.features}</h2>
                <p className="mt-2 font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    {t.featuresTitle}
                </p>
                <p className="mt-6 text-lg leading-8 text-muted-foreground">
                    {t.featuresDescription}
                </p>
            </div>
            <div className="mt-16 grid grid-cols-1 gap-y-12 md:grid-cols-2 lg:grid-cols-2 md:gap-x-8 lg:gap-16">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-6">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:h-14 sm:w-14">
                      {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold leading-7 text-foreground font-headline">
                      {feature.title[language]}
                    </h3>
                    <p className="mt-2 text-base leading-7 text-muted-foreground">
                      {feature.description[language]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-card/40">
        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="flex items-center gap-2">
              <Icons.logo className="h-6 w-6 text-primary" />
              <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} RéviseCamer. Tous droits réservés.
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
