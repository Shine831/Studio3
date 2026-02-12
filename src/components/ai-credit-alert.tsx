'use client';

import Link from "next/link";
import { Zap, CreditCard, MessageCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function AiCreditAlert({ language }: { language: 'fr' | 'en' }) {
    const t = {
        fr: {
            noCreditsTitle: "Crédits Quotidiens Épuisés",
            step1: "Étape 1 : Payez via Neero",
            step2: "Étape 2 : Validez sur WhatsApp",
            description: "Pour obtenir un accès illimité pour toute la journée, suivez ces deux étapes :",
            rechargeButton: "Payer 1200 FCFA avec Neero",
            validateButton: "Envoyer la preuve sur WhatsApp",
            whatsappMessage: "Bonjour, je viens de faire un paiement de 1200 FCFA pour l'accès illimité sur RéviseCamer. Voici ma preuve.",
        },
        en: {
            noCreditsTitle: "Daily Credits Exhausted",
            step1: "Step 1: Pay with Neero",
            step2: "Step 2: Validate on WhatsApp",
            description: "To get unlimited access for the whole day, follow these two steps:",
            rechargeButton: "Pay 1200 FCFA with Neero",
            validateButton: "Send Proof on WhatsApp",
            whatsappMessage: "Hello, I just made a payment of 1200 FCFA for unlimited access on RéviseCamer. Here is my proof.",
        }
    }[language];
    
    const neeroLink = "https://neero.io/r/token/gKOYJUdvuW";
    const whatsappLink = `https://wa.me/237699477055?text=${encodeURIComponent(t.whatsappMessage)}`;

    return (
        <Alert>
            <Zap className="h-4 w-4" />
            <AlertTitle>{t.noCreditsTitle}</AlertTitle>
            <AlertDescription asChild>
                <div className="mt-2 space-y-4">
                    <p>{t.description}</p>
                    <div className="space-y-3">
                        <div>
                             <p className="text-sm font-semibold mb-1">{t.step1}</p>
                             <Button asChild className="w-full">
                                <Link href={neeroLink} target="_blank" rel="noopener noreferrer">
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    {t.rechargeButton}
                                </Link>
                            </Button>
                        </div>
                       <div>
                             <p className="text-sm font-semibold mb-1">{t.step2}</p>
                             <Button asChild variant="secondary" className="w-full">
                                <Link href={whatsappLink} target="_blank" rel="noopener noreferrer">
                                    <MessageCircle className="mr-2 h-4 w-4" />
                                    {t.validateButton}
                                </Link>
                            </Button>
                       </div>
                    </div>
                </div>
            </AlertDescription>
        </Alert>
    );
}
