import React, { useEffect, useState } from 'react';
import { Compass, Landmark, ArrowRight, Activity, Award, Smile, ChevronDown, CalendarDays, Utensils, BookOpen, Heart, MessageSquare, ExternalLink } from 'lucide-react';
import BackgroundSilhouettes from '../components/layout/BackgroundSilhouettes';
import TourCard from '../components/ui/TourCard';
import HotelCard from '../components/ui/HotelCard';
import PlaceCard from '../components/ui/PlaceCard';
import { api } from '../services/api';
import { Tour, Hotel, Place, Restaurant, Blog, HeroSlider, SettingsSchema, Testimonial } from '../types';
import StarRating from '../components/ui/StarRating';

interface HomeProps {
  onNavigate: (path: string) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const [tours, setTours] = useState<Tour[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [settings, setSettings] = useState<SettingsSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSliderIndex, setActiveSliderIndex] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const [toursList, hotelsList, placesList, rests, blgs, cfg] = await Promise.all([
          api.tours.getList(),
          api.hotels.getList(),
          api.places.getList(),
          api.restaurants.getList(),
          api.blogs.getList(),
          api.settings.get()
        ]);
        setTours(toursList || []);
        setHotels(hotelsList || []);
        setPlaces(placesList || []);
        setRestaurants(rests || []);
        setBlogs(blgs || []);
        setSettings(cfg || null);
      } catch (e) {
        console.error('Failed to fetch home page data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Automatic slide cycler
  useEffect(() => {
    const slidersCount = settings?.heroSliders?.length || 1;
    if (slidersCount <= 1) return;

    const interval = setInterval(() => {
      setActiveSliderIndex((prev) => (prev + 1) % slidersCount);
    }, 5000);

    return () => clearInterval(interval);
  }, [settings?.heroSliders]);

  return (
    <div className="relative w-full" id="home-page-container">
      
      {/* 1. Hero Section */}
      <section 
        id="home-hero"
        className="relative w-full h-[100vh] flex items-center justify-center overflow-hidden bg-navy-deep select-none"
      >
        {/* Background visual banner image with deep overlay gradient */}
        {settings?.heroSliders && settings.heroSliders.length > 0 ? (
          settings.heroSliders.map((slider, index) => (
            <div 
              key={index}
              className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out ${
                index === activeSliderIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
              }`}
              style={{
                backgroundImage: `url("${slider.image}")`,
              }}
            />
          ))
        ) : (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
            style={{
              backgroundImage: `url("${settings?.welcomeSettings?.backgroundImageUrl || 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=1920&auto=format&fit=crop'}")`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-tr from-navy-deep/95 via-navy-deep/[0.60] to-navy-deep/20" />

        {/* Localized silhouettes with 0.06 highlight visibility during Hero visual intro */}
        <BackgroundSilhouettes opacityOverride={0.06} />

        {/* Centered visual content */}
        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 md:px-12 text-center flex flex-col items-center">
          
          {/* Tagline Badge */}
          <div className="border border-gold-primary/40 bg-gold-primary/10 text-gold-primary text-xs font-bold tracking-widest px-4 py-2 rounded-full mb-6 uppercase inline-flex items-center gap-2">
            <span>🌍</span> {settings?.welcomeSettings?.badgeText || 'Naxçıvanı Kəşf Et'}
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white tracking-tight leading-tight max-w-4xl text-balance">
            {settings?.heroSliders && settings.heroSliders.length > 0
              ? settings.heroSliders[activeSliderIndex].title
              : (settings?.welcomeSettings?.titleText || 'Naxçıvanın Gözəlliklərini Kəşf Et')}
          </h1>

          {/* Subtitle */}
          <p className="text-base md:text-xl font-sans text-slate-300 font-medium max-w-2xl mt-6 leading-relaxed">
            {settings?.heroSliders && settings.heroSliders.length > 0
              ? settings.heroSliders[activeSliderIndex].subtitle
              : (settings?.welcomeSettings?.descriptionText || 'Qədim sivilizasiya beşiyi olan Naxçıvanda tarixi abidələr, möhtəşəm mənzərələr və unudulmaz mənəvi turlar sizi gözləyir.')}
          </p>

          {/* CTA Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-10 w-full sm:w-auto">
            <button
              onClick={() => onNavigate('/tours')}
              className="bg-gold-primary hover:bg-gold-dark text-navy-deep font-sans font-bold text-base px-8 py-4 rounded-xl shadow-lg active:scale-97 hover:shadow-gold-primary/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Turlara Bax
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => onNavigate('/places')}
              className="border border-white hover:bg-white hover:text-navy-deep text-white font-sans font-semibold text-base px-8 py-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Tarixi Yerləri Kəşf Et
            </button>
          </div>

          {/* Bottom bounce indicator scroll arrow */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-slate-400 animate-bounce cursor-pointer">
            <span className="text-[10px] font-mono tracking-widest uppercase">Aşağı Sürüşdür</span>
            <ChevronDown className="w-5 h-5 text-gold-primary" />
          </div>

        </div>
      </section>

      {/* 2. Horizontal Stats Bar (below hero, deep navy) */}
      <section 
        id="home-stats"
        className="bg-navy-deep relative z-10 py-10 border-y border-white/5 select-none"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 text-center">
          
          <div className="flex flex-col gap-1 items-center">
            <span className="text-3xl md:text-4xl font-mono font-bold text-gold-primary">150+</span>
            <span className="text-xs md:text-sm font-sans text-slate-300">Tur Paketi</span>
          </div>

          <div className="flex flex-col gap-1 items-center">
            <span className="text-3xl md:text-4xl font-mono font-bold text-gold-primary">45+</span>
            <span className="text-xs md:text-sm font-sans text-slate-300">Lüks Otel</span>
          </div>

          <div className="flex flex-col gap-1 items-center">
            <span className="text-3xl md:text-4xl font-mono font-bold text-gold-primary">30+</span>
            <span className="text-xs md:text-sm font-sans text-slate-300">Tarixi Məkan</span>
          </div>

          <div className="flex flex-col gap-1 items-center">
            <span className="text-3xl md:text-4xl font-mono font-bold text-gold-primary">10,000+</span>
            <span className="text-xs md:text-sm font-sans text-slate-300">Məmnun Turist</span>
          </div>

        </div>
      </section>

      {/* Renders other silhouettes overlay on page backgrounds */}
      <BackgroundSilhouettes />

      {/* 3. Featured Tours Section */}
      <section id="featured-tours" className="py-24 relative z-10 max-w-7xl mx-auto px-4 md:px-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-navy-deep">Öne Çıxan Turlar</h2>
          <div className="w-24 h-1 bg-gold-primary mx-auto mt-4 rounded-full" />
          <p className="text-sm md:text-base text-slate-500 font-sans mt-3 max-w-xl mx-auto">
            Ərabiyyətdən Qafqaza qədər şöhrət salmış Naxçıvanın füsunkar marşrutları ilə unudulmaz xatirələr toplayın.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="bg-white border rounded-2xl h-80 shimmer" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tours.slice(0, 3).map((tour) => (
                <TourCard key={tour.id} tour={tour} onClick={(id) => onNavigate(`/tours/${id}`)} />
              ))}
            </div>
            
            <div className="text-center mt-12">
              <button
                onClick={() => onNavigate('/tours')}
                className="inline-flex items-center gap-2 border border-gold-primary text-gold-primary hover:bg-gold-primary hover:text-navy-deep px-6 py-3 rounded-xl transition-all text-sm font-sans font-bold cursor-pointer"
              >
                Bütün Turlara Bax
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </section>

      {/* 4. Hotels Preview Section */}
      <section className="py-24 bg-gradient-to-b from-slate-100 to-cream-bg border-y border-slate-200/50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          
          <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-4">
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-navy-deep">Naxçıvanın Ən Yaxşı Otelləri</h2>
              <div className="w-24 h-1 bg-gold-primary mt-4 rounded-full mx-auto md:mx-0" />
            </div>
            <button
              onClick={() => onNavigate('/hotels')}
              className="text-gold-primary hover:text-gold-dark font-sans font-bold text-sm tracking-wide inline-flex items-center gap-1.5 cursor-pointer"
            >
              Bütün Otelləri Gör
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="bg-white border rounded-2xl h-64 shimmer" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {hotels.slice(0, 4).map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} onClick={(id) => onNavigate(`/hotels/${id}`)} />
              ))}
            </div>
          )}

        </div>
      </section>

      {/* 5. Historical Places Section (Masonry Grid Layout) */}
      <section id="historical-places" className="py-24 relative z-10 max-w-7xl mx-auto px-4 md:px-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-navy-deep">Tarixi və Mədəni Məkanlar</h2>
          <div className="w-24 h-1 bg-gold-primary mx-auto mt-4 rounded-full" />
          <p className="text-sm md:text-base text-slate-500 font-sans mt-3 max-w-xl mx-auto">
            Tunc dövründən bu günə qədər ucalan monumental memarlıq, kərpic bəzək sənəti məktəbinin inciləri.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="bg-white border rounded-2xl h-80 shimmer" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Featured Place (Möminə Xatun) spawns 2 columns if list is populated */}
            {places.length > 0 && (
              <div className="md:col-span-2 relative h-[380px] rounded-3xl overflow-hidden group shadow-lg border border-slate-100 cursor-pointer" onClick={() => onNavigate(`/places/${places[0].id}`)}>
                <img 
                  src={places[0].images[0]} 
                  alt={places[0].name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                {/* Overlay details */}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/90 via-navy-deep/40 to-transparent flex flex-col justify-end p-8">
                  <span className="bg-gold-primary text-navy-deep text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-gold-primary/20 w-fit mb-3">
                    {places[0].category}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-2">{places[0].name}</h3>
                  <p className="text-sm text-slate-200 line-clamp-2 max-w-xl font-sans mb-3">{places[0].description}</p>
                  <p className="text-xs text-gold-light font-sans font-bold flex items-center gap-1">
                    Giriş: {places[0].entryFee} • İş saatları: {places[0].workingHours}
                  </p>
                </div>
              </div>
            )}

            {/* Remaining places in regular grid */}
            {places.slice(1, 4).map((place) => (
              <div key={place.id} className="relative h-[380px] rounded-3xl overflow-hidden group shadow-lg border border-slate-100 cursor-pointer" onClick={() => onNavigate(`/places/${place.id}`)}>
                <img 
                  src={place.images[0]} 
                  alt={place.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                {/* Overlay details */}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/90 via-navy-deep/40 to-transparent flex flex-col justify-end p-6">
                  <span className="bg-gold-primary text-navy-deep text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border border-gold-primary/20 w-fit mb-2">
                    {place.category}
                  </span>
                  <h3 className="text-lg md:text-xl font-serif font-bold text-white mb-2 line-clamp-1">{place.name}</h3>
                  <p className="text-xs text-slate-200 line-clamp-2 font-sans mb-3">{place.description}</p>
                  <p className="text-[10px] text-gold-light font-sans inline-flex items-center gap-1">
                    Ətraflı Bax →
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <button
            onClick={() => onNavigate('/places')}
            className="inline-flex items-center gap-2 border border-gold-primary text-gold-primary hover:bg-gold-primary hover:text-navy-deep px-6 py-3 rounded-xl transition-all text-sm font-sans font-bold cursor-pointer"
          >
            Bütün Tarixi Məkanları Kəşf Et
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* NEW SECTION 1: Traditional Nakhchivan Cuisine & Restaurants */}
      {restaurants && restaurants.length > 0 && (
        <section id="gastronomy-restaurants" className="py-24 bg-gradient-to-b from-slate-50 to-cream-bg relative z-10 border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 md:px-12">
            <div className="text-center mb-16">
              <span className="text-gold-primary text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-lg bg-navy-deep/5 border text-center inline-block">
                Qastro-Turizm
              </span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-navy-deep mt-2">Milli Naxçıvan Mətbəxi & Restoranlar</h2>
              <div className="w-24 h-1 bg-gold-primary mx-auto mt-4 rounded-full" />
              <p className="text-sm md:text-base text-slate-500 font-sans mt-3 max-w-xl mx-auto">
                Qədim dadların ünvanı — Naxçıvan qatlaması, xəmir xörəkləri və əvəzsiz Naxçıvan kabablarını təklif edən rəsmi tərəfdaş restoranlarımızla tanış olun.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {restaurants.map((rest) => (
                <div key={rest.id} className="bg-white rounded-3xl overflow-hidden border border-slate-100 hover:shadow-xl transition-all duration-300 flex flex-col group">
                  <div className="h-56 overflow-hidden relative">
                    <img 
                      src={rest.image} 
                      alt={rest.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-550"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 right-4 bg-navy-deep/90 text-gold-primary text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-lg border border-gold-primary/20">
                      {rest.cuisine}
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between text-left">
                    <div>
                      <h3 className="font-serif text-xl font-bold text-navy-deep">{rest.name}</h3>
                      <p className="text-xs text-slate-500 font-sans mt-2 leading-relaxed line-clamp-3">{rest.description}</p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-sans text-slate-400 flex flex-col gap-1.5">
                      <p className="flex items-center gap-2">
                        <strong className="text-navy-deep font-semibold">İş saatları:</strong> {rest.hours}
                      </p>
                      <p className="flex items-center gap-2">
                        <strong className="text-navy-deep font-semibold">📍 Ünvan:</strong> {rest.address}
                      </p>
                      <p className="flex items-center gap-2">
                        <strong className="text-gold-primary font-bold">📞 Əlaqə:</strong> {rest.phone}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* NEW SECTION 2: Dynamic Promo Banner / Specials */}
      {settings?.promoBanners && settings.promoBanners.filter(b => b.isActive).length > 0 && (
        <section id="campaign-banner" className="py-12 bg-navy-mid border-y border-white/5 relative z-10 select-none">
          <div className="max-w-7xl mx-auto px-4 md:px-12">
            {settings.promoBanners.filter(b => b.isActive).slice(0, 1).map((banner, index) => (
              <div key={index} className="bg-gradient-to-r from-gold-primary/10 to-transparent border border-gold-primary/20 p-8 rounded-3xl flex flex-col md:flex-row items-center gap-8 text-left">
                <img src={banner.image} alt="" className="w-24 h-24 object-cover rounded-2xl shrink-0" />
                <div>
                  <span className="bg-gold-primary text-navy-deep text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded w-fit inline-block mb-2">Xüsusi Təklif</span>
                  <h3 className="text-xl md:text-2xl font-serif font-bold text-white">{banner.title}</h3>
                  <p className="text-xs md:text-sm text-slate-300 font-sans mt-2">{banner.text}</p>
                </div>
                <div className="shrink-0 md:ml-auto">
                  <button 
                    onClick={() => onNavigate('/tours')}
                    className="bg-gold-primary hover:bg-gold-dark text-navy-deep font-sans font-bold text-xs py-3.5 px-6 rounded-xl transition-all cursor-pointer"
                  >
                    Kompaniyaya Qoşul
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* NEW SECTION 3: Nakhchivan Travel Blogs & News */}
      {blogs && blogs.length > 0 && (
        <section id="travel-blogs-section" className="py-24 relative z-10 max-w-7xl mx-auto px-4 md:px-12 border-t border-slate-100">
          <div className="text-center mb-16">
            <span className="text-gold-primary text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-lg bg-navy-deep/5 border text-center inline-block">
              Bloq və Xəbərlər
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-navy-deep mt-2">Naxçıvan Səyahət Qeydləri</h2>
            <div className="w-24 h-1 bg-gold-primary mx-auto mt-4 rounded-full" />
            <p className="text-sm md:text-base text-slate-500 font-sans mt-3 max-w-xl mx-auto">
              Səyyahların və tarixçilərin qələmindən Naxçıvanın gizli qalmış memarlıq inciləri, bələdçi tövsiyələri və ətraflı elmi məqalələr.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {blogs.slice(0, 4).map((blog) => (
              <div key={blog.id} className="bg-white rounded-3xl border border-slate-50 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row text-left group">
                <div className="md:w-2/5 h-48 md:h-auto overflow-hidden relative">
                  <img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
                </div>
                <div className="p-6 md:w-3/5 flex flex-col justify-between font-sans">
                  <div>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">{blog.category}</span>
                    <h3 className="text-base md:text-lg font-serif font-bold text-navy-deep mt-3 line-clamp-2 leading-snug">{blog.title}</h3>
                    <p className="text-xs text-slate-400 font-sans mt-2 line-clamp-3 leading-relaxed">{blog.content}</p>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 border-t pt-4 mt-4 font-sans select-none">
                    <span>Qələmə aldı: {blog.author}</span>
                    <span>{new Date(blog.createdAt).toLocaleDateString('az')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* NEW SECTION 4: Interactive Testimonials Panel */}
      {settings?.testimonials && settings.testimonials.length > 0 && (
        <section id="dynamic-testimonials" className="py-24 bg-navy-deep font-sans relative z-10 border-t border-white/[0.05] text-left">
          <div className="max-w-7xl mx-auto px-4 md:px-12">
            <div className="text-center mb-16">
              <span className="text-gold-primary text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-lg bg-white/5 border text-center inline-block">
                Təəssüratlar
              </span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mt-2">Müştərilərimizin Rəyləri</h2>
              <div className="w-24 h-1 bg-gold-primary mx-auto mt-4 rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              {settings.testimonials.map((testi, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 p-6 rounded-3xl flex flex-col gap-4">
                  <div className="flex items-center gap-1.5">
                    <StarRating rating={testi.rating} size={13} />
                  </div>
                  <p className="text-slate-300 italic text-xs leading-relaxed">"{testi.text}"</p>
                  <div className="border-t border-white/5 pt-4 flex items-center gap-3">
                    <div className="w-9 h-9 bg-gold-primary/10 text-gold-primary border border-gold-primary/30 text-xs font-bold rounded-lg flex items-center justify-center uppercase shrink-0">
                      {testi.name[0]}
                    </div>
                    <div>
                      <p className="text-white text-xs font-bold">{testi.name}</p>
                      <p className="text-slate-500 text-[10px]">{testi.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* NEW SECTION 5: Nakhchivan Photo Gallery Grid */}
      {settings?.photoGalleries && settings.photoGalleries.length > 0 && (
        <section id="photo-galleries-mediateka" className="py-24 bg-gradient-to-b from-cream-bg to-white relative z-10 border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 md:px-12">
            <div className="text-center mb-16">
              <span className="text-gold-primary text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-lg bg-navy-deep/5 border text-center inline-block">
                Mediateka
              </span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-navy-deep mt-2">Foto Qalereya / Naxçıvan İnciləri</h2>
              <div className="w-24 h-1 bg-gold-primary mx-auto mt-4 rounded-full" />
              <p className="text-sm md:text-base text-slate-500 font-sans mt-3 max-w-xl mx-auto">
                Qədim diyarın ən heyranedici kadrları, sivilizasiya tarixi və unikal coğrafi təbiət mənzərələri bir arada.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {settings.photoGalleries.map((imgUrl, idx) => (
                <div key={idx} className="group relative rounded-3xl overflow-hidden aspect-[4/3] shadow-md hover:shadow-xl transition-all duration-300 border bg-slate-100 cursor-pointer">
                  <img 
                    src={imgUrl || 'https://images.unsplash.com/photo-1542332213-9b5a5a3fad35'} 
                    alt={`Naxcivan Gallery ${idx}`} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-navy-deep/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="w-10 h-10 rounded-full bg-gold-primary text-navy-deep flex items-center justify-center scale-90 group-hover:scale-100 transition-transform duration-300">
                      <ExternalLink className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. Reservation CTA Banner Section */}
      <section 
        id="reservation-cta-banner"
        className="w-full py-20 bg-navy-deep relative overflow-hidden select-none"
      >
        <div className="absolute inset-0 opacity-15">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200")' }} />
          <div className="absolute inset-0 bg-navy-deep" />
        </div>

        {/* Decorative mini design lines */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold-primary via-gold-dark to-gold-primary" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white leading-tight">
            Naxçıvana Səyahətinizi Planlaşdırın
          </h2>
          <p className="text-sm md:text-base text-slate-300 font-sans mt-4 max-w-xl mx-auto leading-relaxed">
            Hər şey daxil turlarımız və lüks premium otellərinizə rəsmi zəmanətli paket dərəcələri ilə indi yoxlayın.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => onNavigate('/tours')}
              className="bg-gold-primary hover:bg-gold-dark text-navy-deep font-sans font-bold text-base px-8 py-4 rounded-xl shadow-lg active:scale-97 transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <CalendarDays className="w-5 h-5" />
              İndi Rezervasiya Et
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
