import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Channel, Professor, UserRole } from '../types';
import { getChannels, subscribeToChannel } from '../services/channelService';
import { getUserDetails, updateUserDetails } from '../services/authService';
import ChannelCard from '../components/ChannelCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import ProfessorCard from '../components/ProfessorCard';
import { FACULTIES, DEPARTMENTS } from '../constants';

const ChannelList: React.FC = () => {
  const { user, translate, language, updateUserDetails: contextUpdateUserDetails } = useAuth();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterFaculty, setFilterFaculty] = useState<string>('');
  const [filterDepartment, setFilterDepartment] = useState<string>('');
  const [followedProfIds, setFollowedProfIds] = useState<string[]>([]);
  const [subscribedChannelIds, setSubscribedChannelIds] = useState<string[]>([]);

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    const allChannels = await getChannels();
    setChannels(allChannels);

    // Fetch all unique professors from channels
    const uniqueProfessorIds = [...new Set(allChannels.map(ch => ch.professorId))];
    const allProfessors = await Promise.all(
      uniqueProfessorIds.map(async (profId) => getUserDetails(profId) as Professor)
    );
    setProfessors(allProfessors.filter(p => p)); // Filter out any undefined results

    if (user?.role === UserRole.STUDENT) {
      const studentDetails = getUserDetails(user.id) as any; // Cast to any to access specific student properties
      setFollowedProfIds(studentDetails?.followedProfessors || []);
      setSubscribedChannelIds(studentDetails?.subscribedChannels || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleSubscribe = async (channelId: string) => {
    if (!user || user.role !== UserRole.STUDENT) return;

    setLoading(true);
    const success = await subscribeToChannel(channelId, user.id);
    if (success) {
      setSubscribedChannelIds(prev => [...prev, channelId]);
      alert(translate('paymentSuccess'));
      // Update local state for channels
      setChannels(prevChannels => prevChannels.map(ch =>
        ch.id === channelId ? { ...ch, subscriberCount: ch.subscriberCount + 1 } : ch
      ));
      // Reverted to correctly call the context's updateUserDetails with only the updates object
      await contextUpdateUserDetails({ subscribedChannels: [...subscribedChannelIds, channelId] });
    } else {
      alert(translate('paymentFailed'));
    }
    setLoading(false);
  };

  const handleFollowToggle = async (professorId: string) => {
    if (!user || user.role !== UserRole.STUDENT) return;

    const isCurrentlyFollowing = followedProfIds.includes(professorId);
    let updatedFollowedProfIds: string[];

    if (isCurrentlyFollowing) {
      updatedFollowedProfIds = followedProfIds.filter(id => id !== professorId);
    } else {
      updatedFollowedProfIds = [...followedProfIds, professorId];
    }
    setFollowedProfIds(updatedFollowedProfIds);

    // Reverted to correctly call the context's updateUserDetails with only the updates object
    await contextUpdateUserDetails({ followedProfessors: updatedFollowedProfIds });
  };


  const filteredChannels = channels.filter(channel => {
    const matchesSearch = channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          channel.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          getUserDetails(channel.professorId)?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFaculty = filterFaculty ? channel.department.includes(filterFaculty) : true; // Simplified for now
    const matchesDepartment = filterDepartment ? channel.department === filterDepartment : true;
    return matchesSearch && matchesFaculty && matchesDepartment;
  });

  const filteredProfessors = professors.filter(prof => {
    const matchesSearch = prof.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          prof.university?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          prof.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFaculty = filterFaculty ? prof.faculty?.includes(filterFaculty) : true;
    const matchesDepartment = filterDepartment ? prof.department === filterDepartment : true;
    return matchesSearch && matchesFaculty && matchesDepartment;
  });

  const facultyOptions = FACULTIES.map(f => ({ value: f.name[language], label: f.name[language] }));
  const departmentOptions = DEPARTMENTS.map(d => ({ value: d.name[language], label: d.name[language] }));

  const currentDirection = language === 'ar' ? 'rtl' : 'ltr';

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto p-4" style={{ direction: currentDirection }}>
      <h1 className="text-4xl font-extrabold text-primary-DEFAULT mb-8 text-center">
        {translate('channels')}
      </h1>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Input
            type="text"
            placeholder={translate('search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="col-span-1 md:col-span-3 lg:col-span-1"
          />
          <Select
            label={translate('selectFaculty')}
            options={[{ value: '', label: translate('all') }, ...facultyOptions]}
            value={filterFaculty}
            onChange={(e) => setFilterFaculty(e.target.value)}
          />
          <Select
            label={translate('selectDepartment')}
            options={[{ value: '', label: translate('all') }, ...departmentOptions]}
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
          />
        </div>
      </div>

      {filteredChannels.length > 0 || filteredProfessors.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredChannels.map((channel) => (
            <ChannelCard
              key={channel.id}
              channel={channel}
              professorName={professors.find(p => p.id === channel.professorId)?.name || 'Unknown'}
              onSubscribe={handleSubscribe}
              isSubscribed={user?.role === UserRole.STUDENT && subscribedChannelIds.includes(channel.id)}
            />
          ))}
          {filteredProfessors.map((prof) => (
            <ProfessorCard
              key={prof.id}
              professor={prof}
              onFollowToggle={handleFollowToggle}
              isFollowing={user?.role === UserRole.STUDENT && followedProfIds.includes(prof.id)}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400 text-lg mt-10">{translate('noResultsFound')}</p>
      )}
    </div>
  );
};

export default ChannelList;