import React, { useEffect, useState } from 'react';
import { Car, Search, ShieldCheck, MapPin, Award, Navigation } from 'lucide-react';
import { api } from '../services/api';

interface TransportProps {
  onNavigate: (path: string) => void;
}

const VEHICLES = [
  {
    id: 'car_1',
    name: "Mercedes-Benz Vito (Premium V-Class)",
    desc: "VIP qonaqların qarşılanması və fərdi mənzil başına rahat çatdırılması üçün mükəmməl klimat-kontrol, dəri salon, Wi-Fi bərbəstliyi ilə lüks mikroavtobus.",
    capacity: "6 nəfər",
    price: "80 AZN-dən",
    category: "VIP Transfer",
    iconColor: "text-amber-500",
    image: "https://images.unsplash.com/photo-1549643276-fdf2fab574f5?q=80&w=400"
  },
  {
    id: 'car_2',
    name: "Mercedes-Benz Sprinter (Komfort Siyahısı)",
    desc: "Batabat gölü, Əlincəqala və Əshabi-Kəhf kimi qrup gəzintilərinə ideal, audio/video sistemli, geniş yük bölməli və ultra yumşaq fərdi kreslolu marşrut xidməti.",
    capacity: "18 nəfər",
    price: "150 AZN-dən",
    category: "Qrup Transferi",
    iconColor: "text-blue-500",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=400"
  },
  {
    id: 'car_3',
    name: "Naxçıvan Beynəlxalq Hava Limanı Taksisi",
    desc: "Naxçıvandan gələn bütün uçuş qonaqlarının şəhər daxili otellərə və müalicə mərkəzlərinə rəsmi, təhlükəsiz və münasib qiymətlərlə 7/24 çatdırılması.",
    capacity: "4 nəfər",
    price: "10 AZN-dən",
    category: "Aeroport Taksi",
    iconColor: "text-emerald-500",
    image: "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?q=80&w=400"
  }
];

export default function Transport({ onNavigate }: TransportProps) {
  const [bgUrl, setBgUrl] = useState('https://images.unsplash.com/photo-1549643276-fdf2fab574f5?q=80&w=1920');

  useEffect(() => {
    async function loadBg() {
      try {
        const cfg = await api.settings.get();
        if (cfg?.backgroundSettings?.transportUrl) {
          setBgUrl(cfg.backgroundSettings.transportUrl);
        }
      } catch (e) {
        // Fallback
      }
    }
    loadBg();
  }, []);

  return (
    <div className="min-h-screen pt-28 pb-16 relative z-10 max-w-7xl mx-auto px-4 md:px-12 font-sans antialiased" id="transport-page">
      
      {/* Dynamic Header Banner */}
      <div className="relative overflow-hidden rounded-3xl min-h-[220px] md:min-h-[280px] p-8 md:p-12 mb-10 flex flex-col justify-center text-white select-none shadow-xl border border-white/10" id="transport-banner">
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-700 hover:scale-[1.01]" 
            style={{ backgroundImage: `url("${bgUrl}")` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/95 via-navy-deep/80 to-navy-mid/45 backdrop-blur-[1px]" />
        </div>
        
        <div className="relative z-10 text-left max-w-2xl">
          <span className="bg-gold-primary/20 text-gold-primary border border-gold-primary/30 text-[10px] font-black tracking-widest px-3 py-1.5 rounded-full uppercase">
            Sürətli & Komfortlu Səyahət
          </span>
          <h1 className="text-3xl md:text-5xl font-serif font-black text-white mt-3 leading-tight drop-shadow-md">Nəqliyyat & VIP Transferlər</h1>
          <p className="text-xs md:text-sm text-slate-200 mt-2.5 leading-relaxed">
            Naxçıvan Muxtar Respublikasında fərdi turlar, otel transferləri, qrup gəzintiləri və aeroport qarşılanmaları üçün yüksək sinif avtomobillərimiz və peşəkar sürücülərimiz xidmətinizdədir.
          </p>
        </div>
      </div>

      {/* Safety benefits blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 select-none">
        <div className="bg-white border p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-start gap-4">
          <ShieldCheck className="w-8 h-8 text-gold-primary shrink-0" />
          <div className="text-left">
            <h4 className="font-serif font-bold text-navy-deep text-sm">7/24 Sürücü Dəstəyi</h4>
            <p className="text-[11px] text-slate-500 mt-1">İstənilən saatda aeroport qarşılanması və otel transferi.</p>
          </div>
        </div>
        <div className="bg-white border p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-start gap-4">
          <Navigation className="w-8 h-8 text-gold-primary shrink-0" />
          <div className="text-left">
            <h4 className="font-serif font-bold text-navy-deep text-sm">Təhlükəsiz Marşrutlar</h4>
            <p className="text-[11px] text-slate-500 mt-1">Naxçıvanın bütün gəzməli dağlıq yerlərinə tam bələd sürücülər.</p>
          </div>
        </div>
        <div className="bg-white border p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-start gap-4">
          <Award className="w-8 h-8 text-gold-primary shrink-0" />
          <div className="text-left">
            <h4 className="font-serif font-bold text-navy-deep text-sm">Sabit Qiymət Zəmanəti</h4>
            <p className="text-[11px] text-slate-500 mt-1">Gizli xərclər olmadan rəsmi elan olunmuş rəqəmsal qiymətlər.</p>
          </div>
        </div>
      </div>

      {/* Vehicles Fleet list */}
      <div className="flex flex-col gap-8 text-left" id="fleet-list bg-white">
        <h3 className="font-serif text-xl font-bold text-navy-deep select-none">Mövcud Avtomobil Parkımız</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {VEHICLES.map((v) => (
            <div key={v.id} className="bg-white border rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between group">
              <div className="h-52 overflow-hidden relative">
                <img src={v.image} alt={v.name} className="w-full h-full object-cover group-hover:scale-103 transition-all duration-300 lazy-load" loading="lazy" referrerPolicy="no-referrer" />
                <div className="absolute top-4 left-4 bg-gold-primary text-navy-deep text-[10px] font-black tracking-wider uppercase py-1.5 px-3.5 rounded-lg shadow-sm">
                  {v.category}
                </div>
              </div>
              <div className="p-6 md:p-8 flex-1 flex flex-col justify-between gap-4">
                <div className="text-left flex flex-col gap-2">
                  <h4 className="font-serif font-bold text-navy-deep text-base truncate">{v.name}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-sans">{v.desc}</p>
                </div>

                <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-mono">
                  <div className="text-left">
                    <span className="text-[10px] text-slate-400 block font-sans">KAPASİTET</span>
                    <span className="font-sans font-bold text-navy-deep">{v.capacity}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-sans">İLKİN QİYMƏT</span>
                    <span className="text-base font-black text-gold-primary">{v.price}</span>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('/tours')}
                  className="w-full bg-navy-deep hover:bg-gold-primary hover:text-navy-deep text-gold-primary font-bold py-3 rounded-xl transition-all font-sans text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Car className="w-4 h-4" />
                  Məsafəyə Görə Sifariş
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
