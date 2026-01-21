'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Star, Verified, Phone, MessageSquare } from 'lucide-react';
import { tutors } from '@/lib/data'; // Using mock data for now
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useLanguage } from '@/context/language-context';

export default function TutorProfilePage() {
  const params = useParams();
  const { tutorId } = params;
  const { language } = useLanguage();

  const tutor = tutors.find((t) => t.id === tutorId);

  const content = {
    fr: {
      tutorNotFound: 'Répétiteur non trouvé',
      reviews: 'avis',
      perHour: '/h',
      bookSession: 'Réserver une session',
      contactViaWhatsapp: 'Contacter sur WhatsApp',
      subjects: 'Matières enseignées',
      system: 'Système',
      systems: {
          francophone: 'Francophone',
          anglophone: 'Anglophone',
          both: 'Bilingue'
      }
    },
    en: {
      tutorNotFound: 'Tutor not found',
      reviews: 'reviews',
      perHour: '/hr',
      bookSession: 'Book Session',
      contactViaWhatsapp: 'Contact on WhatsApp',
      subjects: 'Subjects Taught',
      system: 'System',
      systems: {
          francophone: 'Francophone',
          anglophone: 'Anglophone',
          both: 'Bilingual'
      }
    },
  };

  const t = content[language];

  if (!tutor) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p>{t.tutorNotFound}</p>
      </div>
    );
  }

  const whatsappLink = `https://wa.me/${tutor.whatsapp?.replace('+', '')}`;

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <Card>
        <CardHeader className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
          <Avatar className="h-32 w-32 border-4 border-primary">
            <AvatarImage src={tutor.avatarUrl} alt={tutor.name} />
            <AvatarFallback>{tutor.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <CardTitle className="flex items-center justify-center gap-2 text-3xl font-headline md:justify-start">
              {tutor.name}
              {tutor.verified && (
                <Verified
                  className="h-7 w-7 text-primary"
                  aria-label="Verified Tutor"
                />
              )}
            </CardTitle>
            <div className="flex items-center justify-center gap-1 text-lg text-muted-foreground md:justify-start">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span>{tutor.rating}</span>
              <span>
                ({tutor.reviewsCount} {t.reviews})
              </span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {tutor.rate} FCFA
              <span className="text-base font-normal text-muted-foreground">
                {t.perHour}
              </span>
            </div>
          </div>
          <div className="flex w-full flex-col gap-2 md:w-auto">
            <Button size="lg">{t.bookSession}</Button>
            {tutor.whatsapp && (
                <Button variant="outline" asChild>
                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                        <MessageSquare className="mr-2"/>
                        {t.contactViaWhatsapp}
                    </a>
                </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="mt-6 space-y-6 pt-6 border-t">
            <div>
                <h4 className="font-semibold">{t.subjects}</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                {tutor.subjects.map((subject) => (
                    <Badge key={subject} variant="secondary" className="text-sm">
                    {subject}
                    </Badge>
                ))}
                </div>
            </div>
            {tutor.system && (
                <div>
                    <h4 className="font-semibold">{t.system}</h4>
                    <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="default" className="text-sm">
                            {t.systems[tutor.system]}
                        </Badge>
                    </div>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
