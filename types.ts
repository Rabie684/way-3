export enum UserRole {
  PROFESSOR = 'professor',
  STUDENT = 'student',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  university?: string;
  faculty?: string;
  department?: string;
  profilePicture?: string;
  phoneNumber?: string;
  language: 'ar' | 'fr';
}

export interface Professor extends User {
  role: UserRole.PROFESSOR;
  stars: number;
  channels: Channel[];
}

export interface Student extends User {
  role: UserRole.STUDENT;
  followedProfessors: string[]; // Array of professor IDs
  subscribedChannels: string[]; // Array of channel IDs
}

export enum ContentType {
  PDF = 'pdf',
  IMAGE = 'image',
  VIDEO = 'video',
}

export interface Content {
  id: string;
  type: ContentType;
  url: string;
  title: string;
  uploadedAt: string;
}

export interface Channel {
  id: string;
  professorId: string;
  name: string;
  department: string;
  description: string;
  content: Content[];
  meetLink?: string;
  starRating: number;
  subscriberCount: number;
  price: number; // 50 DZD
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
}

export interface Announcement {
  id: string;
  professorId: string;
  title: string;
  content: string;
  timestamp: string;
}

export interface GeminiApiResponse {
  text?: string;
  sources?: { uri: string; title?: string }[];
}

export interface Translation {
  [key: string]: {
    ar: string;
    fr: string;
  };
}