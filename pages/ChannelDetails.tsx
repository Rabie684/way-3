import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Channel, ContentType, UserRole } from '../types';
import { getChannelById, subscribeToChannel } from '../services/channelService';
import { getUserDetails, updateUserDetails } from '../services/authService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StarRating from '../components/common/StarRating';
import Button from '../components/common/Button';

const ChannelDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, translate, language } = useAuth();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [professorName, setProfessorName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const fetchChannelData = useCallback(async () => {
    setLoading(true);
    setError('');
    if (!id) {
      setError('Channel ID is missing.');
      setLoading(false);
      return;
    }

    try {
      const fetchedChannel = await getChannelById(id);
      if (fetchedChannel) {
        setChannel(fetchedChannel);
        const professor = getUserDetails(fetchedChannel.professorId);
        setProfessorName(professor?.name || translate('professorNotFound'));

        if (user && user.role === UserRole.STUDENT) {
          const studentDetails = getUserDetails(user.id) as any;
          setIsSubscribed(studentDetails?.subscribedChannels.includes(fetchedChannel.id) || false);
        }
      } else {
        setError('Channel not found.');
      }
    } catch (err) {
      console.error('Failed to fetch channel details:', err);
      setError('Failed to load channel details.');
    } finally {
      setLoading(false);
    }
  }, [id, user, translate]);

  useEffect(() => {
    fetchChannelData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user?.id]);

  const handleSubscribe = async () => {
    if (!user || user.role !== UserRole.STUDENT || !channel) return;

    setLoading(true);
    try {
      const success = await subscribeToChannel(channel.id, user.id);
      if (success) {
        setIsSubscribed(true);
        setChannel(prev => (prev ? { ...prev, subscriberCount: prev.subscriberCount + 1 } : null));
        alert(translate('paymentSuccess'));
        // Update user's subscribed channels in auth context
        const studentDetails = getUserDetails(user.id) as any;
        // Passed user.id as the first argument to updateUserDetails
        await updateUserDetails(user.id, { subscribedChannels: [...(studentDetails?.subscribedChannels || []), channel.id] });
      } else {
        alert(translate('paymentFailed'));
      }
    } catch (err) {
      console.error('Subscription failed:', err);
      alert(translate('paymentFailed'));
    } finally {
      setLoading(false);
    }
  };

  const currentDirection = language === 'ar' ? 'rtl' : 'ltr';

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <p className="text-center text-red-500 text-lg mt-8">{error}</p>;
  }

  if (!channel) {
    return <p className="text-center text-gray-500 dark:text-gray-400 text-lg mt-8">{translate('channelNotFound')}</p>;
  }

  return (
    <div className="container mx-auto p-4" style={{ direction: currentDirection }}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 mb-8">
        <h1 className="text-4xl font-extrabold text-primary-DEFAULT mb-4">{channel.name}</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
          {translate('professor')}: <Link to={`/professor/${channel.professorId}`} className="text-secondary hover:underline">{professorName}</Link>
        </p>
        <p className="text-md text-gray-600 dark:text-gray-400 mb-4">{channel.department}</p>
        <p className="text-gray-800 dark:text-gray-200 mb-6">{channel.description}</p>

        <div className="flex items-center mb-6 space-x-4">
          <div className="flex items-center">
            <StarRating rating={channel.starRating} />
            <span className="ml-2 text-gray-700 dark:text-gray-200 text-lg">({channel.starRating.toFixed(1)} {translate('stars')})</span>
          </div>
          <span className="text-gray-700 dark:text-gray-200 text-lg">
            {translate('subscribers')}: {channel.subscriberCount}
          </span>
        </div>

        {user?.role === UserRole.STUDENT && (
          <div className="mb-6">
            {!isSubscribed ? (
              <Button onClick={handleSubscribe} variant="primary" size="lg" disabled={loading}>
                {loading ? <LoadingSpinner /> : `${translate('subscribe')} (${channel.price} ${translate('dzd')})`}
              </Button>
            ) : (
              <p className="text-primary-DEFAULT font-semibold text-lg">{translate('subscribed')}</p>
            )}
          </div>
        )}

        {channel.meetLink && (user?.id === channel.professorId || isSubscribed) && (
          <div className="mb-6 p-4 bg-primary-light dark:bg-primary-dark rounded-lg flex items-center justify-between">
            <p className="text-primary-dark dark:text-white font-semibold">Google Meet:</p>
            <a href={channel.meetLink} target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline">
              {translate('joinMeet')}
            </a>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{translate('content')}</h2>
        {channel.content.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {channel.content.map((item) => (
              <div key={item.id} className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                  {translate('type')}: {translate(item.type)}
                </p>
                {item.type === ContentType.IMAGE && (
                  <img src={item.url} alt={item.title} className="w-full h-48 object-cover rounded-md mb-3" />
                )}
                {item.type === ContentType.VIDEO && (
                  <video src={item.url} controls className="w-full h-48 bg-black rounded-md mb-3" />
                )}
                {item.type === ContentType.PDF && (
                  <div className="text-center p-4 border border-gray-300 dark:border-gray-600 rounded-md mb-3">
                    <svg className="mx-auto w-10 h-10 text-red-500 dark:text-red-400 mb-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
                    </svg>
                    <p className="text-gray-700 dark:text-gray-200">{item.title}</p>
                  </div>
                )}
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline text-sm mt-2 block">
                  {translate('viewContent')}
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 text-lg">{translate('noContent')}</p>
        )}
      </div>
    </div>
  );
};

export default ChannelDetails;