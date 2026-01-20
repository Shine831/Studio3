'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/icons';

export default function LoginPage() {
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        router.push('/dashboard');
    }

  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight font-headline">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email below to log in to your account
        </p>
      </div>
      <Card>
        <CardHeader>
          {/* CardTitle and CardDescription can be used if needed */}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="#"
                    className="ml-auto inline-block text-sm underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input id="password" type="password" required />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
              <Button variant="outline" className="w-full">
                <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4"><path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.9-5.62 1.9-4.76 0-8.64-3.89-8.64-8.64s3.88-8.64 8.64-8.64c2.69 0 4.35 1.05 5.33 1.95l2.62-2.62C19.03 1.18 16.25 0 12.48 0 5.6 0 0 5.6 0 12.48s5.6 12.48 12.48 12.48c7.34 0 12.07-4.82 12.07-12.07 0-.82-.07-1.55-.2-2.28H12.48z"></path></svg>
                Login with Google
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
