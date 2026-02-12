'use client';

import { Zap, ExternalLink } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function AiCreditAlert({ language }: { language: 'fr' | 'en' }) {
    const t = {
        fr: {
            noCreditsTitle: "Crédits Quotidiens Épuisés",
            rechargeTitle: "Recharger vos crédits via Neero",
            step1: "1. Ouvrez votre application Neero et effectuez un transfert de 1200 FCFA au contact :",
            number: "+237 699477055",
            step2: "2. Envoyez la capture d'écran de la transaction via WhatsApp pour validation.",
            step3: "Vos crédits seront ajoutés manuellement dans les plus brefs délais.",
            contactWhatsApp: "Contacter par WhatsApp",
            automatedSystemSoon: "Un système de paiement automatisé sera bientôt disponible."
        },
        en: {
            noCreditsTitle: "Daily Credits Exhausted",
            rechargeTitle: "Recharge Your Credits via Neero",
            step1: "1. Open your Neero app and make a transfer of 1200 FCFA to the contact:",
            number: "+237 699477055",
            step2: "2. Send the transaction screenshot via WhatsApp for validation.",
            step3: "Your credits will be added manually as soon as possible.",
            contactWhatsApp: "Contact via WhatsApp",
            automatedSystemSoon: "An automated payment system will be available soon."
        }
    }[language];

    const whatsappLink = `https://wa.me/237699477055?text=${encodeURIComponent(language === 'fr' ? 'Bonjour, voici ma preuve de paiement pour la recharge de crédits RéviseCamer.' : 'Hello, here is my proof of payment for RéviseCamer credits.')}`;

    return (
        <Alert>
            <Zap className="h-4 w-4" />
            <AlertTitle>{t.noCreditsTitle}</AlertTitle>
            <AlertDescription asChild>
                <div className="mt-4 space-y-4">
                    <div className="p-4 border rounded-lg bg-background/50">
                         <h4 className="font-semibold mb-2">{t.rechargeTitle}</h4>
                         <ol className="space-y-2 text-sm">
                            <li>{t.step1} <strong className="font-mono">{t.number}</strong></li>
                            <li>{t.step2}</li>
                             <li>{t.step3}</li>
                         </ol>
                         <Button asChild className="mt-4">
                            <Link href={whatsappLink} target="_blank">
                                {t.contactWhatsApp}
                                <ExternalLink className="ml-2 h-4 w-4" />
                            </Link>
                         </Button>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">{t.automatedSystemSoon}</p>
                </div>
            </AlertDescription>
        </Alert>
    );
}
