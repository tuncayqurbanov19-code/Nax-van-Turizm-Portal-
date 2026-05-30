import React, { useState } from 'react';
import { Mail, Lock, LogIn, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';

interface LoginProps {
  onNavigate: (path: string) => void;
}

export default function Login({ onNavigate }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
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

    if (isAdminLogin && !adminCode.trim()) {
      error('Məxfi admin giriş kodu boş ola bilməz.');
      return;
    }

    try {
      setLoading(true);
      const isSuccess = await login(email, password, isAdminLogin ? adminCode : undefined);
      if (isSuccess) {
        onNavigate('/');
      }
    } catch (err: any) {
      error(err.message || 'Xəta yarandı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen pt-28 pb-12 flex items-center justify-center px-4 relative z-10"
      id="login-page-container"
    >
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-8 shadow-xl relative overflow-hidden">
        
        {/* Abstract Gold Header line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gold-primary to-gold-dark" />

        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif font-bold text-navy-deep leading-tight">Giriş Edin</h2>
          <p className="text-sm font-sans text-slate-400 mt-2">
            Naxçıvanın rəqəmsal dünyasına yenidən xoş gəldiniz
          </p>
        </div>

        {/* Form container */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-sans">
          
          {/* Email input */}
          <div className="flex flex-col gap-1">
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
          <div className="flex flex-col gap-1">
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

          {/* Admin Login Toggle */}
          <div className="flex items-center gap-2 py-1 select-none">
            <input
              type="checkbox"
              id="isAdminLoginCheckbox"
              checked={isAdminLogin}
              onChange={(e) => setIsAdminLogin(e.target.checked)}
              className="w-4 h-4 text-gold-primary border-slate-350 rounded focus:ring-gold-primary focus:ring-2 accent-gold-primary cursor-pointer"
            />
            <label htmlFor="isAdminLoginCheckbox" className="text-xs font-semibold text-slate-600 cursor-pointer">
              İdarəçi kimi daxil ol (Məxfi Admin Girişi)
            </label>
          </div>

          {/* Dynamic Secret Admin Code Input */}
          {isAdminLogin && (
            <div className="flex flex-col gap-1 bg-amber-50/50 p-4 rounded-2xl border border-amber-200/50 animate-fadeIn">
              <label className="text-xs font-semibold text-amber-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                Məxfi Admin Giriş Kodu
              </label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4 text-amber-500" />
                </span>
                <input
                  type="password"
                  required={isAdminLogin}
                  placeholder="Məxfi kod (naxcivan2026)"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-gold-primary text-sm text-slate-800 transition-all font-sans font-semibold placeholder:font-normal"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">İdarəçi hüququ olan hesablar üçün qoruyucu kod tələb olunur.</p>
            </div>
          )}

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

        {/* Credentials hints for high fidelity testing */}
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl mt-6">
          <div className="flex gap-2 text-amber-800 mb-1 font-bold items-center text-[10px] uppercase font-sans">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            Demo İcarəçi Məlumatları:
          </div>
          <div className="text-xs text-amber-700 font-mono mt-1 flex flex-col gap-1 text-left">
            <p><strong>Admin:</strong> admin@tourism.naxcivan / naxcivan2025</p>
            <p><strong>Turist:</strong> turist@tourism.naxcivan / naxcivan2025</p>
          </div>
        </div>

      </div>
    </div>
  );
}
