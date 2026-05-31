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
        const activeRoom = hotel.rooms[selectedRoomIdx];
        const roomPrice = (activeRoom.discountPrice && activeRoom.discountPrice < activeRoom.price)
          ? activeRoom.discountPrice
          : activeRoom.price;
        totalPrice = roomPrice * calculatedNights;
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

    const checkInDateObj = new Date(checkInDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDateObj < today) {
      error('Giriş tarixi keçmişdə ola bilməz.');
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
        const text = `Salam! Mən Naxçıvan Rəqəmsal Turizm Bələdçisi üzərindən yeni otel rezervasiyası etmək istəyirəm.\n\n` +
          `📋 Otel Rezervasiyası Məlumatları:\n` +
          `• Otel: ${hotel?.name || ''}\n` +
          `• Müştəri: ${bookingFullName}\n` +
          `• Telefon: ${bookingPhone}\n` +
          `• E-poçt: ${bookingEmail}\n` +
          `• Giriş Tarixi: ${checkInDate}\n` +
          `• Çıxış Tarixi: ${checkOutDate}\n` +
          `• Qonaq sayı: ${bookingGuestsCount}\n` +
          `• Ümumi Məbləğ: ${totalPrice} AZN\n` +
          (bookingNotes.trim() ? `• Qeyd: ${bookingNotes}\n` : '');

        const encodedText = encodeURIComponent(text);
        const whatsappUrl = `https://wa.me/9940703538283?text=${encodedText}`;

        success('Otel sifarişiniz qeydə alındı! WhatsApp-a yönləndirilirsiniz...', 'Rezervasiya Göndərildi');
        setCheckInDate('');
        setCheckOutDate('');
        setBookingNotes('');

        setTimeout(() => {
          window.location.href = whatsappUrl;
        }, 1000);
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
              {hotel.description || hotel.shortDescription || "Naxçıvanın qədim qonaqpərvərlik adətlərinə əsaslanaraq qurulmuş bu mehmanxana binası, lüks xidmətləri, komfort otaqları və peşəkar işçi heyəti ilə tətilinizi unudulmaz edəcək. Səyahətiniz müddətində otel daxilindəki lüks SPA prosedurları, hovuzlar və möhtəşəm panoromik terrası ilə dincələ bilərsiniz."}
            </p>

            {/* Check-In / Check-Out Hours & Contact board */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100 font-sans text-xs">
              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-slate-450 font-bold uppercase tracking-wider mb-2">🕕 Qəbul Saatları (Hours)</p>
                <div className="flex flex-col gap-1.5 text-slate-600">
                  <div className="flex justify-between"><span>Giriş (Check-In):</span><span className="font-bold">{hotel.checkInTime || "14:00"}</span></div>
                  <div className="flex justify-between"><span>Çıxış (Check-Out):</span><span className="font-bold">{hotel.checkOutTime || "12:00"}</span></div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-slate-450 font-bold uppercase tracking-wider mb-2">📞 Birbaşa Əlaqə Kanalları</p>
                <div className="flex flex-col gap-1 text-slate-600">
                  <p>Telefon: <span className="font-bold text-navy-deep">{hotel.phone}</span></p>
                  <p>E-poçt: <span className="font-bold text-navy-deep">{hotel.email}</span></p>
                  {hotel.whatsapp && <p>WhatsApp: <span className="font-bold text-emerald-650">{hotel.whatsapp}</span></p>}
                  {hotel.website && (
                    <p className="mt-1">
                      <a href={hotel.website} target="_blank" rel="noopener noreferrer" className="text-gold-primary font-bold hover:underline">
                        Rəsmi Veb-saytını Ziyarət et ↗
                      </a>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Otaq Növləri ve Qiymətləri list */}
          <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-3xl shadow-md">
            <h3 className="font-serif text-xl font-bold text-navy-deep border-b border-slate-100 pb-3 mb-6 select-none flex items-center justify-between">
              <span>Otaq Növləri və Qiymətlər</span>
              <span className="text-xs font-sans text-slate-400 font-normal">({hotel.rooms.length} növ otaq mövcuddur)</span>
            </h3>
            
            <div className="flex flex-col gap-5 font-sans">
              {hotel.rooms.map((room, idx) => {
                const isActive = selectedRoomIdx === idx;
                return (
                  <div 
                    key={idx} 
                    onClick={() => setSelectedRoomIdx(idx)}
                    className={`border p-5 rounded-2xl flex flex-col gap-4 cursor-pointer transition-all ${
                      isActive 
                        ? 'border-gold-primary bg-gold-primary/5 shadow-sm' 
                        : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row gap-5 items-start">
                      {room.image && (
                        <div className="w-full md:w-40 aspect-[4/3] rounded-xl overflow-hidden bg-slate-200 shrink-0 border">
                          <img src={room.image} className="w-full h-full object-cover" alt={room.type} referrerPolicy="no-referrer" />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <h4 className="font-bold text-lg text-navy-deep flex items-center gap-2">
                            <span>{room.name || room.type}</span>
                            {room.discountPrice && room.discountPrice < room.price && (
                              <span className="bg-gold-primary text-navy-deep text-[9px] uppercase font-bold px-2 py-0.5 rounded-full">Kampaniya</span>
                            )}
                          </h4>
                          
                          <div className="flex items-baseline gap-1">
                            {room.discountPrice && room.discountPrice < room.price ? (
                              <>
                                <span className="text-xs text-slate-400 line-through">₼ {room.price}</span>
                                <span className="text-xl font-mono font-bold text-gold-primary">₼ {room.discountPrice}</span>
                              </>
                            ) : (
                              <span className="text-xl font-mono font-bold text-gold-primary">₼ {room.price}</span>
                            )}
                            <span className="text-xs text-slate-400">/ Gecə</span>
                          </div>
                        </div>

                        {room.description && (
                          <p className="text-xs text-slate-500 mt-2 leading-relaxed">{room.description}</p>
                        )}

                        {/* Room characteristics (area, beds, guests count) */}
                        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-xs text-slate-500 font-medium">
                          {room.area && <span className="bg-white/80 border px-2.5 py-1 rounded-lg">📐 Sahə: {room.area} m²</span>}
                          {room.bedType && <span className="bg-white/80 border px-2.5 py-1 rounded-lg">🛏️ Çarpayı: {room.bedType}</span>}
                          <span className="bg-white/80 border px-2.5 py-1 rounded-lg">👥 Tutum: Maks. {room.capacity} nəfər</span>
                        </div>

                        {/* Room Amenities checklist */}
                        {room.amenities && room.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {room.amenities.map((amen, aIdx) => (
                              <span key={aIdx} className="bg-white border text-slate-600 text-[10px] px-2 py-0.5 rounded font-semibold shadow-sm">
                                ✓ {amen}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {/* Seasonal Pricing details if listed */}
                        {room.seasonalPrices && room.seasonalPrices.length > 0 && (
                          <div className="mt-3 bg-white/40 border border-slate-100 p-2.5 rounded-xl text-left">
                            <span className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-wide">Mövsümi Tarif Cədvəli</span>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1 ">
                              {room.seasonalPrices.map((sz, sIdx) => (
                                <div key={sIdx} className="bg-white/80 border p-1 rounded-lg text-center text-[10px]">
                                  <span className="text-slate-400 font-medium font-sans block">{sz.season}</span>
                                  <span className="font-mono font-bold text-navy-deep">₼ {sz.price}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      </div>
                    </div>
                  </div>
                );
              })}
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
            
            {/* If our custom meals structure exists, render structured table/board */}
            {hotel.meals && (hotel.meals.breakfast || hotel.meals.lunch || hotel.meals.dinner) ? (
              <div className="flex flex-col gap-4 font-sans text-xs">
                <div className="bg-slate-50 border p-5 rounded-2xl mb-4">
                  <h4 className="font-bold text-base text-navy-deep">{hotel.restaurant.name || "Məkan Restoranı"}</h4>
                  <p className="text-xs text-slate-505 font-sans mt-1">Mətbəx: {hotel.restaurant.cuisine || "Milli və Avropa mətbəxi"} • İş saatları: {hotel.restaurant.hours || "07:00 - 23:00"}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {[
                    { label: "Səhər yeməyi", data: hotel.meals.breakfast, icon: "☕", fallbackName: "Şirin Səhər yeməyi" },
                    { label: "Nahar yeməyi", data: hotel.meals.lunch, icon: "🍲", fallbackName: "Milli Nahar süfrəsi" },
                    { label: "Axşam yeməyi", data: hotel.meals.dinner, icon: "🍢", fallbackName: "Qala Axşam süfrəsi" }
                  ].map((catering, idc) => {
                    if (!catering.data) return null;
                    return (
                      <div key={idc} className="bg-white border rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm">
                        {catering.data.image && (
                          <div className="h-32 bg-slate-100 relative">
                            <img src={catering.data.image} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                          </div>
                        )}
                        <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{catering.icon} {catering.label}</span>
                            <p className="font-bold text-navy-deep text-sm mt-1">{catering.data.menu || catering.fallbackName}</p>
                          </div>
                          
                          <div className="flex justify-between items-center border-t border-dashed pt-2.5 text-[11px]">
                            <span className="text-slate-400">Statusu:</span>
                            <span className={`font-bold ${catering.data.isIncluded ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {catering.data.isIncluded ? "Qiymətə daxildir" : `Əlavə - ₼ ${catering.data.price}`}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-150 p-5 rounded-2xl">
                <h4 className="font-bold text-base text-navy-deep">{hotel.restaurant.name}</h4>
                <p className="text-xs text-slate-505 font-sans mt-1">Mətbəx: {hotel.restaurant.cuisine}</p>
                <p className="text-xs text-slate-505 font-sans mt-1">İş saatları: {hotel.restaurant.hours}</p>
                <p className="text-xs font-sans text-slate-400 mt-4 leading-relaxed">
                  Yüksək peşəkar aşpazlar tərəfindən idarə olunan restoranda həm unikal Ordubad şirniyyatlarından dada, həm də ləziz bifştekslərdən sifariş edə bilərsiniz. Səhər yeməyi bütün qonaqlar üçün ödənişsizdir.
                </p>
              </div>
            )}
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
