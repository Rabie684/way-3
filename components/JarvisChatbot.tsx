import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getGeminiResponse } from '../services/geminiService';
import Button from './common/Button';
import Modal from './common/Modal';
import Input from './common/Input';
import LoadingSpinner from './common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

interface ChatMessage {
  sender: 'user' | 'jarvis';
  text: string;
  sources?: { uri: string; title?: string }[];
}

const JarvisChatbot: React.FC = () => {
  const { translate, language } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [apiKeySelected, setApiKeySelected] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const checkApiKey = useCallback(async () => {
    if ((window as any).aistudio && (window as any).aistudio.hasSelectedApiKey) {
      const selected = await (window as any).aistudio.hasSelectedApiKey();
      setApiKeySelected(selected);
      if (!selected) {
        setMessages(prev => [...prev, { sender: 'jarvis', text: translate('selectApiKey') + ' ' + translate('apiWarning') }]);
      }
    } else {
      setApiKeySelected(true); // Assume API key is fine if aistudio API is not available
    }
  }, [translate]);

  useEffect(() => {
    if (isOpen) {
      // Check API key when chatbot opens
      checkApiKey();
      // Focus on input when modal opens
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, checkApiKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage: ChatMessage = { sender: 'user', text: input.trim() };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      if (apiKeySelected === false) {
        await (window as any).aistudio.openSelectKey();
        setApiKeySelected(true); // Assume selection was successful
        // After selecting, try again
        setLoading(false);
        setMessages(prev => [...prev, { sender: 'jarvis', text: translate('selectApiKey') }]);
        return;
      }

      const aiResponse = await getGeminiResponse(userMessage.text);
      const jarvisMessage: ChatMessage = { sender: 'jarvis', text: aiResponse.text || translate('aiResponseError'), sources: aiResponse.sources };
      setMessages((prevMessages) => [...prevMessages, jarvisMessage]);
    } catch (error) {
      console.error('Error fetching Gemini response:', error);
      setMessages((prevMessages) => [...prevMessages, { sender: 'jarvis', text: translate('aiResponseError') }]);
    } finally {
      setLoading(false);
    }
  };

  const openApiKeySelection = async () => {
    if ((window as any).aistudio && (window as any).aistudio.openSelectKey) {
      try {
        await (window as any).aistudio.openSelectKey();
        setApiKeySelected(true); // Assume selection was successful
        setMessages(prev => prev.filter(msg => msg.text !== translate('selectApiKey') + ' ' + translate('apiWarning')));
      } catch (error) {
        console.error("Failed to open API key selection:", error);
      }
    }
  };

  const currentDirection = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 md:bottom-8 md:right-8 bg-primary-DEFAULT hover:bg-primary-dark text-white p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-primary-light z-50"
        aria-label={translate('jarvisAssistant')}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.375 3.375A.75.75 0 008.5 4.5v1.728a9.006 9.006 0 00-3.13 3.13H3.375a.75.75 0 000 1.5h1.728A9.006 9.006 0 006.772 15.5h-1.728a.75.75 0 000 1.5H6.772a9.006 9.006 0 003.13 3.13v1.728a.75.75 0 001.5 0v-1.728a9.006 9.006 0 003.13-3.13h1.728a.75.75 0 000-1.5h-1.728a9.006 9.006 0 00-3.13-3.13V8.5a.75.75 0 00-1.5 0v1.728a9.006 9.006 0 00-3.13-3.13H4.5a.75.75 0 00-.75.75zm1.5 2.875a7.502 7.502 0 00-1.258 11.084C8.441 19.344 11.233 19.75 12 19.75c.768 0 3.56-.406 4.383-1.416a7.502 7.502 0 00-1.258-11.084A7.502 7.502 0 0012 5.5a7.502 7.502 0 00-1.125.75zM12 9a.75.75 0 01.75.75v1.5h1.5a.75.75 0 010 1.5h-1.5v1.5a.75.75 0 01-1.5 0v-1.5h-1.5a.75.75 0 010-1.5h1.5V9.75a.75.75 0 01.75-.75z" />
        </svg>
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={translate('jarvisAssistant')}
        className="max-w-xl h-full md:max-h-[80vh] flex flex-col"
      >
        <div className="flex flex-col flex-grow h-full p-4 overflow-y-auto bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 text-center">{translate('jarvisDescription')}</p>
          <p className="text-sm text-red-500 dark:text-red-400 mb-4 text-center font-semibold">{translate('aiDisclaimer')}</p>

          <div className="flex-grow overflow-y-auto mb-4 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-inner" style={{ direction: currentDirection }}>
            {messages.length === 0 && (
              <p className="text-gray-400 dark:text-gray-500 text-center">{translate('askJarvis')}</p>
            )}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex mb-4 ${
                  msg.sender === 'user' ? (language === 'ar' ? 'justify-start' : 'justify-end') : (language === 'ar' ? 'justify-end' : 'justify-start')
                }`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    msg.sender === 'user'
                      ? 'bg-primary-light text-primary-dark'
                      : 'bg-blue-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200'
                  }`}
                  style={{ borderRadius: msg.sender === 'user'
                    ? (language === 'ar' ? '15px 15px 15px 0' : '15px 15px 0 15px')
                    : (language === 'ar' ? '15px 15px 0 15px' : '15px 15px 15px 0')
                  }}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-600 pt-2">
                      <p className="font-semibold">{translate('sources')}:</p>
                      <ul className="list-disc pl-4" style={{direction: 'ltr'}}>
                        {msg.sources.map((source, sIndex) => (
                          <li key={sIndex}>
                            <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                              {source.title || source.uri}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {msg.sender === 'jarvis' && msg.text.includes(translate('selectApiKey')) && (
                    <div className="mt-2">
                      <Button onClick={openApiKeySelection} variant="secondary" size="sm">
                        {translate('openApiKeySelection')}
                      </Button>
                      <p className="text-xs mt-1">
                        {translate('billingInfo')}{' '}
                        <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          ai.google.dev/gemini-api/docs/billing
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className={`flex ${language === 'ar' ? 'justify-end' : 'justify-start'} mb-4`}>
                <div className="max-w-[70%] p-3 rounded-lg bg-blue-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
                  <LoadingSpinner />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex mt-auto">
            <Input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !loading) {
                  handleSendMessage();
                }
              }}
              placeholder={translate('enterPrompt')}
              className="flex-grow rounded-r-none md:rounded-r-none"
              dir={currentDirection}
            />
            <Button onClick={handleSendMessage} disabled={loading || input.trim() === ''} className="rounded-l-none md:rounded-l-none">
              {loading ? translate('loading') : translate('send')}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default JarvisChatbot;
