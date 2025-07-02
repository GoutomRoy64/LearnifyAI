import type { Quiz, User, QuizAttempt, Classroom, JoinRequest } from '@/lib/types';

export const mockUsers: User[] = [
  { id: 'student1', email: 'student@example.com', role: 'student', name: 'Alex Doe', password: 'password' },
  { id: 'teacher1', email: 'teacher@example.com', role: 'teacher', name: 'Dr. Evelyn Reed', password: 'password' },
];

export const mockQuizzes: Quiz[] = [
  {
    id: '1',
    title: 'Algebra Basics',
    subject: 'Math',
    skillLevel: 'Beginner',
    createdBy: 'teacher1',
    questions: [
      { id: 'q1', text: 'What is 2 + 2?', options: ['3', '4', '5', '6'], correctAnswer: '4' },
      { id: 'q2', text: 'What is x in x + 5 = 10?', options: ['3', '4', '5', '6'], correctAnswer: '5' },
    ],
    timer: 5,
  },
  {
    id: '2',
    title: 'Introduction to Photosynthesis',
    subject: 'Science',
    skillLevel: 'Beginner',
    createdBy: 'teacher1',
    questions: [
      { id: 'q1', text: 'What is the primary pigment used in photosynthesis?', options: ['Chlorophyll', 'Melanin', 'Hemoglobin', 'Carotene'], correctAnswer: 'Chlorophyll' },
      { id: 'q2', text: 'Which gas is released during photosynthesis?', options: ['Carbon Dioxide', 'Nitrogen', 'Oxygen', 'Hydrogen'], correctAnswer: 'Oxygen' },
      { id: 'q3', text: 'What is the main source of energy for photosynthesis?', options: ['Geothermal Heat', 'Sunlight', 'Wind', 'Water'], correctAnswer: 'Sunlight' },
    ],
    timer: 10,
  },
  {
    id: '3',
    title: 'World War II Key Events',
    subject: 'History',
    skillLevel: 'Intermediate',
    createdBy: 'teacher1',
    questions: [
      { id: 'q1', text: 'In which year did World War II begin?', options: ['1938', '1939', '1940', '1941'], correctAnswer: '1939' },
      { id: 'q2', text: 'The D-Day landings took place in which region of France?', options: ['Brittany', 'Alsace', 'Normandy', 'Provence'], correctAnswer: 'Normandy' },
    ],
  },
  {
    id: '4',
    title: 'Advanced Calculus',
    subject: 'Math',
    skillLevel: 'Advanced',
    createdBy: 'teacher1',
    questions: [
      { id: 'q1', text: 'What is the derivative of x^2?', options: ['x', '2x', 'x^3', '2'], correctAnswer: '2x' },
    ],
  },
];

export const mockQuizAttempts: QuizAttempt[] = [];

export const mockClassrooms: Classroom[] = [
    {
        id: 'cls-1',
        name: 'Grade 10 Math',
        subject: 'Mathematics',
        createdBy: 'teacher1',
        joinCode: 'MTH101',
        studentIds: [],
    },
    {
        id: 'cls-2',
        name: 'Intro to Biology',
        subject: 'Science',
        createdBy: 'teacher1',
        joinCode: 'SCI101',
        studentIds: [],
    }
];

export const mockJoinRequests: JoinRequest[] = [];


// User Data Functions
export const getUsersFromStorage = (): User[] => {
    if (typeof window === 'undefined') return mockUsers;
    try {
        const storedUsers = localStorage.getItem('users');
        if (storedUsers) {
            return JSON.parse(storedUsers);
        } else {
            localStorage.setItem('users', JSON.stringify(mockUsers));
            return mockUsers;
        }
    } catch (error) {
        console.error("Failed to access localStorage or parse users", error);
        return mockUsers;
    }
};

export const setUsersToStorage = (users: User[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('users', JSON.stringify(users));
};

// Quiz Data Functions
export const getQuizzesFromStorage = (): Quiz[] => {
    if (typeof window === 'undefined') return mockQuizzes;
    try {
        const storedQuizzes = localStorage.getItem('quizzes');
        if (storedQuizzes) {
            return JSON.parse(storedQuizzes);
        } else {
            localStorage.setItem('quizzes', JSON.stringify(mockQuizzes));
            return mockQuizzes;
        }
    } catch (error) {
        console.error("Failed to access localStorage or parse quizzes", error);
        return mockQuizzes;
    }
};

export const setQuizzesToStorage = (quizzes: Quiz[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('quizzes', JSON.stringify(quizzes));
};

// Quiz Attempt Functions
export const getQuizAttemptsFromStorage = (): QuizAttempt[] => {
    if (typeof window === 'undefined') return mockQuizAttempts;
    try {
        const storedAttempts = localStorage.getItem('quiz_attempts');
        if (storedAttempts) {
            return JSON.parse(storedAttempts).map((attempt: QuizAttempt) => ({
                ...attempt,
                submittedAt: new Date(attempt.submittedAt),
            }));
        } else {
            localStorage.setItem('quiz_attempts', JSON.stringify(mockQuizAttempts));
            return mockQuizAttempts;
        }
    } catch (error) {
        console.error("Failed to access localStorage or parse quiz attempts", error);
        return mockQuizAttempts;
    }
};

export const setQuizAttemptsToStorage = (attempts: QuizAttempt[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('quiz_attempts', JSON.stringify(attempts));
};

// Classroom Data Functions
export const getClassroomsFromStorage = (): Classroom[] => {
    if (typeof window === 'undefined') return mockClassrooms;
    try {
        const storedClassrooms = localStorage.getItem('classrooms');
        if (storedClassrooms) {
            return JSON.parse(storedClassrooms);
        } else {
            localStorage.setItem('classrooms', JSON.stringify(mockClassrooms));
            return mockClassrooms;
        }
    } catch (error) {
        console.error("Failed to access localStorage or parse classrooms", error);
        return mockClassrooms;
    }
};

export const setClassroomsToStorage = (classrooms: Classroom[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('classrooms', JSON.stringify(classrooms));
};

// Join Request Functions
export const getJoinRequestsFromStorage = (): JoinRequest[] => {
    if (typeof window === 'undefined') return mockJoinRequests;
    try {
        const storedRequests = localStorage.getItem('join_requests');
        if (storedRequests) {
            return JSON.parse(storedRequests).map((request: JoinRequest) => ({
                ...request,
                requestedAt: new Date(request.requestedAt),
            }));
        } else {
            localStorage.setItem('join_requests', JSON.stringify(mockJoinRequests));
            return mockJoinRequests;
        }
    } catch (error) {
        console.error("Failed to access localStorage or parse join requests", error);
        return mockJoinRequests;
    }
};

export const setJoinRequestsToStorage = (requests: JoinRequest[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('join_requests', JSON.stringify(requests));
};
