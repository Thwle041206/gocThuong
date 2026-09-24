import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';
import { Language } from '../data/content';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
}

export function AuthModal({ isOpen, onClose, lang = 'vi' }: AuthModalProps) {
  const { login, register, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg(
        lang === 'en'
          ? 'Please enter email and password.'
          : 'Vui lòng nhập đầy đủ email và mật khẩu.'
      );
      return;
    }

    if (mode === 'register' && password.length < 6) {
      setErrorMsg(
        lang === 'en'
          ? 'Password must be at least 6 characters.'
          : 'Mật khẩu phải có ít nhất 6 ký tự.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await register(email.trim(), password, name.trim());
      }
      onClose();
    } catch (err: unknown) {
      console.error('Auth error:', err);
      const code = (err as { code?: string })?.code || '';
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
        setErrorMsg(
          lang === 'en'
            ? 'Incorrect email or password.'
            : 'Email hoặc mật khẩu không chính xác.'
        );
      } else if (code === 'auth/user-not-found') {
        setErrorMsg(
          lang === 'en'
            ? 'Account does not exist. Please register.'
            : 'Tài khoản không tồn tại. Vui lòng đăng ký.'
        );
      } else if (code === 'auth/email-already-in-use') {
        setErrorMsg(
          lang === 'en'
            ? 'Email already in use. Please sign in instead.'
            : 'Email đã được sử dụng. Vui lòng chọn đăng nhập.'
        );
      } else if (code === 'auth/weak-password') {
        setErrorMsg(
          lang === 'en'
            ? 'Password should be at least 6 characters.'
            : 'Mật khẩu cần tối thiểu 6 ký tự.'
        );
      } else {
        setErrorMsg(
          (err as Error)?.message ||
            (lang === 'en'
              ? 'Authentication failed. Please try again.'
              : 'Xác thực không thành công. Vui lòng thử lại.')
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err) {
      console.error('Google auth error:', err);
      setErrorMsg(
        lang === 'en'
          ? 'Google sign-in was cancelled or failed.'
          : 'Đăng nhập Google thất bại hoặc bị hủy.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 sm:pt-16 md:pt-24 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200 overflow-y-auto">
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden transform transition-all max-h-[85vh] flex flex-col my-auto sm:my-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3.5 border-b border-zinc-100 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif italic font-medium text-lg tracking-tight text-zinc-900">
                góc Thương
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded">
                Account
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              {mode === 'login'
                ? lang === 'en'
                  ? 'Sign in to access your space'
                  : 'Đăng nhập vào tài khoản của bạn'
                : lang === 'en'
                ? 'Create a new reader or author account'
                : 'Đăng ký tài khoản người đọc mới'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-black hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Toggle: Login vs Register */}
        <div className="flex border-b border-zinc-200 bg-zinc-50/50 flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg('');
            }}
            className="flex-1 py-2.5 text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer text-center relative text-black bg-white font-bold"
          >
            {lang === 'en' ? 'Sign In' : 'Đăng Nhập'}
            {mode === 'login' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg('');
            }}
            className="flex-1 py-2.5 text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer text-center relative text-black bg-white font-bold"
          >
            {lang === 'en' ? 'Register' : 'Đăng Ký'}
            {mode === 'register' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
            )}
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="mb-3.5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  {lang === 'en' ? 'Full Name' : 'Họ và Tên'}
                </label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={lang === 'en' ? 'Nguyen Van A' : 'Nguyễn Văn A'}
                    className="w-full pl-10 pr-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your-email@example.com"
                  className="w-full pl-10 pr-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                {lang === 'en' ? 'Password' : 'Mật Khẩu'}
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                />
              </div>
              {mode === 'register' && (
                <p className="text-[11px] text-zinc-500 mt-1">
                  {lang === 'en'
                    ? 'Minimum 6 characters.'
                    : 'Tối thiểu 6 ký tự.'}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-1 bg-black text-white hover:bg-zinc-800 disabled:opacity-50 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <span>
                {isSubmitting
                  ? lang === 'en'
                    ? 'Processing...'
                    : 'Đang xử lý...'
                  : mode === 'login'
                  ? lang === 'en'
                    ? 'Sign In'
                    : 'Đăng Nhập'
                  : lang === 'en'
                  ? 'Create Account'
                  : 'Tạo Tài Khoản'}
              </span>
              {!isSubmitting && <ArrowRight size={14} />}
            </button>
          </form>

          {/* Social Sign In Divider */}
          <div className="relative my-4 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200" />
            </div>
            <span className="relative bg-white px-3 text-[11px] uppercase tracking-wider text-zinc-400 font-mono">
              {lang === 'en' ? 'or continue with' : 'hoặc'}
            </span>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="w-full py-2 px-4 border border-zinc-300 rounded-lg text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:border-black transition-all flex items-center justify-center gap-2.5 cursor-pointer bg-white"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}
