import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Professor, Channel, UserRole } from '../types';
import { getUserDetails, updateUserDetails } from '../services/authService';
import { getChannelsByProfessor } from '../services/channelService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StarRating from '../components/common/StarRating';
import Button from '../components/common/Button';
import ChannelCard from '../components/ChannelCard';

const ProfessorProfile: React.FC = () => {
  const { professorId } = useParams<{ professorId: string }>();
  const { user, translate, language } = useAuth();
  const [professor, setProfessor] = useState<Professor | null>(null);
  const [professorChannels, setProfessorChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const fetchProfessorData = useCallback(async () => {
    setLoading(true);
    setError('');
    if (!professorId) {
      setError(translate('professorNotFound'));
      setLoading(false);
      return;
    }

    try {
      const fetchedProfessor = getUserDetails(professorId) as Professor;
      if (fetchedProfessor && fetchedProfessor.role === UserRole.PROFESSOR) {
        setProfessor(fetchedProfessor);
        const channels = await getChannelsByProfessor(professorId);
        setProfessorChannels(channels);

        if (user && user.role === UserRole.STUDENT) {
          const studentDetails = getUserDetails(user.id) as any;
          setIsFollowing(studentDetails?.followedProfessors.includes(professorId) || false);
        }
      } else {
        setError(translate('professorNotFound'));
      }
    } catch (err) {
      console.error('Failed to fetch professor details:', err);
      setError(translate('failedToLoadProfessor'));
    } finally {
      setLoading(false);
    }
  }, [professorId, user, translate]);

  useEffect(() => {
    fetchProfessorData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [professorId, user?.id]);

  const handleFollowToggle = async () => {
    if (!user || user.role !== UserRole.STUDENT || !professor) return;

    setLoading(true);
    try {
      const studentDetails = getUserDetails(user.id) as any;
      let updatedFollowedProfessors: string[];

      if (isFollowing) {
        updatedFollowedProfessors = studentDetails.followedProfessors.filter((id: string) => id !== professor.id);
      } else {
        updatedFollowedProfessors = [...studentDetails.followedProfessors, professor.id];
      }

      // Passed user.id as the first argument to updateUserDetails
      const success = await updateUserDetails(user.id, { followedProfessors: updatedFollowedProfessors });
      if (success) {
        setIsFollowing(!isFollowing);
      } else {
        setError(translate('updateFailed'));
      }
    } catch (err) {
      console.error('Failed to update follow status:', err);
      setError(translate('updateFailed'));
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

  if (!professor) {
    return <p className="text-center text-gray-500 dark:text-gray-400 text-lg mt-8">{translate('professorNotFound')}</p>;
  }

  return (
    <div className="container mx-auto p-4" style={{ direction: currentDirection }}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 mb-8 flex flex-col items-center md:flex-row md:items-start md:space-x-8">
        <img
          src={professor.profilePicture || 'https://picsum.photos/200/200?random=default-prof'}
          alt={professor.name}
          className="w-32 h-32 rounded-full object-cover mb-6 md:mb-0 border-2 border-primary-DEFAULT flex-shrink-0"
        />
        <div className="text-center md:text-start flex-grow">
          <h1 className="text-4xl font-extrabold text-primary-DEFAULT mb-2">{professor.name}</h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">{professor.university}</p>
          <p className="text-md text-gray-600 dark:text-gray-400 mb-4">{professor.faculty} - {professor.department}</p>
          <div className="flex items-center justify-center md:justify-start mb-4">
            <StarRating rating={professor.stars} />
            <span className="ml-2 text-gray-700 dark:text-gray-200 text-lg">({professor.stars.toFixed(1)} {translate('stars')})</span>
          </div>

          {user && user.id !== professor.id && user.role === UserRole.STUDENT && (
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mt-4">
              <Button onClick={handleFollowToggle} variant={isFollowing ? 'outline' : 'primary'} size="md" disabled={loading}>
                {loading ? <LoadingSpinner /> : (isFollowing ? translate('unfollowProfessor') : translate('followProfessor'))}
              </Button>
              <Link to={`/chat/${professor.id}`}>
                <Button variant="secondary" size="md" className="w-full sm:w-auto">
                  {translate('chatWithProfessor')}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{translate('myChannels')}</h2>
        {professorChannels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {professorChannels.map((channel) => (
              <ChannelCard key={channel.id} channel={channel} professorName={professor.name} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 text-lg">{translate('noChannels')}</p>
        )}
      </div>
    </div>
  );
};

export default ProfessorProfile;