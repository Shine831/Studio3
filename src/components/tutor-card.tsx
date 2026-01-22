
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, Verified } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { TutorProfile, WithId } from '@/lib/types';
import { useLanguage } from '@/context/language-context';

interface TutorCardProps {
  tutor: WithId<TutorProfile>;
}

const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.trim().split(' ').filter(n => n);
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 1).toUpperCase();
}

export function TutorCard({ tutor }: TutorCardProps) {
  const { language } = useLanguage();

  const t = {
    fr: {
      reviews: 'avis',
      perMonth: '/mois',
      viewProfile: 'Voir le profil'
    },
    en: {
      reviews: 'reviews',
      perMonth: '/month',
      viewProfile: 'View Profile'
    }
  }[language];
  
  const isVerified = tutor.adminVerified;

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={tutor.avatarUrl} />
          <AvatarFallback>{getInitials(tutor.name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-lg font-headline flex items-center gap-2">
            {tutor.name}
            {isVerified && <Verified className="h-5 w-5 text-primary" />}
          </CardTitle>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{tutor.rating.toFixed(1)}</span>
            <span>({tutor.reviewsCount} {t.reviews})</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex flex-wrap gap-2">
          {tutor.subjects.slice(0, 3).map((subject) => (
            <Badge key={subject} variant="secondary">
              {subject}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center bg-muted/50 p-4">
        <div className="text-lg font-bold text-foreground">
          {tutor.monthlyRate.toLocaleString('fr-FR')} FCFA
          <span className="text-sm font-normal text-muted-foreground">{t.perMonth}</span>
        </div>
        <Button asChild>
          <Link href={`/tutors/${tutor.id}`}>{t.viewProfile}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

    