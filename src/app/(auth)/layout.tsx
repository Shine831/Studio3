'use client';

import Link from "next/link";
import { Icons } from "@/components/icons";
import { useLanguage } from "@/context/language-context";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { language } = useLanguage();

  const content = {
    fr: {
        quote: "« Cette plateforme a changé la donne pour ma préparation aux examens. Les répétiteurs sont excellents et le contenu est de premier ordre. »",
        author: "A. Ndiaye, Élève de Terminale S"
    },
    en: {
        quote: "“This platform has been a game-changer for my exam preparation. The tutors are excellent and the content is top-notch.”",
        author: "A. Ndiaye, Terminale S Student"
    }
  };

  const t = content[language];

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div
          className="absolute inset-0 bg-primary"
        />
        <div className="relative z-20 flex items-center text-lg font-medium font-headline text-primary-foreground">
          <Icons.logo className="mr-2 h-6 w-6" />
          RéviseCamer
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg text-primary-foreground">
              {t.quote}
            </p>
            <footer className="text-sm text-primary-foreground/80">{t.author}</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          {children}
        </div>
      </div>
    </div>
  );
}
