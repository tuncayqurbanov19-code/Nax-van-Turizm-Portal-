import React, { useEffect, useState } from 'react';
import { ShieldCheck, Calendar, Compass, Building, Landmark, MessageSquare, Users, Edit3, Trash2, Plus, Check, X, ShieldAlert, Award, TrendingUp, Utensils, BookOpen, Settings, Image, Video, Heart, Globe, FileText, Copy, ExternalLink, Search, Sliders, RotateCw, ZoomIn, Upload, QrCode, Printer } from 'lucide-react';
import { api } from '../services/api';
import QRCode from 'qrcode';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Tour, Hotel, Place, Comment, Reservation, User, Restaurant, Blog, SettingsSchema, HeroSlider, Testimonial, VideoItem, PromoBanner, TourismCompany } from '../types';
import StarRating from '../components/ui/StarRating';

interface AdminProps {
  onNavigate: (path: string) => void;
}

type AdminTab = 'reservations' | 'tours' | 'hotels' | 'places' | 'comments' | 'users' | 'restaurants' | 'blogs' | 'settings' | 'companies';

export default function Admin({ onNavigate }: AdminProps) {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<AdminTab>('reservations');
  const [loading, setLoading] = useState(true);

  // Entities state
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [restaurantsList, setRestaurantsList] = useState<Restaurant[]>([]);
  const [blogsList, setBlogsList] = useState<Blog[]>([]);
  const [settingsSchema, setSettingsSchema] = useState<SettingsSchema | null>(null);
  const [companies, setCompanies] = useState<TourismCompany[]>([]);

  // NEW Forms state
  // New Tour Form
  const [newTourName, setNewTourName] = useState('');
  const [newTourImg, setNewTourImg] = useState('');
  const [newTourPrice, setNewTourPrice] = useState(150);
  const [newTourDuration, setNewTourDuration] = useState(3);
  const [newTourCategory, setNewTourCategory] = useState('Tarixi');
  const [newTourDesc, setNewTourDesc] = useState('');
  const [newTourVehicleType, setNewTourVehicleType] = useState('Mercedes Sprinter (Komfort)');
  const [newTourCompanyId, setNewTourCompanyId] = useState('');
  const [newTourIncludedServices, setNewTourIncludedServices] = useState('Peşəkar bələdçi, kondisionerli nəqliyyat, muzey biletləri, otel binaları, dadlı milli səhər yeməyi');
  const [newTourPdfUrl, setNewTourPdfUrl] = useState('');

  // Vehicle settings within Tour state
  const [vehicleDisplayMode, setVehicleDisplayMode] = useState<'image' | '3d'>('3d');
  const [vehicleImgUrl, setVehicleImgUrl] = useState('');
  const [vehicleModelName, setVehicleModelName] = useState('Mercedes Sprinter VIP 2025');
  const [vehicleFeatures, setVehicleFeatures] = useState('Kondisioner, Dəri oturacaqlar, USB şarj portları, Wi-Fi');

  // New Company Form state
  const [newCompName, setNewCompName] = useState('');
  const [newCompLogo, setNewCompLogo] = useState('');
  const [newCompDesc, setNewCompDesc] = useState('');
  const [newCompPhone, setNewCompPhone] = useState('');
  const [newCompEmail, setNewCompEmail] = useState('');
  const [newCompAddress, setNewCompAddress] = useState('');
  const [newCompWebsite, setNewCompWebsite] = useState('');
  const [newCompFb, setNewCompFb] = useState('');
  const [newCompInsta, setNewCompInsta] = useState('');
  const [newCompTg, setNewCompTg] = useState('');

  // New Place Form
  const [newPlaceName, setNewPlaceName] = useState('');
  const [newPlaceImg, setNewPlaceImg] = useState('');
  const [newPlaceCategory, setNewPlaceCategory] = useState('Tarixi');
  const [newPlaceEpoch, setNewPlaceEpoch] = useState('E.ə. III minillik');
  const [newPlaceHours, setNewPlaceHours] = useState('09:00 - 18:00');
  const [newPlaceFee, setNewPlaceFee] = useState('Pulsuz');
  const [newPlaceDesc, setNewPlaceDesc] = useState('');

  // New Hotel Form
  const [newHotelName, setNewHotelName] = useState('');
  const [newHotelImg, setNewHotelImg] = useState('');
  const [newHotelStars, setNewHotelStars] = useState(5);
  const [newHotelAddress, setNewHotelAddress] = useState('');

  // New Restaurant Form
  const [newRestName, setNewRestName] = useState('');
  const [newRestDesc, setNewRestDesc] = useState('');
  const [newRestAddr, setNewRestAddr] = useState('');
  const [newRestPhone, setNewRestPhone] = useState('');
  const [newRestImg, setNewRestImg] = useState('');
  const [newRestHours, setNewRestHours] = useState('11:00 - 23:00');
  const [newRestCuisine, setNewRestCuisine] = useState('Milli Naxçıvan Mətbəxi');

  // New Blog Form
  const [newBlogTitle, setNewBlogTitle] = useState('');
  const [newBlogContent, setNewBlogContent] = useState('');
  const [newBlogImg, setNewBlogImg] = useState('');
  const [newBlogCategory, setNewBlogCategory] = useState('Tarix və İnanc');
  const [newBlogAuthor, setNewBlogAuthor] = useState('Naxçıvan Bələdçisi');

  // General configuration state bindings
  const [cfgHeaderTitle, setCfgHeaderTitle] = useState('');
  const [cfgFooterText, setCfgFooterText] = useState('');
  const [cfgPhone, setCfgPhone] = useState('');
  const [cfgEmail, setCfgEmail] = useState('');
  const [cfgAddress, setCfgAddress] = useState('');
  const [cfgFacebook, setCfgFacebook] = useState('');
  const [cfgInstagram, setCfgInstagram] = useState('');
  const [cfgTelegram, setCfgTelegram] = useState('');
  const [cfgSeoTitle, setCfgSeoTitle] = useState('');
  const [cfgSeoDesc, setCfgSeoDesc] = useState('');
  const [cfgSeoKeywords, setCfgSeoKeywords] = useState('');
  const [cfgPrimaryColor, setCfgPrimaryColor] = useState('#F59E0B');
  const [cfgDarkScheme, setCfgDarkScheme] = useState(true);

  // Logo & favicon & Media state bindings
  const [cfgLogoLightUrl, setCfgLogoLightUrl] = useState('');
  const [cfgLogoDarkUrl, setCfgLogoDarkUrl] = useState('');
  const [cfgFaviconUrl, setCfgFaviconUrl] = useState('');
  const [cfgLogoWidth, setCfgLogoWidth] = useState(150);
  const [cfgLogoHeight, setCfgLogoHeight] = useState(40);
  const [cfgLogoPositionX, setCfgLogoPositionX] = useState(0);
  const [cfgLogoPositionY, setCfgLogoPositionY] = useState(0);

  const [mediaList, setMediaList] = useState<any[]>([]);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaPickerCallback, setMediaPickerCallback] = useState<((url: string) => void) | null>(null);
  const [mediaPickerCategory, setMediaPickerCategory] = useState<string>('Hamısı');
  const [mediaSearchQuery, setMediaSearchQuery] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [croppingImage, setCroppingImage] = useState<any | null>(null);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropRotate, setCropRotate] = useState(0);

  // QR Code Generation States & Logic
  const [selectedForQr, setSelectedForQr] = useState<{ id: string; name: string; category: string; type: 'tour' | 'place'; image: string } | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  const generateQrCode = async (id: string, name: string, category: string, type: 'tour' | 'place', image: string) => {
    try {
      const urlPath = type === 'tour' ? `/tours/${id}` : `/places/${id}`;
      // Construct exact hash path corresponding to the route system in App.tsx
      const targetUrl = `${window.location.origin}${window.location.pathname}#${urlPath}`;
      
      const dataUrl = await QRCode.toDataURL(targetUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0B1528', // Deep navy matching the core theme colour
          light: '#FFFFFF'
        }
      });
      
      setSelectedForQr({ id, name, category, type, image });
      setQrCodeDataUrl(dataUrl);
    } catch (err: any) {
      error('QR Kod yaradıla bilmədi: ' + err.message);
    }
  };

  const openMediaPicker = (callback: (url: string) => void) => {
    setMediaPickerCallback(() => callback);
    setIsMediaPickerOpen(true);
  };

  // Sliders/Banners editing lists
  const [cfgSliders, setCfgSliders] = useState<HeroSlider[]>([]);
  const [cfgTestimonials, setCfgTestimonials] = useState<Testimonial[]>([]);
  const [cfgVideos, setCfgVideos] = useState<VideoItem[]>([]);
  const [cfgGalleries, setCfgGalleries] = useState<string[]>([]);
  const [cfgPromoBanners, setCfgPromoBanners] = useState<PromoBanner[]>([]);

  // Temporary inputs in settings edits
  const [newSliderTitle, setNewSliderTitle] = useState('');
  const [newSliderSubtitle, setNewSliderSubtitle] = useState('');
  const [newSliderImg, setNewSliderImg] = useState('');

  const [newTestiName, setNewTestiName] = useState('');
  const [newTestiText, setNewTestiText] = useState('');
  const [newTestiRole, setNewTestiRole] = useState('Ziyarətçi');
  const [newTestiRating, setNewTestiRating] = useState(5);

  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoDesc, setNewVideoDesc] = useState('');

  const [newGalleryUrl, setNewGalleryUrl] = useState('');

  const [newPromoTitle, setNewPromoTitle] = useState('');
  const [newPromoText, setNewPromoText] = useState('');
  const [newPromoImg, setNewPromoImg] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [resList, toursList, hotelsList, placesList, commentsList, accounts, rests, blgs, cfg, compsList, mediaData] = await Promise.all([
        api.reservations.getAdminList(),
        api.tours.getList(),
        api.hotels.getList(),
        api.places.getList(),
        api.comments.getAdminList(),
        api.users.getAdminList(),
        api.restaurants.getAdminList(),
        api.blogs.getAdminList(),
        api.settings.get(),
        api.companies.getAdminList(),
        (api as any).media.getList().catch(() => [])
      ]);

      setReservations(resList || []);
      setTours(toursList || []);
      setHotels(hotelsList || []);
      setPlaces(placesList || []);
      setComments(commentsList || []);
      setUsersList(accounts || []);
      setRestaurantsList(rests || []);
      setBlogsList(blgs || []);
      setCompanies(compsList || []);
      setMediaList(mediaData || []);
      
      if (cfg) {
        setSettingsSchema(cfg);
        setCfgHeaderTitle(cfg.headerFooter?.headerTitle || '');
        setCfgFooterText(cfg.headerFooter?.footerText || '');
        setCfgPhone(cfg.contactInfo?.phone || '');
        setCfgEmail(cfg.contactInfo?.email || '');
        setCfgAddress(cfg.contactInfo?.address || '');
        setCfgFacebook(cfg.socialMediaLinks?.facebook || '');
        setCfgInstagram(cfg.socialMediaLinks?.instagram || '');
        setCfgTelegram(cfg.socialMediaLinks?.telegram || '');
        setCfgSeoTitle(cfg.seoSettings?.title || '');
        setCfgSeoDesc(cfg.seoSettings?.description || '');
        setCfgSeoKeywords(cfg.seoSettings?.keywords || '');
        setCfgPrimaryColor(cfg.themeSettings?.primaryColor || '#F59E0B');
        setCfgDarkScheme(cfg.themeSettings?.darkScheme ?? true);
        setCfgSliders(cfg.heroSliders || []);
        setCfgTestimonials(cfg.testimonials || []);
        setCfgVideos(cfg.videos || []);
        setCfgGalleries(cfg.photoGalleries || []);
        setCfgPromoBanners(cfg.promoBanners || []);

        // Load logo settings safely with beautiful defaults
        setCfgLogoLightUrl(cfg.logoSettings?.logoLightUrl || 'https://images.unsplash.com/photo-1549643276-fdf2fab574f5?q=80&w=150');
        setCfgLogoDarkUrl(cfg.logoSettings?.logoDarkUrl || 'https://images.unsplash.com/photo-1549643276-fdf2fab574f5?q=80&w=150');
        setCfgFaviconUrl(cfg.logoSettings?.faviconUrl || '/favicon.ico');
        setCfgLogoWidth(cfg.logoSettings?.logoWidth || 150);
        setCfgLogoHeight(cfg.logoSettings?.logoHeight || 40);
        setCfgLogoPositionX(cfg.logoSettings?.logoPositionX || 0);
        setCfgLogoPositionY(cfg.logoSettings?.logoPositionY || 0);
      }
    } catch (e: any) {
      error(e.message || 'Məlumatları oxuyan zaman xəta yarandı.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      error('Bu fəaliyyət yalnız inzibatçılar (Admin) üçün nəzərdə tutulmuşdur.');
      onNavigate('/');
      return;
    }
    loadData();
  }, [user]);

  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioCtx.currentTime;
      
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      gain1.gain.setValueAtTime(0.08, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.2);
      
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1318.51, now + 0.08);
      gain2.gain.setValueAtTime(0.08, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.4);
    } catch (err) {
      console.warn("Audio Context alert could not be played:", err);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    let socket: WebSocket | null = null;
    let pingInterval: NodeJS.Timeout;

    const connectWS = () => {
      try {
        socket = new WebSocket(wsUrl);

        socket.onopen = () => {
          socket?.send(JSON.stringify({ type: 'auth', role: 'admin' }));
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'new_reservation') {
              const newRes = data.reservation;
              
              setReservations((prev) => {
                if (prev.some((r) => r.id === newRes.id)) return prev;
                return [newRes, ...prev];
              });

              success(`Yeni Rezervasiya daxil oldu! Qonaq: ${newRes.fullName}`, 'Yeni Sifariş');
              playChime();
            }
          } catch (e) {
            console.error('WebSocket message parsing error:', e);
          }
        };

        socket.onclose = () => {
          setTimeout(connectWS, 5000);
        };

        socket.onerror = (err) => {
          console.warn('WebSocket encountering connection error:', err);
        };
      } catch (err) {
        console.error('WebSocket connection setup error:', err);
      }
    };

    connectWS();

    pingInterval = setInterval(() => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'ping' }));
      }
    }, 25000);

    return () => {
      clearInterval(pingInterval);
      if (socket) {
        socket.onclose = null;
        socket.close();
      }
    };
  }, [user]);

  // Actions
  const handleApproveReservation = async (id: string) => {
    try {
      const updated = await api.reservations.approve(id);
      success('Sifariş rəsmən təsdiq edildi!');
      loadData();
    } catch (e: any) {
      error(e.message || 'Sifariş təsdiq edilə bilmədi.');
    }
  };

  const handleCancelReservation = async (id: string) => {
    try {
      const updated = await api.reservations.cancel(id);
      success('Sifariş ləğv edildi!');
      loadData();
    } catch (e: any) {
      error(e.message || 'Sifariş ləğv edilə bilmədi.');
    }
  };

  // Add Tour Form action
  const handleAddTourSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTourName.trim() || !newTourDesc.trim()) {
      error('Ad və təsvir bölməsi boş qala bilməz.');
      return;
    }

    try {
      const selectedCompany = companies.find(c => c.id === newTourCompanyId);
      const companyName = selectedCompany ? selectedCompany.name : (companies[0]?.name || 'Naxçıvan Cahan Səyahət');

      const payload: Omit<Tour, 'id'> = {
        name: newTourName,
        category: newTourCategory as any,
        mainImage: newTourImg || 'https://images.unsplash.com/photo-1541963463532-d68292c34b19',
        gallery: [],
        price: Number(newTourPrice),
        duration: Number(newTourDuration),
        shortDescription: newTourDesc,
        stops: [
          { placeName: 'Qədim Gəmiqaya', duration: '1/2 gün', description: 'Gəmiqaya təsvirlərinin rəsmi tədqiqi.', image: '' }
        ],
        meals: {
          breakfast: { restaurantName: 'Milli Səhər Restoranı', items: ['Qaymaq', 'Bal', 'Lavaş'] },
          lunch: { restaurantName: 'Əlincə Qala Restoranı', items: ['Ordubad Qaydısı', 'Sacüstü Kabab'] },
          dinner: { restaurantName: 'Şuşa Lüks Restoran', items: ['Yarpaq dolması', 'Badamlı'] }
        },
        accommodation: {
          hotelName: 'Təbriz Premium Hotel',
          roomType: 'İkiNəfərlik Deluxe',
          amenities: ['WiFi', 'Hovuz', 'Mini Bar']
        },
        transport: {
          type: newTourVehicleType || 'VIP Mercedes Sprinter',
          model: vehicleModelName || 'Sprinter Tourer 2024',
          features: vehicleFeatures ? vehicleFeatures.split(',').map(f => f.trim()) : ['Kondisioner', 'Dəri Oturacaqlar', 'USB portları'],
          model3D: 'VIP_BUS',
          displayMode: vehicleDisplayMode,
          image: vehicleImgUrl
        },
        createdAt: new Date().toISOString(),
        isActive: true,
        vehicleType: newTourVehicleType,
        companyId: newTourCompanyId || companies[0]?.id || 'comp_1',
        companyName: companyName,
        includedServices: newTourIncludedServices ? newTourIncludedServices.split(',').map(s => s.trim()) : [],
        pdfDocuments: newTourPdfUrl ? [newTourPdfUrl] : []
      };

      const res = await api.tours.create(payload);
      if (res) {
        success('Yeni səyahət turu uğurla əlavə edildi!');
        setNewTourName('');
        setNewTourDesc('');
        setNewTourImg('');
        setNewTourVehicleType('Mercedes Sprinter (Komfort)');
        setNewTourCompanyId('');
        setNewTourIncludedServices('Peşəkar bələdçi, kondisionerli nəqliyyat, muzey biletləri, otel binaları, dadlı milli səhər yeməyi');
        setNewTourPdfUrl('');
        loadData();
      }
    } catch (err: any) {
      error(err.message || 'Tur əlavə edilmədi.');
    }
  };

  // Add Landmark Area
  const handleAddPlaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPlaceName.trim() || !newPlaceDesc.trim()) {
      error('Məkan adı boş qala bilməz.');
      return;
    }

    try {
      const payload: Omit<Place, 'id'> = {
        name: newPlaceName,
        category: newPlaceCategory as any,
        images: [newPlaceImg || 'https://images.unsplash.com/photo-1519681393784-d120267933ba'],
        description: newPlaceDesc,
        historicalPeriod: newPlaceEpoch,
        workingHours: newPlaceHours,
        entryFee: newPlaceFee,
        createdAt: new Date().toISOString(),
        location: { lat: 39.2089, lng: 45.4122 },
        isActive: true,
      };

      const res = await api.places.create(payload);
      if (res) {
        success('Yeni tarixi məkan verilənlər bazasına əlavə edildi!');
        setNewPlaceName('');
        setNewPlaceDesc('');
        setNewPlaceImg('');
        loadData();
      }
    } catch (err: any) {
      error(err.message || 'Məkan qeydə alınmadı.');
    }
  };

  // Add Hotel
  const handleAddHotelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newHotelName.trim()) {
      error('Otel adı boş qala bilməz.');
      return;
    }

    try {
      const payload: Omit<Hotel, 'id'> = {
        name: newHotelName,
        stars: Number(newHotelStars),
        address: newHotelAddress || 'Naxçıvan şəhəri',
        images: [newHotelImg || 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c'],
        amenities: ['WiFi', 'Fitness', 'Sauna', 'Hovuz'],
        rooms: [
          { type: 'Standart Otaq', price: 90, capacity: 2 },
          { type: 'Deluxe Suit', price: 170, capacity: 3 }
        ],
        restaurant: {
          name: 'Naxçıvan Regional dad Sarayı',
          cuisine: 'Milli və Avropa',
          hours: '08:00 - 23:00'
        },
        location: { lat: 39.2089, lng: 45.4122 },
        createdAt: new Date().toISOString(),
        email: 'info@hotel.naxcivan.az',
        isActive: true,
        phone: '+994 36 545 00 00',
      };

      const res = await api.hotels.create(payload);
      if (res) {
        success('Yeni mehmanxana və otaq paketləri uğurla əlavə edildi!');
        setNewHotelName('');
        setNewHotelAddress('');
        setNewHotelImg('');
        loadData();
      }
    } catch (err: any) {
      error(err.message || 'Otel qeydə alınmadı.');
    }
  };

  // Delete Landmarks or Tours
  const handleDeleteTour = async (id: string) => {
    if (!window.confirm('Bu tur paketi silinsin? Sifarişlər təsirlənə bilər!')) return;
    try {
      await api.tours.delete(id);
      success('Tur paketi sistemdən silindi.');
      loadData();
    } catch (e: any) {
      error(e.message || 'Silmək mümkün olmadı.');
    }
  };

  const handleDeletePlace = async (id: string) => {
    if (!window.confirm('Bu qədim məkan silinsin?')) return;
    try {
      await api.places.delete(id);
      success('Tarixi məkan siyahıdan təmizləndi.');
      loadData();
    } catch (e: any) {
      error(e.message || 'Məkan silinmədi.');
    }
  };

  const handleDeleteHotel = async (id: string) => {
    if (!window.confirm('Bu mehmanxana profilini tamamilə silmək istəyirsiniz?')) return;
    try {
      await api.hotels.delete(id);
      success('Otel rəsmən silindi.');
      loadData();
    } catch (e: any) {
      error(e.message || 'Otel silinə bilmədi.');
    }
  };

  const handleDeleteComment = async (id: string) => {
    try {
      await api.comments.delete(id);
      success('Ziyarətçi rəyi silindi.');
      loadData();
    } catch (e: any) {
      error(e.message || 'Mərhələli xəta səbəbi ilə rəy silinmədi.');
    }
  };

  const handleAddRestaurantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRestName.trim() || !newRestDesc.trim()) {
      error('Restoran adı və təsviri boş qala bilməz.');
      return;
    }
    try {
      const payload: Omit<Restaurant, 'id'> = {
        name: newRestName,
        description: newRestDesc,
        address: newRestAddr || 'Naxçıvan şəhəri',
        phone: newRestPhone || '+994 36 000 00 00',
        image: newRestImg || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=600',
        hours: newRestHours || '11:00 - 23:00',
        cuisine: newRestCuisine || 'Milli Naxçıvan Mətbəxi',
        isActive: true,
        createdAt: new Date().toISOString()
      };
      await api.restaurants.create(payload);
      success('Yeni restoran uğurla əlavə edildi!');
      setNewRestName('');
      setNewRestDesc('');
      setNewRestAddr('');
      setNewRestPhone('');
      setNewRestImg('');
      loadData();
    } catch (err: any) {
      error(err.message || 'Restoran qeydə alınmadı.');
    }
  };

  const handleDeleteRestaurant = async (id: string) => {
    if (!window.confirm('Bu restoranı silmək istəyirsiniz?')) return;
    try {
      await api.restaurants.delete(id);
      success('Restoran sistemdən təmizləndi.');
      loadData();
    } catch (e: any) {
      error(e.message || 'Restoran silinə bilmədi.');
    }
  };

  const handleAddBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlogTitle.trim() || !newBlogContent.trim()) {
      error('Bloq başlığı və mətni boş qala bilməz.');
      return;
    }
    try {
      const payload: Omit<Blog, 'id'> = {
        title: newBlogTitle,
        content: newBlogContent,
        image: newBlogImg || 'https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?auto=format&fit=crop&q=80&w=600',
        category: newBlogCategory || 'Tarix və Səyahət',
        author: newBlogAuthor || 'İncəsənət Bələdçisi',
        isActive: true,
        createdAt: new Date().toISOString()
      };
      await api.blogs.create(payload);
      success('Yeni bloq yazısı dərc edildi!');
      setNewBlogTitle('');
      setNewBlogContent('');
      setNewBlogImg('');
      loadData();
    } catch (err: any) {
      error(err.message || 'Yazı verilənlər bazasına yazıla bilmədi.');
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!window.confirm('Bu bloq yazısını silmək istəyirsiniz?')) return;
    try {
      await api.blogs.delete(id);
      success('Bloq mətni sistemdən silindi.');
      loadData();
    } catch (e: any) {
      error(e.message || 'Silmə xətası.');
    }
  };

  const handleFileUpload = async (
    eOrFile: React.ChangeEvent<HTMLInputElement> | File,
    onUploadSuccess: (url: string) => void,
    allowedTypes: string[] = []
  ) => {
    let file: File | undefined;
    if (eOrFile instanceof File) {
      file = eOrFile;
    } else if (eOrFile && 'target' in eOrFile) {
      file = eOrFile.target.files?.[0];
    }
    if (!file) return;

    const fileReaderAllowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/svg+xml',
      'application/pdf'
    ];
    if (!fileReaderAllowedTypes.includes(file.type)) {
      error('Dəstəklənməyən fayl formatı. Yalnız JPG, JPEG, PNG, WEBP, SVG və PDF faylları yüklənə bilər.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        const res = await api.uploads.uploadFile(file.name, base64Data);
        if (res && res.url) {
          success(`${file.name} uğurla yükləndi!`);
          onUploadSuccess(res.url);
        }
      } catch (err: any) {
        error(err.message || 'Fayl yüklənən zaman xəta baş verdi.');
      }
    };
    reader.onerror = () => {
      error('Fayl oxunarkən xəta baş verdi.');
    };
    reader.readAsDataURL(file);
  };

  const handleAddCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompName.trim()) {
      error('Şirkət adı boş qala bilməz.');
      return;
    }

    try {
      const payload = {
        name: newCompName,
        logo: newCompLogo || 'https://images.unsplash.com/photo-1549643276-fdf2fab574f5?q=80&w=150',
        description: newCompDesc || 'Premium Travel Company in Nakhchivan.',
        phone: newCompPhone,
        email: newCompEmail,
        address: newCompAddress,
        website: newCompWebsite,
        socialMedia: {
          facebook: newCompFb,
          instagram: newCompInsta,
          telegram: newCompTg
        }
      };

      await api.companies.create(payload);
      success('Yeni turizm şirkəti uğurla qeydə alındı!');
      setNewCompName('');
      setNewCompLogo('');
      setNewCompDesc('');
      setNewCompPhone('');
      setNewCompEmail('');
      setNewCompAddress('');
      setNewCompWebsite('');
      setNewCompFb('');
      setNewCompInsta('');
      setNewCompTg('');
      loadData();
    } catch (err: any) {
      error(err.message || 'Şirkət əlavə edilə bilmədi.');
    }
  };

  const handleDeleteCompany = async (id: string) => {
    if (!window.confirm('Bu turizm şirkətini silmək istəyirsiniz? Şirkətə bağlı turların fəaliyyəti təsirlənə bilər!')) return;
    try {
      await api.companies.delete(id);
      success('Şirkət rəsmən sistemdən silindi.');
      loadData();
    } catch (err: any) {
      error(err.message || 'Şirkət silinə bilmədi.');
    }
  };

  const handleSaveSettings = async () => {
    try {
      const payload: SettingsSchema = {
        heroSliders: cfgSliders,
        testimonials: cfgTestimonials,
        videos: cfgVideos,
        photoGalleries: cfgGalleries,
        contactInfo: {
          phone: cfgPhone,
          email: cfgEmail,
          address: cfgAddress
        },
        socialMediaLinks: {
          facebook: cfgFacebook,
          instagram: cfgInstagram,
          telegram: cfgTelegram
        },
        seoSettings: {
          title: cfgSeoTitle,
          description: cfgSeoDesc,
          keywords: cfgSeoKeywords
        },
        headerFooter: {
          headerTitle: cfgHeaderTitle,
          footerText: cfgFooterText
        },
        promoBanners: cfgPromoBanners,
        themeSettings: {
          primaryColor: cfgPrimaryColor,
          darkScheme: cfgDarkScheme
        },
        logoSettings: {
          logoLightUrl: cfgLogoLightUrl,
          logoDarkUrl: cfgLogoDarkUrl,
          faviconUrl: cfgFaviconUrl,
          logoWidth: Number(cfgLogoWidth) || 150,
          logoHeight: Number(cfgLogoHeight) || 40,
          logoPositionX: Number(cfgLogoPositionX) || 0,
          logoPositionY: Number(cfgLogoPositionY) || 0
        }
      };

      await api.settings.update(payload);
      success('Veb-sayt konfiqurasiyası və dizayn parametrləri uğurla yadda saxlanıldı!');
      loadData();
    } catch (e: any) {
      error(e.message || 'Konfiqurasiya yadda saxlanıla bilmədi.');
    }
  };

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen pt-32 pb-16 flex justify-center items-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <span className="w-12 h-12 border-4 border-gold-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-sans">Giriş yoxlanılır...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-16 relative z-10 max-w-7xl mx-auto px-4 md:px-12" id="admin-desk">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 pb-6 border-b select-none">
        <div>
          <span className="bg-navy-mid text-gold-primary text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-lg">
            İnzibatçı Paneli
          </span>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-navy-deep mt-2">Naxçıvan Turizm Rəsmi İdarə Masası</h1>
        </div>
        <div className="bg-gold-primary/10 border border-gold-primary/30 p-3 rounded-2xl flex items-center gap-2 font-sans">
          <ShieldCheck className="w-5 h-5 text-gold-primary shrink-0" />
          <div className="text-left text-xs leading-none">
            <p className="font-bold text-navy-deep">{user?.fullName}</p>
            <p className="text-slate-500 font-mono mt-1 text-[10px]">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Main Split Layout: Left vertical navigation tab sidebar, Right content panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Side Sidebar Tab Buttons (3 spans) */}
        <div className="lg:col-span-3 bg-white border border-slate-100 p-4 rounded-3xl shadow-sm flex flex-col gap-1.5 sticky top-24 z-10 select-none">
          {[
            { id: 'reservations', label: 'Rezervasiyalar', icon: <Calendar className="w-4 h-4" />, count: reservations.length },
            { id: 'tours', label: 'Turlar (Aktiv)', icon: <Compass className="w-4 h-4" />, count: tours.length },
            { id: 'companies', label: 'Turizm Şirkətləri', icon: <Award className="w-4 h-4" />, count: companies.length },
            { id: 'hotels', label: 'Lüks Otellər', icon: <Building className="w-4 h-4" />, count: hotels.length },
            { id: 'places', label: 'Gəzməli Yerlər', icon: <Landmark className="w-4 h-4" />, count: places.length },
            { id: 'restaurants', label: 'Restoranlar', icon: <Utensils className="w-4 h-4" />, count: restaurantsList.length },
            { id: 'blogs', label: 'Bloq və Xəbərlər', icon: <BookOpen className="w-4 h-4" />, count: blogsList.length },
            { id: 'comments', label: 'Rəylər / Şərhlər', icon: <MessageSquare className="w-4 h-4" />, count: comments.length },
            { id: 'users', label: 'İstifadəçilər', icon: <Users className="w-4 h-4" />, count: usersList.length },
            { id: 'media', label: 'Media Kitabxanası', icon: <Image className="w-4 h-4" />, count: mediaList.length },
            { id: 'settings', label: 'Ümumi Parametrlər', icon: <Settings className="w-4 h-4" />, count: undefined }
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`w-full flex items-center justify-between text-left font-sans text-xs md:text-sm font-semibold py-3 px-4 rounded-xl cursor-pointer transition-all ${
                  active 
                    ? 'bg-gold-primary text-navy-deep' 
                    : 'text-slate-500 hover:text-navy-deep hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  {tab.icon}
                  {tab.label}
                </span>
                {tab.count !== undefined && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${active ? 'bg-navy-deep text-gold-primary' : 'bg-slate-100 text-slate-500'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Side Working Content Desk (9 spans) */}
        <div className="lg:col-span-9" id="admin-working-deck">
          
          {/* TAB 1: Sifarişlər / Rezervasiyalar Desk */}
          {activeTab === 'reservations' && (
            <div className="flex flex-col gap-6" id="panel-reservations">
              <h3 className="font-serif text-xl font-bold text-navy-deep select-none">Gələn Sifarişlərin Təsdiqi</h3>
              
              {reservations.length === 0 ? (
                <div className="bg-white border rounded-3xl p-12 text-center text-slate-400 font-sans">
                  Siyahıda heç bir otel və ya tur sifarişi qeydə alınmamışdır.
                </div>
              ) : (
                <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse text-xs md:text-sm font-sans">
                      <thead>
                        <tr className="bg-slate-50 border-b text-slate-500 uppercase tracking-widest text-[9px] select-none">
                          <th className="p-4">Sifarişçi</th>
                          <th className="p-4">Növ</th>
                          <th className="p-4">Tarixlər</th>
                          <th className="p-4 text-center">Qonaq</th>
                          <th className="p-4">Toplam Ödəniş</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Fəaliyyət</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reservations.map((res) => (
                          <tr key={res.id} className="border-b last:border-b-0 hover:bg-slate-50/50">
                            <td className="p-4">
                              <p className="font-bold text-navy-deep">{res.fullName}</p>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">{res.email}</p>
                              <p className="text-[10px] text-slate-400 font-sans">{res.phone}</p>
                            </td>
                            <td className="p-4">
                              <span className={`text-[10px] font-bold uppercase rounded px-2 py-0.5 ${res.type === 'tour' ? 'bg-amber-100 text-amber-700' : 'bg-sky-100 text-sky-700'}`}>
                                {res.type === 'tour' ? 'Tur' : 'Otel'}
                              </span>
                            </td>
                            <td className="p-4">
                              <p className="text-xs text-slate-600 font-mono leading-none">{res.checkIn}</p>
                              {res.checkOut && res.checkOut !== res.checkIn && (
                                <p className="text-[10px] text-slate-400 font-mono mt-1">→ {res.checkOut}</p>
                              )}
                            </td>
                            <td className="p-4 text-center font-bold font-mono">{res.guests}n</td>
                            <td className="p-4 font-mono font-bold text-gold-primary">₼ {res.totalPrice}</td>
                            <td className="p-4">
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                res.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                                res.status === 'cancelled' ? 'bg-rose-100 text-rose-800' : 'bg-amber-105 text-amber-800 bg-amber-100'
                              }`}>
                                {res.status === 'approved' ? 'Təsdiqli' : res.status === 'cancelled' ? 'Ləğv' : 'Gözləmədə'}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              {res.status === 'pending' && (
                                <div className="flex gap-2 justify-end">
                                  <button
                                    onClick={() => handleApproveReservation(res.id)}
                                    className="p-1.5 bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white rounded-lg border border-emerald-100 transition-colors cursor-pointer"
                                    title="Təsdiqlə"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleCancelReservation(res.id)}
                                    className="p-1.5 bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white rounded-lg border border-rose-100 transition-colors cursor-pointer"
                                    title="İmtina et"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Turlar Desk */}
          {activeTab === 'tours' && (
            <div className="flex flex-col gap-8" id="panel-tours">
              
              <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm animate-fade">
                <h3 className="font-serif text-lg font-bold text-navy-deep border-b pb-2 mb-6">Yeni Tur Paketi Əlavə Et</h3>
                
                <form onSubmit={handleAddTourSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans text-sm">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">Turun Adı</label>
                    <input
                      type="text"
                      required
                      placeholder="Gəmiqaya Tədqiqat Turu"
                      value={newTourName}
                      onChange={(e) => setNewTourName(e.target.value)}
                      className="p-2.5 bg-slate-50 border rounded-xl font-medium"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">Kateqoriyası</label>
                    <select
                      value={newTourCategory}
                      onChange={(e) => setNewTourCategory(e.target.value)}
                      className="p-2.5 bg-slate-50 border rounded-xl font-medium"
                    >
                      <option value="Tarixi">Tarixi</option>
                      <option value="Ekskursiya">Ekskursiya</option>
                      <option value="Eko-Turizm">Eko-Turizm</option>
                      <option value="VIP">VIP</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">Səyahət Nəqliyyat Vasitəsi (Növü)</label>
                    <select
                      value={newTourVehicleType}
                      onChange={(e) => setNewTourVehicleType(e.target.value)}
                      className="p-2.5 bg-slate-50 border rounded-xl font-medium"
                    >
                      <option value="Mercedes Sprinter (Premium)">Mercedes Sprinter (Premium)</option>
                      <option value="Komfortlu Toyota Minivan">Komfortlu Toyota Minivan</option>
                      <option value="Böyük Şəhərlərarası Neoplan Avtobus">Böyük Neoplan Avtobus</option>
                      <option value="Off-road 4x4 Jeep SUV">Off-road 4x4 Jeep SUV</option>
                      <option value="VIP Sedan Avtomobil">VIP Sedan Avtomobil</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">Gecəlik Qiymət (₼)</label>
                    <input
                      type="number"
                      required
                      value={newTourPrice}
                      onChange={(e) => setNewTourPrice(Number(e.target.value))}
                      className="p-2.5 bg-slate-50 border rounded-xl font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">Müddət (Gün)</label>
                    <input
                      type="number"
                      required
                      value={newTourDuration}
                      onChange={(e) => setNewTourDuration(Number(e.target.value))}
                      className="p-2.5 bg-slate-50 border rounded-xl font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                     <label className="text-xs text-slate-500">Paket təşkilatçısı (Şirkət)</label>
                     <select
                       required
                       value={newTourCompanyId}
                       onChange={(e) => setNewTourCompanyId(e.target.value)}
                       className="p-2.5 bg-slate-50 border rounded-xl text-navy-deep font-semibold"
                     >
                       <option value="">-- Şirkət Seçin --</option>
                       {companies.map(c => (
                         <option key={c.id} value={c.id}>{c.name}</option>
                       ))}
                     </select>
                   </div>
 
                   <div className="flex flex-col gap-1 md:col-span-3">
                     <label className="text-xs font-semibold text-slate-705">Ana Şəkil (Fayl Yükləyin və ya URL daxil edin)</label>
                     <div className="flex items-center gap-4 bg-slate-50 p-3 border rounded-2xl w-full">
                       {newTourImg ? (
                         <div className="relative w-16 h-16 rounded-xl overflow-hidden border bg-white shrink-0">
                           <img src={newTourImg} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
                           <button
                             type="button"
                             onClick={() => setNewTourImg('')}
                             className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-all cursor-pointer"
                           >
                             Sil
                           </button>
                         </div>
                       ) : (
                         <div className="w-16 h-16 rounded-xl border border-dashed bg-slate-200 flex items-center justify-center text-slate-400 text-xs text-center p-1 font-sans shrink-0">
                           Şəkil yoxdur
                         </div>
                       )}
                       <div className="flex-1 font-sans">
                         <p className="text-[10px] text-slate-500 mb-1.5 font-sans">Optimum ölçü: 800x600 px (Maks. 10MB). JPG, JPEG, PNG, WEBP formatları.</p>
                         <label className="bg-navy-mid hover:bg-navy-deep text-gold-primary text-xs font-bold px-4 py-2 rounded-xl inline-flex items-center justify-center cursor-pointer border border-gold-primary/30 transition-all select-none">
                           {newTourImg ? 'Yenisini Yüklə' : 'Kompüterdən Şəkil Seç / Yüklə'}
                           <input
                             type="file"
                             accept="image/*"
                             className="hidden"
                             onChange={(e) => handleFileUpload(e, setNewTourImg)}
                           />
                         </label>
                       </div>
                     </div>
                   </div>
 
                   <div className="flex flex-col gap-1 md:col-span-3">
                     <label className="text-xs font-semibold text-slate-705 mb-0.5">Təfsilatlı PDF Broşür / Prospekt</label>
                     <div className="flex items-center gap-3 bg-slate-50 p-2.5 border rounded-xl">
                       <div className="flex-1 truncate text-xs text-slate-600">
                         {newTourPdfUrl ? (
                           <span className="text-emerald-700 font-medium flex items-center gap-1.5">
                             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                             PDF Broşür Yükləndi: {newTourPdfUrl.split('/').pop()}
                           </span>
                         ) : (
                           <span className="text-slate-400 font-medium text-[11px]">PDF Faylı Yüklənməyib (Məcburi deyil)</span>
                         )}
                       </div>
                       
                       {newTourPdfUrl && (
                         <button
                           type="button"
                           onClick={() => setNewTourPdfUrl('')}
                           className="text-red-500 hover:text-red-700 text-xs font-bold px-2 py-1.5 hover:bg-red-50 rounded-lg transition-all"
                         >
                           Sil
                         </button>
                       )}
 
                       <label className="bg-navy-mid hover:bg-navy-deep text-gold-primary text-xs font-bold px-4 py-2.5 rounded-lg flex items-center justify-center cursor-pointer border border-gold-primary/30 transition-all shrink-0 select-none">
                         {newTourPdfUrl ? 'Faylı Dəyiş' : 'PDF Seç və Yüklə'}
                         <input
                           type="file"
                           accept="application/pdf"
                           className="hidden"
                           onChange={(e) => handleFileUpload(e, setNewTourPdfUrl, ['application/pdf'])}
                         />
                       </label>
                     </div>
                   </div>
 
                   {/* Requirement 5: Vehicle Selection Section */}
                   <div className="md:col-span-3 border-t border-slate-100 pt-4 mt-2">
                     <h4 className="font-serif text-sm font-bold text-navy-deep mb-3 uppercase tracking-wider">Ayrıca Nəqliyyat / Maşın Bölməsi</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                       
                       <div className="flex flex-col gap-1">
                         <label className="text-xs text-slate-600 font-medium">Nəqliyyat Modeli / Adı</label>
                         <input
                           type="text"
                           placeholder="Məsələn: Mercedes-Benz Sprinter Tourist"
                           value={vehicleModelName}
                           onChange={(e) => setVehicleModelName(e.target.value)}
                           className="p-2.5 bg-white border rounded-xl"
                         />
                       </div>
 
                       <div className="flex flex-col gap-1">
                         <label className="text-xs text-slate-600 font-medium">Nəqliyyat Özəllikləri (Vergüllə ayırın)</label>
                         <input
                           type="text"
                           placeholder="Kondisioner, Multi-Mediya, Dəri Oturacaqlar"
                           value={vehicleFeatures}
                           onChange={(e) => setVehicleFeatures(e.target.value)}
                           className="p-2.5 bg-white border rounded-xl"
                         />
                       </div>
 
                       <div className="flex flex-col gap-1 md:col-span-2">
                         <label className="text-xs text-slate-700 font-bold mb-1">Görüntüləmə növü (Variant Seçin - Yalnız biri aktiv ola bilər)</label>
                         <div className="flex gap-4">
                           <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2.5 border rounded-xl hover:border-gold-primary/50 transition-colors select-none">
                             <input
                               type="radio"
                               name="vehicleDisplayMode"
                               value="image"
                               checked={vehicleDisplayMode === 'image'}
                               onChange={() => setVehicleDisplayMode('image')}
                               className="accent-gold-primary w-4 h-4"
                             />
                             <span className="text-xs text-slate-700 font-semibold font-sans">Yalnız Şəkil</span>
                           </label>
                           <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2.5 border rounded-xl hover:border-gold-primary/50 transition-colors select-none">
                             <input
                               type="radio"
                               name="vehicleDisplayMode"
                               value="3d"
                               checked={vehicleDisplayMode === '3d'}
                               onChange={() => setVehicleDisplayMode('3d')}
                               className="accent-gold-primary w-4 h-4"
                             />
                             <span className="text-xs text-slate-700 font-semibold font-sans">İnteraktiv 3D Model</span>
                           </label>
                         </div>
                       </div>
 
                       {/* Show conditional upload inputs based on the selected display variant */}
                       {vehicleDisplayMode === 'image' ? (
                         <div className="flex flex-col gap-1 md:col-span-2 animate-fadeIn">
                           <label className="text-xs text-slate-600 font-medium">Maşın Şəkli Yükləyin</label>
                           <div className="flex items-center gap-4 bg-white p-3 border rounded-2xl w-full">
                             {vehicleImgUrl ? (
                               <div className="relative w-16 h-16 rounded-xl overflow-hidden border bg-slate-50 shrink-0">
                                 <img src={vehicleImgUrl} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
                                 <button
                                   type="button"
                                   onClick={() => setVehicleImgUrl('')}
                                   className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-all cursor-pointer"
                                 >
                                   Sil
                                 </button>
                               </div>
                             ) : (
                               <div className="w-16 h-16 rounded-xl border border-dashed bg-slate-100 flex items-center justify-center text-slate-400 text-xs text-center p-1 font-sans shrink-0">
                                 Şəkil yoxdur
                               </div>
                             )}
                             <div className="flex-1 font-sans">
                               <p className="text-[10px] text-slate-500 mb-1.5 font-sans">Nəqliyyat vasitəsinin şəkli. WebP, JPG, PNG formatları.</p>
                               <label className="bg-navy-mid hover:bg-navy-deep text-gold-primary text-xs font-bold px-4 py-2 rounded-xl inline-flex items-center justify-center cursor-pointer border border-gold-primary/30 transition-all select-none">
                                 {vehicleImgUrl ? 'Yenisini Yüklə' : 'Kompüterdən Şəkil Seç / Yüklə'}
                                 <input
                                   type="file"
                                   accept="image/*"
                                   className="hidden"
                                   onChange={(e) => handleFileUpload(e, setVehicleImgUrl)}
                                 />
                               </label>
                             </div>
                           </div>
                         </div>
                       ) : (
                         <div className="md:col-span-2 p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl flex items-center gap-3 animate-fadeIn">
                           <span className="text-xl">🎮</span>
                           <div className="text-xs text-slate-600">
                             <span className="font-bold text-indigo-900 block mb-0.5">İnteraktiv 3D Üstünlüyü Seçildi</span>
                             Sistem bu nəqliyyat vasitəsi üçün müasir daxili <b>Three.js salon dizaynını (3D)</b> avtomatik sintez edəcək və istifadəçilərə fırladıb-baxmaq imkanı verəcəkdir.
                           </div>
                         </div>
                       )}
 
                     </div>
                   </div>
 
                   <div className="flex flex-col gap-1 md:col-span-3">
                     <label className="text-xs text-slate-500">Daxil Olan Xidmətlər (Vergüllə ayıraraq yazın)</label>
                     <input
                       type="text"
                       placeholder="Milli Bələdçi, Komfortlu Transfer, Dadlı səhər yeməyi, Giriş biletləri"
                       value={newTourIncludedServices}
                       onChange={(e) => setNewTourIncludedServices(e.target.value)}
                       className="p-2.5 bg-slate-50 border rounded-xl font-medium"
                     />
                   </div>
 
                   <div className="flex flex-col gap-1 md:col-span-3">
                     <label className="text-xs text-slate-500">Qısa marşrut təsviri</label>
                     <textarea
                       rows={3}
                       value={newTourDesc}
                       onChange={(e) => setNewTourDesc(e.target.value)}
                       placeholder="Ziyarətçilər üçün paket haqqında..."
                       className="p-2.5 bg-slate-50 border rounded-xl leading-normal"
                     />
                   </div>
 
                   <button
                     type="submit"
                     className="md:col-span-3 bg-gold-primary hover:bg-gold-dark text-navy-deep font-bold py-3 rounded-xl flex items-center justify-center gap-2 mt-2 cursor-pointer transition-all"
                   >
                     <Plus className="w-4 h-4" />
                     Yeni Paket Yarat
                   </button>
                </form>
              </div>

              {/* Active list with Delete capability */}
              <div>
                <h4 className="font-serif text-base font-bold text-navy-deep mb-4">Sistemdəki Aktiv Turlar ({tours.length})</h4>
                <div className="bg-white border rounded-3xl divide-y">
                  {tours.map((tour) => (
                    <div key={tour.id} className="p-4 flex items-center justify-between gap-4 font-sans text-xs md:text-sm">
                      <div className="flex items-center gap-3">
                        <img src={tour.mainImage} alt="" className="w-12 h-12 object-cover rounded-xl" />
                        <div>
                          <h4 className="font-bold text-navy-deep">{tour.name}</h4>
                          <p className="text-xs text-slate-400 mt-0.5">{tour.category} • {tour.duration} Gün • ₼ {tour.price}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => generateQrCode(tour.id, tour.name, tour.category, 'tour', tour.mainImage)}
                          className="py-1.5 px-3 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all cursor-pointer flex items-center gap-1 font-semibold text-xs shrink-0"
                          title="QR Kod Yarat"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>QR Kod</span>
                        </button>
                        <button
                          onClick={() => handleDeleteTour(tour.id)}
                          className="p-2 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all cursor-pointer"
                          title="Turu Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB: Turizm Şirkətləri Panel */}
          {activeTab === 'companies' && (
            <div className="flex flex-col gap-8 text-left animate-fade" id="panel-companies">
              
              {/* Add New Company Form */}
              <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
                <h3 className="font-serif text-lg font-bold text-navy-deep border-b pb-2 mb-6">Yeni Turizm Şirkəti Əlavə Et</h3>
                
                <form onSubmit={handleAddCompanySubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans text-sm">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">Şirkətin Adı</label>
                    <input
                      required
                      type="text"
                      placeholder="Məsələn: Naxçıvan Səyahət MMC"
                      value={newCompName}
                      onChange={(e) => setNewCompName(e.target.value)}
                      className="p-2.5 bg-slate-50 border rounded-xl"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">Telefon nömrəsi</label>
                    <input
                      type="text"
                      placeholder="+994 36 544 00 00"
                      value={newCompPhone}
                      onChange={(e) => setNewCompPhone(e.target.value)}
                      className="p-2.5 bg-slate-50 border rounded-xl"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">E-poçt Ünvanı</label>
                    <input
                      type="email"
                      placeholder="info@seyahet.az"
                      value={newCompEmail}
                      onChange={(e) => setNewCompEmail(e.target.value)}
                      className="p-2.5 bg-slate-50 border rounded-xl"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">Veb-sayt URL</label>
                    <input
                      type="url"
                      placeholder="https://seyahet.az"
                      value={newCompWebsite}
                      onChange={(e) => setNewCompWebsite(e.target.value)}
                      className="p-2.5 bg-slate-50 border rounded-xl"
                    />
                  </div>

                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-xs text-slate-500">Şirkət Loqosu (URL və ya Fayl Yükləyin)</label>
                    <div className="flex items-center gap-4 bg-slate-50 p-3 border rounded-2xl w-full">
                      {newCompLogo ? (
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden border bg-white shrink-0">
                          <img src={newCompLogo} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
                          <button
                            type="button"
                            onClick={() => setNewCompLogo('')}
                            className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-all cursor-pointer"
                          >
                            Sil
                          </button>
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-xl border border-dashed bg-slate-200 flex items-center justify-center text-slate-400 text-xs text-center p-1 font-sans shrink-0">
                          Loqo daxil edilməyib
                        </div>
                      )}
                      <div className="flex-1 font-sans">
                        <p className="text-[10px] text-slate-500 mb-1.5 font-sans">Şirkət marka loqosu (PNG, JPG, SVG, WebP).</p>
                        <label className="bg-navy-mid hover:bg-navy-deep text-gold-primary text-xs font-bold px-4 py-2 rounded-xl inline-flex items-center justify-center cursor-pointer border border-gold-primary/30 transition-all select-none">
                          {newCompLogo ? 'Yenisini Yüklə' : 'Kompüterdən Loqo Seç / Yüklə'}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, setNewCompLogo)}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 md:col-span-3">
                    <label className="text-xs text-slate-500">Ofis Ünvanı</label>
                    <input
                      type="text"
                      placeholder="Naxçıvan şəhəri, Azadlıq prospekti 12"
                      value={newCompAddress}
                      onChange={(e) => setNewCompAddress(e.target.value)}
                      className="p-2.5 bg-slate-50 border rounded-xl"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">Facebook Səhifəsi</label>
                    <input
                      type="url"
                      placeholder="https://facebook.com/..."
                      value={newCompFb}
                      onChange={(e) => setNewCompFb(e.target.value)}
                      className="p-2.5 bg-slate-50 border rounded-xl"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">Instagram Profili</label>
                    <input
                      type="url"
                      placeholder="https://instagram.com/..."
                      value={newCompInsta}
                      onChange={(e) => setNewCompInsta(e.target.value)}
                      className="p-2.5 bg-slate-50 border rounded-xl"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">Telegram Kanalı</label>
                    <input
                      type="url"
                      placeholder="https://t.me/..."
                      value={newCompTg}
                      onChange={(e) => setNewCompTg(e.target.value)}
                      className="p-2.5 bg-slate-50 border rounded-xl"
                    />
                  </div>

                  <div className="flex flex-col gap-1 md:col-span-3">
                    <label className="text-xs text-slate-500">Şirkətin Təsviri / Bizim haqqımızda</label>
                    <textarea
                      rows={3}
                      placeholder="Şirkət haqqında ümumi məlumat, fəaliyyət sahələri..."
                      value={newCompDesc}
                      onChange={(e) => setNewCompDesc(e.target.value)}
                      className="p-2.5 bg-slate-50 border rounded-xl leading-normal"
                    />
                  </div>

                  <button
                    type="submit"
                    className="md:col-span-3 bg-gold-primary hover:bg-gold-dark text-navy-deep font-bold py-3 rounded-xl flex items-center justify-center gap-2 mt-2 cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Turizm Şirkətini Əlavə Et
                  </button>
                </form>
              </div>

              {/* Companies List */}
              <div>
                <h4 className="font-serif text-base font-bold text-navy-deep mb-4">Sistemdəki Turizm Şirkətləri ({companies.length})</h4>
                <div className="bg-white border rounded-3xl divide-y overflow-hidden shadow-sm">
                  {companies.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">Heç bir turizm şirkəti qeydə alınmamışdır.</div>
                  ) : (
                    companies.map((comp) => (
                      <div key={comp.id} className="p-5 flex items-start justify-between gap-4 font-sans text-xs md:text-sm hover:bg-slate-50/40">
                        <div className="flex items-start gap-4">
                          <img src={comp.logo || 'https://images.unsplash.com/photo-1549643276-fdf2fab574f5?q=80&w=150'} alt="" className="w-14 h-14 object-cover rounded-2xl bg-slate-100 border p-1" />
                          <div>
                            <h4 className="font-bold text-lg text-navy-deep">{comp.name}</h4>
                            <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">{comp.description}</p>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-slate-400 font-mono text-[11px]">
                              <span>Tel: {comp.phone || 'Daxil edilməyib'}</span>
                              <span>E-poçt: {comp.email || 'Daxil edilməyib'}</span>
                              <span>Veb: {comp.website || 'Yoxdur'}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteCompany(comp.id)}
                          className="p-2 bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl border border-rose-100 transition-all cursor-pointer shrink-0"
                          title="Şirkəti Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
            </div>
          )}

          {/* TAB 3: Otellər Desk */}
          {activeTab === 'hotels' && (
            <div className="flex flex-col gap-8" id="panel-hotels">
              
              <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
                <h3 className="font-serif text-lg font-bold text-navy-deep border-b pb-2 mb-6">Yeni Otel Profili Yarat</h3>
                
                <form onSubmit={handleAddHotelSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-sm">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">Otel Adı</label>
                    <input
                      type="text"
                      required
                      placeholder="Duzdağ sanatoriya Oteli"
                      value={newHotelName}
                      onChange={(e) => setNewHotelName(e.target.value)}
                      className="p-2.5 bg-slate-50 border rounded-xl"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">Yüksək Ulduz Sayı</label>
                    <select
                      value={newHotelStars}
                      onChange={(e) => setNewHotelStars(Number(e.target.value))}
                      className="p-2.5 bg-slate-50 border rounded-xl"
                    >
                      <option value="5">5 Ulduzlu Lüks</option>
                      <option value="4">4 Ulduzlu Lüks</option>
                      <option value="3">3 Ulduzlu Komfort</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-xs text-slate-500">Ünvanı</label>
                    <input
                      type="text"
                      placeholder="Ordubad rayonu, Duzdağ ərazisi"
                      value={newHotelAddress}
                      onChange={(e) => setNewHotelAddress(e.target.value)}
                      className="p-2.5 bg-slate-50 border rounded-xl"
                    />
                  </div>

                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-xs text-slate-500">Otel Şəkli (Yalnız Yükləmə ilə)</label>
                    <div className="flex items-center gap-4 bg-slate-50 p-3 border rounded-2xl w-full">
                      {newHotelImg ? (
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden border bg-white shrink-0">
                          <img src={newHotelImg} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
                          <button
                            type="button"
                            onClick={() => setNewHotelImg('')}
                            className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-all cursor-pointer"
                          >
                            Sil
                          </button>
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-xl border border-dashed bg-slate-200 flex items-center justify-center text-slate-400 text-xs text-center p-1 font-sans shrink-0">
                          Şəkil yoxdur
                        </div>
                      )}
                      <div className="flex-1 font-sans">
                        <p className="text-[10px] text-slate-500 mb-1.5 font-sans">Otelin əsas şəkli (PNG, JPG, WebP).</p>
                        <label className="bg-navy-mid hover:bg-navy-deep text-gold-primary text-xs font-bold px-4 py-2 rounded-xl inline-flex items-center justify-center cursor-pointer border border-gold-primary/30 transition-all select-none">
                          {newHotelImg ? 'Yenisini Yüklə' : 'Kompüterdən Şəkil Seç / Yüklə'}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, setNewHotelImg)}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="md:col-span-2 bg-gold-primary hover:bg-gold-dark text-navy-deep font-bold py-3 rounded-xl flex items-center justify-center gap-2 mt-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Yeni Mehmanxana Əlavə Et
                  </button>
                </form>
              </div>

              <div>
                <h4 className="font-serif text-base font-bold text-navy-deep mb-4">Səlahiyyətdəki Otellər ({hotels.length})</h4>
                <div className="bg-white border rounded-3xl divide-y">
                  {hotels.map((hotel) => (
                    <div key={hotel.id} className="p-4 flex items-center justify-between gap-4 font-sans text-xs md:text-sm">
                      <div className="flex items-center gap-3">
                        <img src={hotel.images[0]} alt="" className="w-12 h-12 object-cover rounded-xl" />
                        <div>
                          <h4 className="font-bold text-navy-deep">{hotel.name}</h4>
                          <p className="text-xs text-slate-400 mt-0.5">{hotel.stars} Ulduz • {hotel.address}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteHotel(hotel.id)}
                        className="p-2 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all cursor-pointer"
                        title="Oteli sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: Məkanlar / Gəzməli Yerlər Desk */}
          {activeTab === 'places' && (
            <div className="flex flex-col gap-8" id="panel-places">
              
              <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
                <h3 className="font-serif text-lg font-bold text-navy-deep border-b pb-2 mb-6">Yeni Tarixi Məkan Əlavə Et</h3>
                
                <form onSubmit={handleAddPlaceSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans text-sm">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">Məkanın Adı</label>
                    <input
                      type="text"
                      required
                      placeholder="Möminə Xatun Türbəsi"
                      value={newPlaceName}
                      onChange={(e) => setNewPlaceName(e.target.value)}
                      className="p-2.5 bg-slate-50 border rounded-xl"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">Kateqoriyası</label>
                    <select
                      value={newPlaceCategory}
                      onChange={(e) => setNewPlaceCategory(e.target.value)}
                      className="p-2.5 bg-slate-50 border rounded-xl"
                    >
                      <option value="Tarixi">Tarixi</option>
                      <option value="Mədəni">Mədəni</option>
                      <option value="Dini">Dini</option>
                      <option value="Təbii">Təbii</option>
                      <option value="Müalicəvi">Müalicəvi</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">Tarixi Dövr</label>
                    <input
                      type="text"
                      placeholder="XII əsr"
                      value={newPlaceEpoch}
                      onChange={(e) => setNewPlaceEpoch(e.target.value)}
                      className="p-2.5 bg-slate-50 border rounded-xl"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">İş Saatları</label>
                    <input
                      type="text"
                      placeholder="09:00 - 18:00"
                      value={newPlaceHours}
                      onChange={(e) => setNewPlaceHours(e.target.value)}
                      className="p-2.5 bg-slate-50 border rounded-xl"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">Bilet haqqı / Giriş</label>
                    <input
                      type="text"
                      placeholder="Pulsuz"
                      value={newPlaceFee}
                      onChange={(e) => setNewPlaceFee(e.target.value)}
                      className="p-2.5 bg-slate-50 border rounded-xl"
                    />
                  </div>

                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-xs text-slate-500">Məkan Şəkli (Yalnız Yükləmə ilə)</label>
                    <div className="flex items-center gap-4 bg-slate-50 p-3 border rounded-2xl w-full">
                      {newPlaceImg ? (
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden border bg-white shrink-0">
                          <img src={newPlaceImg} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
                          <button
                            type="button"
                            onClick={() => setNewPlaceImg('')}
                            className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-all cursor-pointer"
                          >
                            Sil
                          </button>
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-xl border border-dashed bg-slate-200 flex items-center justify-center text-slate-400 text-xs text-center p-1 font-sans shrink-0">
                          Şəkil yoxdur
                        </div>
                      )}
                      <div className="flex-1 font-sans">
                        <p className="text-[10px] text-slate-500 mb-1.5 font-sans">Abidə / məkan şəkli (PNG, JPG, WebP).</p>
                        <label className="bg-navy-mid hover:bg-navy-deep text-gold-primary text-xs font-bold px-4 py-2 rounded-xl inline-flex items-center justify-center cursor-pointer border border-gold-primary/30 transition-all select-none">
                          {newPlaceImg ? 'Yenisini Yüklə' : 'Kompüterdən Şəkil Seç / Yüklə'}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, setNewPlaceImg)}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 md:col-span-3">
                    <label className="text-xs text-slate-500">Tarixi Təsviri və Faktları</label>
                    <textarea
                      rows={4}
                      value={newPlaceDesc}
                      onChange={(e) => setNewPlaceDesc(e.target.value)}
                      placeholder="Abidənin bədii üslubu, memarlıq materialları..."
                      className="p-2.5 bg-slate-50 border rounded-xl leading-normal"
                    />
                  </div>

                  <button
                    type="submit"
                    className="md:col-span-3 bg-gold-primary hover:bg-gold-dark text-navy-deep font-bold py-3 rounded-xl flex items-center justify-center gap-2 mt-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Tarixi Abidəni Qeyd Et
                  </button>
                </form>
              </div>

              <div>
                <h4 className="font-serif text-base font-bold text-navy-deep mb-4">Portal Məkanları ({places.length})</h4>
                <div className="bg-white border rounded-3xl divide-y animate-fade">
                  {places.map((place) => (
                    <div key={place.id} className="p-4 flex items-center justify-between gap-4 font-sans text-xs md:text-sm">
                      <div className="flex items-center gap-3">
                        <img src={place.images[0]} alt="" className="w-12 h-12 object-cover rounded-xl" />
                        <div>
                          <h4 className="font-bold text-navy-deep">{place.name}</h4>
                          <p className="text-xs text-slate-400 mt-0.5">{place.category} • {place.historicalPeriod}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => generateQrCode(place.id, place.name, place.category, 'place', place.images[0])}
                          className="py-1.5 px-3 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all cursor-pointer flex items-center gap-1 font-semibold text-xs shrink-0"
                          title="QR Kod Yarat"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>QR Kod</span>
                        </button>
                        <button
                          onClick={() => handleDeletePlace(place.id)}
                          className="p-2 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all cursor-pointer"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: Şərhlər / Rəylər Desk */}
          {activeTab === 'comments' && (
            <div className="flex flex-col gap-6" id="panel-comments">
              <h3 className="font-serif text-xl font-bold text-navy-deep select-none">İstifadəçi Rəylərinin Təmizlənməsi</h3>
              
              {comments.length === 0 ? (
                <p className="text-slate-400 font-sans italic text-center py-8">Hazırda portalda silinəcək şikayətli rəy yoxdur.</p>
              ) : (
                <div className="bg-white border rounded-3xl divide-y">
                  {comments.map((comm) => (
                    <div key={comm.id} className="p-5 flex justify-between gap-4 font-sans text-xs md:text-sm hover:bg-slate-50/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-bold text-navy-deep">{comm.userName}</h4>
                          <StarRating rating={comm.rating} size={11} />
                        </div>
                        <p className="text-slate-500 text-xs italic">Mətn: {comm.text}</p>
                        <p className="text-[10px] text-slate-400 mt-2 font-mono">Təqdimat ID: {comm.placeId}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteComment(comm.id)}
                        className="p-2 bg-rose-50 hover:bg-rose-500 text-rose-505 text-rose-500 hover:text-white rounded-xl border border-rose-100 transition-all cursor-pointer h-9 shrink-0 flex items-center justify-center self-center"
                        title="Rəyi sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: İstifadəçilər Desk */}
          {activeTab === 'users' && (
            <div className="flex flex-col gap-6" id="panel-users">
              <h3 className="font-serif text-xl font-bold text-navy-deep select-none">Qeydiyyatlı İstifadəçi Hesabları</h3>
              
              <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden">
                <table className="w-full text-left font-sans border-collapse text-xs md:text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b text-slate-400 uppercase tracking-wider text-[9px] select-none">
                      <th className="p-4">İstifadəçi Adı</th>
                      <th className="p-4">Elektron Poçt (Email)</th>
                      <th className="p-4">Sistem Səlahiyyəti</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((usr) => (
                      <tr key={usr.email} className="border-b last:border-b-0 hover:bg-slate-50/50">
                        <td className="p-4 font-bold text-navy-deep">{usr.fullName}</td>
                        <td className="p-4 font-mono text-slate-500">{usr.email}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${usr.role === 'admin' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-600'}`}>
                            {usr.role === 'admin' ? 'İnzibatçı' : 'Səyyah'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: Restoranlar Panel */}
          {activeTab === 'restaurants' && (
            <div className="flex flex-col gap-8 text-left" id="panel-restaurants">
              <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
                <h3 className="font-serif text-lg font-bold text-navy-deep border-b pb-2 mb-6">Yeni Restoran Əlavə Et</h3>
                <form onSubmit={handleAddRestaurantSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-sm">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">Restoranın Adı</label>
                    <input
                      required
                      type="text"
                      placeholder="Məsələn: Xan Süfrəsi"
                      value={newRestName}
                      onChange={(e) => setNewRestName(e.target.value)}
                      className="p-2.5 bg-slate-50 border rounded-xl"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">Mətbəx Növü / Kulinariya</label>
                    <input
                      type="text"
                      placeholder="Milli Naxçıvan Mətbəxi"
                      value={newRestCuisine}
                      onChange={(e) => setNewRestCuisine(e.target.value)}
                      className="p-2.5 bg-slate-50 border rounded-xl"
                    />
                  </div>
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-xs text-slate-500">Şəkil (Yalnız Yükləmə ilə)</label>
                    <div className="flex items-center gap-4 bg-slate-50 p-3 border rounded-2xl w-full">
                      {newRestImg ? (
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden border bg-white shrink-0">
                          <img src={newRestImg} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
                          <button
                            type="button"
                            onClick={() => setNewRestImg('')}
                            className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-all cursor-pointer"
                          >
                            Sil
                          </button>
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-xl border border-dashed bg-slate-200 flex items-center justify-center text-slate-400 text-xs text-center p-1 font-sans shrink-0">
                          Şəkil yoxdur
                        </div>
                      )}
                      <div className="flex-1 font-sans">
                        <p className="text-[10px] text-slate-500 mb-1.5 font-sans">Restoranın əsas şəkli (PNG, JPG, WebP).</p>
                        <label className="bg-navy-mid hover:bg-navy-deep text-gold-primary text-xs font-bold px-4 py-2 rounded-xl inline-flex items-center justify-center cursor-pointer border border-gold-primary/30 transition-all select-none">
                          {newRestImg ? 'Yenisini Yüklə' : 'Kompüterdən Şəkil Seç / Yüklə'}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, setNewRestImg)}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">İş Saatları</label>
                    <input
                      type="text"
                      placeholder="11:00 - 23:00"
                      value={newRestHours}
                      onChange={(e) => setNewRestHours(e.target.value)}
                      className="p-2.5 bg-slate-50 border rounded-xl"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">Ünvan / Yerləşdiyi Yer</label>
                    <input
                      type="text"
                      placeholder="Əsas küçə, bina məlumatı"
                      value={newRestAddr}
                      onChange={(e) => setNewRestAddr(e.target.value)}
                      className="p-2.5 bg-slate-50 border rounded-xl"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">Telefon nömrəsi</label>
                    <input
                      type="text"
                      placeholder="+994 50 123 45 67"
                      value={newRestPhone}
                      onChange={(e) => setNewRestPhone(e.target.value)}
                      className="p-2.5 bg-slate-50 border rounded-xl"
                    />
                  </div>
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-xs text-slate-500">Qısa Təsvir və Xüsusiyyətlər</label>
                    <textarea
                      rows={3}
                      placeholder="Üzən ada mənzərəsi, kənd məhsulları..."
                      value={newRestDesc}
                      onChange={(e) => setNewRestDesc(e.target.value)}
                      className="p-2.5 bg-slate-50 border rounded-xl text-xs md:text-sm leading-normal"
                    />
                  </div>
                  <button
                    type="submit"
                    className="md:col-span-2 bg-gold-primary hover:bg-gold-dark text-navy-deep font-bold py-3 rounded-xl flex items-center justify-center gap-2 mt-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Restoranı Portalda Yayımla
                  </button>
                </form>
              </div>

              <div>
                <h4 className="font-serif text-base font-bold text-navy-deep mb-4">Mövcud Restoranlar ({restaurantsList.length})</h4>
                <div className="bg-white border rounded-3xl divide-y">
                  {restaurantsList.map((rest) => (
                    <div key={rest.id} className="p-4 flex items-center justify-between gap-4 font-sans text-xs md:text-sm">
                      <div className="flex items-center gap-3">
                        <img src={rest.image} alt="" className="w-12 h-12 object-cover rounded-xl" />
                        <div className="text-left">
                          <h4 className="font-bold text-navy-deep">{rest.name}</h4>
                          <p className="text-xs text-slate-400 mt-0.5">{rest.cuisine} • {rest.address}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteRestaurant(rest.id)}
                        className="p-2 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all cursor-pointer"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: Bloq və Xəbərlər Panel */}
          {activeTab === 'blogs' && (
            <div className="flex flex-col gap-8 text-left" id="panel-blogs">
              <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
                <h3 className="font-serif text-lg font-bold text-navy-deep border-b pb-2 mb-6">Yeni Bloq / Xəbər Yazısı</h3>
                <form onSubmit={handleAddBlogSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-sm">
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-xs text-slate-500">Yazı Başlığı</label>
                    <input
                      required
                      type="text"
                      placeholder="Məsələn: Əshabi-Kəhf Mağarasının Sirri Açılır"
                      value={newBlogTitle}
                      onChange={(e) => setNewBlogTitle(e.target.value)}
                      className="p-2.5 bg-slate-50 border rounded-xl"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">Kateqoriya</label>
                    <input
                      type="text"
                      placeholder="Tarix və İnanc, Kulinariya..."
                      value={newBlogCategory}
                      onChange={(e) => setNewBlogCategory(e.target.value)}
                      className="p-2.5 bg-slate-50 border rounded-xl"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">Müəllif</label>
                    <input
                      type="text"
                      placeholder="Müəllif adı"
                      value={newBlogAuthor}
                      onChange={(e) => setNewBlogAuthor(e.target.value)}
                      className="p-2.5 bg-slate-50 border rounded-xl"
                    />
                  </div>
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-xs text-slate-500">Karusel / Örtük Şəkli (Yalnız Yükləmə ilə)</label>
                    <div className="flex items-center gap-4 bg-slate-50 p-3 border rounded-2xl w-full">
                      {newBlogImg ? (
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden border bg-white shrink-0">
                          <img src={newBlogImg} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
                          <button
                            type="button"
                            onClick={() => setNewBlogImg('')}
                            className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-all cursor-pointer"
                          >
                            Sil
                          </button>
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-xl border border-dashed bg-slate-200 flex items-center justify-center text-slate-400 text-xs text-center p-1 font-sans shrink-0">
                          Şəkil yoxdur
                        </div>
                      )}
                      <div className="flex-1 font-sans">
                        <p className="text-[10px] text-slate-500 mb-1.5 font-sans">Bloq məqaləsinin örtük şəkli (PNG, JPG, WebP).</p>
                        <label className="bg-navy-mid hover:bg-navy-deep text-gold-primary text-xs font-bold px-4 py-2 rounded-xl inline-flex items-center justify-center cursor-pointer border border-gold-primary/30 transition-all select-none">
                          {newBlogImg ? 'Yenisini Yüklə' : 'Kompüterdən Şəkil Seç / Yüklə'}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, setNewBlogImg)}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-xs text-slate-500">Məqalə Mətni (Tam məzmun)</label>
                    <textarea
                      rows={6}
                      placeholder="Məqalənin ətraflı paraqrafları..."
                      value={newBlogContent}
                      onChange={(e) => setNewBlogContent(e.target.value)}
                      className="p-2.5 bg-slate-50 border rounded-xl leading-normal text-xs md:text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="md:col-span-2 bg-gold-primary hover:bg-gold-dark text-navy-deep font-bold py-3 rounded-xl flex items-center justify-center gap-2 mt-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Məqaləni Dərc Et
                  </button>
                </form>
              </div>

              <div>
                <h4 className="font-serif text-base font-bold text-navy-deep mb-4">portal Məqalələri ({blogsList.length})</h4>
                <div className="bg-white border rounded-3xl divide-y">
                  {blogsList.map((blog) => (
                    <div key={blog.id} className="p-4 flex items-center justify-between gap-4 font-sans text-xs md:text-sm">
                      <div className="flex items-center gap-3">
                        <img src={blog.image} alt="" className="w-12 h-12 object-cover rounded-xl" />
                        <div className="text-left">
                          <h4 className="font-bold text-navy-deep">{blog.title}</h4>
                          <p className="text-xs text-slate-400 mt-0.5">{blog.category} • {blog.author} • {new Date(blog.createdAt).toLocaleDateString('az')}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteBlog(blog.id)}
                        className="p-2 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all cursor-pointer"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: Ümumi Tənzimləmələr & Dizayn Panel */}
          {activeTab === 'settings' && (
            <div className="flex flex-col gap-8 text-left" id="panel-settings">
              <div className="flex justify-between items-center select-none">
                <h3 className="font-serif text-xl font-bold text-navy-deep">Veb-sayt Konfiqurasiyaları və Dizayn Parametrləri</h3>
                <button
                  onClick={handleSaveSettings}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  Yadda Saxla
                </button>
              </div>

              {/* SECTION A: Brand Header & Footer */}
              <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
                <h4 className="font-serif text-base font-bold text-navy-deep border-b pb-2 mb-4 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gold-primary" />
                  Saytın Tərcümə Başlıqları (Header & Footer)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-sm">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">Header Naviqasiya Loqo Mətni</label>
                    <input
                      type="text"
                      value={cfgHeaderTitle}
                      onChange={(e) => setCfgHeaderTitle(e.target.value)}
                      className="p-2.5 bg-slate-50 border rounded-xl"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">Müəllif Hüquqları Mətni (Footer Copyright)</label>
                    <input
                      type="text"
                      value={cfgFooterText}
                      onChange={(e) => setCfgFooterText(e.target.value)}
                      className="p-2.5 bg-slate-50 border rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION A.5: Logo & Favicon Management */}
              <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm text-sm">
                <h4 className="font-serif text-base font-bold text-navy-deep border-b pb-2 mb-4 flex items-center gap-2 select-none">
                  <Image className="w-4 h-4 text-emerald-500" />
                  Loqo və Brend Tənzimləmələri (Logo Management)
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
                  {/* Light ve Dark Logo */}
                  <div className="flex flex-col gap-4">
                    {/* Light Logo */}
                    <div className="bg-slate-55 p-3 rounded-2xl border">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-semibold text-slate-700">Açıq Rejim Loqosu (Light Mode Logo)</span>
                        <button
                          type="button"
                          onClick={() => openMediaPicker(setCfgLogoLightUrl)}
                          className="text-xs text-gold-primary hover:underline flex items-center gap-1 cursor-pointer font-sans"
                        >
                          <Image className="w-3 h-3" /> Kitabxanadan Seç
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {cfgLogoLightUrl ? (
                          <div className="w-14 h-14 rounded-lg bg-slate-100 border p-1 flex items-center justify-center shrink-0">
                            <img src={cfgLogoLightUrl} alt="Light Logo" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-lg border-2 border-dashed flex items-center justify-center text-[10px] text-slate-400 font-sans shrink-0">Yoxdur</div>
                        )}
                        <div className="flex-1">
                          <label className="bg-navy-mid hover:bg-navy-deep text-gold-primary text-xs font-bold px-3 py-1.5 rounded-lg inline-flex items-center cursor-pointer transition-all border border-gold-primary/20 select-none">
                            Yüklə
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, setCfgLogoLightUrl)}
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Dark Logo */}
                    <div className="bg-slate-55 p-3 rounded-2xl border">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-semibold text-slate-700">Tünd Rejim Loqosu (Dark Mode Logo)</span>
                        <button
                          type="button"
                          onClick={() => openMediaPicker(setCfgLogoDarkUrl)}
                          className="text-xs text-gold-primary hover:underline flex items-center gap-1 cursor-pointer font-sans"
                        >
                          <Image className="w-3 h-3" /> Kitabxanadan Seç
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {cfgLogoDarkUrl ? (
                          <div className="w-14 h-14 rounded-lg bg-slate-900 border border-slate-800 p-1 flex items-center justify-center shrink-0">
                            <img src={cfgLogoDarkUrl} alt="Dark Logo" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-lg border-2 border-dashed flex items-center justify-center text-[10px] text-slate-400 font-sans shrink-0">Yoxdur</div>
                        )}
                        <div className="flex-1">
                          <label className="bg-navy-mid hover:bg-navy-deep text-gold-primary text-xs font-bold px-3 py-1.5 rounded-lg inline-flex items-center cursor-pointer transition-all border border-gold-primary/20 select-none">
                            Yüklə
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, setCfgLogoDarkUrl)}
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Favikon */}
                    <div className="bg-slate-55 p-3 rounded-2xl border">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-semibold text-slate-700">Sayt Favikonu (16x16 icon)</span>
                        <button
                          type="button"
                          onClick={() => openMediaPicker(setCfgFaviconUrl)}
                          className="text-xs text-gold-primary hover:underline flex items-center gap-1 cursor-pointer font-sans"
                        >
                          <Image className="w-3 h-3" /> Kitabxanadan Seç
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {cfgFaviconUrl ? (
                          <div className="w-14 h-14 rounded-lg bg-slate-100 border p-1 flex items-center justify-center shrink-0">
                            <img src={cfgFaviconUrl} alt="Favicon" className="w-6 h-6 object-contain" referrerPolicy="no-referrer" />
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-lg border-2 border-dashed flex items-center justify-center text-[10px] text-slate-400 font-sans shrink-0">Yoxdur</div>
                        )}
                        <div className="flex-1">
                          <label className="bg-navy-mid hover:bg-navy-deep text-gold-primary text-xs font-bold px-3 py-1.5 rounded-lg inline-flex items-center cursor-pointer transition-all border border-gold-primary/20 select-none">
                            Yüklə
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, setCfgFaviconUrl)}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sizing and Position sliders */}
                  <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl flex flex-col gap-4">
                    <h5 className="font-semibold text-xs text-navy-deep uppercase tracking-wider select-none">Loqo Ölçüsü və Yerləşmə Qaydası (Canlı)</h5>
                    
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Loqo Eni (Width):</span>
                        <span className="font-mono font-bold text-navy-deep">{cfgLogoWidth}px</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="300"
                        step="5"
                        value={cfgLogoWidth}
                        onChange={(e) => setCfgLogoWidth(Number(e.target.value))}
                        className="w-full accent-gold-primary cursor-pointer bg-slate-200 h-1 rounded-lg"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Loqo Hündürlüyü (Height):</span>
                        <span className="font-mono font-bold text-navy-deep">{cfgLogoHeight}px</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="120"
                        step="2"
                        value={cfgLogoHeight}
                        onChange={(e) => setCfgLogoHeight(Number(e.target.value))}
                        className="w-full accent-gold-primary cursor-pointer bg-slate-200 h-1 rounded-lg"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Horizontal Sürüşmə (Position X):</span>
                        <span className="font-mono font-bold text-navy-deep">{cfgLogoPositionX}px</span>
                      </div>
                      <input
                        type="range"
                        min="-50"
                        max="150"
                        step="1"
                        value={cfgLogoPositionX}
                        onChange={(e) => setCfgLogoPositionX(Number(e.target.value))}
                        className="w-full accent-gold-primary cursor-pointer bg-slate-200 h-1 rounded-lg"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Vertical Offset (Position Y):</span>
                        <span className="font-mono font-bold text-navy-deep">{cfgLogoPositionY}px</span>
                      </div>
                      <input
                        type="range"
                        min="-20"
                        max="60"
                        step="1"
                        value={cfgLogoPositionY}
                        onChange={(e) => setCfgLogoPositionY(Number(e.target.value))}
                        className="w-full accent-gold-primary cursor-pointer bg-slate-200 h-1 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Loqo Canlı Sınaq Önizləmə Paneli (Realtime Logo Preview Canvas) */}
                <div className="mt-5 p-4 border border-slate-100 rounded-2xl flex flex-col items-center justify-center bg-slate-100 relative overflow-hidden">
                  <span className="absolute top-2 left-2 text-[9px] text-slate-500/80 uppercase font-mono tracking-widest pointer-events-none select-none">Naviqasiya Önizləmə</span>
                  <div className="w-full max-w-lg bg-navy-deep py-4 px-6 rounded-xl flex items-center justify-between border border-white/5">
                    <div className="flex items-center" style={{ transform: `translate(${cfgLogoPositionX}px, ${cfgLogoPositionY}px)` }}>
                      {cfgLogoLightUrl ? (
                        <img
                          src={cfgLogoLightUrl}
                          alt="Logo Preview"
                          style={{ width: `${cfgLogoWidth}px`, height: `${cfgLogoHeight}px` }}
                          className="object-contain"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-gold-primary font-bold tracking-widest text-lg">{cfgHeaderTitle || 'NAXÇIVAN'}</span>
                      )}
                    </div>
                    <div className="flex gap-4 text-[10px] text-slate-400 font-sans font-medium uppercase tracking-wider select-none">
                      <span>Turlar</span>
                      <span>Otellər</span>
                      <span>Məkanlar</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION B: SEO Settings */}
              <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
                <h4 className="font-serif text-base font-bold text-navy-deep border-b pb-2 mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-500" />
                  Axtarış Optimizasiyası (SEO Tənzimləmələri)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-sm">
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-xs text-slate-500">Brauzer Səhifə Başlığı (Meta Title)</label>
                    <input
                      type="text"
                      value={cfgSeoTitle}
                      onChange={(e) => setCfgSeoTitle(e.target.value)}
                      className="p-2.5 bg-slate-50 border rounded-xl"
                    />
                  </div>
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-xs text-slate-500">Məzmun Təsviri (Meta Description)</label>
                    <input
                      type="text"
                      value={cfgSeoDesc}
                      onChange={(e) => setCfgSeoDesc(e.target.value)}
                      className="p-2.5 bg-slate-50 border rounded-xl"
                    />
                  </div>
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-xs text-slate-500 font-sans">Açar Sözlər (Keywords - vergüllə ayırın)</label>
                    <input
                      type="text"
                      placeholder="Naxçıvan, Duzdağ, tourism..."
                      value={cfgSeoKeywords}
                      onChange={(e) => setCfgSeoKeywords(e.target.value)}
                      className="p-2.5 bg-slate-50 border rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION C: Contact Info & Socials */}
              <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
                <h4 className="font-serif text-base font-bold text-navy-deep border-b pb-2 mb-4 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-amber-500" />
                  Rəsmi Əlaqə & Sosial Hesab Linkləri
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans text-sm">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">Telefon nömrəsi</label>
                    <input
                      type="text"
                      value={cfgPhone}
                      onChange={(e) => setCfgPhone(e.target.value)}
                      className="p-2.5 bg-slate-50 border rounded-xl"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">E-poçt ünvanı</label>
                    <input
                      type="email"
                      value={cfgEmail}
                      onChange={(e) => setCfgEmail(e.target.value)}
                      className="p-2.5 bg-slate-50 border rounded-xl"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">Ofis Ünvanı</label>
                    <input
                      type="text"
                      value={cfgAddress}
                      onChange={(e) => setCfgAddress(e.target.value)}
                      className="p-2.5 bg-slate-50 border rounded-xl"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">Facebook URL</label>
                    <input
                      type="url"
                      value={cfgFacebook}
                      onChange={(e) => setCfgFacebook(e.target.value)}
                      className="p-2.5 bg-slate-50 border rounded-xl"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">Instagram URL</label>
                    <input
                      type="url"
                      value={cfgInstagram}
                      onChange={(e) => setCfgInstagram(e.target.value)}
                      className="p-2.5 bg-slate-50 border rounded-xl"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">Telegram URL</label>
                    <input
                      type="url"
                      value={cfgTelegram}
                      onChange={(e) => setCfgTelegram(e.target.value)}
                      className="p-2.5 bg-slate-50 border rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION D: Hero Sliders Control */}
              <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
                <h4 className="font-serif text-base font-bold text-navy-deep border-b pb-2 mb-4 flex items-center gap-2">
                  <Image className="w-4 h-4 text-emerald-500" />
                  Homepage Hero Sliders ({cfgSliders.length})
                </h4>
                <div className="flex flex-col gap-3 mb-6">
                  {cfgSliders.map((slider, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border rounded-2xl flex justify-between items-center gap-4 text-xs">
                      <div className="flex items-center gap-3">
                        <img src={slider.image} alt="" className="w-10 h-10 object-cover rounded-lg" />
                        <div className="text-left">
                          <p className="font-bold text-navy-deep">{slider.title}</p>
                          <p className="text-[10px] text-slate-400">{slider.subtitle}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setCfgSliders(cfgSliders.filter((_, i) => i !== idx))}
                        className="text-rose-500 hover:text-white hover:bg-rose-500 p-1.5 rounded-lg border border-rose-100 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-50/50 border border-dashed rounded-2xl p-4 text-xs md:text-sm grid grid-cols-1 md:grid-cols-2 gap-3">
                  <p className="md:col-span-2 font-bold text-left text-xs text-navy-mid pb-1 border-b">Yeni Slayder Əlavə Et</p>
                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-[10px] text-slate-400 uppercase">Slayder başlığı</label>
                    <input
                      type="text"
                      placeholder="Naxçıvana rəngarəng səyahət"
                      value={newSliderTitle}
                      onChange={(e) => setNewSliderTitle(e.target.value)}
                      className="p-2 bg-white border rounded-lg text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-[10px] text-slate-400">Alt başlıq / Şüar</label>
                    <input
                      type="text"
                      placeholder="Şəfa mənbəyi Duzdağ"
                      value={newSliderSubtitle}
                      onChange={(e) => setNewSliderSubtitle(e.target.value)}
                      className="p-2 bg-white border rounded-lg text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1 text-left md:col-span-2">
                    <label className="text-[10px] text-slate-400">Arxa fon şəkli (Yalnız Yükləmə ilə)</label>
                    <div className="flex items-center gap-3 bg-white p-2 border rounded-lg">
                      {newSliderImg ? (
                        <div className="relative w-10 h-10 rounded-md overflow-hidden border bg-slate-50 shrink-0">
                          <img src={newSliderImg} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-md border border-dashed bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 font-sans shrink-0">Yoxdur</div>
                      )}
                      <div className="flex-1 flex gap-2 items-center">
                        <label className="bg-navy-mid hover:bg-navy-deep text-gold-primary text-[10px] font-bold px-3 py-1.5 rounded-md cursor-pointer border border-gold-primary/20 transition-all select-none">
                          Şəkil Yüklə
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, setNewSliderImg)}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => openMediaPicker(setNewSliderImg)}
                          className="text-[10px] text-gold-primary hover:underline font-sans cursor-pointer"
                        >
                          Kitabxanadan seç
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newSliderTitle) return;
                      setCfgSliders([...cfgSliders, { title: newSliderTitle, subtitle: newSliderSubtitle, image: newSliderImg || 'https://images.unsplash.com/photo-1542332213-9b5a5a3fad35' }]);
                      setNewSliderTitle('');
                      setNewSliderSubtitle('');
                      setNewSliderImg('');
                    }}
                    className="md:col-span-2 bg-gold-primary hover:bg-gold-dark text-navy-deep py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Slayderi əlavə et (Listə əlavə edin)
                  </button>
                </div>
              </div>

              {/* SECTION E: Promotional Banners */}
              <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
                <h4 className="font-serif text-base font-bold text-navy-deep border-b pb-2 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                  Kompaniyalar & Endirim Bannerləri ({cfgPromoBanners.length})
                </h4>
                <div className="flex flex-col gap-3 mb-6">
                  {cfgPromoBanners.map((banner, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border rounded-2xl flex justify-between items-center gap-4 text-xs">
                      <div className="flex items-center gap-3">
                        <img src={banner.image} alt="" className="w-10 h-10 object-cover rounded-lg" />
                        <div className="text-left">
                          <p className="font-bold text-navy-deep">{banner.title}</p>
                          <p className="text-[10px] text-slate-400">{banner.text}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setCfgPromoBanners(cfgPromoBanners.filter((_, i) => i !== idx))}
                        className="text-rose-500 hover:text-white hover:bg-rose-500 p-1.5 rounded-lg border border-rose-100 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-50/50 border border-dashed rounded-2xl p-4 text-xs md:text-sm grid grid-cols-1 md:grid-cols-2 gap-3">
                  <p className="md:col-span-2 font-bold text-left text-xs text-navy-mid pb-1 border-b">Yeni Kampaniya Banneri</p>
                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-[10px] text-slate-400">Banner Başlığı</label>
                    <input
                      type="text"
                      placeholder="Yay turları endirimi"
                      value={newPromoTitle}
                      onChange={(e) => setNewPromoTitle(e.target.value)}
                      className="p-2 bg-white border rounded-lg text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-[10px] text-slate-400">Ümumi Kompaniya Mətni</label>
                    <input
                      type="text"
                      placeholder="Bütün tarixi gəzintilər və otel biletləri xüsusi 20% endirimlə"
                      value={newPromoText}
                      onChange={(e) => setNewPromoText(e.target.value)}
                      className="p-2 bg-white border rounded-lg text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1 text-left md:col-span-2">
                    <label className="text-[10px] text-slate-400">Banner Şəkli (Yalnız Yükləmə ilə)</label>
                    <div className="flex items-center gap-3 bg-white p-2 border rounded-lg">
                      {newPromoImg ? (
                        <div className="relative w-10 h-10 rounded-md overflow-hidden border bg-slate-50 shrink-0">
                          <img src={newPromoImg} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-md border border-dashed bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 font-sans shrink-0">Yoxdur</div>
                      )}
                      <div className="flex-1 flex gap-2 items-center">
                        <label className="bg-navy-mid hover:bg-navy-deep text-gold-primary text-[10px] font-bold px-3 py-1.5 rounded-md cursor-pointer border border-gold-primary/20 transition-all select-none">
                          Şəkil Yüklə
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, setNewPromoImg)}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => openMediaPicker(setNewPromoImg)}
                          className="text-[10px] text-gold-primary hover:underline font-sans cursor-pointer"
                        >
                          Kitabxanadan seç
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newPromoTitle) return;
                      setCfgPromoBanners([...cfgPromoBanners, { title: newPromoTitle, text: newPromoText, image: newPromoImg || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800', isActive: true }]);
                      setNewPromoTitle('');
                      setNewPromoText('');
                      setNewPromoImg('');
                    }}
                    className="md:col-span-2 bg-gold-primary hover:bg-gold-dark text-navy-deep py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Banderi listə daxil et
                  </button>
                </div>
              </div>

              {/* SECTION F: Photo Gallery management */}
              <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
                <h4 className="font-serif text-base font-bold text-navy-deep border-b pb-2 mb-4 flex items-center gap-2">
                  <Image className="w-4 h-4 text-indigo-500" />
                  Photo Galleries / Mediateka ({cfgGalleries.length})
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {cfgGalleries.map((imgUrl, idx) => (
                    <div key={idx} className="group relative rounded-2xl overflow-hidden border aspect-video">
                      <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                        <button
                          onClick={() => setCfgGalleries(cfgGalleries.filter((_, i) => i !== idx))}
                          className="bg-red-500 text-white p-2 rounded-xl cursor-pointer hover:scale-105 transition-all text-xs"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 text-xs md:text-sm">
                  <input
                    type="url"
                    placeholder="Yeni fotoşəkil URL daxil edin"
                    value={newGalleryUrl}
                    onChange={(e) => setNewGalleryUrl(e.target.value)}
                    className="flex-1 p-2.5 bg-slate-50 border rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newGalleryUrl) return;
                      setCfgGalleries([...cfgGalleries, newGalleryUrl]);
                      setNewGalleryUrl('');
                    }}
                    className="bg-navy-deep text-gold-primary hover:bg-navy-mid px-5 py-2.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Əlavə et
                  </button>
                </div>
              </div>

              {/* SECTION G: Testimonials */}
              <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
                <h4 className="font-serif text-base font-bold text-navy-deep border-b pb-2 mb-4 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500" />
                  Müştəri Rəyləri (Testimonials - {cfgTestimonials.length})
                </h4>
                <div className="flex flex-col gap-3 mb-6">
                  {cfgTestimonials.map((t, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border rounded-2xl flex justify-between items-center gap-4 text-xs">
                      <div className="text-left font-sans">
                        <p className="font-bold text-navy-deep">{t.name} <span className="text-[10px] text-slate-400 font-normal">({t.role})</span></p>
                        <p className="text-slate-500 mt-1">"{t.text}"</p>
                      </div>
                      <button
                        onClick={() => setCfgTestimonials(cfgTestimonials.filter((_, i) => i !== idx))}
                        className="text-rose-500 hover:text-white hover:bg-rose-500 p-1.5 rounded-lg border border-rose-100 cursor-pointer h-8"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-50/50 border border-dashed rounded-2xl p-4 text-xs md:text-sm grid grid-cols-1 md:grid-cols-2 gap-3 font-sans">
                  <p className="md:col-span-2 font-bold text-left text-xs text-navy-mid pb-1 border-b">Yeni Rəy Əlavə Et</p>
                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-[10px] text-slate-400">Müştəri adı</label>
                    <input
                      type="text"
                      placeholder="Məs: Kənan Hüseynov"
                      value={newTestiName}
                      onChange={(e) => setNewTestiName(e.target.value)}
                      className="p-2 bg-white border rounded-lg text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-[10px] text-slate-400 font-sans">Rol / Peşə</label>
                    <input
                      type="text"
                      placeholder="Turist, Biznesmen..."
                      value={newTestiRole}
                      onChange={(e) => setNewTestiRole(e.target.value)}
                      className="p-2 bg-white border rounded-lg text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1 text-left md:col-span-2">
                    <label className="text-[10px] text-slate-400 font-sans">Rəy məzmunu</label>
                    <textarea
                      placeholder="Naxçıvan gəzintisi mükəmməl keçdi..."
                      value={newTestiText}
                      onChange={(e) => setNewTestiText(e.target.value)}
                      className="p-2 bg-white border rounded-lg text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newTestiName || !newTestiText) return;
                      setCfgTestimonials([...cfgTestimonials, { name: newTestiName, text: newTestiText, role: newTestiRole, rating: newTestiRating }]);
                      setNewTestiName('');
                      setNewTestiText('');
                    }}
                    className="md:col-span-2 bg-gold-primary hover:bg-gold-dark text-navy-deep py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Rəyi listə əlavə edin
                  </button>
                </div>
              </div>

              {/* SECTION H: Videos */}
              <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
                <h4 className="font-serif text-base font-bold text-navy-deep border-b pb-2 mb-4 flex items-center gap-2">
                  <Video className="w-4 h-4 text-cyan-500" />
                  Tanıtım Videoları ({cfgVideos.length})
                </h4>
                <div className="flex flex-col gap-3 mb-6">
                  {cfgVideos.map((v, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border rounded-2xl flex justify-between items-center gap-4 text-xs">
                      <div className="text-left font-sans">
                        <p className="font-bold text-navy-deep">{v.title}</p>
                        <p className="text-[10px] text-slate-450 mt-1 font-mono text-slate-400">{v.url}</p>
                      </div>
                      <button
                        onClick={() => setCfgVideos(cfgVideos.filter((_, i) => i !== idx))}
                        className="text-rose-500 hover:text-white hover:bg-rose-500 p-1.5 rounded-lg border border-rose-100 cursor-pointer h-8"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-50/50 border border-dashed rounded-2xl p-4 text-xs md:text-sm grid grid-cols-1 md:grid-cols-2 gap-3">
                  <p className="md:col-span-2 font-bold text-left text-xs text-navy-mid pb-1 border-b">Yeni Video Daxil Et</p>
                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-[10px] text-slate-400">Video Başlığı</label>
                    <input
                      type="text"
                      placeholder="Məsələn: Əlincə qalası mənzərələri"
                      value={newVideoTitle}
                      onChange={(e) => setNewVideoTitle(e.target.value)}
                      className="p-2 bg-white border rounded-lg text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-[10px] text-slate-400">YouTube Embed Linki / URL</label>
                    <input
                      type="url"
                      placeholder="https://www.youtube.com/embed/..."
                      value={newVideoUrl}
                      onChange={(e) => setNewVideoUrl(e.target.value)}
                      className="p-2 bg-white border rounded-lg text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1 text-left md:col-span-2 font-sans">
                    <label className="text-[10px] text-slate-400">Video Təsviri / Alt yazısı</label>
                    <input
                      type="text"
                      placeholder="Video haqqında qısa fakt"
                      value={newVideoDesc}
                      onChange={(e) => setNewVideoDesc(e.target.value)}
                      className="p-2 bg-white border rounded-lg text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newVideoTitle || !newVideoUrl) return;
                      setCfgVideos([...cfgVideos, { title: newVideoTitle, url: newVideoUrl, description: newVideoDesc }]);
                      setNewVideoTitle('');
                      setNewVideoUrl('');
                      setNewVideoDesc('');
                    }}
                    className="md:col-span-2 bg-gold-primary hover:bg-gold-dark text-navy-deep py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Videonu daxil et
                  </button>
                </div>
              </div>

              {/* SAVE BUTTON */}
              <button
                onClick={handleSaveSettings}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-lg text-base cursor-pointer hover:scale-[1.01] active:scale-[0.99] mt-4"
              >
                <Check className="w-5 h-5 animate-pulse" />
                Dəyişiklikləri və Portalı Rəsmi Yadda Saxla (Save Portal Settings)
              </button>
            </div>
          )}

          {/* TAB 10: Centralized Media Library Portal */}
          {activeTab === 'media' && (
            <div className="flex flex-col gap-8 text-left" id="panel-media">
              {/* Header */}
              <div className="flex justify-between items-center select-none mb-2">
                <div>
                  <h3 className="font-serif text-xl font-bold text-navy-deep">Mərkəzləşdirilmiş Media Kitabxanası</h3>
                  <p className="text-xs text-slate-500 mt-1 font-sans">Platformadakı loqoları, turları, otelləri və sənədləri rəqəmsal idarə edin, bir dəfə yükləyib təkrar istifadə edin.</p>
                </div>
              </div>

              {/* Upload Drag & Drop Area */}
              <div 
                className={`bg-white border rounded-3xl p-6 transition-all shadow-sm flex flex-col items-center justify-center border-dashed text-center min-h-[200px] ${
                  isDragOver ? 'border-gold-primary bg-amber-50/10' : 'border-slate-200 hover:border-gold-primary/50'
                }`}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleFileUpload(file, () => {});
                }}
              >
                <Upload className="w-10 h-10 text-slate-400 mb-3 animate-bounce" />
                <h4 className="font-sans font-bold text-slate-700 text-sm">Faylı bura sürükləyib buraxın və ya seçin</h4>
                <p className="text-xs text-slate-450 mt-1 mb-4">Dəstəklənən formatlar: JPG, JPEG, PNG, WEBP, SVG, PDF (Maksimum 10MB)</p>
                <label className="bg-navy-deep hover:bg-navy-mid text-gold-primary font-bold px-5 py-2.5 rounded-xl cursor-pointer transition-all text-xs font-sans select-none">
                  Kompüterdən Seçin
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, () => {})}
                  />
                </label>

                {uploadProgress !== null && (
                  <div className="w-full max-w-xs mt-5">
                    <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1 select-none">
                      <span>Proses gedir...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-gold-primary h-full rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Library Browser */}
              <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm text-sm flex flex-col gap-6">
                
                {/* Search and Category Filter controls */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  {/* Category Buttons list */}
                  <div className="flex flex-wrap gap-1.5 justify-start">
                    {['Hamısı', 'logo', 'tour', 'hotel', 'place', 'restaurant', 'blog', 'document', 'other'].map((cat) => {
                      const displayNames: Record<string, string> = {
                        Hamısı: 'Hamısı',
                        logo: 'Loqolar',
                        tour: 'Turlar',
                        hotel: 'Otellər',
                        place: 'Məkanlar',
                        restaurant: 'Restoranlar',
                        blog: 'Bloqlar',
                        document: 'PDF Sənədlər',
                        other: 'Digər'
                      };
                      const active = mediaPickerCategory === catDisplayKeyMatches(cat);
                      return (
                        <button
                          key={cat}
                          onClick={() => setMediaPickerCategory(catDisplayKeyMatches(cat))}
                          className={`px-3 py-1.5 rounded-lg border font-sans text-xs font-semibold cursor-pointer transition-all ${
                            active 
                              ? 'bg-gold-primary border-gold-primary text-navy-deep' 
                              : 'border-slate-100 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          {displayNames[cat] || cat}
                        </button>
                      );
                    })}
                  </div>

                  {/* Search input bar */}
                  <div className="relative w-full md:w-64 font-sans text-xs">
                    <Search className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Medialarda axtarış..."
                      value={mediaSearchQuery}
                      onChange={(e) => setMediaSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border rounded-xl"
                    />
                  </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {mediaList
                    .filter(item => {
                      // category filter
                      if (mediaPickerCategory !== 'Hamısı' && item.category !== mediaPickerCategory) return false;
                      // search filter
                      if (mediaSearchQuery) {
                        return item.name?.toLowerCase().includes(mediaSearchQuery.toLowerCase()) || 
                               item.url?.toLowerCase().includes(mediaSearchQuery.toLowerCase());
                      }
                      return true;
                    })
                    .map((media) => {
                      const isPdf = media.category === 'document' || media.url?.endsWith('.pdf');
                      return (
                        <div key={media.id} className="group relative border rounded-2xl overflow-hidden bg-slate-50 hover:shadow-md transition-all flex flex-col justify-between aspect-square">
                          {/* Top Thumbnail Preview */}
                          <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-slate-200">
                            {isPdf ? (
                              <div className="flex flex-col items-center justify-center p-4">
                                <FileText className="w-10 h-10 text-rose-500 mb-2" />
                                <span className="text-[10px] font-mono text-slate-500 truncate max-w-[130px]">{media.name}</span>
                              </div>
                            ) : (
                              <img src={media.url} alt={media.name} className="w-full h-full object-cover group-hover:scale-[1.05] transition-all duration-300" referrerPolicy="no-referrer" />
                            )}
                            
                            {/* Overlay Controls */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 transition-all">
                              {/* Copy Link URL */}
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(window.location.origin + media.url);
                                  success('Link surəti yaddaşa köçürüldü!');
                                }}
                                className="bg-white/90 text-navy-deep p-2 hover:bg-gold-primary hover:text-navy-deep rounded-lg cursor-pointer transition-all"
                                title="URL-i Kopyala"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              
                              {/* Rotate / Simulate Crop */}
                              {!isPdf && (
                                <button
                                  onClick={() => {
                                    setCroppingImage(media);
                                    setCropZoom(1);
                                    setCropRotate(0);
                                  }}
                                  className="bg-white/90 text-navy-deep p-2 hover:bg-gold-primary hover:text-navy-deep rounded-lg cursor-pointer transition-all"
                                  title="Görüntünü Redaktə Et (Simulyator)"
                                >
                                  <Sliders className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Delete from system */}
                              <button
                                onClick={async () => {
                                  if (!window.confirm(`"${media.name}" adlı media faylını sistem mərkəzindən və yerli yaddaşdan rəsmən silmək istəyirsiniz? Şirkətlər və turlardakı görüntülər təsirlənə bilər!`)) return;
                                  try {
                                    await (api as any).media.delete(media.id);
                                    success('Media faylı platformadan təmizləndi.');
                                    loadData();
                                  } catch (err: any) {
                                    error(err.message || 'Silmə xətası.');
                                  }
                                }}
                                className="bg-rose-500 text-white p-2 hover:bg-rose-600 rounded-lg cursor-pointer transition-all"
                                title="Media Faylını Sil"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Footer details */}
                          <div className="bg-white p-2.5 border-t text-left select-none">
                            <p className="text-[10px] font-bold text-navy-deep truncate mt-0.5">{media.name}</p>
                            <div className="flex justify-between items-center text-[8px] font-mono text-slate-450 mt-1 leading-none">
                              <span className="uppercase text-gold-primary font-bold">{media.categoryDisplay || media.category}</span>
                              <span className="text-slate-400">{media.fileSize || '120 KB'}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                  {mediaList.filter(item => {
                      if (mediaPickerCategory !== 'Hamısı' && item.category !== mediaPickerCategory) return false;
                      if (mediaSearchQuery) {
                        return item.name?.toLowerCase().includes(mediaSearchQuery.toLowerCase()) || item.url?.toLowerCase().includes(mediaSearchQuery.toLowerCase());
                      }
                      return true;
                    }).length === 0 && (
                    <div className="col-span-full py-16 text-center text-slate-400 font-sans select-none flex flex-col items-center">
                      <Image className="w-8 h-8 text-slate-300 mb-2" />
                      Yüklənmiş və ya mövcud media faylı aşkar edilmədi.
                    </div>
                  )}
                </div>
              </div>

              {/* Cropping image simulator overlay modal */}
              {croppingImage && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 font-sans">
                  <div className="bg-white rounded-3xl p-6 max-w-md w-full flex flex-col gap-4 text-left shadow-2xl relative">
                    <button onClick={() => setCroppingImage(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer">
                      <X className="w-5 h-5" />
                    </button>
                    <h4 className="font-serif text-base font-bold text-navy-deep">Təsviri Kəs və ya Optimallaşdır (Resizer Simulyator)</h4>
                    
                    {/* View canvas with transform */}
                    <div className="bg-slate-900 rounded-2xl h-64 overflow-hidden border flex items-center justify-center relative">
                      <img 
                        src={croppingImage.url} 
                        style={{ 
                          transform: `scale(${cropZoom}) rotate(${cropRotate}deg)`,
                          transition: 'transform 0.1s ease-out'
                        }} 
                        className="max-h-full max-w-full object-contain"
                        alt="Crop target"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Zoom bar */}
                    <div className="flex flex-col gap-1.5 text-xs">
                      <div className="flex justify-between">
                        <span>Yaxınlaşdır (Zoom Scale):</span>
                        <span className="font-mono font-bold text-navy-mid">{cropZoom.toFixed(1)}x</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-slate-400" />
                        <input 
                          type="range" 
                          min="1" 
                          max="3" 
                          step="0.1" 
                          value={cropZoom} 
                          onChange={(e) => setCropZoom(Number(e.target.value))} 
                          className="flex-1 accent-gold-primary bg-slate-200 h-1 rounded-lg animate-fade"
                        />
                      </div>
                    </div>

                    {/* Rotation bar */}
                    <div className="flex flex-col gap-1.5 text-xs">
                      <div className="flex justify-between">
                        <span>Döndər (Rotation angle):</span>
                        <span className="font-mono font-bold text-navy-mid">{cropRotate}°</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <RotateCw className="w-4 h-4 text-slate-400" />
                        <input 
                          type="range" 
                          min="0" 
                          max="360" 
                          step="90" 
                          value={cropRotate} 
                          onChange={(e) => setCropRotate(Number(e.target.value))} 
                          className="flex-1 accent-gold-primary bg-slate-200 h-1 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2.5 mt-2">
                      <button 
                        onClick={() => {
                          success('Kəsim və optimizasiya mərkəz tərəfindən tətbiq edildi!');
                          setCroppingImage(null);
                        }}
                        className="flex-1 bg-navy-deep hover:bg-navy-mid text-gold-primary font-bold py-2.5 rounded-xl cursor-pointer transition-all text-xs text-center"
                      >
                        Optimallaşdırılmış Saxla
                      </button>
                      <button 
                        onClick={() => setCroppingImage(null)}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl cursor-pointer transition-all text-xs text-center"
                      >
                        İmtina Et
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* GLOBAL UNIVERSAL MEDIA PICKER DIALOG */}
      {isMediaPickerOpen && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[900] p-4 font-sans select-none animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden text-left shadow-2xl border border-slate-100">
            {/* Modal Header */}
            <div className="p-5 border-b flex justify-between items-center bg-slate-50">
              <div>
                <h4 className="font-serif text-lg font-bold text-navy-deep flex items-center gap-2 block">
                  <Image className="w-5 h-5 text-gold-primary inline-block mr-1" />
                  Media Kitabxanasından Seçin / Yükləyin (Media Library Picker)
                </h4>
                <p className="text-xs text-slate-500 mt-1">İstədiyiniz fayl üzərinə klikləyərək təsdiq edə bilərsiniz.</p>
              </div>
              <button 
                onClick={() => { setIsMediaPickerOpen(false); setMediaPickerCallback(null); }} 
                className="p-1.5 bg-slate-100 hover:bg-rose-500 hover:text-white rounded-xl text-slate-500 cursor-pointer transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Drag & Drop Uploader */}
            <div 
              className={`mx-5 mt-5 border border-dashed rounded-2xl p-5 text-center transition-all ${
                isDragOver ? 'border-gold-primary bg-amber-50/10' : 'border-slate-200 hover:border-gold-primary/30'
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleFileUpload(file, (url) => { if (mediaPickerCallback) { mediaPickerCallback(url); setIsMediaPickerOpen(false); setMediaPickerCallback(null); } });
              }}
            >
              <p className="text-xs text-slate-700 font-bold">Faylı bura sürükləyin və ya <label className="text-gold-primary underline cursor-pointer select-none">kompüterdən seçin<input type="file" className="hidden" onChange={(e) => handleFileUpload(e, (url) => { if (mediaPickerCallback) { mediaPickerCallback(url); setIsMediaPickerOpen(false); setMediaPickerCallback(null); } })} /></label></p>
              <p className="text-[10px] text-slate-400 mt-1">Dəstəklənən fayllar: JPG, PNG, WEBP, SVG, PDF</p>
            </div>

            {/* Search and Filters */}
            <div className="px-5 pt-4 pb-2 flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {['Hamısı', 'logo', 'tour', 'hotel', 'place', 'restaurant', 'blog', 'document', 'other'].map((cat) => {
                  const displayNames: Record<string, string> = {
                    Hamısı: 'Hamısı',
                    logo: 'Loqolar',
                    tour: 'Turlar',
                    hotel: 'Otellər',
                    place: 'Məkanlar',
                    restaurant: 'Restoranlar',
                    blog: 'Bloqlar',
                    document: 'Sənədlər',
                    other: 'Digər'
                  };
                  const active = mediaPickerCategory === catDisplayKeyMatches(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setMediaPickerCategory(catDisplayKeyMatches(cat))}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer border ${
                        active ? 'bg-gold-primary border-gold-primary text-navy-deep' : 'border-slate-100 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {displayNames[cat] || cat}
                    </button>
                  );
                })}
              </div>

              <div className="relative w-full md:w-48 font-sans text-xs">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Başlığa görə axtar..."
                  value={mediaSearchQuery}
                  onChange={(e) => setMediaSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border rounded-lg text-xs"
                />
              </div>
            </div>

            {/* Grid of Selectable elements */}
            <div className="px-5 pb-5 overflow-y-auto flex-1 max-h-[350px]">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
                {mediaList
                  .filter(item => {
                    if (mediaPickerCategory !== 'Hamısı' && item.category !== mediaPickerCategory) return false;
                    if (mediaSearchQuery) {
                      return item.name?.toLowerCase().includes(mediaSearchQuery.toLowerCase()) || 
                             item.url?.toLowerCase().includes(mediaSearchQuery.toLowerCase());
                    }
                    return true;
                  })
                  .map((media) => {
                    const isPdf = media.category === 'document' || media.url?.endsWith('.pdf');
                    return (
                      <div 
                        key={media.id} 
                        onClick={() => {
                          if (mediaPickerCallback) {
                            mediaPickerCallback(media.url);
                          }
                          setIsMediaPickerOpen(false);
                          setMediaPickerCallback(null);
                        }}
                        className="group relative border border-slate-150 rounded-xl overflow-hidden bg-slate-50 hover:border-gold-primary cursor-pointer hover:shadow-sm transition-all flex flex-col justify-between aspect-square"
                      >
                        <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-slate-200">
                          {isPdf ? (
                            <div className="flex flex-col items-center justify-center p-2 text-center text-slate-800">
                              <FileText className="w-8 h-8 text-rose-500 mb-1" />
                              <span className="text-[9px] font-mono text-slate-500 truncate max-w-[100px]">{media.name}</span>
                            </div>
                          ) : (
                            <img src={media.url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          )}
                        </div>
                        <div className="bg-white p-2 border-t text-left">
                          <p className="text-[9px] font-bold text-navy-deep truncate">{media.name}</p>
                          <p className="text-[7px] uppercase font-semibold text-gold-primary mt-0.5">{media.category}</p>
                        </div>
                      </div>
                    );
                  })}

                {mediaList.filter(item => {
                  if (mediaPickerCategory !== 'Hamısı' && item.category !== mediaPickerCategory) return false;
                  if (mediaSearchQuery) {
                    return item.name?.toLowerCase().includes(mediaSearchQuery.toLowerCase()) || item.url?.toLowerCase().includes(mediaSearchQuery.toLowerCase());
                  }
                  return true;
                }).length === 0 && (
                  <div className="col-span-full py-10 text-center text-slate-400 font-sans text-xs">
                    Seçilə bilən heç bir fayl tapılmadı.
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-slate-50 flex justify-end font-sans">
              <button 
                type="button"
                onClick={() => { setIsMediaPickerOpen(false); setMediaPickerCallback(null); }}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer transition-all"
              >
                Geri Dön
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXQUISITE INTERACTIVE QR CODE GENERATOR & PRINT MODAL */}
      {selectedForQr && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[950] p-4 font-sans select-none animate-fadeIn no-print">
          <div className="bg-white rounded-3xl w-full max-w-md flex flex-col overflow-hidden text-left shadow-2xl border border-slate-100 relative">
            
            {/* Modal Header */}
            <div className="p-5 border-b flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-gold-primary" />
                <h4 className="font-serif text-base font-bold text-navy-deep">
                  On-Site QR Kod Generasiyası
                </h4>
              </div>
              <button 
                onClick={() => { setSelectedForQr(null); setQrCodeDataUrl(''); }} 
                className="p-1.5 bg-slate-100 hover:bg-rose-500 hover:text-white rounded-xl text-slate-500 cursor-pointer transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Print Area Style tag */}
            <style>{`
              @media print {
                body {
                  background: white !important;
                  margin: 0 !important;
                  padding: 0 !important;
                }
                body > * {
                  display: none !important;
                }
                #qr-print-area {
                  display: block !important;
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  height: 100% !important;
                  background: white !important;
                  color: #0B1528 !important;
                  padding: 40px !important;
                  box-sizing: border-box !important;
                  text-align: center !important;
                }
                #qr-print-area * {
                  display: block !important;
                  visibility: visible !important;
                }
                .no-print {
                  display: none !important;
                }
              }
            `}</style>

            {/* Modal Body / Print Area Container */}
            <div className="p-6 overflow-y-auto max-h-[70vh] flex flex-col items-center" id="qr-print-area">
              
              {/* Decorative Header for physical plaque prints */}
              <div className="text-center mb-6 hidden print:block">
                <h2 className="text-2xl font-serif font-bold text-navy-deep tracking-widest uppercase">NAXÇIVAN</h2>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-sans mt-1">RƏQƏMSAL TURİZM BƏLƏDÇİSİ</p>
                <div className="w-16 h-0.5 bg-gold-primary mx-auto mt-2"></div>
              </div>

              {/* Thumbnail Image */}
              <div className="w-24 h-24 rounded-2xl overflow-hidden mb-4 border border-slate-100 shadow-sm shrink-0">
                <img 
                  src={selectedForQr.image} 
                  alt={selectedForQr.name} 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Title & Metadata */}
              <div className="text-center mb-5 font-sans">
                <span className="text-[10px] uppercase tracking-wider font-bold text-gold-primary px-2.5 py-0.5 bg-amber-50 rounded-full border border-amber-100 inline-block">
                  {selectedForQr.type === 'tour' ? 'Tur Paketi' : 'Tarixi Abidə / Məkan'} • {selectedForQr.category}
                </span>
                <h3 className="font-serif text-lg font-bold text-navy-deep mt-2 max-w-xs">{selectedForQr.name}</h3>
              </div>

              {/* QR Code Canvas Frame */}
              <div className="p-4 bg-white border border-slate-150 rounded-2xl shadow-sm flex items-center justify-center relative select-none">
                {qrCodeDataUrl ? (
                  <img 
                    src={qrCodeDataUrl} 
                    alt="QR Code" 
                    className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-slate-400">QR Kod generatsiya olunur...</div>
                )}
              </div>

              {/* Instructions for physical scan on site */}
              <div className="text-center mt-5 max-w-xs px-2 select-text">
                <p className="text-[11px] text-slate-500 font-sans leading-relaxed">
                  Platformadakı rəqəmsal bələdçiyə, multimedia fayllarına və əlaqəli xidmətlərə birbaşa mobil telefondan keçid etmək üçün yuxarıdakı QR kodu skan edin.
                </p>
              </div>

              {/* Footer Stamp on Print page */}
              <div className="text-center mt-12 hidden print:block text-[9px] text-slate-400 font-mono tracking-wider pt-6 border-t border-slate-100 w-full">
                © Naxçıvan Muxtar Respublikası Turizm Portalı • naxcivan.travel
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 border-t bg-slate-50 flex gap-2 font-sans justify-between no-print">
              <button 
                type="button" 
                onClick={() => {
                  const urlPath = selectedForQr.type === 'tour' ? `/tours/${selectedForQr.id}` : `/places/${selectedForQr.id}`;
                  const targetUrl = `${window.location.origin}${window.location.pathname}#${urlPath}`;
                  navigator.clipboard.writeText(targetUrl);
                  success('Keçid linki kopyalandı!');
                }}
                className="bg-white hover:bg-slate-100 hover:text-slate-900 border text-slate-700 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Copy className="w-3.5 h-3.5" />
                Linki Kopyala
              </button>

              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => window.print()}
                  className="bg-gold-primary hover:bg-gold-dark text-navy-deep font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Çap Et
                </button>
                <button 
                  type="button" 
                  onClick={() => { setSelectedForQr(null); setQrCodeDataUrl(''); }}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-3 py-2 rounded-xl text-xs cursor-pointer transition-all"
                >
                  Bağla
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// Support key matching displays inside picker filters
function catDisplayKeyMatches(cat: string): string {
  return cat;
}
