
import React, { useState, FormEvent, MouseEvent } from 'react';
import { dbLogin } from '../utils/dbAdapter';

interface AdminLoginPageProps {
  onNavigate: (view: 'home' | 'admin') => void;
  logoUrl: string;
}

const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onNavigate, logoUrl }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLinkClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onNavigate('home');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { user, error: loginError } = await dbLogin(email, password);

    if (loginError) {
        console.error("Login Error:", loginError);
        setError(loginError.message || 'Invalid email or password.');
        setLoading(false);
    } else if (user) {
        // Successful login, the listener in App.tsx will handle navigation
        setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col justify-center items-center text-brand-light p-4 relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('https://i.ibb.co/cSRB4Mg4/image.png')" }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60 z-0"></div>

      <div className="w-full max-w-sm mx-auto relative z-10">
        <a href="#" onClick={handleLinkClick} className="flex justify-center mb-6">
          <img src={logoUrl} alt="Bos Salon Logo" className="w-32 h-32 object-contain" />
        </a>

        <div className="bg-white/80 backdrop-blur-lg border border-gray-200 rounded-xl shadow-2xl p-8">
          <h1 className="text-2xl font-bold text-center mb-1 text-brand-light">Admin Access</h1>
          <p className="text-center text-gray-500 text-sm mb-6">Enter your credentials to manage the studio.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-2">Username or Email</label>
              <input
                id="email"
                name="email"
                type="text"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg p-3 text-brand-light focus:ring-brand-gold focus:border-brand-gold shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="password"className="block text-sm font-medium text-gray-600 mb-2">Password / PIN</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg p-3 text-brand-light focus:ring-brand-gold focus:border-brand-gold shadow-sm"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-brand-green py-3 rounded-full font-bold text-lg hover:bg-brand-green hover:text-black transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg border border-brand-green/30"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </div>
          </form>
        </div>
        <p className="text-center text-xs text-white/80 mt-6 font-bold shadow-sm">
          <a href="#" onClick={handleLinkClick} className="hover:text-brand-green transition-colors">
            &larr; Back to Main Site
          </a>
        </p>
      </div>
    </div>
  );
};

export default AdminLoginPage;
