import React, { useState } from 'react';
import { Phone, MessageCircle, X, HelpCircle } from 'lucide-react';

export default function QuickContact() {
  const [isOpen, setIsOpen] = useState(false);

  const phoneNum = '+994 70 353 82 83';
  const phoneCallUrl = 'tel:+994703538283';
  const whatsappUrl = 'https://wa.me/994703538283';

  return (
    <div className="fixed bottom-6 left-6 z-50 font-sans">
      {/* Expanded contact bubble */}
      {isOpen ? (
        <div className="bg-white border-2 border-gold-primary/30 rounded-3xl p-5 shadow-[0_15px_30px_rgba(11,21,40,0.25)] flex flex-col gap-4 animate-fadeIn max-w-[280px]">
          <div className="flex items-center justify-between border-b pb-2.5">
            <div>
              <h5 className="font-serif font-black text-sm text-navy-deep">Bizimlə Birbaşa Əlaqə</h5>
              <p className="text-[10px] text-slate-400 mt-0.5">Hər gün 24/7 xidmətinizdəyik</p>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-navy-deep transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-2.5">
            {/* WhatsApp Link button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-97 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              WhatsApp ilə Yazın
            </a>

            {/* Direct Call button */}
            <a
              href={phoneCallUrl}
              className="bg-navy-deep hover:bg-navy-mid text-gold-primary font-sans font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-97 cursor-pointer border border-gold-primary/20"
            >
              <Phone className="w-4 h-4" />
              Zəng Edin ({phoneNum})
            </a>
          </div>

          <p className="text-[10px] text-slate-400 text-center leading-relaxed">
            Naxçıvan turları, otel rezervasiyaları və ümumi suallarınız barədə dərhal dəstək alın.
          </p>
        </div>
      ) : (
        /* Floating CTA action button */
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gold-primary hover:bg-gold-dark text-navy-deep rounded-full p-4 shadow-xl flex items-center justify-center gap-2.5 transition-all active:scale-95 border-2 border-white cursor-pointer group hover:ring-4 hover:ring-gold-primary/20"
          id="quick-contact-trigger"
        >
          <Phone className="w-5 h-5 animate-wiggle group-hover:scale-110 transition-transform" />
          <span className="text-xs font-black uppercase tracking-wider pr-1.5 hidden md:inline">ƏLAQƏ SAXLA</span>
        </button>
      )}
    </div>
  );
}
