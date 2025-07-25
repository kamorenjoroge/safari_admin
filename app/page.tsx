"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      // Mock authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (password.length > 0 && email.includes('@')) {
        localStorage.setItem('admin-auth', 'true');
        router.push('/d');
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary">
      <div className="w-full max-w-md p-8 space-y-8 bg-light rounded-xl shadow-primary">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-primary-dark">
            Safari Admin Portal
          </h2>
          <p className="mt-2 text-earth">Sign in to manage your safari operations</p>
        </div>

        {error && (
          <div className="p-4 rounded-md bg-danger/10 border border-danger/20">
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-earth">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-secondary-dark rounded-md shadow-sm focus:ring-primary focus:border-primary"
                placeholder="admin@safari.co.ke"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-earth">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-secondary-dark rounded-md shadow-sm focus:ring-primary focus:border-primary"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary focus:ring-primary border-secondary-dark rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-earth">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link href="/forgot-password" className="font-medium text-accent hover:text-accent-light">
                Forgot password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-light bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-glow transition-default ${loading ? 'opacity-80' : ''}`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-light" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </>
              ) : 'Sign in'}
            </button>
          </div>
        </form>

        <div className="text-center text-sm text-earth-light">
          <p>Need help? <Link href="/contact" className="text-accent hover:text-accent-light">Contact support</Link></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;