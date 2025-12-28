import { Channel, Content, ContentType, Announcement, Professor, UserRole } from '../types';
import { users } from './mockDb'; // Assume mockDb.ts exists and exports `users`

// Mock database for channels
const channels: Channel[] = [
  {
    id: 'ch1',
    professorId: 'prof1',
    name: 'مقدمة في الذكاء الاصطناعي',
    department: 'ذكاء اصطناعي',
    description: 'قناة متخصصة لتعليم أساسيات الذكاء الاصطناعي وتطبيقاته العملية.',
    content: [
      { id: 'c1', type: ContentType.PDF, title: 'محاضرة 1: مدخل للذكاء الاصطناعي', url: 'https://www.africau.edu/images/default/sample.pdf', uploadedAt: new Date().toISOString() },
      { id: 'c2', type: ContentType.IMAGE, title: 'مخطط الشبكات العصبية', url: 'https://picsum.photos/600/400?random=1', uploadedAt: new Date().toISOString() },
      { id: 'c3', type: ContentType.VIDEO, title: 'فيديو شرح المفهوم', url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', uploadedAt: new Date().toISOString() },
    ],
    meetLink: 'https://meet.google.com/abc-xyz',
    starRating: 4.8,
    subscriberCount: 250,
    price: 50,
  },
  {
    id: 'ch2',
    professorId: 'prof1',
    name: 'برمجة بايثون للمبتدئين',
    department: 'هندسة برمجيات',
    description: 'تعلم أساسيات لغة بايثون وتطوير تطبيقات بسيطة.',
    content: [
      { id: 'c4', type: ContentType.PDF, title: 'كتاب بايثون', url: 'https://www.africau.edu/images/default/sample.pdf', uploadedAt: new Date().toISOString() },
    ],
    meetLink: undefined,
    starRating: 4.5,
    subscriberCount: 180,
    price: 50,
  },
  {
    id: 'ch3',
    professorId: 'prof2', // Assuming another professor exists in mockDb
    name: 'مبادئ القانون المدني',
    department: 'قانون عام',
    description: 'شرح شامل لمبادئ القانون المدني الجزائري.',
    content: [],
    meetLink: 'https://meet.google.com/def-uvw',
    starRating: 4.9,
    subscriberCount: 300,
    price: 50,
  },
];

const announcements: Announcement[] = [
  {
    id: 'ann1',
    professorId: 'prof1',
    title: 'تذكير بمحاضرة هذا الأسبوع',
    content: 'يرجى العلم أن محاضرة الذكاء الاصطناعي ستعقد يوم الأربعاء القادم في تمام الساعة 10 صباحًا عبر Google Meet.',
    timestamp: new Date().toISOString(),
  },
];

export const getChannels = async (): Promise<Channel[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...channels]), 300);
  });
};

export const getChannelById = async (id: string): Promise<Channel | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(channels.find(ch => ch.id === id)), 300);
  });
};

export const getChannelsByProfessor = async (professorId: string): Promise<Channel[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(channels.filter(ch => ch.professorId === professorId)), 300);
  });
};

export const createChannel = async (channelData: Omit<Channel, 'id' | 'content' | 'starRating' | 'subscriberCount'>): Promise<Channel> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newChannel: Channel = {
        ...channelData,
        id: `ch-${Date.now()}`,
        content: [],
        starRating: 0, // Initial rating
        subscriberCount: 0,
      };
      channels.push(newChannel);
      resolve(newChannel);
    }, 500);
  });
};

export const updateChannel = async (id: string, updates: Partial<Channel>): Promise<Channel | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = channels.findIndex(ch => ch.id === id);
      if (index !== -1) {
        channels[index] = { ...channels[index], ...updates };
        resolve(channels[index]);
      } else {
        resolve(null);
      }
    }, 500);
  });
};

export const deleteChannel = async (id: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const initialLength = channels.length;
      channels.splice(channels.findIndex(ch => ch.id === id), 1);
      resolve(channels.length < initialLength);
    }, 500);
  });
};

