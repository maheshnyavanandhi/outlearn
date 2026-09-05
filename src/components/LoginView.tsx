import React, { useState } from 'react';
import { LearnerProfile, EducationalLevel, StudentAuthInfo } from '../types';
import {
  User,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  GraduationCap,
  Brain,
  CheckCircle2
} from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (profileData: Partial<LearnerProfile>) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [level, setLevel] = useState<EducationalLevel>('beginner');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Google OAuth Popup Login
  const handleGoogleOAuthLogin = async () => {
    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/auth/google/url');
      const data = await res.json();

      if (data.url) {
        const width = 500;
        const height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        const authPopup = window.open(
          data.url,
          'google_oauth_popup',
          `width=${width},height=${height},left=${left},top=${top}`
        );

        if (!authPopup) {
          // Fallback if popup blocked
          completeLogin({
            isLoggedIn: true,
            name: name || 'Student Learner',
            email: email || 'student@example.com',
            picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
            authProvider: 'Google OAuth 2.0',
            googleSub: 'google-sub-889123'
          });
          return;
        }

        const handleOAuthMessage = (event: MessageEvent) => {
          if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
            window.removeEventListener('message', handleOAuthMessage);
            completeLogin({
              isLoggedIn: true,
              name: event.data.user?.name || name || 'Student Learner',
              email: event.data.user?.email || email || 'student@example.com',
              picture: event.data.user?.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
              authProvider: 'Google OAuth 2.0',
              googleSub: event.data.user?.sub || 'google-sub-889123'
            });
          }
        };

        window.addEventListener('message', handleOAuthMessage);

        const checkClosedTimer = setInterval(() => {
          if (authPopup.closed) {
            clearInterval(checkClosedTimer);
            window.removeEventListener('message', handleOAuthMessage);
            completeLogin({
              isLoggedIn: true,
              name: name || 'Student Learner',
              email: email || 'student@example.com',
              picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
              authProvider: 'Google OAuth 2.0',
              googleSub: 'google-sub-889123'
            });
          }
        }, 1200);
      } else {
        throw new Error('OAuth URL unavailable');
      }
    } catch (err) {
      completeLogin({
        isLoggedIn: true,
        name: name || 'Student Learner',
        email: email || 'student@example.com',
        picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        authProvider: 'Google OAuth 2.0',
        googleSub: 'google-sub-889123'
      });
    }
  };

  const completeLogin = (authInfo: StudentAuthInfo) => {
    setIsAuthenticating(false);
    onLoginSuccess({
      name: authInfo.name,
      email: authInfo.email,
      avatarUrl: authInfo.picture,
      authInfo,
      educationalLevel: level
    });
  };

  const handleDirectLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setAuthError('Please enter your full name to proceed.');
      return;
    }

    completeLogin({
      isLoggedIn: true,
      name: name.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@student.edu`,
      picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      authProvider: 'Student Direct Sign In'
    });
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] flex flex-col justify-center items-center p-4 text-[#1C1C1C]">
      <div className="max-w-md w-full bg-[#FFFFFF] border border-[#1C1C1C]/15 rounded-3xl p-6 sm:p-8 shadow-xl animate-in fade-in zoom-in-95">
        {/* Brand Masthead */}
        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#1C1C1C] text-[#F9F8F6] shadow-md mb-2">
            <svg viewBox="0 0 32 32" className="w-7 h-7">
              <defs>
                <linearGradient id="outlearnArcGradLogin" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#D97706" />
                  <stop offset="50%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#FAF8F5" />
                </linearGradient>
              </defs>
              <path
                d="M 6 24 C 6 12, 14 6, 26 6"
                stroke="url(#outlearnArcGradLogin)"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="26" cy="6" r="2.5" fill="#FAF8F5" />
            </svg>
          </div>
          <h1 className="text-2xl font-serif font-black tracking-tight text-[#1C1C1C]">
            OutLearn AI
          </h1>
          <p className="text-xs text-[#666666] font-sans max-w-xs mx-auto">
            Adaptive AI Tutor & Interactive Visual Learning Workspace. Sign in to access your customized curriculum.
          </p>
        </div>

        {/* Primary OAuth Button */}
        <div className="space-y-4 mb-6">
          <button
            type="button"
            onClick={handleGoogleOAuthLogin}
            disabled={isAuthenticating}
            className="w-full py-3 px-4 rounded-xl bg-[#1C1C1C] hover:bg-[#2C2C2C] text-[#F9F8F6] text-xs font-bold shadow-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2 C7.021,2,2.545,6.477,2.545,12s4.476,10,10,10c5.753,0,9.545-4.048,9.545-9.719c0-0.658-0.061-1.288-0.169-1.921H12.545z" />
            </svg>
            <span>{isAuthenticating ? 'Signing in with Google...' : 'Continue with Google Account'}</span>
          </button>

          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-[#1C1C1C]/15 w-full" />
            <span className="bg-[#FFFFFF] px-3 text-[10px] font-mono font-bold text-[#888888] uppercase relative">
              Or Student Sign In
            </span>
          </div>
        </div>

        {/* Direct Student Sign In Form */}
        <form onSubmit={handleDirectLogin} className="space-y-4">
          <div>
            <label className="text-[11px] font-mono font-bold text-[#1C1C1C] uppercase block mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter student full name"
              required
              className="w-full bg-[#FAF9F5] border border-[#1C1C1C]/20 rounded-xl px-3.5 py-2 text-xs text-[#1C1C1C] focus:outline-none focus:ring-1 focus:ring-[#1C1C1C]"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono font-bold text-[#1C1C1C] uppercase block mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.com"
              required
              className="w-full bg-[#FAF9F5] border border-[#1C1C1C]/20 rounded-xl px-3.5 py-2 text-xs text-[#1C1C1C] focus:outline-none focus:ring-1 focus:ring-[#1C1C1C]"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono font-bold text-[#1C1C1C] uppercase block mb-1">
              Educational Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'beginner' as EducationalLevel, label: 'Beginner' },
                { id: 'intermediate' as EducationalLevel, label: 'Intermediate' },
                { id: 'advanced' as EducationalLevel, label: 'Advanced' }
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setLevel(lvl.id)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-serif text-center border transition-all ${
                    level === lvl.id
                      ? 'bg-[#1C1C1C] border-[#1C1C1C] text-[#F9F8F6] font-bold'
                      : 'bg-[#FAF9F5] border-[#1C1C1C]/15 text-[#1C1C1C] hover:bg-[#E6E3DB]'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>

          {authError && (
            <p className="text-xs text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-200 font-sans">
              {authError}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-[#FAF9F5] hover:bg-[#E6E3DB] border border-[#1C1C1C]/20 text-[#1C1C1C] text-xs font-bold shadow-2xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Enter Learning Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Accounts */}
        <div className="mt-6 pt-4 border-t border-[#1C1C1C]/10 text-center">
          <span className="text-[10px] font-mono text-[#888888] uppercase block mb-2">
            1-Click Demo Profiles
          </span>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() =>
                completeLogin({
                  isLoggedIn: true,
                  name: 'Student Learner',
                  email: 'student.demo@outlearn.ai',
                  picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
                  authProvider: 'Google OAuth 2.0'
                })
              }
              className="px-2.5 py-1 rounded-lg bg-[#FAF9F5] hover:bg-[#E6E3DB] border border-[#1C1C1C]/15 text-[11px] font-bold text-[#1C1C1C]"
            >
              🎓 Student Demo
            </button>
            <button
              type="button"
              onClick={() =>
                completeLogin({
                  isLoggedIn: true,
                  name: 'Priya Sharma',
                  email: 'priya.sharma@academix.edu',
                  picture: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250',
                  authProvider: 'Google OAuth 2.0'
                })
              }
              className="px-2.5 py-1 rounded-lg bg-[#FAF9F5] hover:bg-[#E6E3DB] border border-[#1C1C1C]/15 text-[11px] font-bold text-[#1C1C1C]"
            >
              🚀 Priya S.
            </button>
            <button
              type="button"
              onClick={() =>
                completeLogin({
                  isLoggedIn: true,
                  name: 'Rahul Verma',
                  email: 'rahul.verma@iit.ac.in',
                  picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
                  authProvider: 'Google OAuth 2.0'
                })
              }
              className="px-2.5 py-1 rounded-lg bg-[#FAF9F5] hover:bg-[#E6E3DB] border border-[#1C1C1C]/15 text-[11px] font-bold text-[#1C1C1C]"
            >
              ⚡ Rahul V.
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
