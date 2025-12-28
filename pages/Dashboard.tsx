import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole, Professor, Channel } from '../types';
import { getChannels, getChannelsByProfessor, getAnnouncementsByProfessor, getChatMessages } from '../services/channelService';
import { getUserDetails } from '../services/authService';
import ChannelCard from '../components/ChannelCard';
import ProfessorCard from '../components/ProfessorCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
// Added import for StarRating component
import StarRating from '../components/common/StarRating';

const Dashboard: React.FC = () => {
  const { user, translate, language } = useAuth();
  const [professorDetails, setProfessorDetails] = useState<Professor | null>(null);
  const [allChannels, setAllChannels] = useState<Channel[]>([]);
  const [myChannels, setMyChannels] = useState<Channel[]>([]);
  const [myAnnouncements, setMyAnnouncements] = useState<any[]>([]);
  const [myMessages, setMyMessages] = useState<any[]>([]); // Simplified for dashboard view
  const [followedProfessors, setFollowedProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const channelsData = await getChannels();
    setAllChannels(channelsData);

    if (user.role === UserRole.PROFESSOR) {
      const profDetails = getUserDetails(user.id) as Professor;
      setProfessorDetails(profDetails);
      const professorChannels = await getChannelsByProfessor(user.id);
      setMyChannels(professorChannels);
      const announcements = await getAnnouncementsByProfessor(user.id);
      setMyAnnouncements(announcements);
      // Fetch some recent messages
      const messages = await getChatMessages(user.id, 'student1'); // Example chat with a student
      setMyMessages(messages.slice(-3)); // Show last 3 messages
    } else { // Student role
      const studentProfIds = (getUserDetails(user.id) as any)?.followedProfessors || [];
      const followedProfData = await Promise.all(
        studentProfIds.map(async (profId: string) => getUserDetails(profId) as Professor)
      );
      setFollowedProfessors(followedProfData.filter(p => p));
      const studentSubscribedChannels = (getUserDetails(user.id) as any)?.subscribedChannels || [];
      setMyChannels(channelsData.filter(ch => studentSubscribedChannels.includes(ch.id)));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, fetchData]);

  if (loading) {
    return <LoadingSpinner />;
  }

  const currentDirection = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <div className="container mx-auto p-4" style={{ direction: currentDirection }}>
      <h1 className="text-4xl font-extrabold text-primary-DEFAULT mb-6 text-center">
        {translate('dashboard')}
      </h1>

      {user?.role === UserRole.PROFESSOR && professorDetails && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">{translate('welcomeProfessor')}</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              {translate('fullName')}: {professorDetails.name}
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              {translate('stars')}: <StarRating rating={professorDetails.stars} /> ({professorDetails.stars.toFixed(1)})
            </p>
            <Link to="/profile">
              <Button variant="outline" size="sm" className="mt-4">{translate('viewDetails')}</Button>
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">{translate('myChannels')}</h2>
            {myChannels.length > 0 ? (
              <ul className="space-y-2">
                {myChannels.slice(0, 3).map((channel) => (
                  <li key={channel.id} className="flex items-center justify-between text-gray-700 dark:text-gray-300">
                    <Link to={`/channel/${channel.id}`} className="hover:text-primary-DEFAULT dark:hover:text-primary-light">
                      {channel.name}
                    </Link>
                    <span className="text-sm">({channel.subscriberCount} {translate('subscribers')})</span>
                  </li>
                ))}
                {myChannels.length > 3 && (
                  <Link to="/professor/channels" className="text-primary-DEFAULT hover:underline block mt-2 text-sm">
                    {translate('readMore')}
                  </Link>
                )}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">{translate('noChannels')}</p>
            )}
            <Link to="/professor/channels/create">
              <Button variant="primary" size="sm" className="mt-4">{translate('createChannel')}</Button>
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">{translate('myAnnouncements')}</h2>
            {myAnnouncements.length > 0 ? (
              <ul className="space-y-2">
                {myAnnouncements.slice(0, 3).map((ann) => (
                  <li key={ann.id} className="text-gray-700 dark:text-gray-300 text-sm">
                    <span className="font-semibold">{ann.title}: </span>
                    {ann.content.substring(0, 50)}...
                  </li>
                ))}
                {myAnnouncements.length > 3 && (
                  <Link to="/profile" className="text-primary-DEFAULT hover:underline block mt-2 text-sm">
                    {translate('readMore')}
                  </Link>
                )}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">{translate('noAnnouncements')}</p>
            )}
            <Link to="/profile">
              <Button variant="secondary" size="sm" className="mt-4">{translate('publishAnnouncement')}</Button>
            </Link>
          </div>
        </div>
      )}

      {user?.role === UserRole.STUDENT && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">{translate('mySubscribedChannels')}</h2>
            {myChannels.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {myChannels.slice(0, 2).map((channel) => (
                  <ChannelCard key={channel.id} channel={channel} professorName={getUserDetails(channel.professorId)?.name || 'Unknown'} isSubscribed={true} />
                ))}
                {myChannels.length > 2 && (
                  <Link to="/channels" className="text-primary-DEFAULT hover:underline block mt-2 text-sm text-center">
                    {translate('readMore')}
                  </Link>
                )}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center">{translate('noChannels')}</p>
            )}
            <Link to="/channels" className="block text-center mt-4">
              <Button variant="primary" size="sm">{translate('viewChannels')}</Button>
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">{translate('myFollowedProfessors')}</h2>
            {followedProfessors.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {followedProfessors.slice(0, 2).map((prof) => (
                  <ProfessorCard key={prof.id} professor={prof} isFollowing={true} />
                ))}
                {followedProfessors.length > 2 && (
                  <Link to="/channels" className="text-primary-DEFAULT hover:underline block mt-2 text-sm text-center">
                    {translate('readMore')}
                  </Link>
                )}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center">{translate('noFollowedProfessors')}</p>
            )}
            <Link to="/channels" className="block text-center mt-4">
              <Button variant="secondary" size="sm">{translate('findProfessors')}</Button>
            </Link>
          </div>
        </div>
      )}

      <section className="mt-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">{translate('availableChannels')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {allChannels.slice(0, 4).map((channel) => (
            <ChannelCard key={channel.id} channel={channel} professorName={getUserDetails(channel.professorId)?.name || 'Unknown'} />
          ))}
        </div>
        <div className="text-center mt-8">
          <Link to="/channels">
            <Button variant="outline" size="lg">{translate('viewAllChannels')}</Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;