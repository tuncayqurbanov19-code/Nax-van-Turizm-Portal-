import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Eye, EyeOff, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';

interface AdminLoginProps {
  onNavigate: (path: string) => void;
}

export default function AdminLogin({ onNavigate }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const { success, error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      error('Bütün xanaları doldurun.');
      return;
    }

    try {
      setSubmitting(true);
      // Let's pass 'admin_login_gate' to specify that this is the admin login flow
      const role = await login(email, password);
      
      if (role === 'admin') {
        success('Admin panelinə uğurlu giriş edildi.', 'Xoş Gəldiniz');
        onNavigate('/admin');
      } else {
        error('Giriş rədd edildi: Səlahiyyətiniz yoxdur.', 'Səlahiyyət Xətası');
      }
    } catch (err: any) {
      error(err.message || 'Məlumatlar yoxlanılarkən səhv yarandı.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      className="min-h-screen pt-32 pb-16 flex items-center justify-center px-4 bg-slate-950 text-white relative z-10"
      id="admin-secure-portal"
    >
      {/* Abstract dark digital web grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-25 pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Subtle top indicator bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600" />

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center mx-auto mb-4 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <Lock className="w-6 h-6" />
          </div>
          
          <h2 className="text-2xl font-serif font-extrabold tracking-tight text-white select-none">
            Secure Admin Portal
          </h2>
          <p className="text-xs font-mono text-slate-500 mt-2 select-none uppercase tracking-wider">
            Sistem İdarəçisi Autentifikasiyası
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 font-sans">
          
          {/* Email input field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold select-none">
              E-Poçt Ünvanı
            </label>
            <input
              type="email"
              required
              autoFocus
              autoComplete="email"
              placeholder="admin@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition-all font-sans text-white placeholder-slate-600"
            />
          </div>

          {/* Password input field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold select-none">
              Təhlükəsizlik Şifrəsi
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-4 pr-11 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition-all font-sans text-white placeholder-slate-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350 p-1 cursor-pointer transition-colors"
                title={showPassword ? 'Gizlə' : 'Göstər'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-sans font-extrabold tracking-wide py-3.5 rounded-xl text-sm shadow-lg shadow-amber-500/10 cursor-pointer transition-all active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {submitting ? 'Yoxlanılır...' : (
              <>
                <span>Sistemə Daxil Ol</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </>
            )}
          </button>

        </form>

        <div className="mt-8 border-t border-slate-800/60 pt-4 text-center">
          <p className="text-[10px] font-mono text-slate-600 select-none uppercase tracking-widest leading-normal">
            Unauthorized access is strictly monitored & logged.
          </p>
        </div>

      </div>
    </div>
  );
}
