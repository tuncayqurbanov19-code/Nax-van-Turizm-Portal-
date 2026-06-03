import React, { useEffect, useState } from 'react';
import { Compass, Search, Filter, RefreshCw, Sparkles } from 'lucide-react';
import TourCard from '../components/ui/TourCard';
import { api } from '../services/api';
import { Tour } from '../types';

interface ToursProps {
  onNavigate: (path: string) => void;
}

export default function Tours({ onNavigate }: ToursProps) {
  const [tours, setTours] = useState<Tour[]>([]);
  const [filteredTours, setFilteredTours] = useState<Tour[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bgUrl, setBgUrl] = useState('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1920');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Hamısı');
  const [selectedVehicle, setSelectedVehicle] = useState('Hamısı');
  const [selectedCompanyId, setSelectedCompanyId] = useState('Hamısı');
  const [selectedDuration, setSelectedDuration] = useState('Hamısı');
  const [maxPrice, setMaxPrice] = useState<number>(3000);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  const categories = ['Hamısı', 'Tarixi', 'Ekskursiya', 'Eko-Turizm', 'VIP', 'Fərdi'];

  const fetchTours = async () => {
    try {
      setLoading(true);
      const [toursData, companiesData] = await Promise.all([
        api.tours.getList(),
        api.companies.getList().catch(() => [])
      ]);
      setTours(toursData || []);
      setFilteredTours(toursData || []);
      setCompanies(companiesData || []);
    } catch (e) {
      console.error('Failed to load tours or companies in public catalog:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTours();
    async function loadBg() {
      try {
        const cfg = await api.settings.get();
        if (cfg?.backgroundSettings?.toursUrl) {
          setBgUrl(cfg.backgroundSettings.toursUrl);
        }
      } catch (err) {
        // Fallback
      }
    }
    loadBg();
  }, []);

  // Filter application helper
  useEffect(() => {
    let result = tours;

    if (selectedCategory !== 'Hamısı') {
      result = result.filter(t => t.category === selectedCategory);
    }

    if (selectedVehicle !== 'Hamısı') {
      result = result.filter(t => t.vehicleType === selectedVehicle);
    }

    if (selectedCompanyId !== 'Hamısı') {
      result = result.filter(t => t.companyId === selectedCompanyId);
    }

    if (selectedDuration !== 'Hamısı') {
      const days = Number(selectedDuration);
      result = result.filter(t => t.duration === days);
    }

    if (maxPrice && maxPrice > 0) {
      result = result.filter(t => t.price <= maxPrice);
    }

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.name.toLowerCase().includes(query) || 
        t.shortDescription.toLowerCase().includes(query) ||
        (t.companyName && t.companyName.toLowerCase().includes(query))
      );
    }

    setFilteredTours(result);
  }, [searchQuery, selectedCategory, selectedVehicle, selectedCompanyId, selectedDuration, maxPrice, tours]);

  return (
    <div className="min-h-screen pt-28 pb-16 relative z-10 max-w-7xl mx-auto px-4 md:px-12 font-sans antialiased" id="tours-page">
      
      {/* Dynamic Header Banner */}
      <div className="relative overflow-hidden rounded-3xl min-h-[220px] md:min-h-[280px] p-8 md:p-12 mb-10 flex flex-col justify-center text-white select-none shadow-xl border border-white/10" id="tours-banner">
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-700 hover:scale-[1.01]" 
            style={{ backgroundImage: `url("${bgUrl}")` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/95 via-navy-deep/80 to-navy-mid/45 backdrop-blur-[1px]" />
        </div>
        
        <div className="relative z-10 text-left max-w-2xl">
          <span className="bg-gold-primary/20 text-gold-primary border border-gold-primary/30 text-[10px] font-black tracking-widest px-3 py-1.5 rounded-full uppercase">
            Xüsusi Marşrutlar
          </span>
          <h1 className="text-3xl md:text-5xl font-serif font-black text-white mt-3 leading-tight drop-shadow-md">Tur Paketləri</h1>
          <p className="text-xs md:text-sm text-slate-200 mt-2.5 leading-relaxed">
            Naxçıvanın fərqli guşələrinə peşəkar bələdçi ilə bütöv təşkilatçılıq xidmətindən yararlanın.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar Section */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-md mb-10 flex flex-col gap-6" id="tours-filters-container">
        
        {/* Search Input box */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative w-full lg:max-w-md flex gap-2">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Turun adını, təşkilatçısını axtarın..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-gold-primary focus:bg-white text-sm text-slate-700 transition-all font-sans"
              />
            </div>
            <button
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              className={`px-4 py-3 border rounded-xl flex items-center gap-2 cursor-pointer transition-all text-sm font-sans font-semibold shrink-0 select-none ${
                isFilterExpanded || selectedVehicle !== 'Hamısı' || selectedCompanyId !== 'Hamısı' || selectedDuration !== 'Hamısı' || maxPrice < 3000
                  ? 'bg-navy-deep text-gold-primary border-navy-deep'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-navy-deep'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Süzgəclər</span>
            </button>
          </div>

          <div className="flex gap-2 w-full lg:w-auto overflow-x-auto shrink-0 pb-1 lg:pb-0" id="tour-category-badges">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`font-sans text-xs font-semibold px-4 py-2.5 rounded-xl border cursor-pointer whitespace-nowrap transition-all select-none ${
                  selectedCategory === cat
                    ? 'bg-gold-primary border-gold-primary text-navy-deep shadow-sm shadow-gold-primary/10'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-gold-primary/40 hover:text-gold-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Collapsible Filters block */}
        {isFilterExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100 font-sans text-xs animate-fade">
            {/* 1. Vehicle selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-semibold">Səyahət Nəqliyyatı</label>
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                <option value="Hamısı">Hamısı</option>
                <option value="Mercedes Sprinter (Premium)">Mercedes Sprinter (Premium)</option>
                <option value="Komfortlu Toyota Minivan">Komfortlu Toyota Minivan</option>
                <option value="Böyük Şəhərlərarası Neoplan Avtobus">Böyük Neoplan Avtobus</option>
                <option value="Off-road 4x4 Jeep SUV">Off-road 4x4 Jeep SUV</option>
                <option value="VIP Sedan Avtomobil">VIP Sedan Avtomobil</option>
              </select>
            </div>

            {/* 2. Company selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-semibold">Təşkilatçı Şirkət</label>
              <select
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                <option value="Hamısı font-semibold">Bütün Şirkətlər</option>
                {companies.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* 3. Duration selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-semibold">Müddət (Gün)</label>
              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                <option value="Hamısı">İstənilən müddət</option>
                <option value="1">1 Günlük Turlar</option>
                <option value="2">2 Günlük Turlar</option>
                <option value="3">3 Günlük Turlar</option>
                <option value="4">4 Günlük Turlar</option>
                <option value="5">5 Günlük Turlar</option>
              </select>
            </div>

            {/* 4. Price slider */}
            <div className="flex flex-col gap-1.5 justify-center">
              <div className="flex justify-between text-slate-500 font-semibold">
                <span>Maksimum Qiymət:</span>
                <span className="text-navy-deep font-bold font-mono">₼ {maxPrice}</span>
              </div>
              <input
                type="range"
                min="50"
                max="3000"
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-gold-primary"
              />
            </div>
          </div>
        )}
      </div>

      {/* Grid List view */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="bg-white border rounded-2xl h-[340px] shimmer" />
          ))}
        </div>
      ) : filteredTours.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center select-none shadow-sm flex flex-col items-center">
          <Compass className="w-16 h-16 text-slate-300 mb-4 animate-pulse" />
          <h4 className="font-serif text-xl font-bold text-slate-700">Heç bir tur paketi tapılmadı</h4>
          <p className="text-sm font-sans text-slate-400 mt-2 max-w-sm mx-auto">
            Axtardığınız meyarlara uyğun hazırda aktiv tur mövcud deyil. Lütfən axtarış sorğunuzu təmizləyin və ya başqa kateqoriya seçin.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('Hamısı');
              setSelectedVehicle('Hamısı');
              setSelectedCompanyId('Hamısı');
              setSelectedDuration('Hamısı');
              setMaxPrice(3000);
            }}
            className="mt-6 flex items-center gap-2 border border-gold-primary text-gold-primary hover:bg-gold-primary hover:text-navy-deep px-5 py-2.5 rounded-xl text-xs font-sans font-bold transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Meyarları Sıfırla
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTours.map((tour) => (
            <TourCard key={tour.id} tour={tour} onClick={(id) => onNavigate(`/tours/${id}`)} />
          ))}
        </div>
      )}

    </div>
  );
}
