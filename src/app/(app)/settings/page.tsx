'use client';

import { Separator } from "@/components/ui/separator"
import { useLanguage } from "@/context/language-context";

export default function SettingsPage() {
  const { language } = useLanguage();

  const content = {
    fr: {
      title: 'Paramètres',
      description: 'Gérez les paramètres et les préférences de votre compte.',
      formPlaceholder: 'Le formulaire de paramètres sera ici.',
    },
    en: {
      title: 'Settings',
      description: 'Manage your account settings and preferences.',
      formPlaceholder: 'Settings form will be here.',
    }
  };

  const t = content[language];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium font-headline">{t.title}</h3>
        <p className="text-sm text-muted-foreground">
          {t.description}
        </p>
      </div>
      <Separator />
      <p>{t.formPlaceholder}</p>
    </div>
  )
}
