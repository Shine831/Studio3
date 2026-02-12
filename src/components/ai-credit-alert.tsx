'use client';

import { Zap, CreditCard } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function AiCreditAlert({ language }: { language: 'fr' | 'en' }) {
    const t = {
        fr: {
            noCreditsTitle: "Crédits Quotidiens Épuisés",
            description: "Pour un accès illimité à la génération de contenu, vous pouvez recharger votre compte.",
            rechargeButton: "Recharger mes crédits (Bientôt disponible)",
            automatedSystemSoon: "Notre système de paiement automatisé et sécurisé via Neero est en cours de finalisation."
        },
        en: {
            noCreditsTitle: "Daily Credits Exhausted",
            description: "For unlimited content generation, you can recharge your account.",
            rechargeButton: "Recharge Credits (Coming Soon)",
            automatedSystemSoon: "Our automated and secure payment system via Neero is being finalized."
        }
    }[language];

    return (
        <Alert>
            <Zap className="h-4 w-4" />
            <AlertTitle>{t.noCreditsTitle}</AlertTitle>
            <AlertDescription asChild>
                <div className="mt-2 space-y-4">
                    <p>{t.description}</p>
                    <Button disabled className="w-full">
                        <CreditCard className="mr-2 h-4 w-4" />
                        {t.rechargeButton}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">{t.automatedSystemSoon}</p>
                </div>
            </AlertDescription>
        </Alert>
    );
}
