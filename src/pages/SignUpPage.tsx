import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const SignUpPage: React.FC = () => {
  const { signup, loginWithGoogle, loginWithApple, loginWithMeta } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await signup(email, password, name);
      if (error) throw error;

      // Supabase will send a verification email
      alert('Verification email sent. Please check your inbox.');
      navigate('/verify-email'); // Optional route if you want to show instructions
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignup = async (provider: 'google' | 'facebook' | 'apple') => {
    try {
      let result;
      if (provider === 'google') {
        result = await loginWithGoogle();
      } else if (provider === 'facebook') {
        result = await loginWithMeta();
      } else if (provider === 'apple') {
        result = await loginWithApple();
      }

     

      // Redirect handled by Supabase OAuth
    } catch (err: any) {
      setError(err.message || 'Social signup failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <form
        onSubmit={handleSignup}
        className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md space-y-6"
      >
        <h2 className="text-2xl font-bold text-center">Create an Account</h2>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded p-2"
          required
        />

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded p-2"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded p-2"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>

        <div className="space-y-2 pt-4">
          <button
            type="button"
            onClick={() => handleSocialSignup('google')}
            className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
          >
            Sign up with Google
          </button>

          <button
            type="button"
            onClick={() => handleSocialSignup('facebook')}
            className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800"
          >
            Sign up with Facebook
          </button>

          <button
            type="button"
            onClick={() => handleSocialSignup('apple')}
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-900"
          >
            Sign up with Apple
          </button>
        </div>

        <p className="text-sm text-center text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 hover:underline">
            Log in
          </a>
        </p>
      </form>
    </div>
  );
};

export default SignUpPage;
