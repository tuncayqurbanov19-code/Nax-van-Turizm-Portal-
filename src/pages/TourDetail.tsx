import React, { useEffect, useState, useRef } from 'react';
import { Clock, MapPin, Coffee, Utensils, Hotel, Car, ArrowLeft, Star, Heart, Calendar, Users, MessageSquare, Check, X, ShieldAlert, FileText } from 'lucide-react';
import * as THREE from 'three';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Tour } from '../types';
import StarRating from '../components/ui/StarRating';

interface TourDetailProps {
  tourId: string;
  onNavigate: (path: string) => void;
}

export default function TourDetail({ tourId, onNavigate }: TourDetailProps) {
  const [tour, setTour] = useState<Tour | null>(null);
  const [hotelsList, setHotelsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stops' | 'meals' | 'hotel' | 'transport'>('stops');
  const { user } = useAuth();
  const { success, error } = useToast();

  // Booking states
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [guestsCount, setGuestsCount] = useState(1);
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingFullName, setBookingFullName] = useState('');
  const [bookingEmail, setBookingEmail] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');

  // Three.js 3D Viewer reference
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const threeEngineRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    mesh: THREE.Group;
    animationId: number;
  } | null>(null);

  useEffect(() => {
    async function loadTour() {
      try {
        setLoading(true);
        const data = await api.tours.getDetail(tourId);
        setTour(data);
        
        try {
          const fetchedHotels = await api.hotels.getList();
          if (Array.isArray(fetchedHotels)) {
            setHotelsList(fetchedHotels);
          }
        } catch (hotelErr) {
          console.error("Hotels could not be loaded in detail view:", hotelErr);
        }

        if (data) {
          // Prepopulate booking form with logged user info
          if (user) {
            setBookingFullName(user.fullName);
            setBookingEmail(user.email);
            setBookingPhone('+994 ');
          }
        }
      } catch (e: any) {
        error(e.message || 'Tur tapılmadı.');
        onNavigate('/tours');
      } finally {
        setLoading(false);
      }
    }
    loadTour();
  }, [tourId, user]);

  // SEO settings dynamic updater
  useEffect(() => {
    if (tour) {
      const originalTitle = document.title;
      if (tour.seoSettings?.title) {
        document.title = tour.seoSettings.title;
      } else {
        document.title = `${tour.name} - Premium Naxçıvan Turları`;
      }

      let metaDesc = document.querySelector('meta[name="description"]');
      let created = false;
      let originalContent = '';
      if (metaDesc) {
        originalContent = metaDesc.getAttribute('content') || '';
      }
      if (tour.seoSettings?.description) {
        if (!metaDesc) {
          metaDesc = document.createElement('meta');
          metaDesc.setAttribute('name', 'description');
          document.head.appendChild(metaDesc);
          created = true;
        }
        metaDesc.setAttribute('content', tour.seoSettings.description);
      }

      return () => {
        document.title = originalTitle;
        if (created && metaDesc) {
          document.head.removeChild(metaDesc);
        } else if (metaDesc && originalContent) {
          metaDesc.setAttribute('content', originalContent);
        }
      };
    }
  }, [tour]);

  // Adjust activeTab automatically if the current tab doesn't have data and is hidden
  useEffect(() => {
    if (tour) {
      const showStops = tour.stops && tour.stops.length > 0;
      const showMeals = (tour.customMeals && tour.customMeals.length > 0) || (tour.meals && (tour.meals.breakfast?.restaurantName || tour.meals.lunch?.restaurantName || tour.meals.dinner?.restaurantName));
      const showHotel = (tour.hotelIds && tour.hotelIds.length > 0) || (tour.accommodation && tour.accommodation.hotelName);
      const showTransport = (tour.customTransports && tour.customTransports.length > 0) || (tour.transport && (tour.transport.type || tour.transport.model));

      if (activeTab === 'stops' && !showStops) {
        if (showMeals) setActiveTab('meals');
        else if (showHotel) setActiveTab('hotel');
        else if (showTransport) setActiveTab('transport');
      } else if (activeTab === 'meals' && !showMeals) {
        if (showStops) setActiveTab('stops');
        else if (showHotel) setActiveTab('hotel');
        else if (showTransport) setActiveTab('transport');
      } else if (activeTab === 'hotel' && !showHotel) {
        if (showStops) setActiveTab('stops');
        else if (showMeals) setActiveTab('meals');
        else if (showTransport) setActiveTab('transport');
      } else if (activeTab === 'transport' && !showTransport) {
        if (showStops) setActiveTab('stops');
        else if (showMeals) setActiveTab('meals');
        else if (showHotel) setActiveTab('hotel');
      }
    }
  }, [tour, activeTab]);

  // Three.js Interactive 360 Vehicle View Engine
  useEffect(() => {
    if (activeTab !== 'transport' || !canvasRef.current || !tour) return;

    const width = canvasRef.current.clientWidth || 400;
    const height = canvasRef.current.clientHeight || 300;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0F172A'); // Match navydeep

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 2, 7);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xF59E0B, 1.2); // Golden direct light
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const fillLight = new THREE.PointLight(0x38BDF8, 0.8, 50); // Muted blue fill
    fillLight.position.set(-5, -2, -5);
    scene.add(fillLight);

    // 5. Structure our Interactive 3D Vehicle interior representation (Vehicle capsule mesh)
    const vehicleGroup = new THREE.Group();

    // Translucent bus/minivan outer frame shell
    const outerGeo = new THREE.BoxGeometry(4.5, 2.2, 8.5);
    const outerMat = new THREE.MeshPhongMaterial({
      color: 0x334155,
      transparent: true,
      opacity: 0.15,
      wireframe: true
    });
    const shell = new THREE.Mesh(outerGeo, outerMat);
    vehicleGroup.add(shell);

    // Vehicle Chassis base plate
    const chassisGeo = new THREE.BoxGeometry(4.6, 0.2, 8.6);
    const chassisMat = new THREE.MeshPhongMaterial({ color: 0x1E293B, shininess: 80 });
    const chassis = new THREE.Mesh(chassisGeo, chassisMat);
    chassis.position.y = -1;
    vehicleGroup.add(chassis);

    // Windshield (Front glass)
    const glassGeo = new THREE.BoxGeometry(4.3, 1.5, 0.1);
    const glassMat = new THREE.MeshPhongMaterial({ color: 0xF59E0B, transparent: true, opacity: 0.4 });
    const windshield = new THREE.Mesh(glassGeo, glassMat);
    windshield.position.set(0, 0.4, 4.2);
    vehicleGroup.add(windshield);

    // Generate passenger rows of seats inside
    const seatGeo = new THREE.BoxGeometry(0.9, 1.0, 0.7);
    const seatMat = new THREE.MeshStandardMaterial({ color: 0xF59E0B, roughness: 0.5 }); // Golden seats
    const headrestGeo = new THREE.BoxGeometry(0.5, 0.4, 0.3);

    for (let row = -2.5; row <= 2.5; row += 1.8) {
      // Left row
      const leftSeat = new THREE.Mesh(seatGeo, seatMat);
      leftSeat.position.set(-1.1, -0.4, row);
      vehicleGroup.add(leftSeat);

      const leftHead = new THREE.Mesh(headrestGeo, seatMat);
      leftHead.position.set(-1.1, 0.3, row);
      vehicleGroup.add(leftHead);

      // Right row
      const rightSeat = new THREE.Mesh(seatGeo, seatMat);
      rightSeat.position.set(1.1, -0.4, row);
      vehicleGroup.add(rightSeat);

      const rightHead = new THREE.Mesh(headrestGeo, seatMat);
      rightHead.position.set(1.1, 0.3, row);
      vehicleGroup.add(rightHead);
    }

    scene.add(vehicleGroup);

    // 6. Interactive Drag Controls logic
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y
      };

      vehicleGroup.rotation.y += deltaMove.x * 0.005;
      vehicleGroup.rotation.x += deltaMove.y * 0.005;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    // Canvas listeners
    const canvasEl = canvasRef.current;
    canvasEl.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Zoom listeners
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z += e.deltaY * 0.008;
      camera.position.z = Math.max(3, Math.min(camera.position.z, 15));
    };
    canvasEl.addEventListener('wheel', handleWheel, { passive: false });

    // 7. Render Loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      // Gentle self-spin if not dragging
      if (!isDragging) {
        vehicleGroup.rotation.y += 0.002;
      }
      
      renderer.render(scene, camera);
    };
    animate();

    // Resize Observer wrapper
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width: newWidth, height: newHeight } = entries[0].contentRect;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    });
    resizeObserver.observe(canvasEl.parentElement as HTMLElement);

    // Save references to cleanup on unmount or tab change
    threeEngineRef.current = {
      renderer,
      scene,
      camera,
      mesh: vehicleGroup,
      animationId
    };

    return () => {
      cancelAnimationFrame(animationId);
      canvasEl.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvasEl.removeEventListener('wheel', handleWheel);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, [activeTab, tour]);

   // Form submit handling
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      error('Rezervasiya etmək üçün zəhmət olmasa daxil olun.', 'Giriş Tələb Olunur');
      return;
    }

    if (!bookingDate) {
      error('Lütfən gedəcəyiniz tarixi seçin.');
      return;
    }

    const checkInDateObj = new Date(bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (checkInDateObj < today) {
      error('Seçilmiş tarix keçmişdə ola bilməz.');
      return;
    }

    try {
      const totalPrice = (tour?.price || 0) * guestsCount;
      const res = await api.reservations.create({
        type: 'tour',
        refId: tour?.id,
        fullName: bookingFullName,
        email: bookingEmail,
        phone: bookingPhone,
        checkIn: bookingDate,
        checkOut: bookingDate, // Simple Tour is single-start check-in
        guests: Number(guestsCount),
        notes: bookingNotes,
        totalPrice,
        viaWhatsapp: true
      });

      if (res && res.id) {
        const text = `Salam! Mən Naxçıvan Rəqəmsal Turizm Bələdçisi üzərindən yeni tur rezervasiyası etmək istəyirəm.\n\n` +
          `📋 Sifariş Məlumatları:\n` +
          `• Tur: ${tour?.name || ''}\n` +
          `• Müştəri: ${bookingFullName}\n` +
          `• Telefon: ${bookingPhone}\n` +
          `• E-poçt: ${bookingEmail}\n` +
          `• Tarix: ${bookingDate}\n` +
          `• İştirakçı sayı: ${guestsCount}\n` +
          `• Ümumi Məbləğ: ${totalPrice} AZN\n` +
          (bookingNotes.trim() ? `• Qeyd: ${bookingNotes}\n` : '');

        const encodedText = encodeURIComponent(text);
        const whatsappUrl = `https://api.whatsapp.com/send?phone=994703538283&text=${encodedText}`;
        
        success('Sizin sifarişiniz qeydə alındı! WhatsApp-a yönləndirilirsiniz...', 'Sifariş qəbul olundu');
        setIsBookingModalOpen(false);
        
        setTimeout(() => {
          window.location.href = whatsappUrl;
        }, 1000);
      }
    } catch (e: any) {
      error(e.message || 'Sifariş zamanı rəsmi xəta yarandı.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-16 flex justify-center items-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <span className="w-12 h-12 border-4 border-gold-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-sans text-sm animate-pulse">Zəhmət olmasa gözləyin, ətraflı məlumatlar yüklənir...</p>
        </div>
      </div>
    );
  }

  if (!tour) return null;

  return (
    <div className="min-h-screen pb-24 relative z-10" id="tour-detail-page">
      
      {/* 1. Full-Width Hero Cover Header with Back Arrow control */}
      <div className="relative w-full h-[460px] bg-navy-deep">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: `url("${tour.mainImage}")` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/40 to-black/30" />

        {/* Floating Content detail */}
        <div className="absolute inset-0 flex flex-col justify-between max-w-7xl mx-auto px-4 md:px-12 py-8 relative">
          
          <button
            onClick={() => onNavigate('/tours')}
            className="w-fit flex items-center gap-2 bg-navy-deep/80 text-white rounded-xl px-4 py-2 border border-white/10 hover:border-gold-primary transition-all text-xs font-sans font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Turlara Geri Dön
          </button>

          <div id="tour-header-details" className="mb-4">
            <span className="bg-gold-primary text-navy-deep text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-lg">
              {tour.category}
            </span>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mt-4 max-w-4xl tracking-tight leading-tight">
              {tour.name}
            </h1>
            <p className="text-sm md:text-base text-slate-300 font-sans mt-3 max-w-2xl text-balance">
              {tour.shortDescription}
            </p>
          </div>
        </div>
      </div>

      {/* Main Two-Column Structure layout */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-10 mt-12">
        
        {/* Left Column content (65%) */}
        <div className="lg:col-span-8 flex flex-col gap-6" id="tour-main-content">
          
          {/* Tab Selection Header (sticky on scroll) */}
          <div className="bg-white border border-slate-100 rounded-2xl flex items-center overflow-x-auto p-2 shadow-sm sticky top-20 z-20">
            {[
              { id: 'stops', label: 'Gediləcək Yerlər', icon: <MapPin className="w-4 h-4" />, show: tour.stops && tour.stops.length > 0 },
              { id: 'meals', label: 'Qidalanma', icon: <Coffee className="w-4 h-4" />, show: (tour.customMeals && tour.customMeals.length > 0) || (tour.meals && (tour.meals.breakfast?.restaurantName || tour.meals.lunch?.restaurantName || tour.meals.dinner?.restaurantName)) },
              { id: 'hotel', label: 'Qonaqlama', icon: <Hotel className="w-4 h-4" />, show: (tour.hotelIds && tour.hotelIds.length > 0) || (tour.accommodation && tour.accommodation.hotelName) },
              { id: 'transport', label: 'Nəqliyyat', icon: <Car className="w-4 h-4" />, show: (tour.customTransports && tour.customTransports.length > 0) || (tour.transport && (tour.transport.type || tour.transport.model)) }
            ].filter(tab => tab.show).map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 font-sans text-xs md:text-sm font-semibold py-3 px-4 rounded-xl cursor-pointer whitespace-nowrap transition-all ${
                    active 
                      ? 'bg-gold-primary text-navy-deep shadow-sm' 
                      : 'text-slate-500 hover:text-navy-deep hover:bg-slate-50'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB CONTENTS */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-md">
                 {/* Tab 1: Gediləcək Yerlər Timeline view */}
            {activeTab === 'stops' && (
              <div className="flex flex-col gap-8 relative select-none font-sans">
                <div className="absolute top-4 bottom-4 left-6 md:left-8 w-0.5 bg-gold-primary/30" />
                
                {tour.stops.map((stop, idx) => (
                  <div key={idx} className="flex gap-4 md:gap-8 items-start relative z-10">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gold-primary/10 border-2 border-gold-primary text-gold-primary flex items-center justify-center shrink-0 shadow-sm font-serif font-bold text-lg">
                      {idx + 1}
                    </div>
                    
                    <div className="flex-1 bg-slate-50 border border-slate-100 p-5 rounded-2xl flex flex-col md:flex-row gap-5 hover:bg-slate-100/50 transition-colors">
                      {stop.image && (
                        <div className="w-full md:w-36 aspect-[4/3] rounded-xl overflow-hidden shrink-0 bg-slate-200">
                          <img src={stop.image} alt={stop.placeName} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <h4 className="font-serif text-lg font-bold text-navy-deep">{stop.placeName}</h4>
                            <span className="text-[10px] font-mono bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">{stop.duration}</span>
                          </div>
                          {stop.lat && stop.lng && (
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${stop.lat},${stop.lng}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] font-bold text-gold-primary hover:text-amber-600 flex items-center gap-1 transition-colors"
                            >
                              <MapPin className="w-3.5 h-3.5" />
                              Xəritədə Bax
                            </a>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-sans mt-3 leading-relaxed">{stop.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 2: Qidalanma section */}
            {activeTab === 'meals' && (
              <div className="flex flex-col gap-6 select-none font-sans" id="tour-meals-container">
                <div className="border-b pb-4">
                  <h3 className="font-serif text-xl font-bold text-navy-deep flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-gold-primary" />
                    Milli və Regional Kulinariya Təminatı
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Səyahət müddətində dadacağınız xüsusi təamlar və restoran planı</p>
                </div>
                
                {tour.customMeals && tour.customMeals.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tour.customMeals.map((meal, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-100 p-5 rounded-2xl flex flex-col gap-4 animate-fadeIn">
                        {meal.image && (
                          <div className="w-full h-40 rounded-xl overflow-hidden bg-slate-200">
                            <img src={meal.image} alt={meal.typeName} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div>
                          <span className="bg-gold-primary/10 text-gold-primary text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-lg">
                            {meal.typeName}
                          </span>
                          <h4 className="text-base font-bold text-navy-deep font-sans mt-2">{meal.typeName}</h4>
                          {meal.restaurantName && (
                            <p className="text-xs text-slate-500 font-sans font-medium mt-1">📍 Məkan: {meal.restaurantName}</p>
                          )}
                          <div className="flex flex-wrap gap-1.5 mt-4">
                            {meal.items.map((item, idy) => (
                              <span key={idy} className="bg-white border border-slate-200 text-slate-600 text-xs px-2.5 py-1 rounded-xl font-medium">
                                • {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { title: 'Səhər Yeməyi', obj: tour.meals?.breakfast, icon: '☕' },
                      { title: 'Nahar', obj: tour.meals?.lunch, icon: '🍲' },
                      { title: 'Axşam Yeməyi', obj: tour.meals?.dinner, icon: '🍢' }
                    ].filter(m => m.obj && m.obj.restaurantName).map((meal, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
                        <div className="text-2xl mb-1">{meal.icon}</div>
                        <h4 className="text-sm font-bold text-navy-deep font-sans">{meal.title}</h4>
                        <p className="text-xs text-slate-400 font-sans mt-1">Məkan: {meal.obj.restaurantName}</p>
                        
                        <div className="flex flex-col gap-1.5 mt-4">
                          {meal.obj.items.map((item, idy) => (
                            <div key={idy} className="flex items-center gap-2 text-xs text-slate-600 font-sans">
                              <span className="w-1.5 h-1.5 bg-gold-primary rounded-full" />
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Qonaqlama section */}
            {activeTab === 'hotel' && (
              <div className="select-none font-sans" id="tour-accommodation-container">
                <div className="border-b pb-4 mb-6">
                  <h3 className="font-serif text-xl font-bold text-navy-deep flex items-center gap-2">
                    <Hotel className="w-5 h-5 text-gold-primary" />
                    Yaşayış və Otel Təminatı
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Bu tur müddətində qalacağınız lüks dərəcəli otel profilləri</p>
                </div>

                {tour.hotelIds && tour.hotelIds.length > 0 && hotelsList.length > 0 ? (
                  <div className="flex flex-col gap-6 animate-fadeIn">
                    {hotelsList
                      .filter(h => tour.hotelIds?.includes(h.id))
                      .map((hotel, idx) => (
                        <div key={idx} className="bg-slate-50 border border-slate-100 p-6 rounded-2xl flex flex-col md:flex-row gap-6 hover:bg-slate-100/50 transition-colors">
                          {hotel.images && hotel.images[0] && (
                            <div className="w-full md:w-48 aspect-video rounded-xl overflow-hidden shrink-0 bg-slate-200">
                              <img src={hotel.images[0]} alt={hotel.name} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <h4 className="font-serif text-xl font-bold text-navy-deep">{hotel.name}</h4>
                                <p className="text-xs text-slate-400 font-sans mt-1">📍 Ünvan: {hotel.address}</p>
                              </div>
                              <div className="flex items-center gap-1 bg-gold-primary/10 text-gold-primary px-2.5 py-1 rounded-xl">
                                <span className="text-xs font-bold font-sans">Reytinq:</span>
                                <StarRating rating={hotel.stars} size={13} />
                              </div>
                            </div>
                            
                            {hotel.shortDescription && (
                              <p className="text-xs text-slate-500 font-sans mt-3 leading-relaxed">{hotel.shortDescription}</p>
                            )}

                            <div className="flex flex-wrap gap-2 mt-4">
                              {hotel.amenities?.slice(0, 5).map((a: string, i: number) => (
                                <span key={i} className="bg-white border border-slate-200 text-slate-650 text-[10px] font-sans font-semibold px-2.5 py-1 rounded-lg">
                                  {a}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl flex flex-col md:flex-row gap-6 hover:bg-slate-100/50 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-serif text-xl font-bold text-navy-deep">{tour.accommodation?.hotelName || 'Lüks Mehmanxana'}</h4>
                      <p className="text-xs text-slate-400 font-sans mt-1">Otaq növü: {tour.accommodation?.roomType}</p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-slate-500 font-sans font-medium">Reytinq:</span>
                        <StarRating rating={5} size={14} />
                      </div>

                      <div className="flex flex-wrap gap-2 mt-6">
                        {tour.accommodation?.amenities?.map((a, i) => (
                          <span key={i} className="bg-white border border-slate-200 text-slate-650 text-xs font-sans font-semibold px-3 py-1.5 rounded-xl block">
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Nəqliyyat with complete Three.js Canvas */}
            {activeTab === 'transport' && (
              <div className="flex flex-col gap-6 font-sans" id="tour-transport-container">
                <div className="border-b pb-4">
                  <h3 className="font-serif text-xl font-bold text-navy-deep flex items-center gap-2">
                    <Car className="w-5 h-5 text-gold-primary" />
                    Komfortlu Nəqliyyat Təminatı
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Yolların və marşrutların rahatlığı üçün VIP nəqliyyat sistemləri</p>
                </div>

                {tour.customTransports && tour.customTransports.length > 0 ? (
                  <div className="flex flex-col gap-6 animate-fadeIn">
                    {tour.customTransports.map((trans, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-100 p-6 rounded-2xl flex flex-col md:flex-row gap-6 hover:bg-slate-100/50 transition-colors">
                        {trans.image && (
                          <div className="w-full md:w-48 aspect-video rounded-xl overflow-hidden shrink-0 bg-slate-200 shadow-sm">
                            <img src={trans.image} alt={trans.model} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1">
                          <span className="bg-gold-primary/10 text-gold-primary text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg">
                            {trans.type}
                          </span>
                          <h4 className="font-sans text-lg font-bold text-navy-deep mt-2">{trans.model}</h4>
                          <div className="flex flex-wrap gap-2 mt-4">
                            {trans.features.map((feat, fIdx) => (
                              <span key={fIdx} className="bg-white border border-slate-200 text-slate-600 text-[10px] px-2.5 py-1 rounded-lg font-medium">
                                ✓ {feat}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h4 className="text-base font-bold text-navy-deep font-sans">{tour.transport?.model || 'Modern avtobus'}</h4>
                        <p className="text-xs text-slate-400 font-sans mt-0.5">Növü: {tour.transport?.type}</p>
                      </div>
                    </div>

                    {tour.transport?.displayMode === 'image' ? (
                      <div className="relative w-full h-[320px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 shadow-inner flex items-center justify-center group">
                        <img 
                          src={tour.transport.image || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800'} 
                          alt={tour.transport.model} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800';
                          }}
                        />
                        <div className="absolute top-4 left-4 bg-slate-905/80 backdrop-blur-md border border-gold-primary/30 text-gold-primary text-[10px] font-sans font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                          📸 Avtomobilin Real Şəkli
                        </div>
                      </div>
                    ) : (
                      <div className="relative w-full h-[320px] bg-navy-deep rounded-2xl overflow-hidden border border-slate-700">
                        <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
                        
                        {/* Drag hints label */}
                        <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md text-white text-[10px] md:text-xs text-center py-2 px-3 rounded-xl pointer-events-none uppercase font-semibold font-sans tracking-wide">
                          🎮 Nəqliyyatın 3D Görüntüsü — Sürükləyərək fırlada və ya yaxınlaşdıra bilərsiniz
                        </div>
                      </div>
                    )}

                    {/* Feature breakdown list */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
                      {tour.transport?.features?.map((feat, idx) => (
                        <div key={idx} className="bg-slate-50 border border-slate-150 p-3 rounded-xl flex flex-col items-center justify-center text-center">
                          <Check className="w-4 h-4 text-emerald-500 mb-1" />
                          <span className="text-[10px] font-bold text-slate-700 font-sans leading-tight">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Right Column booking sidebar (35%) - sticky */}
        <div className="lg:col-span-4 select-none">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-lg sticky top-24 z-10 flex flex-col gap-5 border-t-4 border-t-gold-primary">
            
            {/* Price section */}
            <div>
              <span className="text-xs text-slate-400 font-sans uppercase tracking-widest">Hər Şey Daxil</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-mono font-bold text-gold-primary">₼ {tour.price}</span>
                <span className="text-sm font-sans text-slate-500">/ nəfər</span>
              </div>
            </div>

            <hr className="border-slate-100" />

             {/* Quick check details */}
             <div className="flex flex-col gap-3 text-xs font-sans">
               <div className="flex justify-between items-center">
                 <span className="text-slate-400 font-medium">Turun Müddəti</span>
                 <span className="font-bold text-navy-deep">{tour.duration} Gün / Nəfər</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-slate-400 font-medium">Ziyarət mətni</span>
                 <span className="font-bold text-navy-deep">{tour.stops.length} Tarixi Dayanacaq</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-slate-400 font-medium font-medium">Yeməklər</span>
                 <span className="font-bold text-navy-deep">Səhər, Nahar, Şam daxil</span>
               </div>
               {tour.vehicleType && (
                 <div className="flex justify-between items-center">
                   <span className="text-slate-400 font-medium">Nəqliyyat Növü</span>
                   <span className="font-bold text-navy-deep">{tour.vehicleType}</span>
                 </div>
               )}
               <div className="flex justify-between items-center">
                 <span className="text-slate-400 font-medium">Avto təminatı</span>
                 <span className="font-bold text-navy-deep">{tour.transport.type} ({tour.transport.displayMode === 'image' ? 'Şəkil' : '360° 3D'})</span>
               </div>
               <div className="flex justify-between items-center border-t border-dashed pt-2.5">
                 <span className="text-slate-400 font-medium">Tur Təşkilatçısı</span>
                 <span className="font-extrabold text-navy-deep underline decoration-gold-primary decoration-2">{tour.companyName || 'Naxçıvan Səyahət Birliyi'}</span>
               </div>
             </div>
 
             {tour.includedServices && tour.includedServices.length > 0 && (
               <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 font-sans text-xs">
                 <p className="font-bold text-navy-deep mb-2">🎁 Qiymətə Daxil Xidmətlər:</p>
                 <div className="flex flex-wrap gap-1.5">
                   {tour.includedServices.map((service, idx) => (
                     <span key={idx} className="bg-white border text-slate-600 text-[10px] px-2 py-0.5 rounded font-medium shadow-sm">
                       ✓ {service}
                     </span>
                   ))}
                 </div>
               </div>
             )}
 
             {tour.pdfDocuments && tour.pdfDocuments.length > 0 && (
               <div className="bg-emerald-50/50 border border-emerald-100/50 p-4 rounded-2xl flex flex-col gap-2 font-sans text-xs">
                 <div className="flex items-center gap-2 text-emerald-800 font-bold">
                   <FileText className="w-4 h-4 text-emerald-600" />
                   <span>Rəsmi Səyahət Prospekti</span>
                 </div>
                 <p className="text-[11px] text-slate-500">Təfsilatlı dayanacaq cədvəli və rəsmi ekskursiya qaydaları (PDF formatda).</p>
                 <a
                   href={tour.pdfDocuments[0]}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="mt-1 bg-emerald-600 hover:bg-emerald-700 text-gold-light font-bold py-2 px-3 rounded-xl block text-center shadow-sm hover:shadow transition-all font-mono"
                 >
                   PDF PROSPEKTİ YÜKLƏ
                 </a>
               </div>
             )}
 
             <hr className="border-slate-100" />
 
             {/* Core reservation CTA */}
             <button
               onClick={() => setIsBookingModalOpen(true)}
               className="w-full bg-gold-primary hover:bg-gold-dark text-navy-deep font-sans font-bold py-4 rounded-xl shadow-md cursor-pointer transition-all active:scale-97 text-center block"
             >
               Rezervasiya Et
             </button>
 
             <span className="text-[10px] text-center text-slate-400 font-sans leading-relaxed">
               Sualınız var? Bizimlə birbaşa +994 36 545 25 25 nömrəsi vasitəsilə əlaqə yaradın.
             </span>

          </div>
        </div>

      </div>

      {/* 4. MODAL RESERVATION PANEL COMPONENT */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 md:p-8 relative border border-slate-100 shadow-2xl overflow-y-auto max-h-[90vh]">
            
            <button
              onClick={() => setIsBookingModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <span className="text-[10px] uppercase font-bold tracking-widest text-gold-primary font-mono select-none">Yeni Sifariş</span>
              <h3 className="text-2xl font-serif font-bold text-navy-deep leading-tight mt-1">{tour.name}</h3>
              <p className="text-xs font-sans text-slate-400 mt-1">Lütfən səyahət paketini tamamlamaq üçün məlumatlarınızı daxil edin</p>
            </div>

            {user ? (
              <form onSubmit={handleBookingSubmit} className="flex flex-col gap-4 font-sans">
                
                {/* Full name input */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Ad və Soyad</label>
                  <input
                    type="text"
                    required
                    value={bookingFullName}
                    onChange={(e) => setBookingFullName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-gold-primary"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Email */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">E-Poçt ünvanı</label>
                    <input
                      type="email"
                      required
                      value={bookingEmail}
                      onChange={(e) => setBookingEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-gold-primary"
                    />
                  </div>
                  {/* Telefon */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Mobil Telefon</label>
                    <input
                      type="tel"
                      required
                      placeholder="+994"
                      value={bookingPhone}
                      onChange={(e) => setBookingPhone(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-gold-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Date selection picker */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Gediş Tarixi</label>
                    <input
                      type="date"
                      required
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-gold-primary"
                    />
                  </div>
                  {/* Guest count input */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Qonaq Sayı</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={12}
                      value={guestsCount}
                      onChange={(e) => setGuestsCount(Math.max(1, Number(e.target.value)))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-gold-primary text-center font-mono"
                    />
                  </div>
                </div>

                {/* Special Requirements Notes */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Xüsusi qeydlər (İstəyə bağlı)</label>
                  <textarea
                    rows={3}
                    placeholder="Qidalanma təvəccühü, əlil arabası dəstəyi və ya digər qeydlər..."
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-gold-primary leading-normal"
                  />
                </div>

                {/* Live total pricing breakdown */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between mt-2 select-none">
                  <div>
                    <p className="text-[10px] text-slate-400 font-sans uppercase">Toplam Qiymət</p>
                    <p className="text-xs text-slate-500 font-sans mt-0.5">₼ {tour.price} x {guestsCount} nəfər</p>
                  </div>
                  <span className="text-2xl font-mono font-bold text-gold-primary">₼ {tour.price * guestsCount}</span>
                </div>

                <div className="flex gap-4 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsBookingModalOpen(false)}
                    className="flex-1 bg-white border border-slate-200 hover:border-slate-350 text-slate-600 font-bold py-3.5 rounded-xl text-sm transition-all text-center cursor-pointer"
                  >
                    Ləğv Et
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gold-primary hover:bg-gold-dark text-navy-deep font-bold py-3.5 rounded-xl text-sm shadow-md transition-all active:scale-97 text-center cursor-pointer"
                  >
                    Təsdiqlə və Göndər
                  </button>
                </div>

              </form>
            ) : (
              <div className="text-center py-8">
                <ShieldAlert className="w-12 h-12 text-gold-primary mx-auto mb-4" />
                <h4 className="font-serif text-lg font-bold text-navy-deep">Sessiya tapılmadı</h4>
                <p className="text-xs text-slate-500 font-sans mt-2 max-w-xs mx-auto">
                  Səyahət sifarişini rəsmi tamamlamaq üçün lütfən sistemə giriş edin.
                </p>
                <div className="flex flex-col gap-3 mt-8">
                  <button
                    onClick={() => {
                      setIsBookingModalOpen(false);
                      onNavigate('/login');
                    }}
                    className="w-full bg-gold-primary hover:bg-gold-dark text-navy-deep font-bold py-3 rounded-xl text-sm shadow-md cursor-pointer"
                  >
                    Giriş səhifəsinə get
                  </button>
                  <button
                    onClick={() => setIsBookingModalOpen(false)}
                    className="w-full bg-slate-50 text-slate-500 hover:bg-slate-100 py-2.5 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Geri Dön
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
