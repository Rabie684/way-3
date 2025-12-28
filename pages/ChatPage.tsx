import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserDetails } from '../services/authService';
import { getChatMessages, sendChatMessage } from '../services/channelService'; // Reusing for chat messages
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
}

const ChatPage: React.FC = () => {
  const { receiverId } = useParams<{ receiverId: string }>();
  const { user, translate, language } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [receiverName, setReceiverName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    if (!user || !receiverId) return;

    setLoading(true);
    setError('');
    try {
      const fetchedMessages = await getChatMessages(user.id, receiverId);
      setMessages(fetchedMessages);
      const receiver = getUserDetails(receiverId);
      setReceiverName(receiver?.name || translate('professorNotFound')); // Can be student or professor
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      setError(translate('failedToLoadMessages'));
    } finally {
      setLoading(false);
    }
  }, [user, receiverId, translate]);

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, receiverId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !user || !receiverId) return;

    try {
      const sentMessage = await sendChatMessage(user.id, receiverId, newMessage.trim());
      setMessages((prevMessages) => [...prevMessages, sentMessage]);
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
      setError(translate('failedToSend'));
    }
  };

  const currentDirection = language === 'ar' ? 'rtl' : 'ltr';

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <p className="text-center text-red-500 text-lg mt-8">{error}</p>;
  }

  if (!user || !receiverId) {
    return <p className="text-center text-gray-500 dark:text-gray-400 text-lg mt-8">{translate('invalidChatParticipants')}</p>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 md:p-6" style={{ direction: currentDirection }}>
      <h1 className="text-3xl font-bold text-primary-DEFAULT mb-4 border-b pb-2 dark:border-gray-700">
        {translate('chatWithProfessor')} {receiverName}
      </h1>

      <div className="flex-grow overflow-y-auto mb-4 p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-4">{translate('noMessages')}</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex mb-3 ${msg.senderId === user.id ? (language === 'ar' ? 'justify-start' : 'justify-end') : (language === 'ar' ? 'justify-end' : 'justify-start')}`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  msg.senderId === user.id
                    ? 'bg-primary-light text-primary-dark'
                    : 'bg-blue-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200'
                }`}
                style={{ borderRadius: msg.senderId === user.id
                  ? (language === 'ar' ? '15px 15px 15px 0' : '15px 15px 0 15px')
                  : (language === 'ar' ? '15px 15px 0 15px' : '15px 15px 15px 0')
                }}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(msg.timestamp).toLocaleString(language === 'ar' ? 'ar-DZ' : 'fr-FR')}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="flex space-x-2">
        <Input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={translate('typeYourMessage')}
          className="flex-grow"
          dir={currentDirection}
        />
        <Button type="submit" className="flex-shrink-0">
          {translate('send')}
        </Button>
      </form>
    </div>
  );
};

export default ChatPage;