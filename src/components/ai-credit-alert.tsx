'use client';

import { Zap } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function AiCreditAlert({ language }: { language: 'fr' | 'en' }) {
    const t = {
        fr: {
            noCreditsTitle: "Crédits Quotidiens Épuisés",
            noCreditsDescription: "Vous avez utilisé tous vos crédits pour aujourd'hui. Revenez demain pour en avoir plus ou rechargez pour un accès illimité.",
            rechargeButton: "Recharger (1200 FCFA)",
            rechargeDescription: "Payez via Orange Money au 699 477 055 pour un accès illimité pour le reste de la journée.",
        },
        en: {
            noCreditsTitle: "Daily Credits Exhausted",
            noCreditsDescription: "You have used all your credits for today. Check back tomorrow for more or recharge for unlimited access.",
            rechargeButton: "Recharge (1200 FCFA)",
            rechargeDescription: "Pay via Orange Money to 699 477 055 for unlimited access for the rest of the day.",
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
