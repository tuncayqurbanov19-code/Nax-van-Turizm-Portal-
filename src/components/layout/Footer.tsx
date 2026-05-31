import React from 'react';
import { Mail, Phone, MapPin, Compass, Landmark, ShieldCheck } from 'lucide-react';
import { SettingsSchema } from '../../types';

interface FooterProps {
  onNavigate: (path: string) => void;
  settings?: SettingsSchema | null;
}

export default function Footer({ onNavigate, settings }: FooterProps) {
  // Social media mapping based on settings or defaults
  const socialFacebook = settings?.socialMediaLinks?.facebook || 'https://facebook.com';
  const socialInstagram = settings?.socialMediaLinks?.instagram || 'https://instagram.com';
  const socialTelegram = settings?.socialMediaLinks?.telegram || 'https://telegram.org';

  const socialLinks = [
    { label: 'F', href: socialFacebook, title: 'Facebook' },
    { label: 'I', href: socialInstagram, title: 'Instagram' },
    { label: 'T', href: socialTelegram, title: 'Telegram' },
  ];

  const addressText = settings?.contactInfo?.address || 'Naxçıvan şəhəri, Heydər Əliyev prospekti 22, Azərbaycan Respublikası';
  const phoneText = settings?.contactInfo?.phone || '+994 36 545 25 25';
  const emailText = settings?.contactInfo?.email || 'info@tourism.naxcivan.az';

  const footerCopyright = settings?.headerFooter?.footerText || '© 2026 Naxçıvan Rəqəmsal Turizm Platforması. Bütün hüquqlar qorunur.';

  return (
    <footer 
      id="main-footer"
      className="bg-navy-deep text-slate-300 pt-16 pb-8 border-t border-white/[0.05] relative z-10"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        
        {/* Column 1: Brand & Historical Description */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 select-none">
            {settings?.logoSettings?.logoFooterUrl ? (
              <img 
                src={settings.logoSettings.logoFooterUrl} 
                alt="Footer Logo" 
                className="max-h-12 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            ) : (
              <>
                <svg className="w-6 h-6 fill-gold-primary" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 6c.28 0 .5.22.5.5s-.22.5-.5.5-.5-.22-.5-.5.22-.5.5-.5z" />
                </svg>
                <span className="text-xl font-serif tracking-widest font-bold text-gold-primary">
                  {settings?.headerFooter?.headerTitle || 'NAXÇIVAN'}
                </span>
              </>
            )}
          </div>
          <p className="text-sm text-slate-400 font-sans leading-relaxed mt-2">
            Naxçıvan Muxtar Respublikasının rəsmi rəqəmsal turizm portalı. 
            Nuh Peyğəmbərin yurdu, Möminə Xatun diyarı və qəhrəmanlıq qalası Əlincə ilə tanış olun!
          </p>
          <div className="flex gap-3 mt-2">
            {/* Embedded social icons */}
            {socialLinks.map((item, idx) => (
              <a 
                key={idx} 
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                title={item.title}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-gold-primary hover:bg-gold-primary/10 transition-all cursor-pointer text-xs uppercase font-semibold font-mono"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>

        {/* Column 2: Fast UI Links */}
        <div className="flex flex-col gap-4">
          <h4 className="text-base font-serif font-bold text-white tracking-wider border-b border-white/5 pb-2">
            Sürətli Keçidlər
          </h4>
          <ul className="flex flex-col gap-2 text-sm font-sans">
            <li>
              <button 
                onClick={() => onNavigate('/')}
                className="hover:text-gold-primary transition-colors cursor-pointer"
              >
                Ana Səhifə
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavigate('/tours')}
                className="hover:text-gold-primary transition-colors cursor-pointer"
              >
                Səyahət Turları
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavigate('/hotels')}
                className="hover:text-gold-primary transition-colors cursor-pointer"
              >
                Lüks Otellər
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavigate('/places')}
                className="hover:text-gold-primary transition-colors cursor-pointer"
              >
                Tarixi və Mədəni Məkanlar
              </button>
            </li>
          </ul>
        </div>

        {/* Column 3: Contact details */}
        <div className="flex flex-col gap-4">
          <h4 className="text-base font-serif font-bold text-white tracking-wider border-b border-white/5 pb-2">
            Əlaqə Məlumatları
          </h4>
          <ul className="flex flex-col gap-3 text-sm font-sans text-slate-400">
            <li className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gold-primary shrink-0" />
              <span>{addressText}</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gold-primary shrink-0" />
              <span>{phoneText}</span>
            </li>

            <li className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gold-primary shrink-0" />
              <span>{emailText}</span>
            </li>
          </ul>
        </div>

        {/* Column 4: Quick badges */}
        <div className="flex flex-col gap-4">
          <h4 className="text-base font-serif font-bold text-white tracking-wider border-b border-white/5 pb-2">
            Rəsmi Dəstək
          </h4>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            Dövlət Şəhərsalma və Dövlət Turizm Agentliyinin yardımları ilə yaradılmışdır. Təhlükəsizlik təminatı rəsmi dövlət standartlarına cavab verir.
          </p>
          <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-3 mt-1">
            <ShieldCheck className="w-8 h-8 text-gold-primary shrink-0" />
            <div>
              <p className="text-xs font-semibold text-white font-sans leading-tight">Yüksək Güvənlik</p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">SSL Secured TLS 1.3</p>
            </div>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-12 mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-slate-500">
        <p>{footerCopyright}</p>
        <p className="flex gap-4">
          <span className="hover:text-slate-400 cursor-pointer">Gizlilik Siyasəti</span>
          <span>•</span>
          <span className="hover:text-slate-400 cursor-pointer">İstifadə Şərtləri</span>
        </p>
      </div>
    </footer>
  );
}
