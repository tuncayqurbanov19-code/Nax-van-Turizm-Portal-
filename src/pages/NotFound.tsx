import React from 'react';
import { HelpCircle, ArrowLeft } from 'lucide-react';

interface NotFoundProps {
  onNavigate: (path: string) => void;
}

export default function NotFound({ onNavigate }: NotFoundProps) {
  return (
    <div 
      className="min-h-screen pt-28 pb-12 flex flex-col items-center justify-center text-center px-4 relative z-10"
      id="notfound-page-container"
    >
      <div className="w-full max-w-sm bg-white border border-slate-100 rounded-3xl p-8 shadow-xl">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-gold-primary mx-auto mb-6">
          <HelpCircle className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-serif font-bold text-navy-deep leading-tight">Səhifə Tapılmadı</h2>
        <p className="text-sm font-sans text-slate-500 mt-3 leading-relaxed">
          Göstərdiyiniz URL və ya axtardığınız bölmə portal daxilində mövcud deyil. Lütfən ana səhifəyə geri dönün.
        </p>
        <button
          onClick={() => onNavigate('/')}
          className="w-full bg-gold-primary hover:bg-gold-dark text-navy-deep font-sans font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-8 active:scale-97 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Ana Səhifəyə Qayıt
        </button>
      </div>
    </div>
  );
}
