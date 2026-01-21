'use client';

import { useParams } from 'next/navigation';
import { Star, Verified, MessageSquare, MapPin, UserPlus, UserCheck } from 'lucide-react';
import { tutors } from '@/lib/data'; // Using mock data for now
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useLanguage } from '@/context/language-context';
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import type { TutorRating, UserProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';

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
  const { tutorId } = params as { tutorId: string };
  const { language } = useLanguage();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const tutor = tutors.find((t) => t.id === tutorId);

  // --- Data Fetching ---
  const userProfileRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);
  
  const userRatingRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid || !tutorId) return null;
    return doc(firestore, 'tutors', tutorId, 'ratings', user.uid);
  }, [firestore, user?.uid, tutorId]);
  const { data: userRating, isLoading: isRatingLoading } = useDoc<TutorRating>(userRatingRef);

  const followerRef = useMemoFirebase(() => {
    if(!firestore || !user?.uid || !tutorId) return null;
    return doc(firestore, 'tutors', tutorId, 'followers', user.uid);
  }, [firestore, user?.uid, tutorId]);
  const { data: followerDoc, isLoading: isFollowerLoading } = useDoc(followerRef);

  const hasRated = !!userRating;
  const isFollowing = !!followerDoc;


  // --- Content ---
  const content = {
    fr: {
      tutorNotFound: 'Répétiteur non trouvé',
      reviews: 'avis',
      perMonth: '/mois',
      contactViaWhatsapp: 'Contacter sur WhatsApp',
      subjects: 'Matières enseignées',
      classes: 'Classes enseignées',
      system: 'Système',
      systems: { francophone: 'Francophone', anglophone: 'Anglophone', both: 'Bilingue' },
      location: 'Localisation',
      leaveRating: 'Laisser une évaluation',
      yourComment: 'Votre commentaire...',
      submitRating: 'Soumettre l\'évaluation',
      ratingSubmitted: 'Évaluation envoyée !',
      ratingSubmittedDesc: 'Merci d\'avoir évalué ce répétiteur.',
      loginToRate: 'Connectez-vous pour noter',
      loginToRateDesc: 'Vous devez être connecté pour laisser une évaluation.',
      alreadyRated: 'Déjà évalué',
      ratingError: "Échec de l'envoi de l'évaluation. Veuillez réessayer.",
      follow: 'Suivre',
      unfollow: 'Ne plus suivre',
      following: 'Suivi',
    },
    en: {
      tutorNotFound: 'Tutor not found',
      reviews: 'reviews',
      perMonth: '/month',
      contactViaWhatsapp: 'Contact on WhatsApp',
      subjects: 'Subjects Taught',
      classes: 'Classes Taught',
      system: 'System',
      systems: { francophone: 'Francophone', anglophone: 'Anglophone', both: 'Bilingual' },
      location: 'Location',
      leaveRating: 'Leave a Rating',
      yourComment: 'Your comment...',
      submitRating: 'Submit Rating',
      ratingSubmitted: 'Rating Submitted!',
      ratingSubmittedDesc: 'Thanks for rating this tutor.',
      loginToRate: 'Login to Rate',
      loginToRateDesc: 'You must be logged in to leave a rating.',
      alreadyRated: 'Already Rated',
      ratingError: 'Failed to submit rating. Please try again.',
      follow: 'Follow',
      unfollow: 'Unfollow',
      following: 'Following',
    },
  };
  const t = content[language];
  
  // --- Handlers ---
  const handleFollowToggle = async () => {
    if (!followerRef || !user || !userProfile) return;
    if (isFollowing) {
        await deleteDoc(followerRef);
    } else {
        await setDoc(followerRef, {
            studentId: user.uid,
            studentName: userProfile.firstName + ' ' + userProfile.lastName,
            studentAvatar: userProfile.profilePicture || null,
            followedAt: serverTimestamp(),
        });
    }
  }
  
  const handleSubmitRating = async () => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: t.loginToRate, description: t.loginToRateDesc });
      return;
    }
    if (!tutorId || !userRatingRef) return;

    try {
      await setDoc(userRatingRef, {
        id: user.uid,
        tutorId: tutorId,
        studentId: user.uid,
        studentName: userProfile?.firstName + ' ' + userProfile?.lastName,
        rating: rating,
        comment: comment,
        createdAt: serverTimestamp(),
      }, { merge: true });

      toast({ title: t.ratingSubmitted, description: `${t.ratingSubmittedDesc} (${rating}/5)` });
    } catch (error: any) {
      console.error("Error submitting rating: ", error);
      toast({
        variant: "destructive",
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: error.message.includes('permission-denied') ? (language === 'fr' ? 'Vous avez déjà noté ce tuteur.' : 'You have already rated this tutor.') : t.ratingError,
      });
    }
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
             <Button size="lg" variant={isFollowing ? "secondary" : "outline"} onClick={handleFollowToggle} disabled={isFollowerLoading}>
                {isFollowing ? <UserCheck className="mr-2" /> : <UserPlus className="mr-2" />}
                {isFollowing ? t.following : t.follow}
             </Button>
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
              {isRatingLoading ? (
                  <Skeleton className="h-24 w-full" />
              ) : (
                <div className="mt-2 space-y-4">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "h-7 w-7",
                          hasRated ? "text-muted-foreground cursor-not-allowed" : "cursor-pointer",
                          (hoverRating || rating || userRating?.rating) >= star
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        )}
                        onMouseEnter={() => !hasRated && setHoverRating(star)}
                        onMouseLeave={() => !hasRated && setHoverRating(0)}
                        onClick={() => !hasRated && setRating(star)}
                      />
                    ))}
                  </div>
                  {!hasRated && rating > 0 && (
                    <Textarea 
                        placeholder={t.yourComment}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                  )}
                  {hasRated && userRating?.comment && (
                    <p className="text-sm text-muted-foreground italic p-3 bg-muted rounded-md">"{userRating.comment}"</p>
                  )}
                  <Button disabled={(rating === 0 && !hasRated) || hasRated} onClick={handleSubmitRating}>
                    {hasRated ? t.alreadyRated : t.submitRating}
                  </Button>
                </div>
              )}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

    