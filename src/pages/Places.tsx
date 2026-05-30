import React, { useEffect, useState } from 'react';
import { Landmark, Search, Filter, RefreshCw } from 'lucide-react';
import PlaceCard from '../components/ui/PlaceCard';
import { api } from '../services/api';
import { Place } from '../types';

interface PlacesProps {
  onNavigate: (path: string) => void;
}

export default function Places({ onNavigate }: PlacesProps) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter criteria states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Hamısı');

  const categories = ['Hamısı', 'Tarixi', 'Mədəni', 'Dini', 'Təbii', 'Müalicəvi'];

  const fetchPlaces = async () => {
    try {
      setLoading(true);
      const data = await api.places.getList();
      setPlaces(data || []);
      setFilteredPlaces(data || []);
    } catch (e) {
      console.error('Failed to load places:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  // Filter application hooks
  useEffect(() => {
    let result = places;

    if (activeCategory !== 'Hamısı') {
      result = result.filter(p => p.category === activeCategory);
    }

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query) ||
        p.historicalPeriod.toLowerCase().includes(query)
      );
    }

    setFilteredPlaces(result);
  }, [searchQuery, activeCategory, places]);

  return (
    <div className="min-h-screen pt-28 pb-16 relative z-10 max-w-7xl mx-auto px-4 md:px-12" id="places-page">
      
      {/* Header heading */}
      <div className="text-center mb-16 select-none">
        <span className="bg-gold-primary/10 border border-gold-primary/30 text-gold-primary text-[10px] font-bold tracking-widest px-3 py-1.5 rounded-full uppercase">
          Eramızdan Əvvəlki İrsi
        </span>
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-navy-deep mt-3">Tarixi və Mədəni Məkanlar</h1>
        <div className="w-20 h-1 bg-gold-primary mx-auto mt-4 rounded-full" />
        <p className="text-sm md:text-base text-slate-500 font-sans mt-3 max-w-lg mx-auto">
          Ziyarətgahlar, qədim qalalar və kərpic memarlıq məktəbi nümunələri ilə bəşəriyyətin beşiyini səyahət edin.
        </p>
      </div>

      {/* Filter Header Box */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-md mb-10 flex flex-col gap-6" id="places-filters-panel">
        
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search box icon */}
          <div className="relative w-full md:max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Tarixi məkanın adını və ya dövrünü axtarın..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-gold-primary focus:bg-white text-sm text-slate-700 transition-all font-sans"
            />
          </div>

          {/* Categories tag badge scrollbar */}
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto shrink-0 pb-1 md:pb-0" id="places-category-toggles">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`font-sans text-xs font-semibold px-4 py-2.5 rounded-xl border cursor-pointer whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-gold-primary border-gold-primary text-navy-deep shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-gold-primary/40 hover:text-gold-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Listing layout grids */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="bg-white border rounded-2xl h-80 shimmer" />
          ))}
        </div>
      ) : filteredPlaces.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center select-none shadow-sm flex flex-col items-center">
          <Landmark className="w-16 h-16 text-slate-300 mb-4 animate-pulse" />
          <h4 className="font-serif text-xl font-bold text-slate-700">Heç bir mövqe tapılmadı</h4>
          <p className="text-sm font-sans text-slate-400 mt-2 max-w-sm mx-auto">
            Axtarış meyarlarınıza uyğun qədim tarixi və ya coğrafi məkan qeydə alınmamışdır. Zəhmət olmasa filtri dəyişin.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('Hamısı');
            }}
            className="mt-6 flex items-center gap-2 border border-gold-primary text-gold-primary hover:bg-gold-primary hover:text-navy-deep px-5 py-2.5 rounded-xl text-xs font-sans font-bold transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Meyarları Təmizlə
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPlaces.map((place) => (
            <PlaceCard key={place.id} place={place} onClick={(id) => onNavigate(`/places/${id}`)} />
          ))}
        </div>
      )}

    </div>
  );
}
