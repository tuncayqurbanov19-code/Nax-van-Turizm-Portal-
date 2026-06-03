import React, { useEffect, useState } from 'react';
import { Building, Search, SlidersHorizontal, RefreshCw, Calendar, Tag, Gift, Users } from 'lucide-react';
import HotelCard from '../components/ui/HotelCard';
import { api } from '../services/api';
import { Hotel } from '../types';

interface HotelsProps {
  onNavigate: (path: string) => void;
}

export default function Hotels({ onNavigate }: HotelsProps) {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [bgUrl, setBgUrl] = useState('https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1920');

  // Search form states
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guestsCount, setGuestsCount] = useState('1');

  // Sidebar filter states
  const [starFilters, setStarFilters] = useState<number[]>([]);
  const [priceLimit, setPriceLimit] = useState(300);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const amenitiesList = [
    'WiFi',
    'Hovuz',
    'Restoran',
    'Spa',
    'Parkinq',
    'Fitness',
    'Otaq Xidməti',
    'Lift',
    'Xizək İcarəsi'
  ];

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const data = await api.hotels.getList();
      setHotels(data || []);
      setFilteredHotels(data || []);
    } catch (e) {
      console.error('Failed to load hotels:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
    async function loadBg() {
      try {
        const cfg = await api.settings.get();
        if (cfg?.backgroundSettings?.hotelsUrl) {
          setBgUrl(cfg.backgroundSettings.hotelsUrl);
        }
      } catch (err) {
        // Fallback
      }
    }
    loadBg();
  }, []);

  // Filter actions logic
  useEffect(() => {
    let result = hotels;

    // Star rating check
    if (starFilters.length > 0) {
      result = result.filter(h => starFilters.includes(h.stars));
    }

    // Price limits (based on lowest-rate room)
    result = result.filter(h => {
      const basePrice = h.rooms.length > 0 ? Math.min(...h.rooms.map(r => r.price)) : 100;
      return basePrice <= priceLimit;
    });

    // Amenities match
    if (selectedAmenities.length > 0) {
      result = result.filter(h => 
        selectedAmenities.every(amenity => h.amenities.includes(amenity))
      );
    }

    setFilteredHotels(result);
  }, [starFilters, priceLimit, selectedAmenities, hotels]);

  // Star select toggles
  const handleStarToggle = (stars: number) => {
    setStarFilters(prev => 
      prev.includes(stars) ? prev.filter(s => s !== stars) : [...prev, stars]
    );
  };

  // Amenities checklist toggles
  const handleAmenityToggle = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In high-fidelity simulation, arrival scheduling is mapped filters
  };

  return (
    <div className="min-h-screen pt-28 pb-16 relative z-10 max-w-7xl mx-auto px-4 md:px-12 font-sans antialiased" id="hotels-page">
      
      {/* Dynamic Header Banner */}
      <div className="relative overflow-hidden rounded-3xl min-h-[220px] md:min-h-[280px] p-8 md:p-12 mb-10 flex flex-col justify-center text-white select-none shadow-xl border border-white/10" id="hotels-banner">
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-700 hover:scale-[1.01]" 
            style={{ backgroundImage: `url("${bgUrl}")` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/95 via-navy-deep/80 to-navy-mid/45 backdrop-blur-[1px]" />
        </div>
        
        <div className="relative z-10 text-left max-w-2xl">
          <span className="bg-gold-primary/20 text-gold-primary border border-gold-primary/30 text-[10px] font-black tracking-widest px-3 py-1.5 rounded-full uppercase leading-none">
            Lüks Qonaqlama
          </span>
          <h1 className="text-3xl md:text-5xl font-serif font-black text-white mt-3 leading-tight drop-shadow-md">Otellər və İstirahət Mərkəzləri</h1>
          <p className="text-xs md:text-sm text-slate-200 mt-2.5 leading-relaxed">
            Arzularınızdakı premium Naxçıvan tətilini təminatlı otaq bronlaşdırma qiymətləri ilə planlaşdırın.
          </p>
        </div>
      </div>

      {/* Top horizontal calendar scheduling bar */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-lg mb-10" id="hotels-booking-horizontal-bar">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end font-sans">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 leading-none">
              <Calendar className="w-4 h-4 text-gold-primary" />
              Giriş Tarixi
            </label>
            <input
              type="date"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-gold-primary text-sm text-slate-700 transition-colors font-sans"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 leading-none">
              <Calendar className="w-4 h-4 text-gold-primary" />
              Çıxış Tarixi
            </label>
            <input
              type="date"
              value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-gold-primary text-sm text-slate-700 transition-colors font-sans"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 leading-none">
              <Users className="w-4 h-4 text-gold-primary" />
              Qonaq Sayı
            </label>
            <select
              value={guestsCount}
              onChange={(e) => setGuestsCount(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-gold-primary text-sm text-slate-700 transition-colors font-sans"
            >
              <option value="1">1 Nəfər</option>
              <option value="2">2 Nəfər</option>
              <option value="3">3 Nəfər</option>
              <option value="4">4 Nəfər</option>
              <option value="6">Ailəvi (5+)</option>
            </select>
          </div>

          <button
            type="submit"
            className="bg-gold-primary hover:bg-gold-dark text-navy-deep font-sans font-bold py-3.5 rounded-xl cursor-pointer transition-all active:scale-97 text-center w-full flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            Meyarlarla Axtar
          </button>
        </form>
      </div>

      {/* Main Two Column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Sidebar Filter Column (4 spans) */}
        <div 
          className="lg:col-span-4 bg-white border border-slate-100 p-6 rounded-3xl shadow-md flex flex-col gap-6 sticky top-24 z-10"
          id="hotels-filters-sidebar"
        >
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 select-none">
            <span className="font-serif text-lg font-bold text-navy-deep flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-gold-primary" />
              Filtrlər
            </span>
            <button
              onClick={() => {
                setStarFilters([]);
                setPriceLimit(300);
                setSelectedAmenities([]);
              }}
              className="text-xs font-semibold text-slate-400 hover:text-gold-primary transition-colors cursor-pointer"
            >
              Sıfırla
            </button>
          </div>

          {/* Star Filters checklist */}
          <div className="flex flex-col gap-3 font-sans select-none">
            <h4 className="text-sm font-semibold text-slate-700">Ulduz Sayı</h4>
            <div className="flex flex-col gap-2.5">
              {[5, 4, 3].map((star) => (
                <label key={star} className="flex items-center gap-2.5 text-sm text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={starFilters.includes(star)}
                    onChange={() => handleStarToggle(star)}
                    className="w-4 h-4 rounded text-gold-primary accent-gold-primary cursor-pointer"
                  />
                  <span>{star} Ulduzlu Lüks</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="flex flex-col gap-3 font-sans select-none">
            <div className="flex justify-between items-center text-sm font-semibold text-slate-700">
              <h4>Maksimum Gecəlik Qiymət</h4>
              <span className="text-gold-primary font-mono font-bold">₼ {priceLimit}</span>
            </div>
            <input
              type="range"
              min={50}
              max={350}
              step={10}
              value={priceLimit}
              onChange={(e) => setPriceLimit(Number(e.target.value))}
              className="w-full accent-gold-primary cursor-ew-resize h-1.5 bg-slate-100 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>₼ 50</span>
              <span>₼ 350+</span>
            </div>
          </div>

          {/* Amenities criteria checks */}
          <div className="flex flex-col gap-3 font-sans select-none">
            <h4 className="text-sm font-semibold text-slate-700">Xidmətlər & Şərait</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              {amenitiesList.map((amenity) => (
                <label key={amenity} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedAmenities.includes(amenity)}
                    onChange={() => handleAmenityToggle(amenity)}
                    className="w-3.5 h-3.5 rounded text-gold-primary accent-gold-primary cursor-pointer"
                  />
                  <span className="truncate">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Fast Campaign Ad badge */}
          <div className="bg-amber-50 border border-gold-primary/20 rounded-2xl p-4 flex gap-3 select-none">
            <Gift className="w-10 h-10 text-gold-primary shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-800 font-sans leading-tight">Yaz Kampaniyası!</p>
              <p className="text-[10px] text-amber-700 font-sans mt-1 leading-relaxed">
                Təbriz Premium mehmanxanasında turlar vasitəsilə 15% endirimlər mövcuddur. Endirim kuponunu bələdçidən istəyin.
              </p>
            </div>
          </div>

        </div>

        {/* Right Hotels List Grid (8 spans) */}
        <div className="lg:col-span-8 flex flex-col gap-6" id="hotels-grid-section">
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="bg-white border rounded-2xl h-80 shimmer" />
              ))}
            </div>
          ) : filteredHotels.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center select-none shadow-sm flex flex-col items-center">
              <Building className="w-16 h-16 text-slate-300 mb-4 animate-pulse" />
              <h4 className="font-serif text-xl font-bold text-slate-700">Uyğun otel tapılmadı</h4>
              <p className="text-sm font-sans text-slate-400 mt-2 max-w-sm mx-auto">
                Seçdiyiniz kriteriyalara və qiymət səviyyəsinə uyğun heç bir lüks mehmanxana tapılmadı. Lütfən filtrləri sıfırlayın.
              </p>
              <button
                onClick={() => {
                  setStarFilters([]);
                  setPriceLimit(300);
                  setSelectedAmenities([]);
                }}
                className="mt-6 flex items-center gap-2 border border-gold-primary text-gold-primary hover:bg-gold-primary hover:text-navy-deep px-5 py-2.5 rounded-xl text-xs font-sans font-bold transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Meyarları Sıfırla
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredHotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} onClick={(id) => onNavigate(`/hotels/${id}`)} />
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
