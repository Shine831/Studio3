
export type WithId<T> = T & { id: string };

export interface UserProfile {
  id: string;
  role: 'student' | 'admin';
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  language: 'fr' | 'en';
  createdAt: any; // Firestore Timestamp
  lastLogin: any; // Firestore Timestamp
  system?: 'francophone' | 'anglophone';
  aiCredits?: number;
  lastCreditRenewal?: any; // Firestore Timestamp
}

export interface Notification {
  messageFr: string;
  messageEn: string;
  sentAt: any; // Firestore Timestamp
  targetURL?: string;
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
