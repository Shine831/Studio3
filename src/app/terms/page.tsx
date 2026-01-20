import Link from 'next/link';
import { Icons } from '@/components/icons';

export default function TermsPage() {
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
             <Link href="/login" className="text-sm font-medium text-foreground hover:underline">
                Back to App
            </Link>
          </div>
        </header>
        <main className="flex-1">
            <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold font-headline mb-4">Terms of Service</h1>
                <p className="mb-4">
                Welcome to RéviseCamer! These terms and conditions outline the rules and regulations for the use of RéviseCamer's Website, located at revise-camer.com.
                </p>
                <p className="mb-4">
                By accessing this website we assume you accept these terms and conditions. Do not continue to use RéviseCamer if you do not agree to take all of the terms and conditions stated on this page.
                </p>
                <h2 className="text-2xl font-bold font-headline mt-6 mb-2">Cookies</h2>
                <p className="mb-4">
                We employ the use of cookies. By accessing RéviseCamer, you agreed to use cookies in agreement with the RéviseCamer's Privacy Policy. Most interactive websites use cookies to let us retrieve the user’s details for each visit.
                </p>
                <h2 className="text-2xl font-bold font-headline mt-6 mb-2">License</h2>
                <p>
                Unless otherwise stated, RéviseCamer and/or its licensors own the intellectual property rights for all material on RéviseCamer. All intellectual property rights are reserved. You may access this from RéviseCamer for your own personal use subjected to restrictions set in these terms and conditions.
                </p>
            </div>
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
            </div>
            </div>
        </footer>
      </div>
    );
  }
