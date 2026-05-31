import React, { useState } from 'react';
import { Mail, Lock, LogIn, ShieldAlert, AlertCircle } from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import { api } from '../services/api';

interface AdminLoginProps {
  onNavigate: (path: string) => void;
}

export default function AdminLogin({ onNavigate }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { error, success } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!email.trim() || !password.trim()) {
      error('Email və şifrə daxil edilməlidir.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      error('Düzgün email ünvanı daxil edin.');
      return;
    }

    if (password.length < 8) {
      error('Şifrə minimum 8 simvol olmalıdır.');
      return;
    }

    try {
      setLoading(true);

      // Call secure admin login endpoint
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Giriş uğursuz oldu.');
      }

      // Save token
      if (data.token) {
        localStorage.setItem('token', data.token);
        success('Admin panelinə xoş gəldiniz!', 'Giriş Uğurlu');
        onNavigate('/admin');
      }
    } catch (err: any) {
      error(err.message || 'Daxil olarkən xəta baş verdi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-12 flex items-center justify-center px-4 relative z-10 font-sans">
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-8 shadow-xl relative overflow-hidden text-left">

        {/* Gold Header line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gold-primary to-gold-dark" />

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gold-primary/10 rounded-full flex items-center justify-center text-gold-primary mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-navy-deep leading-tight">Admin Girişi</h2>
          <p className="text-sm font-sans text-slate-400 mt-2">
            Təhlükəsiz admin panelinə giriş
          </p>
        </div>

        {/* Security notice */}
        <div className="bg-amber-50 border border-gold-primary/20 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 font-sans leading-relaxed">
            Bu səhifə yalnız administratorlar üçündür. İcazəsiz giriş qəti qadağandır və qeydə alınacaq.
          </p>
        </div>

        {/* Form container */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-sans">

          {/* Email input */}
          <div className="flex flex-col gap-1 text-left">
            <label className="text-xs font-semibold text-slate-700">Admin Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                placeholder="admin@naxcivan.travel"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-gold-primary focus:bg-white text-sm text-slate-800 transition-all font-sans"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="flex flex-col gap-1 text-left">
            <label className="text-xs font-semibold text-slate-700">Şifrə</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-gold-primary focus:bg-white text-sm text-slate-800 transition-all font-sans"
              />
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold-primary hover:bg-gold-dark text-navy-deep font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 mt-2 hover:shadow-lg active:scale-97 cursor-pointer"
            id="admin-login-submit-button"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-navy-deep border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Təhlükəsiz Giriş
                <LogIn className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Redirect to home */}
        <div className="border-t border-slate-100 mt-8 pt-4 text-center text-xs text-slate-500">
          <button
            onClick={() => onNavigate('/')}
            className="text-gold-primary font-bold hover:text-gold-dark hover:underline cursor-pointer"
          >
            Ana səhifəyə qayıt
          </button>
        </div>

      </div>
    </div>
  );
}
