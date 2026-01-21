'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useLanguage } from '@/context/language-context';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Star,
  CalendarClock,
  Users,
  Banknote,
} from 'lucide-react';


// Mock data, as the data model is not fully integrated
const upcomingSessions = [
    { id: 1, studentName: 'Fatiha N.', subject: 'Mathématiques', date: 'Demain à 16:00' },
    { id: 2, studentName: 'John A.', subject: 'Physics', date: '25/07/2024 à 10:00' },
];

const recentReviews = [
    { id: 1, studentName: 'Aïssatou B.', rating: 5, comment: 'Excellent tuteur, très patient !' },
    { id: 2, studentName: 'Chris K.', rating: 4, comment: 'Good session, I learned a lot.' },
];


export function TutorDashboard() {
  const { language } = useLanguage();

  const content = {
    fr: {
      title: 'Tableau de bord du Répétiteur',
      description: 'Gérez vos sessions, vos revenus et votre profil.',
      totalStudents: 'Total Étudiants',
      avgRating: 'Note Moyenne',
      upcomingSessions: 'Sessions à Venir',
      totalEarnings: 'Revenus (30 jours)',
      viewAll: 'Voir tout',
      recentActivity: 'Avis Récents',
      noUpcoming: 'Aucune session à venir.',
      noReviews: 'Aucun avis récent.',
      contact: 'Contacter',
      currency: 'FCFA',
      basedOn: 'Basé sur',
      reviews: 'avis',
      inNext7Days: 'Dans les 7 prochains jours',
      devFeature: 'Fonctionnalité en développement'
    },
    en: {
      title: 'Tutor Dashboard',
      description: 'Manage your sessions, earnings, and profile.',
      totalStudents: 'Total Students',
      avgRating: 'Average Rating',
      upcomingSessions: 'Upcoming Sessions',
      totalEarnings: 'Earnings (30 days)',
      viewAll: 'View all',
      recentActivity: 'Recent Reviews',
      noUpcoming: 'No upcoming sessions.',
      noReviews: 'No recent reviews.',
      contact: 'Contact',
      currency: 'XAF',
      basedOn: 'Based on',
      reviews: 'reviews',
      inNext7Days: 'In the next 7 days',
      devFeature: 'Feature in development'
    }
  };

  const t = content[language];

  return (
    <div className="flex flex-1 flex-col gap-4">
      <h1 className="text-3xl font-bold font-headline">{t.title}</h1>
      <p className="text-muted-foreground">{t.description}</p>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.totalStudents}</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">+2 {language === 'fr' ? 'ce mois-ci' : 'this month'}</p>
              </CardContent>
          </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.avgRating}</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">4.8</div>
                  <p className="text-xs text-muted-foreground">{t.basedOn} 98 {t.reviews}</p>
              </CardContent>
          </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.upcomingSessions}</CardTitle>
                  <CalendarClock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{upcomingSessions.length}</div>
                  <p className="text-xs text-muted-foreground">{t.inNext7Days}</p>
              </CardContent>
          </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.totalEarnings}</CardTitle>
                  <Banknote className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">150,000 <span className="text-sm">{t.currency}</span></div>
                  <p className="text-xs text-muted-foreground">{t.devFeature}</p>
              </CardContent>
          </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4">
              <CardHeader>
                  <CardTitle>{t.upcomingSessions}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                  {upcomingSessions.length > 0 ? upcomingSessions.map(session => (
                      <div key={session.id} className="flex items-center">
                          <Avatar className="h-9 w-9">
                              <AvatarFallback>{session.studentName[0]}</AvatarFallback>
                          </Avatar>
                          <div className="ml-4 space-y-1">
                              <p className="text-sm font-medium leading-none">{session.studentName}</p>
                              <p className="text-sm text-muted-foreground">{session.subject}</p>
                          </div>
                          <div className="ml-auto font-medium">{session.date}</div>
                      </div>
                  )) : <p className="text-sm text-muted-foreground">{t.noUpcoming}</p>}
              </CardContent>
          </Card>
          <Card className="lg:col-span-3">
              <CardHeader>
                  <CardTitle>{t.recentActivity}</CardTitle>
                  <CardDescription>{language === 'fr' ? 'Avis récents de vos élèves.' : 'Recent reviews from your students.'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                  {recentReviews.length > 0 ? recentReviews.map(review => (
                       <div key={review.id} className="flex items-start">
                          <Avatar className="h-9 w-9">
                              <AvatarFallback>{review.studentName[0]}</AvatarFallback>
                          </Avatar>
                          <div className="ml-4 space-y-1 w-full">
                              <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium leading-none">{review.studentName}</p>
                                  <div className="flex items-center gap-0.5 ml-2">
                                      {[...Array(5)].map((_, i) => (
                                          <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-primary text-primary' : 'fill-muted stroke-muted-foreground'}`} />
                                      ))}
                                  </div>
                              </div>
                              <p className="text-sm text-muted-foreground italic">"{review.comment}"</p>
                          </div>
                      </div>
                  )) : <p className="text-sm text-muted-foreground">{t.noReviews}</p>}
              </CardContent>
          </Card>
      </div>
    </div>
  );
}
