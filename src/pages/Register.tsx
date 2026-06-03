import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import Logo from '../components/ui/Logo';

interface RegisterProps {
  onNavigate: (path: string) => void;
}

export default function Register({ onNavigate }: RegisterProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { error, success } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Front-end validations
    if (!fullName.trim() || !email.trim() || !password.trim()) {
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
      const isSuccess = await register(fullName, email, password);
      if (isSuccess) {
        onNavigate('/');
      }
    } catch (err: any) {
      error(err.message || 'Qeydiyyat zamanı səhv qeydə alındı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen pt-28 pb-12 flex items-center justify-center px-4 relative z-10"
      id="register-page-container"
    >
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-8 shadow-xl relative overflow-hidden">
        
        {/* Abstract Gold Header Decorator */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gold-primary to-gold-dark" />

        <div className="text-center mb-8 flex flex-col items-center">
          <div className="mb-4 cursor-pointer scale-110" onClick={() => onNavigate('/')}>
            <Logo />
          </div>
          <h2 className="text-3xl font-serif font-bold text-navy-deep leading-tight">Qeydiyyat</h2>
          <p className="text-sm font-sans text-slate-400 mt-2">
            Naxçıvan Muxtar Respublikasının rəqəmsal vətəndaşı olun
          </p>
        </div>

        {/* Form container */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-sans">
          
          {/* Full Name field */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-700">Ad və Soyad</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                placeholder="Ömər Qasımov"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-gold-primary focus:bg-white text-sm text-slate-800 transition-all font-sans"
              />
            </div>
          </div>

          {/* Email field */}
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

          {/* Password field */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-700">Şifrə</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                placeholder="Minimum 8 simvol"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-gold-primary focus:bg-white text-sm text-slate-800 transition-all font-sans"
              />
            </div>
          </div>

          {/* Terms and conditions notice */}
          <p className="text-[10px] text-slate-400 leading-normal font-sans">
            "Hesab yarat" düyməsinə klikləməklə, Naxçıvan Rəqəmsal Portalı İstifadə Şərtlərini və Gizlilik Prinsiplərini qəbul etdiyinizi bildirirsiniz.
          </p>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold-primary hover:bg-gold-dark text-navy-deep font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 mt-2 hover:shadow-lg active:scale-97 cursor-pointer"
            id="register-submit-button"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-navy-deep border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Hesab Yaratmaq
                <UserCheck className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Alternate login flow anchor */}
        <div className="border-t border-slate-100 mt-8 pt-4 text-center text-xs text-slate-500">
          <p>
            Artıq hesabınız var?{' '}
            <button
              onClick={() => onNavigate('/login')}
              className="text-gold-primary font-bold hover:text-gold-dark hover:underline cursor-pointer"
            >
              Giriş səhifəsinə qayıt
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
