import type { Course, Tutor } from '@/lib/types';
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

export const courses: Course[] = [
  {
    id: 'math-101',
    title: 'Algebra Fundamentals',
    subject: 'Mathematics',
    level: 'Seconde',
    language: 'en',
    description: 'Master the basics of algebra, from linear equations to functions.',
    imageUrl: placeholderImages[1].imageUrl,
    imageHint: placeholderImages[1].imageHint,
    lessonsCount: 12,
  },
  {
    id: 'phy-201',
    title: 'Classical Mechanics',
    subject: 'Physics',
    level: 'Première',
    language: 'en',
    description: 'Explore Newton\'s laws, energy, momentum, and rotational motion.',
    imageUrl: placeholderImages[2].imageUrl,
    imageHint: placeholderImages[2].imageHint,
    lessonsCount: 15,
  },
  {
    id: 'chem-301',
    title: 'Organic Chemistry',
    subject: 'Chemistry',
    level: 'Terminale',
    language: 'fr',
    description: 'Plongez dans le monde des composés à base de carbone et de leurs réactions.',
    imageUrl: placeholderImages[3].imageUrl,
    imageHint: placeholderImages[3].imageHint,
    lessonsCount: 18,
  },
  {
    id: 'bio-101',
    title: 'Introduction to Biology',
    subject: 'Biology',
    level: 'Seconde',
    language: 'en',
    description: 'Learn about the fundamental concepts of life, cells, and ecosystems.',
    imageUrl: placeholderImages[4].imageUrl,
    imageHint: placeholderImages[4].imageHint,
    lessonsCount: 10,
  },
  {
    id: 'math-202',
    title: 'Géométrie & Trigonométrie',
    subject: 'Mathematics',
    level: 'Première',
    language: 'fr',
    description: 'Maîtrisez les formes, les angles et les fonctions trigonométriques.',
    imageUrl: placeholderImages[1].imageUrl,
    imageHint: placeholderImages[1].imageHint,
    lessonsCount: 14,
  },
  {
    id: 'phy-301',
    title: 'Electromagnetism',
    subject: 'Physics',
    level: 'Terminale',
    language: 'en',
    description: 'Understand the forces that govern electricity and magnetism.',
    imageUrl: placeholderImages[2].imageUrl,
    imageHint: placeholderImages[2].imageHint,
    lessonsCount: 20,
  },
];

export const tutors: Tutor[] = [
  {
    id: 'tutor-001',
    name: 'Dr. Marie Dubois',
    avatarUrl: placeholderImages[5].imageUrl,
    imageHint: placeholderImages[5].imageHint,
    subjects: ['Physics', 'Chemistry'],
    level: ['Première', 'Terminale'],
    rating: 4.9,
    reviewsCount: 120,
    rate: 25,
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
    level: ['Seconde', 'Première', 'Terminale'],
    rating: 4.8,
    reviewsCount: 98,
    rate: 22,
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
    level: ['Seconde', 'Première'],
    rating: 4.7,
    reviewsCount: 75,
    rate: 20,
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
    level: ['Terminale'],
    rating: 5.0,
    reviewsCount: 210,
    rate: 30,
    verified: true,
    whatsapp: '+237612345681',
    system: 'both'
  },
];
