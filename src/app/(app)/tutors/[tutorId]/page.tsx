
'use client';

import { useParams } from 'next/navigation';
import { Star, Verified, MessageSquare, MapPin, UserPlus, UserCheck } from 'lucide-react';
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
import { doc, setDoc, deleteDoc, serverTimestamp, collection, writeBatch, getDoc } from 'firebase/firestore';
import type { TutorRating, UserProfile, TutorProfile } from '@/lib/types';
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

  const tutorProfileRef = useMemoFirebase(() => (firestore ? doc(firestore, 'tutors', tutorId) : null), [firestore, tutorId]);
  const { data: tutor, isLoading: isTutorLoading } = useDoc<TutorProfile>(tutorProfileRef);

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

  const followingRef = useMemoFirebase(() => {
    if(!firestore || !user?.uid || !tutorId) return null;
    return doc(firestore, 'users', user.uid, 'following', tutorId);
  }, [firestore, user?.uid, tutorId]);

  const { data: followerDoc, isLoading: isFollowerLoading } = useDoc(followerRef);

  const hasRated = !!userRating;
  const isFollowing = !!followerDoc;


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
      newFollowerNotif: `vous suit maintenant.`
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
      newFollowerNotif: `is now following you.`
    },
  };
  const t = content[language];
  
  const handleFollowToggle = async () => {
    if (!followerRef || !followingRef || !user || !userProfile || !tutor || !firestore || !tutorProfileRef) return;
    
    try {
        const batch = writeBatch(firestore);
        const tutorDocRef = doc(firestore, 'tutors', tutorId);
        const tutorDoc = await getDoc(tutorDocRef);
        const currentTutorData = tutorDoc.data() as TutorProfile;
        const currentFollowers = currentTutorData.followersCount || 0;

        if (isFollowing) {
            // Unfollow action
            batch.delete(followerRef);
            batch.delete(followingRef);
            batch.update(tutorDocRef, { followersCount: currentFollowers > 0 ? currentFollowers - 1 : 0 });
        } else {
            // Follow action
            const now = serverTimestamp();
            
            batch.set(followerRef, {
                studentId: user.uid,
                studentName: userProfile.firstName + ' ' + userProfile.lastName,
                studentAvatar: userProfile.profilePicture || null,
                followedAt: now,
            });

            batch.set(followingRef, {
                tutorId: tutorId,
                tutorName: tutor.name,
                tutorAvatar: tutor.avatarUrl || null,
                followedAt: now,
            });
            
            batch.update(tutorDocRef, { followersCount: currentFollowers + 1 });

            if(tutor.userId) {
                const tutorNotificationsRef = doc(collection(firestore, 'users', tutor.userId, 'notifications'));
                const studentName = userProfile.firstName + ' ' + userProfile.lastName;
                batch.set(tutorNotificationsRef, {
                    userId: tutor.userId,
                    type: 'new_follower',
                    messageFr: `${studentName} ${t.newFollowerNotif}`,
                    messageEn: `${studentName} ${t.newFollowerNotif}`,
                    sentAt: now,
                    targetURL: '/students'
                });
            }
        }
        await batch.commit();
    } catch(error) {
      console.error("Follow/Unfollow transaction failed: ", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "L'opération a échoué. Veuillez réessayer.",
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


  if (isTutorLoading) {
    return (
        <div className="container mx-auto max-w-4xl py-8">
            <Card>
                <CardHeader className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
                    <Skeleton className="h-32 w-32 rounded-full" />
                    <div className="flex-1 space-y-3">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-7 w-32" />
                    </div>
                </CardHeader>
                <CardContent className="mt-6 space-y-6 pt-6 border-t">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </CardContent>
            </Card>
        </div>
    )
  }

  if (!tutor) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p>{t.tutorNotFound}</p>
      </div>
    );
  }

  const whatsappLink = `https://wa.me/${tutor.whatsapp?.replace(/[^0-9]/g, '')}`;
  const isVerified = tutor.adminVerified || (tutor.followersCount && tutor.followersCount >= 20);

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <Card>
        <CardHeader className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
          <Avatar className="h-32 w-32 border-4 border-primary">
            <AvatarImage src={tutor.avatarUrl} />
            <AvatarFallback>{getInitials(tutor.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <CardTitle className="flex items-center justify-center gap-2 text-3xl font-headline md:justify-start">
              {tutor.name}
              {isVerified && (
                <Verified
                  className="h-7 w-7 text-primary"
                  aria-label="Verified Tutor"
                />
              )}
            </CardTitle>
            <div className="flex items-center justify-center gap-4 text-lg text-muted-foreground md:justify-start">
                <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span>{tutor.rating.toFixed(1)}</span>
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
