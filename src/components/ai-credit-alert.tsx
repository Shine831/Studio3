'use client';

import { Zap } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function AiCreditAlert({ language }: { language: 'fr' | 'en' }) {
    const t = {
        fr: {
            noCreditsTitle: "Crédits Quotidiens Épuisés",
            noCreditsDescription: "Vous avez utilisé tous vos crédits pour aujourd'hui. Revenez demain pour en avoir plus.",
            rechargeButton: "Recharger (Bientôt disponible)",
            rechargeDescription: "Un système de paiement automatisé via Mobile Money sera bientôt intégré. Après le paiement, vos crédits seront ajoutés instantanément.",
        },
        en: {
            noCreditsTitle: "Daily Credits Exhausted",
            noCreditsDescription: "You have used all your credits for today. Check back tomorrow for more.",
            rechargeButton: "Recharge (Coming Soon)",
            rechargeDescription: "An automated payment system via Mobile Money will be integrated soon. After payment, your credits will be added instantly.",
        }
    }[language];

    return (
        <Alert>
            <Zap className="h-4 w-4" />
            <AlertTitle>{t.noCreditsTitle}</AlertTitle>
            <AlertDescription>
                {t.noCreditsDescription}
                <div className="mt-4">
                    <Button disabled>
                        {t.rechargeButton}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">{t.rechargeDescription}</p>
                </div>
            </AlertDescription>
        </Alert>
    );
}
