import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { isSameDay } from 'date-fns';
import type { UserProfile } from './types';

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

/**
 * Checks if the user has unlimited AI credits for the current day.
 * @param userProfile The user's profile object.
 * @returns True if the user has unlimited access for the day, false otherwise.
 */
export function hasUnlimitedAccess(userProfile: UserProfile | null | undefined): boolean {
    if (!userProfile) return false;
    const lastRenewal = userProfile.lastCreditRenewal?.toDate();
    // The payment grants Infinity credits and sets the lastRenewal date.
    // This access is valid for the entire day of the renewal.
    return !!(lastRenewal && isSameDay(new Date(), lastRenewal) && userProfile.aiCredits === Infinity);
}
