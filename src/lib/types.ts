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
