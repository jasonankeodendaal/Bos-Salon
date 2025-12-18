
import React, { useState, FormEvent, MouseEvent } from 'react';
import { dbLogin, dbLoginWithGoogle } from '../utils/dbAdapter';

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

  const handleGoogleLogin = async () => {
    try {
        setLoading(true);
        // Save intent so App.tsx knows where to redirect after OAuth callback
        localStorage.setItem('login_redirect_destination', 'admin');
        await dbLoginWithGoogle();
    } catch (err: any) {
        console.error("Google Login Error:", err);
        setError(err.message || 'Failed to sign in with Google.');
        setLoading(false);
    }
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

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <p className="text-red-500 text-sm text-center font-semibold">{error}</p>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-brand-green py-3 rounded-full font-bold text-lg hover:bg-brand-green hover:text-black transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg border border-brand-green/30"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative flex items-center py-6">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink-0 mx-4 text-xs font-bold text-gray-400 uppercase tracking-widest">OR</span>
              <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* Google Button */}
          <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-full font-bold text-sm hover:bg-gray-50 shadow-sm flex items-center justify-center gap-3 transition-all hover:border-gray-400 disabled:opacity-50"
          >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
          </button>
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
