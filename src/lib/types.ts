
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
  aiCredits?: number;
  lastCreditRenewal?: any; // Firestore Timestamp
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

export interface Question {
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface Lesson {
  title: string;
  description: string;
  duration: number;
  content?: string;
  quiz?: Question[];
}

export interface SavedStudyPlan {
  id: string;
  studentId: string;
  subject: string;
  learningGoals: string;
  lessons: Lesson[];
  createdAt: any; // Firestore Timestamp
}

export interface QuizResult {
  studentId: string;
  planId: string;
  planSubject: string;
  lessonTitle: string;
  score: number;
  completionDate: any; // Firestore Timestamp
  answers: Array<{ questionIndex: number; answer: string }>;
}

export interface Notification {
    id: string;
    userId: string;
    type: string;
    messageFr: string;
    messageEn: string;
    sentAt: any; // Firestore timestamp
    targetURL?: string;
}
