import React, { useEffect, useState } from 'react';
import { Landmark, Search, Compass, MapPin, Sparkles } from 'lucide-react';
import { api } from '../services/api';

interface MuseumsProps {
  onNavigate: (path: string) => void;
}

const DEFAULT_MUSEUMS = [
  {
    id: 'mus_1',
    name: "Naxçıvan Dövlət Tarix Muzeyi",
    desc: "Muxtar Respublikanın ən qədim muzeyi olub, qədim dövrlərdən bu günə qədər olan dövrü əks etdirən minlərlə etnoqrafik, arxeoloji və memarlıq eksponatlarına ev sahibliyi edir.",
    location: "Naxçıvan şəhəri, İstiqlal küçəsi.",
    established: "1932",
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=400",
    workHours: "09:00 - 18:00 (Hər gün)"
  },
  {
    id: 'mus_2',
    name: "Naxçıvan Xalça Muzeyi",
    desc: "Qədim milli toxuculuq sənətinin şah əsərlərini qoruyan, xovlu və xovsuz Naxçıvan xalçalarının bənzərsiz nümunələrini canlandıran beynəlxalq dərəcəli mərkəz.",
    location: "Naxçıvan şəhəri, Heydər Əliyev prospekti.",
    established: "1998",
    image: "https://images.unsplash.com/photo-1549643276-fdf2fab574f5?q=80&w=400",
    workHours: "09:00 - 18:00 (Hər gün)"
  },
  {
    id: 'mus_3',
    name: "Hüseyn Cavidin Ev Muzeyi",
    desc: "Böyük Azərbaycan şairi və dramaturqu Hüseyn Cavidin ömür yolunu, fəlsəfi yaradıcılığını və repressiya illərinin xatirəsini işıqlandıran mənəvi ev ziyarətgahı.",
    location: "Naxçıvan şəhəri, Hüseyn Cavid məqbərəsinin yaxınlığı.",
    established: "1984",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=400",
    workHours: "09:00 - 18:00 (Bazar ertəsi istisna)"
  },
  {
    id: 'mus_4',
    name: "Heydər Əliyev Muzeyi",
    desc: "Ümummilli lider Heydər Əliyevin uşaqlıq, gənclik, rəhbərlik illərini və Naxçıvandakı tarixi fəaliyyətini əks etdirən səsli sənədlər, fotoşəkillər və şəxsi arxiv kolleksiyası.",
    location: "Naxçıvan şəhəri, Atatürk küçəsi.",
    established: "1999",
    image: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=400",
    workHours: "09:00 - 18:00 (Hər gün)"
  }
];

export default function Museums({ onNavigate }: MuseumsProps) {
  const [bgUrl, setBgUrl] = useState('https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1920');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadBg() {
      try {
        const cfg = await api.settings.get();
        if (cfg?.backgroundSettings?.museumsUrl) {
          setBgUrl(cfg.backgroundSettings.museumsUrl);
        }
      } catch (e) {
        // Fallback
      }
    }
    loadBg();
  }, []);

  const filtered = DEFAULT_MUSEUMS.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-28 pb-16 relative z-10 max-w-7xl mx-auto px-4 md:px-12 font-sans antialiased" id="museums-page">
      
      {/* Dynamic Header Banner */}
      <div className="relative overflow-hidden rounded-3xl min-h-[220px] md:min-h-[280px] p-8 md:p-12 mb-10 flex flex-col justify-center text-white select-none shadow-xl border border-white/10" id="museums-banner">
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-700 hover:scale-[1.01]" 
            style={{ backgroundImage: `url("${bgUrl}")` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/95 via-navy-deep/80 to-navy-mid/45 backdrop-blur-[1px]" />
        </div>
        
        <div className="relative z-10 text-left max-w-2xl">
          <span className="bg-gold-primary/20 text-gold-primary border border-gold-primary/30 text-[10px] font-black tracking-widest px-3 py-1.5 rounded-full uppercase">
            Mədəni Miras Mərkəzləri
          </span>
          <h1 className="text-3xl md:text-5xl font-serif font-black text-white mt-3 leading-tight drop-shadow-md">Naxçıvan Muzeyləri</h1>
          <p className="text-xs md:text-sm text-slate-200 mt-2.5 leading-relaxed">
            Naxçıvan Muxtar Respublikasının zəngin mədəni irsini, qədim xalçaçılıq, tarixləndirilmiş arxeologiya sənətini muzeylərimiz vasitəsilə kəşf edin.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm mb-10 flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Muzey adı və ya qiymətli eksponat axtarışı..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-gold-primary focus:bg-white text-xs select-text font-sans"
          />
        </div>
        <div className="hidden sm:flex items-center gap-1.5 bg-gold-primary/10 text-gold-primary py-2.5 px-4 rounded-xl border border-gold-primary/20 text-xs font-bold leading-none select-none">
          <Sparkles className="w-4 h-4 animate-bounce shrink-0" />
          <span>Giriş bütün muzeylərə sərbəstdir</span>
        </div>
      </div>

      {/* Grid of Museums */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8" id="museums-grid">
        {filtered.map((mus) => (
          <div key={mus.id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            
            <div className="h-56 overflow-hidden relative">
              <img src={mus.image} alt={mus.name} className="w-full h-full object-cover group-hover:scale-103 transition-all duration-300 lazy-load" loading="lazy" referrerPolicy="no-referrer" />
              <div className="absolute top-4 left-4 bg-navy-deep/80 backdrop-blur-md text-gold-primary text-[10px] font-mono tracking-wider py-1 px-2.5 border border-gold-primary/30 rounded-lg">
                Təsis ili: {mus.established}
              </div>
            </div>

            <div className="p-6 md:p-8 text-left flex-1 flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-2">
                <h3 className="font-serif font-black text-navy-deep text-lg hover:text-gold-primary cursor-pointer transition-colors leading-snug">{mus.name}</h3>
                <p className="text-xs text-slate-500 font-sans leading-relaxed">{mus.desc}</p>
              </div>

              <div className="pt-4 border-t border-slate-50 flex flex-col gap-2.5 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gold-primary shrink-0" />
                  <span>{mus.location}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] bg-slate-50 py-2 px-3 rounded-xl border">
                  <span className="font-semibold text-slate-600">🕰️ İş saatları:</span>
                  <span className="font-mono text-navy-mid font-bold">{mus.workHours}</span>
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
