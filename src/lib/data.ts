import type { Tutor } from '@/lib/types';
import type { ImagePlaceholder } from './placeholder-images';

export const placeholderImages: ImagePlaceholder[] = [
    {
      id: "hero-1",
      description: "A student studying in a classroom",
      imageUrl: "https://picsum.photos/seed/hero1/1920/1080",
      imageHint: "classroom student"
    },
    {
      id: "math-course",
      description: "Abstract mathematical formulas and graphs",
      imageUrl: "https://picsum.photos/seed/math1/600/400",
      imageHint: "mathematics formula"
    },
    {
      id: "physics-course",
      description: "Illustration of atoms and particles",
      imageUrl: "https://picsum.photos/seed/physics1/600/400",
      imageHint: "atom physics"
    },
    {
      id: "chemistry-course",
      description: "Beakers and lab equipment",
      imageUrl: "https://picsum.photos/seed/chem1/600/400",
      imageHint: "science laboratory"
    },
    {
      id: "biology-course",
      description: "DNA helix strand",
      imageUrl: "https://picsum.photos/seed/bio1/600/400",
      imageHint: "dna helix"
    },
    {
      id: "tutor-1",
      description: "Profile picture of a female tutor",
      imageUrl: "https://picsum.photos/seed/tutor1/100/100",
      imageHint: "woman portrait"
    },
    {
      id: "tutor-2",
      description: "Profile picture of a male tutor",
      imageUrl: "https://picsum.photos/seed/tutor2/100/100",
      imageHint: "man portrait"
    },
    {
      id: "tutor-3",
      description: "Profile picture of a female tutor",
      imageUrl: "https://picsum.photos/seed/tutor3/100/100",
      imageHint: "person portrait"
    },
    {
        id: "user-avatar-1",
        description: "Avatar for a user",
        imageUrl: "https://picsum.photos/seed/user1/40/40",
        imageHint: "person face"
    }
  ];


export const tutors: Tutor[] = [
  {
    id: 'tutor-001',
    name: 'Dr. Marie Dubois',
    avatarUrl: placeholderImages[5].imageUrl,
    imageHint: placeholderImages[5].imageHint,
    subjects: ['Physique', 'Chimie'],
    classes: ['Première S', 'Terminale D'],
    rating: 4.9,
    reviewsCount: 120,
    rate: 15000,
    verified: true,
    whatsapp: '+237612345678',
    system: 'francophone'
  },
  {
    id: 'tutor-002',
    name: 'John Adebayo',
    avatarUrl: placeholderImages[6].imageUrl,
    imageHint: placeholderImages[6].imageHint,
    subjects: ['Mathematics', 'Further Maths'],
    classes: ['Lower Sixth', 'Upper Sixth'],
    rating: 4.8,
    reviewsCount: 98,
    rate: 12000,
    verified: true,
    whatsapp: '+237612345679',
    system: 'anglophone'
  },
  {
    id: 'tutor-003',
    name: 'Aïcha Benali',
    avatarUrl: placeholderImages[7].imageUrl,
    imageHint: placeholderImages[7].imageHint,
    subjects: ['Français', 'Histoire-Géo'],
    classes: ['Seconde', 'Première A'],
    rating: 4.7,
    reviewsCount: 75,
    rate: 10000,
    verified: false,
    whatsapp: '+237612345680',
    system: 'francophone'
  },
    {
    id: 'tutor-004',
    name: 'Samuel Eto\'o',
    avatarUrl: placeholderImages[6].imageUrl,
    imageHint: placeholderImages[6].imageHint,
    subjects: ['Biology', 'Chemistry'],
    classes: ['Form 5', 'Upper Sixth'],
    rating: 5.0,
    reviewsCount: 210,
    rate: 20000,
    verified: true,
    whatsapp: '+237612345681',
    system: 'both'
  },
];
