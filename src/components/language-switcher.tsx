'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { useState } from 'react';

export function LanguageSwitcher() {
  const [language, setLanguage] = useState('EN');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <Globe className="h-4 w-4 mr-2" />
          {language}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => setLanguage('EN')}>
          English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('FR')}>
          Français
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
