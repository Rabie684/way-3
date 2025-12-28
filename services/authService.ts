import { User, UserRole, Professor, Student } from '../types';

// Mock database for users
const users: User[] = [
  {
    id: 'prof1',
    name: 'أحمد جمال',
    email: 'ahmed@example.com',
    role: UserRole.PROFESSOR,
    university: 'جامعة الجزائر 1',
    faculty: 'علوم الحاسوب',
    department: 'ذكاء اصطناعي',
    profilePicture: 'https://picsum.photos/200/200',
    phoneNumber: '0555123456',
    language: 'ar',
  },
  {
    id: 'student1',
    name: 'فاطمة الزهراء',
    email: 'fatima@example.com',
    role: UserRole.STUDENT,
    university: 'جامعة الجزائر 2',
    faculty: 'الطب',
    department: 'طب عام',
    profilePicture: 'https://picsum.photos/200/201',
    phoneNumber: '0666987654',
    language: 'ar',
  },
];

export const login = async (email: string, password: string): Promise<User | null> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = users.find(u => u.email === email);
      if (user) {
        // In a real app, you'd verify the password here
        resolve(user);
      } else {
        resolve(null);
      }
    }, 500);
  });
};

export const register = async (userData: Omit<User, 'id'>): Promise<User | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (users.some(u => u.email === userData.email)) {
        resolve(null); // User with this email already exists
      } else {
        const newUser: User = { ...userData, id: `user-${Date.now()}` };
        users.push(newUser);
        resolve(newUser);
      }
    }, 500);
  });
};

export const getCurrentUser = (): User | null => {
  // In a real app, this would get user from session/localStorage
  const userId = localStorage.getItem('currentUser');
  if (userId) {
    return users.find(u => u.id === userId) || null;
  }
  return null;
};

export const logout = (): void => {
  localStorage.removeItem('currentUser');
};

export const setCurrentUser = (user: User): void => {
  localStorage.setItem('currentUser', user.id);
};

// Helper function to get Professor or Student details
export const getUserDetails = (userId: string): Professor | Student | undefined => {
  const user = users.find(u => u.id === userId);
  if (!user) return undefined;

  // Mock specific data for Professor/Student roles
  if (user.role === UserRole.PROFESSOR) {
    return {
      ...user,
      stars: 4.5, // Mock value
      channels: [], // Will be populated by channelService
    } as Professor;
  } else if (user.role === UserRole.STUDENT) {
    return {
      ...user,
      followedProfessors: [], // Mock value
      subscribedChannels: [], // Mock value
    } as Student;
  }
  return undefined;
};

export const updateUserDetails = async (userId: string, updates: Partial<User>): Promise<User | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updates };
        resolve(users[userIndex]);
      } else {
        resolve(null);
      }
    }, 500);
  });
};
