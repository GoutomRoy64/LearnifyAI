export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
}

export interface Quiz {
  id: string;
  title: string;
  subject: string;
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  createdBy: string; // teacherId
  questions: Question[];
  timer?: number; // Duration in minutes
}

export interface User {
  id: string;
  email: string;
  role: 'student' | 'teacher';
  name: string;
  password?: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  answers: { [questionId: string]: string };
  score: number;
  submittedAt: Date;
}

export interface Classroom {
  id: string;
  name: string;
  subject: string;
  createdBy: string; // teacherId
  joinCode: string;
  studentIds: string[];
}

export interface JoinRequest {
    id: string;
    classroomId: string;
    studentId: string;
    status: 'pending' | 'approved' | 'denied';
    requestedAt: Date;
}
