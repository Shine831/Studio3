'use client';

import { useParams } from 'next/navigation';
import { Star, Verified, MessageSquare, MapPin } from 'lucide-react';
import { tutors } from '@/lib/data'; // Using mock data for now
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useLanguage } from '@/context/language-context';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.trim().split(' ').filter(n => n);
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 1).toUpperCase();
}

export default function TutorProfilePage() {
  const params = useParams();
  const { tutorId } = params;
  const { language } = useLanguage();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const { user } = useUser();
  const { toast } = useToast();

  const tutor = tutors.find((t) => t.id === tutorId);

  const content = {
    fr: {
      tutorNotFound: 'Répétiteur non trouvé',
      reviews: 'avis',
      perMonth: '/mois',
      contactViaWhatsapp: 'Contacter sur WhatsApp',
      subjects: 'Matières enseignées',
      classes: 'Classes enseignées',
      system: 'Système',
      systems: {
          francophone: 'Francophone',
          anglophone: 'Anglophone',
          both: 'Bilingue'
      },
      location: 'Localisation',
      leaveRating: 'Laisser une évaluation',
      submitRating: 'Soumettre l\'évaluation',
      ratingSubmitted: 'Évaluation envoyée !',
      ratingSubmittedDesc: 'Merci d\'avoir évalué ce répétiteur.',
      loginToRate: 'Connectez-vous pour noter',
      loginToRateDesc: 'Vous devez être connecté pour laisser une évaluation.',
      alreadyRated: 'Déjà évalué',
    },
    en: {
      tutorNotFound: 'Tutor not found',
      reviews: 'reviews',
      perMonth: '/month',
      contactViaWhatsapp: 'Contact on WhatsApp',
      subjects: 'Subjects Taught',
      classes: 'Classes Taught',
      system: 'System',
      systems: {
          francophone: 'Francophone',
          anglophone: 'Anglophone',
          both: 'Bilingual'
      },
      location: 'Location',
      leaveRating: 'Leave a Rating',
      submitRating: 'Submit Rating',
      ratingSubmitted: 'Rating Submitted!',
      ratingSubmittedDesc: 'Thanks for rating this tutor.',
      loginToRate: 'Login to Rate',
      loginToRateDesc: 'You must be logged in to leave a rating.',
      alreadyRated: 'Already Rated',
    },
  };

  const t = content[language];
  
  const handleSubmitRating = () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: t.loginToRate,
        description: t.loginToRateDesc,
      });
      return;
    }
    // In a real app, you would save this to a database and recalculate the average.
    // For now, we just show a confirmation toast.
    toast({
      title: t.ratingSubmitted,
      description: `${t.ratingSubmittedDesc} (${rating}/5)`,
    });
    setHasRated(true);
  };


  if (!tutor) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p>{t.tutorNotFound}</p>
      </div>
    );
  }

  const whatsappLink = `https://wa.me/${tutor.whatsapp?.replace(/[^0-9]/g, '')}`;

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <Card>
        <CardHeader className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
          <Avatar className="h-32 w-32 border-4 border-primary">
            <AvatarFallback>{getInitials(tutor.name)}</AvatarFallback>
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
            <div className="flex items-center justify-center gap-4 text-lg text-muted-foreground md:justify-start">
                <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span>{tutor.rating}</span>
                    <span>
                        ({tutor.reviewsCount} {t.reviews})
                    </span>
                </div>
                {tutor.city && (
                    <div className="flex items-center gap-1">
                        <MapPin className="h-5 w-5" />
                        <span>{tutor.city}</span>
                    </div>
                )}
            </div>
            <div className="text-2xl font-bold text-foreground">
              {tutor.monthlyRate.toLocaleString('fr-FR')} FCFA
              <span className="text-base font-normal text-muted-foreground">
                {t.perMonth}
              </span>
            </div>
          </div>
          <div className="flex w-full flex-col gap-2 md:w-auto">
             {tutor.whatsapp && (
                <Button size="lg" asChild>
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
             <div>
                <h4 className="font-semibold">{t.classes}</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                {tutor.classes.map((c) => (
                    <Badge key={c} variant="secondary" className="text-sm">
                    {c}
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
             <div className="border-t pt-6 mt-6">
              <h4 className="font-semibold">{t.leaveRating}</h4>
              <div className="flex items-center gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-7 w-7",
                      hasRated ? "text-muted-foreground cursor-not-allowed" : "cursor-pointer",
                      (hoverRating || rating) >= star
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    )}
                    onMouseEnter={() => !hasRated && setHoverRating(star)}
                    onMouseLeave={() => !hasRated && setHoverRating(0)}
                    onClick={() => !hasRated && setRating(star)}
                  />
                ))}
              </div>
              <Button className="mt-4" disabled={rating === 0 || hasRated} onClick={handleSubmitRating}>
                {hasRated ? t.alreadyRated : t.submitRating}
              </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
