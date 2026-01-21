export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: 'student' | 'tutor' | 'admin';
};

export type Course = {
  id: string;
  title: string;
  subject: string;
  level: string;
  language: 'fr' | 'en';
  description: string;
  imageUrl: string;
  imageHint: string;
  lessonsCount: number;
};

export type Tutor = {
  id: string;
  name: string;
  avatarUrl: string;
  imageHint: string;
  subjects: string[];
  level: string[];
  rating: number;
  reviewsCount: number;
  rate: number;
  verified: boolean;
  whatsapp?: string;
  system?: 'francophone' | 'anglophone' | 'both';
};
