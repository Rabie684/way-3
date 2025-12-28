import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Channel, UserRole, Announcement } from '../../types';
import { getChannelsByProfessor, deleteChannel, publishAnnouncement, getAnnouncementsByProfessor } from '../../services/channelService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import StarRating from '../../components/common/StarRating';
import Input from '../../components/common/Input';
import TextArea from '../../components/common/TextArea';
import Modal from '../../components/common/Modal';

const ProfessorChannels: React.FC = () => {
  const { user, loading: authLoading, translate, language } = useAuth();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState<boolean>(false);
  const [announcementTitle, setAnnouncementTitle] = useState<string>('');
  const [announcementContent, setAnnouncementContent] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (user && user.role === UserRole.PROFESSOR) {
      setLoading(true);
      Promise.all([
        getChannelsByProfessor(user.id),
        getAnnouncementsByProfessor(user.id),
      ])
        .then(([fetchedChannels, fetchedAnnouncements]) => {
          setChannels(fetchedChannels);
          setAnnouncements(fetchedAnnouncements);
        })
        .catch(err => {
          console.error("Failed to fetch professor data:", err);
          setError(translate('failedToLoadData'));
        })
        .finally(() => setLoading(false));
    }
  }, [user, translate]);

  const handleDeleteChannel = async (channelId: string) => {
    if (!window.confirm(translate('confirmDelete'))) return;

    setLoading(true);
    setError('');
    try {
      const success = await deleteChannel(channelId);
      if (success) {
        setChannels(prev => prev.filter(ch => ch.id !== channelId));
        setMessage(translate('channelDeletedSuccessfully'));
      } else {
        setError(translate('failedToDeleteChannel'));
      }
    } catch (err) {
      console.error("Error deleting channel:", err);
      setError(translate('failedToDeleteChannel'));
    } finally {
      setLoading(false);
    }
  };

  const handlePublishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !announcementTitle || !announcementContent) {
      setError(translate('pleaseFillAllFields'));
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');
    try {
      const newAnn = await publishAnnouncement({
        professorId: user.id,
        title: announcementTitle,
        content: announcementContent,
      });
      setAnnouncements(prev => [newAnn, ...prev]);
      setMessage(translate('announcementPublishedSuccessfully'));
      setIsAnnouncementModalOpen(false);
      setAnnouncementTitle('');
      setAnnouncementContent('');
    } catch (err) {
      console.error("Error publishing announcement:", err);
      setError(translate('failedToPublishAnnouncement'));
    } finally {
      setLoading(false);
    }
  };

  const currentDirection = language === 'ar' ? 'rtl' : 'ltr';

  if (authLoading || loading) {
    return <LoadingSpinner />;
  }

  if (user?.role !== UserRole.PROFESSOR) {
    return <p className="text-center text-red-500 text-lg mt-8">{translate('unauthorizedAccess')}</p>;
  }

  return (
    <div className="container mx-auto p-4" style={{ direction: currentDirection }}>
      <h1 className="text-4xl font-extrabold text-primary-DEFAULT mb-8 text-center">
        {translate('myChannels')}
      </h1>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {message && <p className="text-green-500 text-center mb-4">{message}</p>}

      <div className="flex justify-between items-center mb-6">
        <Link to="/professor/channels/create">
          <Button variant="primary">{translate('createChannel')}</Button>
        </Link>
        <Button variant="secondary" onClick={() => setIsAnnouncementModalOpen(true)}>
          {translate('publishAnnouncement')}
        </Button>
      </div>

      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        {translate('yourChannels')}
      </h2>
      {channels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {channels.map((channel) => (
            <div key={channel.id} className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-6 flex flex-col">
              <Link to={`/channel/${channel.id}`} className="block">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 hover:text-primary-DEFAULT dark:hover:text-primary-light transition-colors">
                  {channel.name}
                </h3>
              </Link>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                {translate('department')}: {channel.department}
              </p>
              <div className="flex items-center mb-2">
                <StarRating rating={channel.starRating} />
                <span className="ml-2 text-gray-700 dark:text-gray-200 text-sm">({channel.starRating.toFixed(1)} {translate('stars')})</span>
              </div>
              <p className="text-gray-700 dark:text-gray-200 text-sm mb-4">
                {translate('subscribers')}: {channel.subscriberCount}
              </p>
              <div className="mt-auto flex space-x-2">
                <Link to={`/professor/channels/edit/${channel.id}`} className="flex-grow">
                  <Button variant="secondary" size="sm" className="w-full">
                    {translate('edit')}
                  </Button>
                </Link>
                <Button variant="danger" size="sm" onClick={() => handleDeleteChannel(channel.id)} className="flex-grow">
                  {translate('delete')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400 text-lg mb-8">{translate('noChannels')}</p>
      )}

      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        {translate('myAnnouncements')}
      </h2>
      {announcements.length > 0 ? (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <div key={ann.id} className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{ann.title}</h3>
              <p className="text-gray-700 dark:text-gray-200">{ann.content}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {new Date(ann.timestamp).toLocaleString(language === 'ar' ? 'ar-DZ' : 'fr-FR')}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400 text-lg">{translate('noAnnouncements')}</p>
      )}

      <Modal
        isOpen={isAnnouncementModalOpen}
        onClose={() => setIsAnnouncementModalOpen(false)}
        title={translate('publishAnnouncement')}
      >
        <form onSubmit={handlePublishAnnouncement} className="space-y-4">
          <Input
            label={translate('announcementTitle')}
            type="text"
            value={announcementTitle}
            onChange={(e) => setAnnouncementTitle(e.target.value)}
            required
            id="announcementTitle"
          />
          <TextArea
            label={translate('announcementContent')}
            value={announcementContent}
            onChange={(e) => setAnnouncementContent(e.target.value)}
            required
            rows={5}
            id="announcementContent"
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <LoadingSpinner /> : translate('publish')}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default ProfessorChannels;
