import React, { useState } from 'react';
import { Mail, Lock, LogIn, Key, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { api } from '../services/api';

interface LoginProps {
  onNavigate: (path: string) => void;
}

export default function Login({ onNavigate }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [require2FA, setRequire2FA] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [testOtp, setTestOtp] = useState('');
  const { login, verify2FA } = useAuth();
  const { error, success } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Front-end validations
    if (!email.trim() || !password.trim()) {
      error('Bu xanalar boş qala bilməz. Lütfən bütün məlumatları doldurun.');
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
      // Hit login API to check if 2FA is required
      const res = await api.auth.login({ email, password });
      
      if (res && res.require2FA) {
        setRequire2FA(true);
        setTestOtp(res.twoFactorOtp || '');
        success('İki mərhələli təhlükəsizlik doğrulama kodu tələb olunur.', '2FA Tələb Edilir');
        setLoading(false);
        return;
      }

      // If no 2FA is needed, do actual login context mapping
      const role = await login(email, password);
      if (role) {
        // Fetch dynamic general settings to get customized admin url
        let redirectPath = '/admin';
        try {
          const cfg = await api.settings.get();
          if (cfg && cfg.adminPath) {
            redirectPath = cfg.adminPath;
          }
        } catch (_) {}

        if (role === 'admin') {
          onNavigate(redirectPath);
        } else {
          onNavigate('/');
        }
      }
    } catch (err: any) {
      error(err.message || 'Giriş məlumatları yanlışdır.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otpCode.trim()) {
      error('Zəhmət olmasa doğrulama kodunu daxil edin.');
      return;
    }

    try {
      setLoading(true);
      const role = await verify2FA(email, otpCode);
      if (role) {
        let redirectPath = '/admin';
        try {
          const cfg = await api.settings.get();
          if (cfg && cfg.adminPath) {
            redirectPath = cfg.adminPath;
          }
        } catch (_) {}

        if (role === 'admin') {
          onNavigate(redirectPath);
        } else {
          onNavigate('/');
        }
      }
    } catch (err: any) {
      error(err.message || 'Kod yanlışdır və ya müddəti bitib.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen pt-28 pb-12 flex items-center justify-center px-4 relative z-10 font-sans"
      id="login-page-container"
    >
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-8 shadow-xl relative overflow-hidden text-left">
        
        {/* Abstract Gold Header line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gold-primary to-gold-dark" />

        {!require2FA ? (
          <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-serif font-bold text-navy-deep leading-tight">Giriş Edin</h2>
              <p className="text-sm font-sans text-slate-400 mt-2">
                Naxçıvanın rəqəmsal dünyasına yenidən xoş gəldiniz
              </p>
            </div>

            {/* Form container */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-sans">
              
              {/* Email input */}
              <div className="flex flex-col gap-1 text-left">
                <label className="text-xs font-semibold text-slate-700">Elektron poçt ünvanı</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="misal@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-gold-primary focus:bg-white text-sm text-slate-800 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Password input */}
              <div className="flex flex-col gap-1 text-left">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-700">Şifrə</label>
                  <span className="text-[10px] text-slate-400 hover:text-gold-primary cursor-pointer transition-colors">
                    Şifrənizi unutmusunuz?
                  </span>
                </div>
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
                id="login-submit-button"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-navy-deep border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Sistemə Giriş
                    <LogIn className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Redirect signups */}
            <div className="border-t border-slate-100 mt-8 pt-4 text-center text-xs text-slate-500">
              <p>
                Portalda hesabınız yoxdur?{' '}
                <button
                  onClick={() => onNavigate('/register')}
                  className="text-gold-primary font-bold hover:text-gold-dark hover:underline cursor-pointer"
                >
                  İndi qeydiyyatdan keçin
                </button>
              </p>
            </div>
          </>
        ) : (
          <>
            {/* 2FA Verification UI */}
            <div className="text-center mb-6">
              <div className="mx-auto w-12 h-12 rounded-full bg-gold-primary/10 flex items-center justify-center text-gold-primary mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-navy-deep leading-tight">İki Mərhələli Giriş</h2>
              <p className="text-xs font-sans text-slate-400 mt-2 leading-relaxed">
                Hesabınızın təhlükəsizliyi üçün sistem tərəfindən yaradılmış birdəfəlik giriş kodunu daxil edin.
              </p>
            </div>

            {/* Demo/Test Simulated Code Banner */}
            {testOtp && (
              <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl mb-5 flex flex-col items-center justify-center gap-1.5">
                <span className="text-[10px] tracking-widest text-slate-400 font-mono font-bold uppercase leading-none">DOĞRULAMA KODU (TEST REJİMİ):</span>
                <span className="text-xl font-mono font-black text-gold-dark tracking-widest bg-gold-primary/10 px-4 py-1 rounded-lg border border-gold-primary/20 animate-pulse">{testOtp}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4 font-sans">
              <div className="flex flex-col gap-1 text-left">
                <label className="text-xs font-semibold text-slate-700">Təsdiqləmə Kodu</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Key className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="------"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-gold-primary focus:bg-white text-center text-lg font-mono tracking-widest text-slate-800 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gold-primary hover:bg-gold-dark text-navy-deep font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 hover:shadow-lg active:scale-97 cursor-pointer"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-navy-deep border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Kodu Təsdiqlə və Daxil Ol
                    <ShieldCheck className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setRequire2FA(false);
                  setOtpCode('');
                }}
                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-500 font-medium py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Geri qayıt
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
}
