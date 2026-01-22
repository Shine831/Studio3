
export type WithId<T> = T & { id: string };

export interface UserProfile {
  id: string;
  role: 'student' | 'tutor' | 'admin';
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  language: 'fr' | 'en';
  createdAt: any; // Firestore Timestamp
  lastLogin: any; // Firestore Timestamp
  system?: 'francophone' | 'anglophone';
  city: string;
}

export interface TutorProfile {
    id: string;
    userId: string;
    name: string;
    avatarUrl?: string;
    subjects: string[];
    classes: string[];
    monthlyRate: number;
    availability: string;
    rating: number;
    reviewsCount: number;
    adminVerified: boolean;
    cvUrl?: string;
    identificationDocumentUrl?: string;
    whatsapp: string;
    system?: 'francophone' | 'anglophone' | 'both';
    city: string;
}

export interface TutorRating {
  id: string; // studentUID
  tutorId: string;
  studentId: string;
  studentName?: string;
  rating: number;
  comment?: string;
  createdAt: any; // Firestore Timestamp
}

    