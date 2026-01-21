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
  monthlyRate: number;
  verified: boolean;
  whatsapp?: string;
  system?: 'francophone' | 'anglophone' | 'both';
  city?: string;
};

export interface SavedStudyPlan {
  id: string;
  studentId: string;
  subject: string;
  learningGoals: string;
  createdAt: any; // Firestore Timestamp
  lessons: {
    title: string;
    description: string;
    duration: number;
  }[];
}
