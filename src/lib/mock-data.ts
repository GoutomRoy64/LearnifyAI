import type { Quiz, User } from '@/lib/types';

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