export const addContentToChannel = async (channelId: string, content: Omit<Content, 'id' | 'uploadedAt'>): Promise<Content | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const channel = channels.find(ch => ch.id === channelId);
      if (channel) {
        const newContent: Content = { ...content, id: `con-${Date.now()}`, uploadedAt: new Date().toISOString() };
        channel.content.push(newContent);
        resolve(newContent);
      } else {
        resolve(null);
      }
    }, 500);
  });
};

export const subscribeToChannel = async (channelId: string, studentId: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const channel = channels.find(ch => ch.id === channelId);
      const student = users.find(u => u.id === studentId && u.role === UserRole.STUDENT) as unknown as { subscribedChannels: string[] } | undefined;

      if (channel && student) {
        if (!student.subscribedChannels.includes(channelId)) {
          student.subscribedChannels.push(channelId);
          channel.subscriberCount++;
          // Professor gets 5 stars per subscriber
          const professor = users.find(u => u.id === channel.professorId && u.role === UserRole.PROFESSOR) as unknown as { stars: number } | undefined;
          if (professor) {
            professor.stars = (professor.stars || 0) + 5;
          }
          resolve(true);
        } else {
          resolve(false); // Already subscribed
        }
      } else {
        resolve(false);
      }
    }, 500);
  });
};

export const publishAnnouncement = async (announcementData: Omit<Announcement, 'id' | 'timestamp'>): Promise<Announcement> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newAnnouncement: Announcement = { ...announcementData, id: `ann-${Date.now()}`, timestamp: new Date().toISOString() };
      announcements.push(newAnnouncement);
      resolve(newAnnouncement);
    }, 500);
  });
};

export const getAnnouncementsByProfessor = async (professorId: string): Promise<Announcement[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(announcements.filter(ann => ann.professorId === professorId)), 300);
  });
};

// Mock function for monthly star updates
export const updateChannelStarsMonthly = async (): Promise<void> => {
  console.log('Updating channel stars monthly...');
  return new Promise((resolve) => {
    setTimeout(() => {
      channels.forEach(channel => {
        // Simulate star update based on some logic, e.g., a fraction of subscribers
        channel.starRating = Math.min(5, (channel.subscriberCount / 50) + 3); // Example logic
        if (channel.starRating < 3) channel.starRating = 3; // Ensure a minimum
        channel.starRating = parseFloat(channel.starRating.toFixed(1)); // Keep one decimal
      });
      // Also update professor total stars based on channel averages or new subscribers
      const professorIds = [...new Set(channels.map(ch => ch.professorId))];
      professorIds.forEach(profId => {
        const profChannels = channels.filter(ch => ch.professorId === profId);
        const totalStars = profChannels.reduce((sum, ch) => sum + ch.starRating, 0);
        const professor = users.find(u => u.id === profId && u.role === UserRole.PROFESSOR) as unknown as Professor;
        if (professor && profChannels.length > 0) {
          professor.stars = parseFloat((totalStars / profChannels.length).toFixed(1));
        }
      });
      console.log('Channel stars updated.');
      resolve();
    }, 2000); // Simulate a delay for the monthly update
  });
};

// Initial call to simulate monthly update (e.g., on app start)
// updateChannelStarsMonthly(); // Will be called by an effect in App.tsx

// Mock messaging system (simple in-memory)
interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
}

const chatMessages: ChatMessage[] = [];

export const getChatMessages = async (userId1: string, userId2: string): Promise<ChatMessage[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const messages = chatMessages.filter(msg =>
        (msg.senderId === userId1 && msg.receiverId === userId2) ||
        (msg.senderId === userId2 && msg.receiverId === userId1)
      ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      resolve(messages);
    }, 300);
  });
};

export const sendChatMessage = async (senderId: string, receiverId: string, content: string): Promise<ChatMessage> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        senderId,
        receiverId,
        content,
        timestamp: new Date().toISOString(),
      };
      chatMessages.push(newMessage);
      resolve(newMessage);
    }, 200);
  });
};
