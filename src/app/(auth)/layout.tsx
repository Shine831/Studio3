import Link from "next/link";
import { Icons } from "@/components/icons";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
              &ldquo;This platform has been a game-changer for my exam
              preparation. The tutors are excellent and the content is top-notch.&rdquo;
            </p>
            <footer className="text-sm text-primary-foreground/80">A. Ndiaye, Terminale S Student</footer>
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
