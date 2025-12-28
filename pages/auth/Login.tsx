import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const { login, loading, translate } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await login(email, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid email or password.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen-minus-header bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-primary-DEFAULT mb-6">
          {translate('login')}
        </h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <LoadingSpinner /> : translate('login')}
          </Button>
        </form>
        <p className="mt-6 text-center text-gray-600 dark:text-gray-300">
          {translate('dontHaveAccount')}{' '}
          <Link to="/register" className="text-primary-DEFAULT hover:underline">
            {translate('register')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;