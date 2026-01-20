import Link from 'next/link';
import { Icons } from '@/components/icons';

export default function PrivacyPage() {
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
                    <h1 className="text-3xl font-bold font-headline mb-4">Privacy Policy</h1>
                    <p className="mb-4">
                    At RéviseCamer, accessible from revise-camer.com, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by RéviseCamer and how we use it.
                    </p>
                    <p className="mb-4">
                    If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us.
                    </p>
                    <h2 className="text-2xl font-bold font-headline mt-6 mb-2">Log Files</h2>
                    <p className="mb-4">
                    RéviseCamer follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this and a part of hosting services' analytics. The information collected by log files include internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks.
                    </p>
                    <h2 className="text-2xl font-bold font-headline mt-6 mb-2">Personal Information</h2>
                    <p>
                    We collect personal information such as your name and email address when you register for an account. This information is used to personalize your experience and to communicate with you about our services. We do not share this information with third parties without your consent, except as required by law.
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
