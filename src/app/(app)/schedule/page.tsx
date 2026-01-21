// src/app/(app)/schedule/page.tsx
'use client';

import { useLanguage } from '@/context/language-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

export default function SchedulePage() {
    const { language } = useLanguage();

    const t = {
        fr: {
            title: "Mon Calendrier",
            description: "Gérez votre emploi du temps et vos sessions à venir.",
            devTitle: "En cours de développement",
            devDescription: "La fonctionnalité de calendrier est en cours de construction et sera bientôt disponible. Vous pourrez ici voir vos réservations et gérer vos disponibilités."
        },
        en: {
            title: "My Schedule",
            description: "Manage your schedule and upcoming sessions.",
            devTitle: "In Development",
            devDescription: "The calendar feature is currently under construction and will be available soon. You will be able to see your bookings and manage your availability here."
        }
    }[language];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">{t.title}</h1>
                <p className="text-muted-foreground">{t.description}</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>{t.devTitle}</CardTitle>
                    <CardDescription>{t.devDescription}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-lg">
                        <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">{t.devTitle}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

    