import { User, UserRole, Professor, Student } from '../types';

// Updated the users array type to allow for both Professor and Student interfaces,
// ensuring properties like `subscribedChannels` and `followedProfessors` are correctly typed.
export const users: (Professor | Student)[] = [
  {
    id: 'prof1',
    name: 'أحمد جمال',
    email: 'ahmed@example.com',
    role: UserRole.PROFESSOR,
    university: 'جامعة الجزائر 1',
    faculty: 'علوم الحاسوب',
    department: 'ذكاء اصطناعي',
    profilePicture: 'https://picsum.photos/200/200?random=prof1',
    phoneNumber: '0555123456',
    language: 'ar',
  },
  {
    id: 'prof2',
    name: 'ليلى بن علي',
    email: 'layla@example.com',
    role: UserRole.PROFESSOR,
    university: 'جامعة وهران 1',
    faculty: 'الحقوق',
    department: 'قانون عام',
    profilePicture: 'https://picsum.photos/200/200?random=prof2',
    phoneNumber: '0555654321',
    language: 'fr',
  },
  {
    id: 'student1',
    name: 'فاطمة الزهراء',
    email: 'fatima@example.com',
    role: UserRole.STUDENT,
    university: 'جامعة الجزائر 2',
    faculty: 'الطب',
    department: 'طب عام',
    profilePicture: 'https://picsum.photos/200/200?random=student1',
    phoneNumber: '0666987654',
    language: 'ar',
    subscribedChannels: ['ch1'], // Mock subscribed channels
    followedProfessors: ['prof1'], // Mock followed professors
  },
  {
    id: 'student2',
    name: 'يوسف منصور',
    email: 'youssef@example.com',
    role: UserRole.STUDENT,
    university: 'جامعة قسنطينة 1',
    faculty: 'علوم الحاسوب',
    department: 'هندسة برمجيات',
    profilePicture: 'https://picsum.photos/200/200?random=student2',
    phoneNumber: '0666112233',
    language: 'fr',
    subscribedChannels: [],
    followedProfessors: [],
  },
];