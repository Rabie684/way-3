import React from 'react';
import { Channel } from '../types';
import StarRating from './common/StarRating';
import { useAuth } from '../context/AuthContext';
import Button from './common/Button';
import { Link } from 'react-router-dom';

interface ChannelCardProps {
  channel: Channel;
  professorName: string;
  onSubscribe?: (channelId: string) => void;
  isSubscribed?: boolean;
}

const ChannelCard: React.FC<ChannelCardProps> = ({ channel, professorName, onSubscribe, isSubscribed }) => {
  const { translate, user } = useAuth();

  return (
    <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-6 flex flex-col hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
      <Link to={`/channel/${channel.id}`} className="block">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 hover:text-primary-DEFAULT dark:hover:text-primary-light transition-colors">
          {channel.name}
        </h3>
      </Link>
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-1">
        {translate('professor')}: {professorName}
      </p>
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
      <p className="text-gray-700 dark:text-gray-200 text-sm mb-4">
        {translate('price')}: {channel.price} {translate('dzd')}
      </p>

      <div className="mt-auto flex space-x-2">
        {user && user.role === 'student' && onSubscribe && (
          <Button
            onClick={() => onSubscribe(channel.id)}
            variant={isSubscribed ? 'outline' : 'primary'}
            size="sm"
            className="flex-grow"
          >
            {isSubscribed ? translate('subscribed') : translate('subscribe')}
          </Button>
        )}
        <Link to={`/channel/${channel.id}`} className="flex-grow">
          <Button variant="secondary" size="sm" className="w-full">
            {translate('viewChannel')}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ChannelCard;