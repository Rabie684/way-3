import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Select from '../components/common/Select';
import { fileToBase64 } from '../utils';
import { UNIVERSITIES, FACULTIES, DEPARTMENTS } from '../constants';
import { User } from '../types';

const Profile: React.FC = () => {
  const { user, updateUserDetails, loading, translate, language, setLanguage } = useAuth();
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [profilePicture, setProfilePicture] = useState<string>('');
  const [university, setUniversity] = useState<string>('');
  const [faculty, setFaculty] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhoneNumber(user.phoneNumber || '');
      setProfilePicture(user.profilePicture || 'https://picsum.photos/200/200?random=default-user');
      setUniversity(user.university || '');
      setFaculty(user.faculty || '');
      setDepartment(user.department || '');
    }
  }, [user]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const base64 = await fileToBase64(file);
        setProfilePicture(`data:${file.type};base64,${base64}`);
      } catch (err) {
        setError(translate('fileUploadError') + (err instanceof Error ? err.message : String(err)));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!user) {
      setError('User not authenticated.');
      return;
    }

    const updates: Partial<User> = {
      name,
      email,
      phoneNumber,
      profilePicture: profilePicture.startsWith('data:') ? profilePicture : undefined, // Only update if it's a new base64 string
      university,
      faculty,
      department,
      language, // Ensure language is saved if changed via header
    };

    const success = await updateUserDetails(updates);
    if (success) {
      setMessage(translate('updateSuccessful'));
    } else {
      setError(translate('updateFailed'));
    }
  };

  const universityOptions = UNIVERSITIES.map(u => ({ value: u.name[language], label: u.name[language] }));
  const facultyOptions = FACULTIES.map(f => ({ value: f.name[language], label: f.name[language] }));
  const departmentOptions = DEPARTMENTS.map(d => ({ value: d.name[language], label: d.name[language] }));

  const currentDirection = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <div className="container mx-auto p-4" style={{ direction: currentDirection }}>
      <h1 className="text-4xl font-extrabold text-primary-DEFAULT mb-8 text-center">
        {translate('profile')}
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-2xl mx-auto">
        {message && <p className="text-green-500 text-center mb-4">{message}</p>}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center">
            <img
              src={profilePicture}
              alt={translate('profilePicture')}
              className="w-32 h-32 rounded-full object-cover mb-4 border-2 border-primary-DEFAULT"
            />
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              id="profile-picture-upload"
              label={translate('changeProfilePicture')}
              className="w-full max-w-xs text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-primary-dark hover:file:bg-primary-DEFAULT hover:file:text-white"
            />
          </div>

          <Input
            label={translate('fullName')}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            id="name"
          />
          <Input
            label={translate('email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            id="email"
          />
          <Input
            label={translate('phoneNumber')}
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            id="phoneNumber"
          />
          <Select
            label={translate('selectUniversity')}
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            options={universityOptions}
            required
            id="university"
          />
          <Select
            label={translate('selectFaculty')}
            value={faculty}
            onChange={(e) => setFaculty(e.target.value)}
            options={facultyOptions}
            required
            id="faculty"
          />
          <Select
            label={translate('selectDepartment')}
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            options={departmentOptions}
            required
            id="department"
          />
          <Select
            label={translate('language')}
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'ar' | 'fr')}
            options={[
              { value: 'ar', label: translate('arabic') },
              { value: 'fr', label: translate('french') },
            ]}
            id="language"
          />


          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <LoadingSpinner /> : translate('updateProfile')}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Profile;