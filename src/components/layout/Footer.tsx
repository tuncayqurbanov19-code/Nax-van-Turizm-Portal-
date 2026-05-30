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
            <svg className="w-6 h-6 fill-gold-primary" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 6c.28 0 .5.22.5.5s-.22.5-.5.5-.5-.22-.5-.5.22-.5.5-.5z" />
            </svg>
            <span className="text-xl font-serif tracking-widest font-bold text-gold-primary">
              {settings?.headerFooter?.headerTitle || 'NAXÇIVAN'}
            </span>
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
              <a href="https://wa.me/9940703538283" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-emerald-400 transition-colors cursor-pointer">
                <svg className="w-4 h-4 text-emerald-500 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M12.031 7.24c-.221-.01-.433.048-.614.167s-.3.303-.321.52c-.042.433.167.854.52 1.096l.163.1c.42.27.734.693.856 1.189a2.531 2.531 0 0 1-1.025 2.651 2.508 2.508 0 0 1-2.736.143l-.151-.091a1.983 1.983 0 0 0-1.896-.062l-1.424.712a.991.991 0 0 0-.441 1.258c.203.447.698.694 1.178.583a4.512 4.512 0 0 0 2.92-1.921c1.196-1.543 1.01-3.738-.415-5.069a1.002 1.002 0 0 0-.649-.247zm-5.753-1.63L7.7 4.192c.32-.619.083-1.385-.532-1.71a1.205 1.205 0 0 0-1.254.075L4.49 3.63a3.529 3.529 0 0 0-1.353 3.987l1.015 3.32a15.352 15.352 0 0 0 7.828 9.387c1.3.565 2.766.452 3.974-.316l2.128-1.344c.594-.375.768-1.164.39-1.76l-1.812-2.859a1.288 1.288 0 0 0-1.802-.382l-1.455.932a.49.49 0 0 1-.58-.027 10.422 10.422 0 0 1-4.73-4.757.48.48 0 0 1 .012-.486l1.006-1.383a1.288 1.288 0 0 0-.17-1.815zm15.779 6.38a10.038 10.038 0 0 1-10.047 10.016 10.03 10.03 0 0 1-4.747-1.19l-5.69 1.493L3.1 15.688A10.035 10.035 0 0 1 1.991 12c0-5.54 4.51-10.016 10.066-10.016a10.038 10.038 0 0 1 10.0 10.016z" />
                </svg>
                <span className="hover:underline">WhatsApp: +994 70 353 82 83</span>
              </a>
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
