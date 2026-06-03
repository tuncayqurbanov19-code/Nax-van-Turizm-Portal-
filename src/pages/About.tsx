import React, { useEffect, useState } from 'react';
import { Award, ShieldCheck, Heart, Sparkles, MapPin } from 'lucide-react';
import { api } from '../services/api';

interface AboutProps {
  onNavigate: (path: string) => void;
}

export default function About({ onNavigate }: AboutProps) {
  const [bgUrl, setBgUrl] = useState('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1920');

  useEffect(() => {
    async function loadBg() {
      try {
        const cfg = await api.settings.get();
        if (cfg?.backgroundSettings?.aboutUrl) {
          setBgUrl(cfg.backgroundSettings.aboutUrl);
        }
      } catch (e) {
        // Fallback
      }
    }
    loadBg();
  }, []);

  return (
    <div className="min-h-screen pt-28 pb-16 relative z-10 max-w-7xl mx-auto px-4 md:px-12 font-sans antialiased" id="about-page">
      
      {/* Dynamic Header Banner */}
      <div className="relative overflow-hidden rounded-3xl min-h-[220px] md:min-h-[280px] p-8 md:p-12 mb-10 flex flex-col justify-center text-white select-none shadow-xl border border-white/10" id="about-banner">
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-700 hover:scale-[1.01]" 
            style={{ backgroundImage: `url("${bgUrl}")` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/95 via-navy-deep/80 to-navy-mid/45 backdrop-blur-[1px]" />
        </div>
        
        <div className="relative z-10 text-left max-w-2xl">
          <span className="bg-gold-primary/20 text-gold-primary border border-gold-primary/30 text-[10px] font-black tracking-widest px-3 py-1.5 rounded-full uppercase">
            Platformamızın Fəlsəfəsi
          </span>
          <h1 className="text-3xl md:text-5xl font-serif font-black text-white mt-3 leading-tight drop-shadow-md">Haqqımızda & Missiyamız</h1>
          <p className="text-xs md:text-sm text-slate-200 mt-2.5 leading-relaxed">
            Naxçıvan Muxtar Respublikasının qədim bəşəri mədəniyyətini, bənzərsiz təbii mənzərələrini və müalicəvi duz mağaralarını dünyaya rəqəmsal olaraq tanıdırıq.
          </p>
        </div>
      </div>

      {/* Main Narrative Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-left mb-16">
        <div className="flex flex-col gap-5">
          <span className="text-[10px] font-black tracking-widest uppercase text-gold-primary bg-gold-primary/10 border py-1.5 px-3 rounded-lg w-max leading-none select-none">Qədim Sivilizasiyanın Beşiyi</span>
          <h2 className="font-serif font-bold text-navy-deep text-2xl md:text-3.5xl leading-tight select-none">Nə üçün biz? Portalımızın Əsas Mövqeyi</h2>
          <p className="text-sm text-slate-500 leading-relaxed font-sans">
            Biz Naxçıvan Muxtar Respublikasının rəsmi turizm və təbliğat portalıyıq. Məqsədimiz dünyanın hər yerindən gələn səyahətçilər, turistlər və tarix həvəskarları üçün Naxçıvanın qapılarını tam rəqəmsal, asan və qüsursuz şəkildə açmaqdır.
          </p>
          <p className="text-sm text-slate-500 leading-relaxed font-sans">
            Naxçıvan yalnız füsunkar təbiəti ilə deyil, həm də Nuh peyğəmbərin qəbri daxil olmaqla dini abidələri, Batabat alp gölünün üzən adası, Duzdağ Fizioterapiya Mərkəzi və mənəvi gücü olan Əshabi-Kəhf inanc mağarası ilə bənzərsiz bir məkandır. Portalımız vasitəsilə ən uyğun otelləri rezerv edə, fərdi turlar tərtib edə və səyahətinizi peşəkarlara etibar edə bilərsiniz.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 select-none">
          <div className="bg-white border p-6 rounded-2xl shadow-sm hover:shadow-md transition-all text-left flex flex-col gap-2.5">
            <Award className="w-8 h-8 text-gold-primary" />
            <h4 className="font-serif font-bold text-navy-deep text-sm">Zəngin Təcrübə</h4>
            <p className="text-[11px] text-slate-500 font-sans leading-relaxed">20 ildən artıq muxtar respublika daxilində peşəkar tur rəhbərliyi zəmanəti.</p>
          </div>
          <div className="bg-white border p-6 rounded-2xl shadow-sm hover:shadow-md transition-all text-left flex flex-col gap-2.5">
            <ShieldCheck className="w-8 h-8 text-gold-primary" />
            <h4 className="font-serif font-bold text-navy-deep text-sm border-gold-primary">Rəsmi Zəmanət</h4>
            <p className="text-[11px] text-slate-500 font-sans leading-relaxed">Təhlükəsiz yerli fəaliyyət lisenziyaları və sığorta imkanları.</p>
          </div>
          <div className="bg-white border p-6 rounded-2xl shadow-sm hover:shadow-md transition-all text-left flex flex-col gap-2.5">
            <Heart className="w-8 h-8 text-gold-primary" />
            <h4 className="font-serif font-bold text-navy-deep text-sm">Canlı Qonaqpərvərlik</h4>
            <p className="text-[11px] text-slate-500 font-sans leading-relaxed">Yerli Naxçıvan mətbəxinin (alana, Ordubad qayqanağı) dadları ilə qarşılanma.</p>
          </div>
          <div className="bg-white border p-6 rounded-2xl shadow-sm hover:shadow-md transition-all text-left flex flex-col gap-2.5">
            <Sparkles className="w-8 h-8 text-gold-primary" />
            <h4 className="font-serif font-bold text-navy-deep text-sm">Rəqəmsal Rahatlıq</h4>
            <p className="text-[11px] text-slate-500 font-sans leading-relaxed">Real-vaxt SMS/WhatsApp inteqrasiyalı rəqəmsal bilet təsdiqi.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
