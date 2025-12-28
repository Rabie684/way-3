import React from 'react';
import { Professor } from '../types';
import StarRating from './common/StarRating';
import { useAuth } from '../context/AuthContext';
import Button from './common/Button';
import { Link } from 'react-router-dom';

interface ProfessorCardProps {
  professor: Professor;
  onFollowToggle?: (professorId: string) => void;
  isFollowing?: boolean;
}

const ProfessorCard: React.FC<ProfessorCardProps> = ({ professor, onFollowToggle, isFollowing }) => {
  const { translate, user } = useAuth();

  return (
    <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-6 flex flex-col items-center text-center hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
      <img
        src={professor.profilePicture || 'https://picsum.photos/200/200?random=default-prof'}
        alt={professor.name}
        className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-primary-DEFAULT"
      />
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{professor.name}</h3>
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{professor.university}</p>
      <div className="flex items-center mb-4">
        <StarRating rating={professor.stars} />
        <span className="ml-2 text-gray-700 dark:text-gray-200 text-sm">({professor.stars.toFixed(1)} {translate('stars')})</span>
      </div>

      <div className="flex flex-col space-y-2 w-full">
        {user && user.id !== professor.id && user.role === 'student' && onFollowToggle && (
          <Button
            onClick={() => onFollowToggle(professor.id)}
            variant={isFollowing ? 'outline' : 'primary'}
            size="sm"
            className="w-full"
          >
            {isFollowing ? translate('unfollowProfessor') : translate('followProfessor')}
          </Button>
        )}
        <Link to={`/professor/${professor.id}`}>
          <Button variant="secondary" size="sm" className="w-full">
            {translate('viewDetails')}
          </Button>
        </Link>
        {user && user.id !== professor.id && user.role === 'student' && (
          <Link to={`/chat/${professor.id}`}>
            <Button variant="outline" size="sm" className="w-full">
              {translate('chatWithProfessor')}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default ProfessorCard;