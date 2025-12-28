import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { UserRole } from '../../types';
import { UNIVERSITIES, FACULTIES, DEPARTMENTS } from '../../constants';

const Register: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [university, setUniversity] = useState<string>('');
  const [faculty, setFaculty] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [error, setError] = useState<string>('');
  const { register, loading, translate, language } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!role) {
      setError('Please select a role (Student or Professor).');
      return;
    }

    const userData = {
      name,
      email,
      password, // In a real app, hash this
      role: role as UserRole,
      university,
      faculty,
      department,
      language, // Default to current app language
    };

    const success = await register(userData);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Registration failed. Email might already be in use.');
    }
  };

  const universityOptions = UNIVERSITIES.map(u => ({ value: u.id, label: u.name[language] }));
  const facultyOptions = FACULTIES.map(f => ({ value: f.id, label: f.name[language] }));
  const departmentOptions = DEPARTMENTS.map(d => ({ value: d.id, label: d.name[language] }));

  return (
    <div className="flex items-center justify-center min-h-screen-minus-header bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-primary-DEFAULT mb-6">
          {translate('register')}
        </h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
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
            label={translate('password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            id="password"
          />
          <Select
            label={translate('registerAs')}
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            options={[
              { value: UserRole.STUDENT, label: translate('student') },
              { value: UserRole.PROFESSOR, label: translate('professor') },
            ]}
            required
            id="role"
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

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <LoadingSpinner /> : translate('register')}
          </Button>
        </form>
        <p className="mt-6 text-center text-gray-600 dark:text-gray-300">
          {translate('alreadyHaveAccount')}{' '}
          <Link to="/login" className="text-primary-DEFAULT hover:underline">
            {translate('login')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
