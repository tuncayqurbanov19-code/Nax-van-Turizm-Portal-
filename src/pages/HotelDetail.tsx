import React, { useEffect, useState } from 'react';
import { ArrowLeft, MapPin, Phone, Mail, Star, BedDouble, Calendar, Users, MessageSquare, ShieldCheck, Check, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Hotel } from '../types';
import StarRating from '../components/ui/StarRating';

interface HotelDetailProps {
  hotelId: string;
  onNavigate: (path: string) => void;
}

export default function HotelDetail({ hotelId, onNavigate }: HotelDetailProps) {
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const { user } = useAuth();
  const { success, error } = useToast();

  // Booking states
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [selectedRoomIdx, setSelectedRoomIdx] = useState(0);
  const [bookingGuestsCount, setBookingGuestsCount] = useState(2);
  const [bookingFullName, setBookingFullName] = useState('');
  const [bookingEmail, setBookingEmail] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  // Map interaction simulations
  const [mapZoom, setMapZoom] = useState(14);
  const [satelliteView, setSatelliteView] = useState(false);

  useEffect(() => {
    async function loadHotel() {
      try {
        setLoading(true);
        const data = await api.hotels.getDetail(hotelId);
        setHotel(data);
        if (data) {
          if (user) {
            setBookingFullName(user.fullName);
            setBookingEmail(user.email);
            setBookingPhone('+994 ');
          }
        }
      } catch (e: any) {
        error(e.message || 'Otel tapılmadı.');
        onNavigate('/hotels');
      } finally {
        setLoading(false);
      }
    }
    loadHotel();
  }, [hotelId, user]);

  // Price stay calculations
  let calculatedNights = 0;
  let totalPrice = 0;

  if (checkInDate && checkOutDate) {
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diff = end.getTime() - start.getTime();
    if (diff > 0) {
      calculatedNights = Math.ceil(diff / (1000 * 60 * 60 * 24));
      if (hotel && hotel.rooms[selectedRoomIdx]) {
        totalPrice = hotel.rooms[selectedRoomIdx].price * calculatedNights;
      }
    }
  }

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      error('Mehmanxana rezervasiyası etmək üçün, zəhmət olmasa daxil olun.', 'Giriş Tələb Olunur');
      return;
    }

    if (!checkInDate || !checkOutDate) {
      error('Lütfən giriş və çıxış tarixlərini seçin.');
      return;
    }

    if (calculatedNights <= 0) {
      error('Giriş tarixi çıxış tarixindən əvvəl olmalıdır.');
      return;
    }

    try {
      setBookingLoading(true);
      const res = await api.reservations.create({
        type: 'hotel',
        refId: hotel?.id,
        fullName: bookingFullName,
        email: bookingEmail,
        phone: bookingPhone,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests: Number(bookingGuestsCount),
        notes: bookingNotes,
        totalPrice
      });

      if (res && res.id) {
        success('Otel sifarişiniz uğurla qeydə alındı! Menecer təsdiqləməsini gözləyin.', 'Rezervasiya Göndərildi');
        setCheckInDate('');
        setCheckOutDate('');
        setBookingNotes('');
      }
    } catch (e: any) {
      error(e.message || 'Rezervasiya göndərilərkən xəta yarandı.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-16 flex justify-center items-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <span className="w-12 h-12 border-4 border-gold-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-sans animate-pulse">Zəhmət olmasa gözləyin, otel məlumatları oxunur...</p>
        </div>
      </div>
    );
  }

  if (!hotel) return null;

  return (
    <div className="min-h-screen pb-24 relative z-10 max-w-7xl mx-auto px-4 md:px-12 pt-28" id="hotel-detail-page">
      
      {/* 1. Header with back link */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <button
          onClick={() => onNavigate('/hotels')}
          className="w-fit flex items-center gap-2 bg-white/80 text-navy-deep rounded-xl px-4 py-2 border border-slate-200 hover:border-gold-primary transition-all text-xs font-sans font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Otellərə Geri Dön
        </button>

        <div className="flex items-center gap-2" id="hotel-meta">
          <StarRating rating={hotel.stars} size={15} />
          <span className="text-xs text-slate-400 font-sans font-bold uppercase">{hotel.stars} Ulduzlu Lüks</span>
        </div>
      </div>

      <h1 className="text-3xl md:text-5xl font-serif font-bold text-navy-deep mb-2">{hotel.name}</h1>
      <p className="text-slate-500 font-sans text-sm flex items-center gap-1 mb-8">
        <MapPin className="w-4 h-4 text-gold-primary" />
        {hotel.address}
      </p>

      {/* 2. Image Gallery Showcase layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-12" id="hotel-gallery">
        
        {/* Main Photo (8 columns) */}
        <div className="md:col-span-8 h-[380px] md:h-[480px] bg-slate-100 rounded-3xl overflow-hidden relative group">
          <img
            src={hotel.images[selectedPhotoIndex] || hotel.images[0]}
            alt={hotel.name}
            className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-4 right-4 bg-navy-deep/80 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs text-white font-mono">
            {selectedPhotoIndex + 1} / {hotel.images.length}
          </div>
        </div>

        {/* Thumbnail selection grid (4 columns) */}
        <div className="md:col-span-4 grid grid-cols-4 md:grid-cols-2 gap-4 h-auto md:h-[480px]">
          {hotel.images.map((photo, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedPhotoIndex(idx)}
              className={`rounded-2xl overflow-hidden cursor-pointer bg-slate-100 h-20 md:h-[110px] border-2 transition-all hover:opacity-100 ${
                selectedPhotoIndex === idx ? 'border-gold-primary opacity-100' : 'border-transparent opacity-70'
              }`}
            >
              <img src={photo} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          ))}
        </div>
      </div>

      {/* 3. Main Detail and checkout form split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left-side main details (65%) */}
        <div className="lg:col-span-8 flex flex-col gap-8" id="hotel-core-info">
          
          {/* About description */}
          <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-3xl shadow-md">
            <h3 className="font-serif text-xl font-bold text-navy-deep border-b border-slate-100 pb-3 mb-4 select-none">
              Mehmanxana haqqında
            </h3>
            <p className="text-sm md:text-base text-slate-600 font-sans leading-relaxed text-balance">
              Naxçıvanın qədim qonaqpərvərlik adətlərinə əsaslanaraq qurulmuş bu mehmanxana binası, lüks xidmətləri, komfort otaqları və peşəkar işçi heyəti ilə tətilinizi unudulmaz edəcək. Səyahətiniz müddətində otel daxilindəki lüks SPA prosedurları, hovuzlar və möhtəşəm panoromik terrası ilə dincələ bilərsiniz.
            </p>
          </div>

          {/* Otaq Növləri ve Qiymətləri list */}
          <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-3xl shadow-md">
            <h3 className="font-serif text-xl font-bold text-navy-deep border-b border-slate-100 pb-3 mb-6 select-none">
              Otaq Növləri və Qiymətlər
            </h3>
            
            <div className="flex flex-col gap-4 font-sans">
              {hotel.rooms.map((room, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setSelectedRoomIdx(idx)}
                  className={`border p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-all ${
                    selectedRoomIdx === idx 
                      ? 'border-gold-primary bg-gold-primary/5 shadow-inner' 
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${selectedRoomIdx === idx ? 'bg-gold-primary text-navy-deep' : 'bg-slate-100 text-slate-500'}`}>
                      <BedDouble className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-navy-deep">{room.type}</h4>
                      <p className="text-xs text-slate-400 mt-1">Maksimum tutum: {room.capacity} qonaq</p>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-1 sm:text-right">
                    <span className="text-xl font-mono font-bold text-gold-primary">₼ {room.price}</span>
                    <span className="text-xs text-slate-400">/ Gecə</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Amenities grid layout */}
          <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-3xl shadow-md select-none">
            <h3 className="font-serif text-xl font-bold text-navy-deep border-b border-slate-100 pb-3 mb-6">
              Otelin fərqli xidmətləri
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {hotel.amenities.map((amenity, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center flex flex-col items-center justify-center">
                  <Check className="w-4 h-4 text-emerald-500 mb-1" />
                  <span className="text-xs font-semibold text-slate-700 font-sans">{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dining / Restaurant column detail */}
          <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-3xl shadow-md select-none">
            <h3 className="font-serif text-xl font-bold text-navy-deep border-b border-slate-100 pb-3 mb-6">
              Restoran və Qidalanma
            </h3>
            <div className="bg-slate-50 border border-slate-150 p-5 rounded-2xl">
              <h4 className="font-bold text-base text-navy-deep">{hotel.restaurant.name}</h4>
              <p className="text-xs text-slate-500 font-sans mt-1">Mətbəx: {hotel.restaurant.cuisine}</p>
              <p className="text-xs text-slate-500 font-sans mt-1">İş saatları: {hotel.restaurant.hours}</p>
              <p className="text-xs font-sans text-slate-400 mt-4 leading-relaxed">
                Yüksək peşəkar aşpazlar tərəfindən idarə olunan restoranda həm unikal Ordubad şirniyyatlarından dada, həm də ləziz bifştekslərdən sifariş edə bilərsiniz. Səhər yeməyi bütün qonaqlar üçün ödənişsizdir.
              </p>
            </div>
          </div>

          {/* 4. Map Section: Realistic satellite/road map */}
          <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-3xl shadow-md">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-6 font-sans select-none">
              <h3 className="font-serif text-xl font-bold text-navy-deep">Xəritədə Otel mövqeyi</h3>
              
              {/* Toggle satellite mode */}
              <div className="flex gap-2 text-[10px] font-sans">
                <button 
                  onClick={() => setSatelliteView(false)}
                  className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${!satelliteView ? 'bg-gold-primary text-navy-deep' : 'bg-slate-100 text-slate-500'}`}
                >
                  Xəritə
                </button>
                <button 
                  onClick={() => setSatelliteView(true)}
                  className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${satelliteView ? 'bg-gold-primary text-navy-deep' : 'bg-slate-100 text-slate-500'}`}
                >
                  Peyk
                </button>
              </div>
            </div>

            {/* Simulated interactive map displaying coordinate markings */}
            <div className="relative w-full h-[320px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-200">
              
              {/* Satellite vs Roadmap textures */}
              {satelliteView ? (
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-70"
                  style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800")' }}
                />
              ) : (
                <div className="absolute inset-x-0 inset-y-0 bg-slate-50 grid grid-cols-12 grid-rows-6 opacity-30 pointer-events-none">
                  {Array.from({ length: 72 }).map((_, i) => (
                    <div key={i} className="border border-slate-200/50" />
                  ))}
                </div>
              )}

              {/* Centered marker */}
              <div 
                className="absolute inset-0 flex items-center justify-center flex-col transition-all duration-300"
                style={{ transform: `scale(${mapZoom / 14})` }}
                id="satellite-marker"
              >
                <div className="relative">
                  <span className="absolute -top-1 -left-1 w-6 h-6 bg-gold-primary/30 rounded-full animate-ping" />
                  <MapPin className="w-8 h-8 text-gold-primary fill-navy-deep relative z-10 filter drop-shadow" />
                </div>
                <div className="bg-navy-deep/90 border border-gold-primary/30 backdrop-blur text-white text-[10px] font-sans font-bold py-1.5 px-3 rounded-lg shadow-lg mt-2">
                  {hotel.name}
                </div>
              </div>

              {/* Map controls */}
              <div className="absolute bottom-4 right-4 flex flex-col gap-1 z-10 font-sans text-xs">
                <button 
                  onClick={() => setMapZoom(prev => Math.min(18, prev + 1))}
                  className="w-8 h-8 bg-white hover:bg-slate-100 text-navy-deep flex items-center justify-center font-bold rounded-lg border shadow cursor-pointer"
                >
                  +
                </button>
                <button 
                  onClick={() => setMapZoom(prev => Math.max(10, prev - 1))}
                  className="w-8 h-8 bg-white hover:bg-slate-100 text-navy-deep flex items-center justify-center font-bold rounded-lg border shadow cursor-pointer"
                >
                  -
                </button>
              </div>

              {/* GPS HUD */}
              <div className="absolute top-4 left-4 bg-navy-mid/85 text-white/90 text-[10px] font-mono py-1 px-2.5 rounded-lg border border-white/10 select-none">
                COORD: {hotel.location.lat.toFixed(4)}° N, {hotel.location.lng.toFixed(4)}° E • ZOOM: {mapZoom}
              </div>

            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-4 text-xs font-sans text-slate-400 select-none">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-gold-primary" />
                GPS: {hotel.location.lat}, {hotel.location.lng}
              </span>
              <span>Naxçıvan Regional İcra nümayəndəliyinə yaxınlıq</span>
            </div>

          </div>

        </div>

        {/* Right booking column (35%) */}
        <div className="lg:col-span-4">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl flex flex-col gap-5 sticky top-24 z-10 border-t-4 border-t-gold-primary">
            
            <div className="select-none">
              <span className="text-xs text-slate-400 font-sans uppercase tracking-widest">Otaq növü dərəcəsi</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-mono font-bold text-gold-primary">
                  ₼ {hotel.rooms[selectedRoomIdx]?.price || 100}
                </span>
                <span className="text-sm font-sans text-slate-500">/ gecə</span>
              </div>
            </div>

            <hr className="border-slate-100" />

            <form onSubmit={handleBookingSubmit} className="flex flex-col gap-4 font-sans select-none">
              
              {/* Checkin date picker */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-600">Giriş Tarixi</label>
                <input
                  type="date"
                  required
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-gold-primary"
                />
              </div>

              {/* Checkout date picker */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-600">Çıxış Tarixi</label>
                <input
                  type="date"
                  required
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-gold-primary"
                />
              </div>

              {/* Room select */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-600">Otaq Növü</label>
                <select
                  value={selectedRoomIdx}
                  onChange={(e) => setSelectedRoomIdx(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-gold-primary"
                >
                  {hotel.rooms.map((room, idx) => (
                    <option key={idx} value={idx}>{room.type} (₼ {room.price}/g)</option>
                  ))}
                </select>
              </div>

              {/* Guest counts */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-600">Qonaq Sayı</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={6}
                  value={bookingGuestsCount}
                  onChange={(e) => setBookingGuestsCount(Math.max(1, Number(e.target.value)))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-gold-primary text-center font-mono"
                />
              </div>

              {/* Customer Inputs if logged session exists */}
              {user ? (
                <>
                  <div className="flex flex-col gap-1 mt-1">
                    <label className="text-xs font-semibold text-slate-600">Sifarişçi Adı</label>
                    <input
                      type="text"
                      required
                      value={bookingFullName}
                      onChange={(e) => setBookingFullName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-600">E-Poçt</label>
                      <input
                        type="email"
                        required
                        value={bookingEmail}
                        onChange={(e) => setBookingEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-600">Telefon</label>
                      <input
                        type="tel"
                        required
                        value={bookingPhone}
                        onChange={(e) => setBookingPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-600">Qeydlər</label>
                    <textarea
                      rows={2}
                      placeholder="Gec gəliş, allergik təmizləmə..."
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none leading-tight"
                    />
                  </div>

                  {/* Calculations breakdown block */}
                  {calculatedNights > 0 && (
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mt-2">
                      <div className="flex justify-between items-center text-xs text-slate-500">
                        <span>Gecə sayı:</span>
                        <span className="font-bold">{calculatedNights} gecə</span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-slate-500 mt-1">
                        <span>Otaq qiyməti:</span>
                        <span className="font-bold">₼ {hotel.rooms[selectedRoomIdx]?.price} / gecə</span>
                      </div>
                      <hr className="border-slate-100 my-2" />
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-semibold text-slate-700">Toplam Məbləğ:</span>
                        <span className="font-mono font-bold text-lg text-gold-primary">₼ {totalPrice}</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="w-full bg-gold-primary hover:bg-gold-dark text-navy-deep font-sans font-bold py-4 rounded-xl shadow-md transition-all active:scale-97 text-center mt-4 cursor-pointer"
                  >
                    {bookingLoading ? 'Göndərilir...' : 'Rezervasiya Göndər'}
                  </button>
                </>
              ) : (
                <div className="bg-amber-50 border border-gold-primary/20 p-4 rounded-2xl text-center select-none mt-2">
                  <p className="text-xs font-bold text-amber-800">Qeydiyyat Tələb Olunur</p>
                  <p className="text-[10px] text-amber-600 mt-1">Bu otel otağını rəsmən rezervasiya etmək üçün sistemə daxil olun.</p>
                  <button
                    type="button"
                    onClick={() => onNavigate('/login')}
                    className="mt-4 w-full bg-gold-primary hover:bg-gold-dark text-navy-deep font-sans font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer"
                  >
                    Daxil ol
                  </button>
                </div>
              )}

            </form>

          </div>
        </div>

      </div>

    </div>
  );
}
