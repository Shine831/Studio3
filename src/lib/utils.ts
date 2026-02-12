import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates initials from a name string.
 * @param name The full name.
 * @returns A 1 or 2-character uppercase string.
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return 'U';
  const names = name.trim().split(' ').filter(n => n);
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  if (names.length === 1 && names[0]) {
    return names[0].substring(0, 1).toUpperCase();
  }
  return 'U';
}
