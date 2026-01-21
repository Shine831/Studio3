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

export type WithId<T> = T & { id: string };

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
  content?: string; // Markdown content of the lesson
  quiz?: Question[]; // Array of quiz questions
}

export interface SavedStudyPlan {
  id: string;
  studentId: string;
  subject: string;
  learningGoals: string;
  createdAt: any; // Firestore Timestamp
  lessons: Lesson[];
}

export interface Notification {
    id: string;
    userId: string;
    type: string;
    messageFr: string;
    messageEn: string;
    sentAt: any; // Firestore Timestamp
    targetURL?: string;
}

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
  aiCredits: number;
  lastCreditRenewal?: any; // Firestore Timestamp
  // Tutor-specific fields that might exist on the doc
  whatsapp?: string;
  classes?: string[];
  monthlyRate?: number;
}

export interface QuizResult {
    id: string;
    studentId: string;
    planId: string;
    planSubject: string;
    lessonTitle: string;
    score: number;
    completionDate: any; // Firestore Timestamp
    answers: { questionIndex: number; answer: string }[];
}

export interface TutorRating {
  id: string; // studentUID
  tutorId: string;
  studentId: string;
  rating: number;
  comment?: string;
  createdAt: any; // Firestore Timestamp
}

export interface FollowerRecord {
    studentId: string;
    studentName: string;
    studentAvatar?: string;
    followedAt: any; // Firestore Timestamp
}

    