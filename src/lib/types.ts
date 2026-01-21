export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: 'student' | 'tutor' | 'admin';
};

export type Tutor = {
  id: string;
  name: string;
  avatarUrl: string;
  imageHint: string;
  subjects: string[];
  classes: string[];
  rating: number;
  reviewsCount: number;
  rate: number;
  verified: boolean;
  whatsapp?: string;
  system?: 'francophone' | 'anglophone' | 'both';
};
