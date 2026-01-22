'use client';
import Link from 'next/link';
import Image from 'next/image';
import {
  MessageSquare,
  Search,
  Star,
  UserCheck,
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
      icon: <Search className="h-10 w-10" />,
      title: {
        fr: 'Trouvez le Répétiteur Idéal',
        en: 'Find the Ideal Tutor',
      },
      description: {
        fr: 'Parcourez les profils de répétiteurs qualifiés et vérifiés pour toutes les matières.',
        en: 'Browse profiles of qualified and verified tutors for all subjects.',
      },
    },
    {
      icon: <MessageSquare className="h-10 w-10" />,
      title: {
        fr: 'Contact Direct sur WhatsApp',
        en: 'Direct Contact on WhatsApp',
      },
      description: {
        fr: 'Échangez directement avec les répétiteurs sur WhatsApp pour poser vos questions et organiser des cours.',
        en: 'Chat directly with tutors on WhatsApp to ask questions and arrange lessons.',
      },
    },
    {
      icon: <Star className="h-10 w-10" />,
      title: {
        fr: 'Évaluations Authentiques',
        en: 'Authentic Reviews',
      },
      description: {
        fr: 'Consultez les notes et les commentaires laissés par d\'autres élèves pour faire le bon choix.',
        en: 'Check ratings and comments from other students to make the right choice.',
      },
    },
    {
      icon: <UserCheck className="h-10 w-10" />,
      title: {
        fr: 'Profils Vérifiés',
        en: 'Verified Profiles',
      },
      description: {
        fr: 'Un badge de vérification vous aide à identifier les répétiteurs les plus fiables et expérimentés.',
        en: 'A verification badge helps you identify the most reliable and experienced tutors.',
      },
    },
  ];

  const content = {
    fr: {
      tagline: 'Le moyen le plus simple de trouver un répétiteur au Cameroun et de le contacter sur WhatsApp.',
      getStarted: 'Trouver un répétiteur',
      features: 'Fonctionnalités',
      tutors: 'Répétiteurs',
      login: 'Se connecter',
      signup: 'S\'inscrire',
      terms: 'Conditions',
      privacy: 'Confidentialité'
    },
    en: {
      tagline: 'The easiest way to find a tutor in Cameroon and connect on WhatsApp.',
      getStarted: 'Find a Tutor',
      features: 'Features',
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
              {t.tagline}
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="lg" asChild>
                <Link href="/tutors">{t.getStarted}</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 md:py-24 bg-card">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="font-headline text-3xl font-bold text-foreground">
                Une Connexion Directe et Simple
              </h2>
              <p className="mt-4 text-muted-foreground">
                Tout est conçu pour faciliter la mise en relation.
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

    