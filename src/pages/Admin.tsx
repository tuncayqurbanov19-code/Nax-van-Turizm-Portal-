import React, { useEffect, useState } from 'react';
import { ShieldCheck, Calendar, Compass, Building, Landmark, MessageSquare, Users, Edit3, Trash2, Plus, PlusCircle, Check, X, ShieldAlert, Award, TrendingUp, Utensils, BookOpen, Settings, Image, Video, Heart, Globe, FileText, Copy, ExternalLink, Search, Sliders, RotateCw, ZoomIn, Upload, QrCode, Printer, MapPin, ArrowUp, ArrowDown, Coffee, Car, ChevronLeft, ChevronRight, Bell } from 'lucide-react';
import { api } from '../services/api';
import QRCode from 'qrcode';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Tour, Hotel, Place, Comment, Reservation, User, Restaurant, Blog, SettingsSchema, HeroSlider, Testimonial, VideoItem, PromoBanner, TourismCompany, CustomMeal, CustomTransport } from '../types';
import StarRating from '../components/ui/StarRating';
import Logo from '../components/ui/Logo';

interface AdminProps {
  onNavigate: (path: string) => void;
}

type AdminTab = 'reservations' | 'tours' | 'hotels' | 'places' | 'comments' | 'users' | 'restaurants' | 'blogs' | 'settings' | 'companies' | 'media' | 'backgrounds';

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  isUnread: boolean;
  refId: string;
  type: 'tour' | 'hotel';
  price: number;
}

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
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

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

  // Extended and customizable Tour parameters states
  const [newTourStops, setNewTourStops] = useState<any[]>([
    { placeName: 'Möminə Xatun Türbəsi', duration: '2 saat', description: 'Naxçıvan memarlıq məktəbinin incisini peşəkar bələdçi ilə gəzirik.', image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=400', lat: 39.2065, lng: 45.4111 }
  ]);
  const [newTourCustomMeals, setNewTourCustomMeals] = useState<any[]>([
    { typeName: 'Səhər yeməyi', restaurantName: 'Saat Cafe-Bistro', items: ['Qaymaq', 'Bal', 'Naxçıvan şoru', 'Təndir çörəyi', 'Süzmə', 'Samovar çayı'], image: '' }
  ]);
  const [newTourSelectedHotelIds, setNewTourSelectedHotelIds] = useState<string[]>([]);
  const [newTourCustomTransports, setNewTourCustomTransports] = useState<any[]>([
    { type: 'Mikroavtobus', model: 'Mercedes-Benz Sprinter VIP', features: ['WiFi', 'Kondisioner', 'USB Şarj ports', 'Mineral sular', 'Geniş oturacaqlar'], image: '' }
  ]);
  const [newTourDiscountPrice, setNewTourDiscountPrice] = useState<number>(0);
  const [newTourContingent, setNewTourContingent] = useState<number>(24);
  const [newTourSeoTitle, setNewTourSeoTitle] = useState('');
  const [newTourSeoDesc, setNewTourSeoDesc] = useState('');
  const [newTourSeoKeywords, setNewTourSeoKeywords] = useState('');

  // Auxiliary input states for managing inline addition to tours
  const [auxStopName, setAuxStopName] = useState('');
  const [auxStopDuration, setAuxStopDuration] = useState('');
  const [auxStopDesc, setAuxStopDesc] = useState('');
  const [auxStopImg, setAuxStopImg] = useState('');
  const [auxStopLat, setAuxStopLat] = useState<number | ''>('');
  const [auxStopLng, setAuxStopLng] = useState<number | ''>('');

  const [auxMealType, setAuxMealType] = useState('Səhər yeməyi');
  const [auxMealRest, setAuxMealRest] = useState('');
  const [auxMealItems, setAuxMealItems] = useState('');
  const [auxMealImg, setAuxMealImg] = useState('');

  const [auxTransType, setAuxTransType] = useState<'Avtobus' | 'Mikroavtobus' | 'Minivan' | 'VIP Avtomobil' | 'Offroad' | 'Digər'>('Mikroavtobus');
  const [auxTransModel, setAuxTransModel] = useState('');
  const [auxTransFeatures, setAuxTransFeatures] = useState('');
  const [auxTransImg, setAuxTransImg] = useState('');

  // New helper states for inline editing items in list builders
  const [editingStopIndex, setEditingStopIndex] = useState<{ form: 'new' | 'edit'; index: number } | null>(null);
  const [editingMealIndex, setEditingMealIndex] = useState<{ form: 'new' | 'edit'; index: number } | null>(null);
  const [editingTransportIndex, setEditingTransportIndex] = useState<{ form: 'new' | 'edit'; index: number } | null>(null);
  const [newTourGallery, setNewTourGallery] = useState<string[]>([]);

  // Inline Hotel Fast Creator Form states
  const [inlineHotelName, setInlineHotelName] = useState('');
  const [inlineHotelStars, setInlineHotelStars] = useState(5);
  const [inlineHotelAddress, setInlineHotelAddress] = useState('');
  const [inlineHotelDesc, setInlineHotelDesc] = useState('');
  const [inlineHotelImg, setInlineHotelImg] = useState('');
  const [inlineHotelAmenities, setInlineHotelAmenities] = useState('WiFi, Səhər Yeməyi, Kondisioner, Mini Bar, Parkinq, Hovuz');

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
  const [newCompWhatsapp, setNewCompWhatsapp] = useState('');
  const [newCompEmail, setNewCompEmail] = useState('');
  const [newCompAddress, setNewCompAddress] = useState('');
  const [newCompWebsite, setNewCompWebsite] = useState('');
  const [newCompFb, setNewCompFb] = useState('');
  const [newCompInsta, setNewCompInsta] = useState('');
  const [newCompTg, setNewCompTg] = useState('');
  const [newCompCommission, setNewCompCommission] = useState(10);
  const [editingRates, setEditingRates] = useState<Record<string, string>>({});
  
  // Company Editing states
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
  const [editCompName, setEditCompName] = useState('');
  const [editCompPhone, setEditCompPhone] = useState('');
  const [editCompWhatsapp, setEditCompWhatsapp] = useState('');
  const [editCompEmail, setEditCompEmail] = useState('');
  const [editCompAddress, setEditCompAddress] = useState('');
  const [editCompWebsite, setEditCompWebsite] = useState('');
  const [editCompDesc, setEditCompDesc] = useState('');
  const [editCompLogo, setEditCompLogo] = useState('');

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

  // New Tour Nutrition Plan States
  const [newTourBreakfastRest, setNewTourBreakfastRest] = useState('Milli Səhər Restoranı');
  const [newTourBreakfastImg, setNewTourBreakfastImg] = useState('');
  const [newTourBreakfastItemInput, setNewTourBreakfastItemInput] = useState('');
  const [newTourBreakfastItems, setNewTourBreakfastItems] = useState<string[]>(['Pendir', 'Kərə yağı', 'Bal', 'Çay']);

  const [newTourLunchRest, setNewTourLunchRest] = useState('Kəklik Otu Restoranı');
  const [newTourLunchImg, setNewTourLunchImg] = useState('');
  const [newTourLunchItemInput, setNewTourLunchItemInput] = useState('');
  const [newTourLunchItems, setNewTourLunchItems] = useState<string[]>(['Kabab', 'Toyuq salatı', 'Düşbərə']);

  const [newTourDinnerRest, setNewTourDinnerRest] = useState('Kəklik Otu Restoranı');
  const [newTourDinnerImg, setNewTourDinnerImg] = useState('');
  const [newTourDinnerItemInput, setNewTourDinnerItemInput] = useState('');
  const [newTourDinnerItems, setNewTourDinnerItems] = useState<string[]>(['Sac qovurma', 'Mövsümi salat', 'Ayran']);

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
  const [cfgLogoMobileUrl, setCfgLogoMobileUrl] = useState('');
  const [cfgLogoFooterUrl, setCfgLogoFooterUrl] = useState('');
  const [cfgFaviconUrl, setCfgFaviconUrl] = useState('');
  const [cfgLogoWidth, setCfgLogoWidth] = useState(150);
  const [cfgLogoHeight, setCfgLogoHeight] = useState(40);
  const [cfgMobileWidth, setCfgMobileWidth] = useState(120);
  const [cfgMobileHeight, setCfgMobileHeight] = useState(30);
  const [cfgDesktopWidth, setCfgDesktopWidth] = useState(150);
  const [cfgDesktopHeight, setCfgDesktopHeight] = useState(40);
  const [cfgLogoPositionX, setCfgLogoPositionX] = useState(0);
  const [cfgLogoPositionY, setCfgLogoPositionY] = useState(0);
  const [cfgLogoVariant, setCfgLogoVariant] = useState<'variant1' | 'variant2' | 'variant3'>('variant2');
  const [cfgLogoText, setCfgLogoText] = useState('NAXÇIVAN');
  const [cfgLogoFontSize, setCfgLogoFontSize] = useState(28);
  const [cfgLogoFontWeight, setCfgLogoFontWeight] = useState('font-black');
  const [cfgLogoFontFamily, setCfgLogoFontFamily] = useState('Space Grotesk');
  const [cfgLogoTextColor, setCfgLogoTextColor] = useState('#0F172A');
  const [cfgLogoAccentColor, setCfgLogoAccentColor] = useState('#F59E0B');
  const [cfgLogoSubtitle, setCfgLogoSubtitle] = useState('TURİZM PORTALI');

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

  // Edit Dialog States
  const [editingTour, setEditingTour] = useState<any | null>(null);
  const [editingHotel, setEditingHotel] = useState<any | null>(null);

  // WhatsApp States
  const [selectedLogsRes, setSelectedLogsRes] = useState<any | null>(null);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState<boolean>(false);
  const [waPhoneId, setWaPhoneId] = useState<string>('');
  const [waAccessToken, setWaAccessToken] = useState<string>('');
  const [waVerifyToken, setWaVerifyToken] = useState<string>('');
  const [waMessageTemplate, setWaMessageTemplate] = useState<string>('');
  const [waIsRealMode, setWaIsRealMode] = useState<boolean>(false);

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

  const [editingSliderIdx, setEditingSliderIdx] = useState<number | null>(null);
  const [editingSliderTitle, setEditingSliderTitle] = useState('');
  const [editingSliderSubtitle, setEditingSliderSubtitle] = useState('');
  const [editingSliderImg, setEditingSliderImg] = useState('');

  const [newTestiName, setNewTestiName] = useState('');
  const [newTestiText, setNewTestiText] = useState('');
  const [newTestiRole, setNewTestiRole] = useState('Ziyarətçi');
  const [newTestiRating, setNewTestiRating] = useState(5);

  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoDesc, setNewVideoDesc] = useState('');

  const [newGalleryUrl, setNewGalleryUrl] = useState('');

  // Welcome settings inputs
  const [cfgWelcomeBadge, setCfgWelcomeBadge] = useState('Naxçıvanı Kəşf Et');
  const [cfgWelcomeTitle, setCfgWelcomeTitle] = useState('Naxçıvanın Gözəlliklərini Kəşf Et');
  const [cfgWelcomeDesc, setCfgWelcomeDesc] = useState('Qədim sivilizasiya beşiyi olan Naxçıvanda tarixi abidələr, möhtəşəm mənzərələr və unudulmaz mənəvi turlar sizi gözləyir.');
  const [cfgWelcomeBgImg, setCfgWelcomeBgImg] = useState('https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=1920&auto=format&fit=crop');

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
      if (resList) {
        const initialNotifs: AdminNotification[] = resList.map((r: any) => ({
          id: `notif_${r.id}`,
          title: r.type === 'tour' ? 'Yeni Tur' : 'Yeni Otel Sifarişi',
          message: `${r.fullName} • ${r.guests} nəfər • ${r.totalPrice} AZN`,
          time: new Date(r.createdAt || Date.now()).toLocaleDateString('az', { hour: '2-digit', minute: '2-digit' }),
          isUnread: r.status === 'pending',
          refId: r.id,
          type: r.type,
          price: r.totalPrice
        }));
        setNotifications(initialNotifs);
      }
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

        const welcome = cfg.welcomeSettings || {};
        setCfgWelcomeBadge(welcome.badgeText || 'Naxçıvanı Kəşf Et');
        setCfgWelcomeTitle(welcome.titleText || 'Naxçıvanın Gözəlliklərini Kəşf Et');
        setCfgWelcomeDesc(welcome.descriptionText || 'Qədim sivilizasiya beşiyi olan Naxçıvanda tarixi abidələr, möhtəşəm mənzərələr və unudulmaz mənəvi turlar sizi gözləyir.');
        setCfgWelcomeBgImg(welcome.backgroundImageUrl || 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=1920&auto=format&fit=crop');

        // Load logo settings safely with beautiful defaults
        setCfgLogoLightUrl(cfg.logoSettings?.logoLightUrl || 'https://images.unsplash.com/photo-1549643276-fdf2fab574f5?q=80&w=150');
        setCfgLogoDarkUrl(cfg.logoSettings?.logoDarkUrl || 'https://images.unsplash.com/photo-1549643276-fdf2fab574f5?q=80&w=150');
        setCfgLogoMobileUrl(cfg.logoSettings?.logoMobileUrl || '');
        setCfgLogoFooterUrl(cfg.logoSettings?.logoFooterUrl || '');
        setCfgFaviconUrl(cfg.logoSettings?.faviconUrl || '/favicon.ico');
        setCfgLogoWidth(cfg.logoSettings?.logoWidth || 150);
        setCfgLogoHeight(cfg.logoSettings?.logoHeight || 40);
        setCfgMobileWidth(cfg.logoSettings?.mobileWidth || 120);
        setCfgMobileHeight(cfg.logoSettings?.mobileHeight || 30);
        setCfgDesktopWidth(cfg.logoSettings?.desktopWidth || 150);
        setCfgDesktopHeight(cfg.logoSettings?.desktopHeight || 40);
        setCfgLogoPositionX(cfg.logoSettings?.logoPositionX || 0);
        setCfgLogoPositionY(cfg.logoSettings?.logoPositionY || 0);
        setCfgLogoVariant(cfg.logoSettings?.logoVariant || 'variant2');
        setCfgLogoText(cfg.logoSettings?.logoText || 'NAXÇIVAN');
        setCfgLogoFontSize(cfg.logoSettings?.logoFontSize || 28);
        setCfgLogoFontWeight(cfg.logoSettings?.logoFontWeight || 'font-black');
        setCfgLogoFontFamily(cfg.logoSettings?.logoFontFamily || 'Space Grotesk');
        setCfgLogoTextColor(cfg.logoSettings?.logoTextColor || '#0F172A');
        setCfgLogoAccentColor(cfg.logoSettings?.logoAccentColor || '#F59E0B');
        setCfgLogoSubtitle(cfg.logoSettings?.logoSubtitle || 'TURİZM PORTALI');

        // Hydrate WhatsApp configs
        if (cfg.whatsappSettings) {
          setWaPhoneId(cfg.whatsappSettings.phoneId || '');
          setWaAccessToken(cfg.whatsappSettings.accessToken || '');
          setWaVerifyToken(cfg.whatsappSettings.verifyToken || 'naxcivan_verify_token_2026');
          setWaMessageTemplate(cfg.whatsappSettings.messageTemplate || '');
          setWaIsRealMode(cfg.whatsappSettings.isRealMode ?? false);
        } else {
          setWaPhoneId('');
          setWaAccessToken('');
          setWaVerifyToken('naxcivan_verify_token_2026');
          setWaMessageTemplate('Hörmətli {Müştəri Adı},\n\nSifarişiniz uğurla qəbul edildi.\n\nTurunuz {Tur Tarixi} tarixində, saat {Tur Başlama Saatı}-da başlayacaq.\n\nSizə xoş və unudulmaz səyahət arzulayırıq. Bizi seçdiyiniz üçün təşəkkür edirik.\n\nHər hansı sualınız yaranarsa, bizimlə əlaqə saxlaya bilərsiniz.\n\nƏlaqə:\n📧 tourist@tourism.naxcivan\n📞 +994 60 237 71 37');
          setWaIsRealMode(false);
        }
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
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.5);
      
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(659.25, now + 0.08); // E5
      gain2.gain.setValueAtTime(0.12, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.6);

      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance("Yeni rezervasiya daxil olub");
        utterance.lang = 'az-AZ';
        utterance.pitch = 1.05;
        utterance.rate = 1.0;
        setTimeout(() => {
          window.speechSynthesis.speak(utterance);
        }, 300);
      }
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

              // Add notification item
              const newNotif: AdminNotification = {
                id: `notif_${newRes.id}`,
                title: newRes.type === 'tour' ? 'Yeni Tur' : 'Yeni Otel Sifarişi',
                message: `${newRes.fullName} • ${newRes.guests} nəfər • ${newRes.totalPrice} AZN`,
                time: new Date(newRes.createdAt || Date.now()).toLocaleDateString('az', { hour: '2-digit', minute: '2-digit' }),
                isUnread: true,
                refId: newRes.id,
                type: newRes.type,
                price: newRes.totalPrice
              };
              setNotifications((prev) => [newNotif, ...prev]);

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
      
      // Automatically send the WhatsApp notification message
      try {
        await api.reservations.sendWhatsApp(id);
        success('Təbrik edirik! Sifarişçi üçün fərdi WhatsApp təsdiq mesajı avtomatlaşdırılmış şəkildé göndərildi.');
      } catch (waErr: any) {
        console.error('Auto WhatsApp notification error:', waErr);
        error('Sifariş təsdiqləndi, lakin WhatsApp bildirişi avtomatik göndərilə bilmədi: ' + (waErr.message || 'aktiv deyil.'));
      }

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

  const handleSendWhatsApp = async (id: string) => {
    try {
      await api.reservations.sendWhatsApp(id);
      success('WhatsApp mesajı uğurla göndərildi!');
      loadData();
    } catch (e: any) {
      error(e.message || 'WhatsApp göndərilə bilmədi.');
    }
  };

  const handleOpenLogs = (res: any) => {
    setSelectedLogsRes(res);
    setIsLogsModalOpen(true);
  };

  // Add Tour Form action
  const handleAddTourSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTourName.trim() || !newTourDesc.trim()) {
      error('Ad və təsvir bölməsi boş qala bilməz.');
      return;
    }

    if (!newTourCompanyId) {
      error('Zəhmət olmasa bu turun məxsus olduğu Tur Şirkətini seçin.');
      return;
    }

    try {
      const selectedCompany = companies.find(c => c.id === newTourCompanyId);
      const companyName = selectedCompany ? selectedCompany.name : (companies[0]?.name || 'Naxçıvan Cahan Səyahət');

      const payload: Omit<Tour, 'id'> = {
        name: newTourName,
        category: newTourCategory as any,
        duration: Number(newTourDuration) || 3,
        mainImage: newTourImg || 'https://images.unsplash.com/photo-1541963463532-d68292c34b19',
        gallery: newTourGallery,
        price: Number(newTourPrice),
        discountPrice: Number(newTourDiscountPrice) || undefined,
        contingent: Number(newTourContingent) || undefined,
        shortDescription: newTourDesc,
        stops: newTourStops.length > 0 ? newTourStops : [
          { placeName: 'Qədim Gəmiqaya', duration: '1/2 gün', description: 'Gəmiqaya təsvirlərinin rəsmi tədqiqi.', image: '', lat: 39.2089, lng: 45.4122 }
        ],
        meals: {
          breakfast: { 
            restaurantName: newTourBreakfastRest || 'Kəklik Otu Restoranı', 
            items: newTourBreakfastItems.length > 0 ? newTourBreakfastItems : ['Pendir', 'Kərə yağı', 'Bal', 'Çay'],
            image: newTourBreakfastImg || ''
          },
          lunch: { 
            restaurantName: newTourLunchRest || 'Kəklik Otu Restoranı', 
            items: newTourLunchItems.length > 0 ? newTourLunchItems : ['Kabab', 'Toyuq salatı', 'Düşbərə'],
            image: newTourLunchImg || ''
          },
          dinner: { 
            restaurantName: newTourDinnerRest || 'Kəklik Otu Restoranı', 
            items: newTourDinnerItems.length > 0 ? newTourDinnerItems : ['Sac qovurma', 'Mövsümi salat', 'Ayran'],
            image: newTourDinnerImg || ''
          }
        },
        customMeals: newTourCustomMeals,
        accommodation: {
          hotelName: 'Təbriz Premium Hotel',
          roomType: 'İkiNəfərlik Deluxe',
          amenities: ['WiFi', 'Hovuz', 'Mini Bar']
        },
        hotelIds: newTourSelectedHotelIds,
        transport: {
          type: newTourVehicleType || 'VIP Mercedes Sprinter',
          model: vehicleModelName || 'Sprinter Tourer 2024',
          features: vehicleFeatures ? vehicleFeatures.split(',').map(f => f.trim()) : ['Kondisioner', 'Dəri Oturacaqlar', 'USB portları'],
          model3D: 'VIP_BUS',
          displayMode: vehicleDisplayMode,
          image: vehicleImgUrl
        },
        customTransports: newTourCustomTransports,
        createdAt: new Date().toISOString(),
        isActive: true,
        vehicleType: newTourVehicleType,
        companyId: newTourCompanyId || companies[0]?.id || 'comp_1',
        companyName: companyName,
        includedServices: newTourIncludedServices ? newTourIncludedServices.split(',').map(s => s.trim()) : [],
        pdfDocuments: newTourPdfUrl ? [newTourPdfUrl] : [],
        seoSettings: {
          title: newTourSeoTitle || undefined,
          description: newTourSeoDesc || undefined,
          keywords: newTourSeoKeywords || undefined
        }
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
        setNewTourGallery([]);
        setNewTourBreakfastRest('');
        setNewTourBreakfastImg('');
        setNewTourBreakfastItems([]);
        setNewTourLunchRest('');
        setNewTourLunchImg('');
        setNewTourLunchItems([]);
        setNewTourDinnerRest('');
        setNewTourDinnerImg('');
        setNewTourDinnerItems([]);
        setNewTourStops([
          { placeName: 'Möminə Xatun Türbəsi', duration: '2 saat', description: 'Naxçıvan memarlıq məktəbinin incisini peşəkar bələdçi ilə gəzirik.', image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=400', lat: 39.2065, lng: 45.4111 }
        ]);
        setNewTourCustomMeals([
          { typeName: 'Səhər yeməyi', restaurantName: 'Saat Cafe-Bistro', items: ['Qaymaq', 'Bal', 'Naxçıvan şoru', 'Təndir çörəyi', 'Süzmə', 'Samovar çayı'], image: '' }
        ]);
        setNewTourSelectedHotelIds([]);
        setNewTourCustomTransports([
          { type: 'Mikroavtobus', model: 'Mercedes-Benz Sprinter VIP', features: ['WiFi', 'Kondisioner', 'USB Şarj ports', 'Mineral sular', 'Geniş oturacaqlar'], image: '' }
        ]);
        setNewTourDiscountPrice(0);
        setNewTourContingent(24);
        setNewTourSeoTitle('');
        setNewTourSeoDesc('');
        setNewTourSeoKeywords('');
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

  const handleEditTourSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTour) return;
    try {
      await api.tours.update(editingTour.id, editingTour);
      success('Səyahət turunun məlumatları uğurla yeniləndi!');
      setEditingTour(null);
      loadData();
    } catch (err: any) {
      error(err.message || 'Yeniləmə xətası baş verdi.');
    }
  };

  const handleEditHotelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHotel) return;
    try {
      if (!editingHotel.id) {
        // Creating a new hotel profile!
        const res = await api.hotels.create(editingHotel);
        if (res) {
          success(`"${res.name}" oteli və onun otaq növləri uğurla yaradıldı!`);
        }
      } else {
        // Updating existing hotel profile!
        await api.hotels.update(editingHotel.id, editingHotel);
        success(`"${editingHotel.name}" məlumatları uğurla yeniləndi!`);
      }
      setEditingHotel(null);
      loadData();
    } catch (err: any) {
      error(err.message || 'Mehmanxana qeydiyyatı/yenilənməsi alınmadı.');
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

  const compressToWebP = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = document.createElement('img');
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const maxDim = 1920;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob) => {
              if (blob) {
                const reader2 = new FileReader();
                reader2.onloadend = () => {
                  resolve(reader2.result as string);
                };
                reader2.onerror = reject;
                reader2.readAsDataURL(blob);
              } else {
                resolve(event.target?.result as string);
              }
            }, 'image/webp', 0.85);
          } else {
            resolve(event.target?.result as string);
          }
        };
        img.onerror = reject;
        img.src = event.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleBackgroundUpload = async (sectionKey: string, file: File) => {
    try {
      success('Təsvir sıxılır və sürətli WebP formatına çevrilir...', 'Sıxılma Prosesi');
      const base64Webp = await compressToWebP(file);
      
      const payload = {
        fileName: `bg_section_${sectionKey}.webp`,
        fileData: base64Webp
      };
      
      const res = await api.uploads.uploadFile(payload.fileName, payload.fileData);
      
      if (res && res.url) {
        const originalSettings = settingsSchema || {};
        const bgSettings = originalSettings.backgroundSettings || {};
        const updatedBgSettings = {
          ...bgSettings,
          [`${sectionKey}Url`]: res.url
        };
        
        await api.settings.update({
          ...originalSettings,
          backgroundSettings: updatedBgSettings
        });
        
        success('Arxa fon şəkli uğurla sıxıldı, WebP-ə çevrildi və yükləndi!', 'Uğurlu Əməliyyat');
        loadData();
      }
    } catch (e: any) {
      error(e.message || 'Arxa fon yüklənərkən xəta baş verdi.');
    }
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
        whatsapp: newCompWhatsapp,
        email: newCompEmail,
        address: newCompAddress,
        website: newCompWebsite,
        socialMedia: {
          facebook: newCompFb,
          instagram: newCompInsta,
          telegram: newCompTg
        },
        commissionRate: Number(newCompCommission)
      };

      await api.companies.create(payload);
      success('Yeni turizm şirkəti uğurla qeydə alındı!');
      setNewCompName('');
      setNewCompLogo('');
      setNewCompDesc('');
      setNewCompPhone('');
      setNewCompWhatsapp('');
      setNewCompEmail('');
      setNewCompAddress('');
      setNewCompWebsite('');
      setNewCompFb('');
      setNewCompInsta('');
      setNewCompTg('');
      setNewCompCommission(10);
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

  const handleUpdateCompanyCommissionRate = async (id: string, rate: number) => {
    if (rate < 0 || rate > 100) {
      error('Komissiya faizi 0-100 aralığında olmalıdır.');
      return;
    }
    try {
      await api.companies.update(id, { commissionRate: rate });
      success('Komissiya faizi uğurla yeniləndi!');
      loadData();
    } catch (err: any) {
      error(err.message || 'Komissiya faizini yeniləmək mümkün olmadı.');
    }
  };

  const handleUpdateCompanySubmit = async (id: string) => {
    if (!editCompName.trim()) {
      error('Şirkət adı boş qala bilməz.');
      return;
    }
    try {
      await api.companies.update(id, {
        name: editCompName,
        phone: editCompPhone,
        whatsapp: editCompWhatsapp,
        email: editCompEmail,
        address: editCompAddress,
        website: editCompWebsite,
        description: editCompDesc,
        logo: editCompLogo
      });
      success('Şirkət məlumatları uğurla yeniləndi!');
      setEditingCompanyId(null);
      loadData();
    } catch (err: any) {
      error(err.message || 'Şirkət məlumatlarını yeniləmək mümkün olmadı.');
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
          logoMobileUrl: cfgLogoMobileUrl,
          logoFooterUrl: cfgLogoFooterUrl,
          faviconUrl: cfgFaviconUrl,
          logoWidth: Number(cfgLogoWidth) || 150,
          logoHeight: Number(cfgLogoHeight) || 40,
          logoPositionX: Number(cfgLogoPositionX) || 0,
          logoPositionY: Number(cfgLogoPositionY) || 0,
          logoVariant: cfgLogoVariant,
          mobileWidth: Number(cfgMobileWidth) || 120,
          mobileHeight: Number(cfgMobileHeight) || 30,
          desktopWidth: Number(cfgDesktopWidth) || 150,
          desktopHeight: Number(cfgDesktopHeight) || 40,
          logoText: cfgLogoText,
          logoFontSize: Number(cfgLogoFontSize) || 28,
          logoFontWeight: cfgLogoFontWeight,
          logoFontFamily: cfgLogoFontFamily,
          logoTextColor: cfgLogoTextColor,
          logoAccentColor: cfgLogoAccentColor,
          logoSubtitle: cfgLogoSubtitle
        },
        whatsappSettings: {
          phoneId: waPhoneId,
          accessToken: waAccessToken,
          verifyToken: waVerifyToken,
          messageTemplate: waMessageTemplate,
          isRealMode: waIsRealMode
        },
        welcomeSettings: {
          badgeText: cfgWelcomeBadge,
          titleText: cfgWelcomeTitle,
          descriptionText: cfgWelcomeDesc,
          backgroundImageUrl: cfgWelcomeBgImg
        }
      };

      await api.settings.update(payload);
      success('Veb-sayt konfiqurasiyası və dizayn parametrləri uğurla yadda saxlanıldı!');
      loadData();
    } catch (e: any) {
      error(e.message || 'Konfiqurasiya yadda saxlanıla bilmədi.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-16 flex justify-center items-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <span className="w-12 h-12 border-4 border-gold-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-sans">Giriş yoxlanılır...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen pt-32 pb-16 flex flex-col justify-center items-center font-sans">
        <div className="bg-white border rounded-3xl p-8 max-w-md w-full text-center shadow-lg">
          <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto mb-4 animate-bounce" />
          <h3 className="font-serif text-xl font-bold text-navy-deep mb-2">Giriş Məhdudlaşdırılıb</h3>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            Bu səhifəyə giriş icazəniz yoxdur.
          </p>
          <button
            onClick={() => onNavigate('/')}
            className="w-full bg-navy-deep hover:bg-navy-mid text-gold-primary py-3 rounded-xl font-bold transition-all cursor-pointer"
          >
            Ana Səhifəyə Qayıt
          </button>
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
        
        <div className="flex items-center gap-3.5 self-end md:self-center relative">
          
          {/* Notification Bell Dropdown Panel */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen((prev) => !prev)}
              className="relative p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer transition-all flex items-center justify-center text-slate-600 hover:text-navy-deep hover:border-gold-primary shadow-sm"
              style={{ minHeight: '46px' }}
              title="Reservasiya Bildirişləri"
            >
              <Bell className="w-5 h-5 text-slate-550" />
              {notifications.filter(n => n.isUnread).length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4.5 w-4.5 bg-rose-500 text-[8px] font-mono font-black text-white items-center justify-center">
                    {notifications.filter(n => n.isUnread).length}
                  </span>
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div 
                className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-slate-100 rounded-3xl shadow-xl z-50 p-4 flex flex-col gap-3 font-sans"
                id="admin-notification-dropdown"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 select-none">
                  <div className="text-left">
                    <h4 className="font-bold text-navy-deep text-xs uppercase tracking-wider">Canlı Rezervasiyalar</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Səyahət və otel rezervasiya axını</p>
                  </div>
                  {notifications.filter(n => n.isUnread).length > 0 && (
                    <button
                      onClick={() => {
                        setNotifications(prev => prev.map(n => ({ ...n, isUnread: false })));
                        success("Bütün bildirişlər oxunmuş kimi qeyd edildi.");
                      }}
                      className="text-[9px] font-bold text-gold-primary hover:text-gold-dark cursor-pointer transition-colors"
                    >
                      Oxunmuş et
                    </button>
                  )}
                </div>

                <div className="max-h-[300px] overflow-y-auto flex flex-col gap-2 p-0.5 scrollbar-thin">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs font-medium">
                      📱 Yeni rezervasiya daxil olduqda bildiriş səslənəcək!
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          setNotifications(p => p.map(n => n.id === notif.id ? { ...n, isUnread: false } : n));
                          setActiveTab('reservations');
                          setIsNotifOpen(false);
                        }}
                        className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex items-start gap-2.5 ${
                          notif.isUnread 
                            ? 'bg-amber-50/20 border-amber-200 hover:bg-amber-50/30' 
                            : 'bg-slate-50/50 border-slate-100 hover:bg-slate-50'
                        }`}
                      >
                        <span className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${notif.isUnread ? 'bg-gold-primary animate-pulse' : 'bg-slate-300'}`} />
                        <div className="flex-1 leading-tight">
                          <div className="flex justify-between items-start gap-1.5">
                            <span className="text-xs font-black text-navy-deep block truncate">{notif.title}</span>
                            <span className="text-[9px] text-slate-400 font-mono tracking-tight shrink-0">{notif.time}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 font-semibold">{notif.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="text-center pt-2 border-t border-slate-50 select-none text-[9px] text-slate-400">
                  ⚡ Socket.io real-vaxt bildiriş mərkəzi
                </div>
              </div>
            )}
          </div>

          {/* User Profile Card */}
          <div className="bg-gold-primary/10 border border-gold-primary/30 p-2.5 rounded-2xl flex items-center gap-2.5 font-sans">
            <ShieldCheck className="w-5 h-5 text-gold-primary shrink-0" />
            <div className="text-left text-xs leading-none">
              <p className="font-bold text-navy-deep">{user?.fullName}</p>
              <p className="text-slate-500 font-mono mt-1 text-[10px]">{user?.email}</p>
            </div>
          </div>

        </div>

      </div>

      {/* Main Split Layout: Left vertical navigation tab sidebar, Right content panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Side Sidebar Tab Buttons (3 spans) */}
        <div className="lg:col-span-3 bg-white border border-slate-100 p-4 rounded-3xl shadow-sm flex flex-col gap-1.5 sticky top-24 z-10 select-none">
          <div className="px-3 pb-4 mb-2 border-b border-slate-100 flex justify-center items-center cursor-pointer overflow-hidden max-w-full" onClick={() => onNavigate('/')}>
            <Logo forceDark={true} />
          </div>
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
            { id: 'backgrounds', label: 'Arxa Fon İdarəetməsi', icon: <Sliders className="w-4 h-4" />, count: undefined },
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
              
              {/* Statistika Dashboard Section */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-2">
                
                {/* Card 1: Ümumi Sifarişlər */}
                <div className="bg-white border border-slate-100 p-4 rounded-3xl shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-gold-primary/10 border border-gold-primary/20 text-gold-primary flex items-center justify-center shrink-0">
                    <Calendar className="w-4.5 h-4.5 text-gold-primary" />
                  </div>
                  <div>
                    <p className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold leading-none">ÜMUMİ REZERV</p>
                    <p className="text-xl font-serif font-extrabold text-navy-deep mt-1 leading-none">
                      {reservations.length}
                    </p>
                  </div>
                </div>

                {/* Card 2: WhatsApp Rezervasiyaları */}
                <div className="bg-white border border-slate-100 p-4 rounded-3xl shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-650 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4.5 h-4.5 text-emerald-650" />
                  </div>
                  <div>
                    <p className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold leading-none">WHATSAPP İLƏ</p>
                    <p className="text-xl font-serif font-extrabold text-navy-deep mt-1 leading-none">
                      {reservations.filter(r => r.viaWhatsapp === true || r.whatsappStatus !== undefined).length}
                    </p>
                  </div>
                </div>

                {/* Card 3: Web / Sistem Rezervasiyaları */}
                <div className="bg-white border border-[#eaeaea] p-4 rounded-3xl shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-600 flex items-center justify-center shrink-0">
                    <Compass className="w-4.5 h-4.5 text-sky-600" />
                  </div>
                  <div>
                    <p className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold leading-none">SAYT VASİTƏSİLƏ</p>
                    <p className="text-xl font-serif font-extrabold text-navy-deep mt-1 leading-none">
                      {reservations.filter(r => !r.viaWhatsapp && r.whatsappStatus === undefined).length}
                    </p>
                  </div>
                </div>

                {/* Card 4: Toplam Sifariş Dəyəri */}
                <div className="bg-white border border-slate-100 p-4 rounded-3xl shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
                    <span className="text-base font-extrabold font-mono text-amber-600">₼</span>
                  </div>
                  <div>
                    <p className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold leading-none">TOPLAM GƏLİR</p>
                    <p className="text-xl font-serif font-extrabold text-navy-deep mt-1 leading-none">
                      ₼{reservations.reduce((acc, r) => acc + (r.totalPrice || 0), 0)}
                    </p>
                  </div>
                </div>

              </div>
              
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
                                res.status === 'confirmed' || res.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                                res.status === 'cancelled' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {res.status === 'confirmed' || res.status === 'approved' ? 'Təsdiqləndi' : 
                                 res.status === 'cancelled' ? 'Ləğv edildi' : 'Gözləyir'}
                              </span>
                              {res.whatsappStatus && (
                                <div className="mt-1.5 flex" id={`wa-status-badge-${res.id}`}>
                                  <span className={`text-[9px] font-mono font-medium px-1.5 py-0.5 rounded border flex items-center gap-1 ${
                                    res.whatsappStatus === 'read' ? 'bg-sky-50 text-sky-600 border-sky-100' :
                                    res.whatsappStatus === 'sent' || res.whatsappStatus === 'delivered' ? 'bg-green-50 text-green-600 border-green-100' :
                                    res.whatsappStatus === 'failed' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                                  }`} title="WhatsApp Statusu">
                                    <span className={`w-1 h-1 rounded-full ${
                                      res.whatsappStatus === 'read' ? 'bg-sky-500 animate-pulse' :
                                      res.whatsappStatus === 'sent' || res.whatsappStatus === 'delivered' ? 'bg-green-500' :
                                      res.whatsappStatus === 'failed' ? 'bg-rose-500' : 'bg-slate-400'
                                    }`} />
                                    WA: {
                                      res.whatsappStatus === 'read' ? 'Oxundu' :
                                      res.whatsappStatus === 'sent' || res.whatsappStatus === 'delivered' ? 'Göndərildi' :
                                      res.whatsappStatus === 'failed' ? 'Xəta baş verdi' : 'Gözləyir'
                                    }
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex gap-1.5 justify-end">
                                {/* Confirm Reservation */}
                                {(res.status === 'pending' || !res.status) && (
                                  <button
                                    onClick={() => handleApproveReservation(res.id)}
                                    className="p-1.5 bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white rounded-lg border border-emerald-100 transition-colors cursor-pointer"
                                    title="Sifarişi Təsdiqlə"
                                    id={`btn-approve-${res.id}`}
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {/* Cancel Reservation */}
                                {(res.status === 'pending' || !res.status) && (
                                  <button
                                    onClick={() => handleCancelReservation(res.id)}
                                    className="p-1.5 bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white rounded-lg border border-rose-100 transition-colors cursor-pointer"
                                    title="Sifarişi Ləğv Et"
                                    id={`btn-cancel-${res.id}`}
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {/* Resend WhatsApp */}
                                {(res.status === 'confirmed' || res.status === 'approved') && (
                                  <button
                                    onClick={() => handleSendWhatsApp(res.id)}
                                    className="p-1.5 bg-indigo-50 hover:bg-indigo-500 text-indigo-600 hover:text-white rounded-lg border border-indigo-100 transition-colors cursor-pointer"
                                    title="WhatsApp mesajını yenidən göndər"
                                    id={`btn-resend-${res.id}`}
                                  >
                                    <RotateCw className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {/* Manual customer WhatsApp Redirect link */}
                                <a
                                  href={`https://api.whatsapp.com/send?phone=${res.phone.replace(/[^0-9]/g, '')}&text=${encodeURIComponent(
                                    res.type === 'tour'
                                      ? `Hörmətli ${res.fullName}, sifarişiniz uğurla qəbul edildi. Turunuz ${res.checkIn} tarixində, saat 09:00-da qoyulmuşdur. Sizə xoş və unudulmaz səyahət arzulayırıq. Bizi seçdiyiniz üçün təşəkkür edirik. Hər hansı sualınız yaranarsa, bizimlə əlaqə saxlaya bilərsiniz.`
                                      : `Hörmətli ${res.fullName}, sifarişiniz uğurla qəbul edildi. Mehmanxana qeydiyyatınız ${res.checkIn} — ${res.checkOut} tarixləri üçün təsdiqlənmişdir. Sizə xoş və rahat qonaqlama arzulayırıq. Bizi seçdiyiniz üçün təşəkkür edirik. Hər hansı sualınız yaranarsa, bizimlə əlaqə saxlaya bilərsiniz.`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white rounded-lg border border-emerald-100 transition-colors flex items-center justify-center cursor-pointer"
                                  title="Müştəriyə WhatsApp ilə təsdiq mesajı göndər"
                                  id={`btn-manual-wa-${res.id}`}
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                                {/* View Logs history */}
                                <button
                                  onClick={() => handleOpenLogs(res)}
                                  className="p-1.5 bg-slate-50 hover:bg-slate-500 text-slate-600 hover:text-white rounded-lg border border-slate-100 transition-colors cursor-pointer"
                                  title="Mesaj tarixçəsinə bax"
                                  id={`btn-logs-${res.id}`}
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </button>
                              </div>
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
                     <label className="text-xs font-semibold text-slate-705">Ana Şəkil (Yalnız Şəkil Yükləyin)</label>
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

                    {/* ===== 1. DYNAMIC STOPS / DESTINATIONS SECTION (Gediləcək Yerlər Bölməsi) ===== */}
                    <div className="md:col-span-3 border-t border-slate-100 pt-6 mt-4">
                      <div className="flex items-center justify-between mb-4 bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100/50 select-none">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-emerald-600 shrink-0" />
                          <div className="text-left font-sans">
                            <h4 className="font-serif text-sm font-black text-navy-deep">Səyahət Proqramı • Gediləcək Yerlər Bölməsi</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Tur proqramına daxil olan ekskursiya nöqtələrini, müddəti və koordinatları idarə edin.</p>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/50 px-2.5 py-1 rounded-full font-sans">
                          {newTourStops.length} Məkan
                        </span>
                      </div>

                      {/* List of current stops */}
                      <div className="space-y-3 mb-4 text-left font-sans">
                        {newTourStops.length === 0 ? (
                          <p className="text-xs text-slate-400 italic py-2">Heç bir gediləcək məkan daxil edilməyib. Aşağıdan yeni məkan əlavə edin.</p>
                        ) : (
                          <div className="border border-slate-200/60 rounded-2xl divide-y overflow-hidden max-h-[350px] overflow-y-auto bg-white">
                            {newTourStops.map((stop, idx) => (
                              <div key={idx} className="p-3 bg-slate-50/20 hover:bg-white flex items-center justify-between gap-4 transition-colors">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  {stop.image ? (
                                    <img src={stop.image} className="w-10 h-10 rounded-lg object-cover shrink-0 border" alt="" referrerPolicy="no-referrer" />
                                  ) : (
                                    <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center shrink-0 border border-dashed"><MapPin className="w-4 h-4 text-slate-400" /></div>
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-xs font-bold text-navy-deep truncate">
                                        {idx + 1}. {stop.placeName}
                                      </span>
                                      <span className="text-[9px] bg-slate-200/80 text-slate-600 font-bold px-1.5 py-0.5 rounded">
                                        ⏱️ {stop.duration}
                                      </span>
                                      {(stop.lat || stop.lng) && (
                                        <span className="text-[9px] bg-sky-50 text-sky-700 font-mono px-1 rounded-sm">
                                          📍 GPS Ready
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{stop.description}</p>
                                  </div>
                                </div>

                                {/* Reordering & Editing actions */}
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    disabled={idx === 0}
                                    onClick={() => {
                                      const list = [...newTourStops];
                                      const temp = list[idx];
                                      list[idx] = list[idx - 1];
                                      list[idx - 1] = temp;
                                      setNewTourStops(list);
                                    }}
                                    className="p-1 hover:bg-slate-200 text-slate-500 rounded disabled:opacity-30 cursor-pointer"
                                    title="Yuxarı Sürüşdür"
                                  >
                                    <ArrowUp className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={idx === newTourStops.length - 1}
                                    onClick={() => {
                                      const list = [...newTourStops];
                                      const temp = list[idx];
                                      list[idx] = list[idx + 1];
                                      list[idx + 1] = temp;
                                      setNewTourStops(list);
                                    }}
                                    className="p-1 hover:bg-slate-200 text-slate-500 rounded disabled:opacity-30 cursor-pointer"
                                    title="Aşağı Sürüşdür"
                                  >
                                    <ArrowDown className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setAuxStopName(stop.placeName);
                                      setAuxStopDuration(stop.duration);
                                      setAuxStopDesc(stop.description);
                                      setAuxStopImg(stop.image || '');
                                      setAuxStopLat(stop.lat || '');
                                      setAuxStopLng(stop.lng || '');
                                      setEditingStopIndex({ form: 'new', index: idx });
                                    }}
                                    className="p-1 hover:bg-indigo-50 text-indigo-600 rounded cursor-pointer"
                                    title="Redaktə Et"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const list = newTourStops.filter((_, i) => i !== idx);
                                      setNewTourStops(list);
                                      if (editingStopIndex?.form === 'new' && editingStopIndex.index === idx) {
                                        setEditingStopIndex(null);
                                      }
                                    }}
                                    className="p-1 hover:bg-rose-100 text-rose-500 rounded cursor-pointer"
                                    title="Sil"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Mini Form to dynamic Add / Edit Landmark/Stop */}
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 md:grid-cols-6 gap-3 text-left font-sans">
                        <div className="md:col-span-3 flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-500">Məkan / Stop Adı</label>
                          <input
                            type="text"
                            placeholder="Məs: Əlincə Qalası"
                            value={auxStopName}
                            onChange={(e) => setAuxStopName(e.target.value)}
                            className="p-2 bg-white border rounded-xl text-xs"
                          />
                        </div>
                        <div className="md:col-span-1.5 flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-500">Sərf Olunan Müddət</label>
                          <input
                            type="text"
                            placeholder="Məs: 3 saat"
                            value={auxStopDuration}
                            onChange={(e) => setAuxStopDuration(e.target.value)}
                            className="p-2 bg-white border rounded-xl text-xs"
                          />
                        </div>
                        <div className="md:col-span-1.5 flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-500 font-sans">Məkan Şəkli</label>
                          <div className="flex items-center gap-1.5 bg-white p-1 border rounded-xl">
                            {auxStopImg && <img src={auxStopImg} className="w-5 h-5 object-cover rounded" alt="" referrerPolicy="no-referrer" />}
                            <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[9px] py-1 px-2 rounded cursor-pointer transition-all font-sans font-bold flex-1 text-center select-none">
                              Foto Yüklə
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, setAuxStopImg)}
                              />
                            </label>
                          </div>
                        </div>

                        <div className="md:col-span-2 flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-500">Xəritə En dairəsi (Lat)</label>
                          <input
                            type="number"
                            step="any"
                            placeholder="Məs: 39.2065"
                            value={auxStopLat}
                            onChange={(e) => setAuxStopLat(e.target.value ? Number(e.target.value) : '')}
                            className="p-2 bg-white border rounded-xl text-xs font-mono"
                          />
                        </div>
                        <div className="md:col-span-2 flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-500 font-sans">Xəritə Uzunluq dairəsi (Lng)</label>
                          <input
                            type="number"
                            step="any"
                            placeholder="Məs: 45.4111"
                            value={auxStopLng}
                            onChange={(e) => setAuxStopLng(e.target.value ? Number(e.target.value) : '')}
                            className="p-2 bg-white border rounded-xl text-xs font-mono"
                          />
                        </div>

                        <div className="md:col-span-2 flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-500 font-sans">&nbsp;</label>
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                if (!auxStopName.trim()) {
                                  error('Məkan adı daxil edilməlidir.');
                                  return;
                                }
                                const payload = {
                                  placeName: auxStopName.trim(),
                                  duration: auxStopDuration.trim() || '2 saat',
                                  description: auxStopDesc.trim() || 'Naxçıvanın gəzməli guşələri.',
                                  image: auxStopImg || 'https://images.unsplash.com/photo-1541963463532-d68292c34b19',
                                  lat: auxStopLat !== '' ? auxStopLat : undefined,
                                  lng: auxStopLng !== '' ? auxStopLng : undefined
                                };

                                if (editingStopIndex && editingStopIndex.form === 'new') {
                                  const list = [...newTourStops];
                                  list[editingStopIndex.index] = payload;
                                  setNewTourStops(list);
                                  setEditingStopIndex(null);
                                  success('Hədəf məkan uğurla yeniləndi!');
                                } else {
                                  setNewTourStops([...newTourStops, payload]);
                                  success('Hədəf məkan siyahıya daxil edildi!');
                                }

                                setAuxStopName('');
                                setAuxStopDuration('');
                                setAuxStopDesc('');
                                setAuxStopImg('');
                                setAuxStopLat('');
                                setAuxStopLng('');
                              }}
                              className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all flex-1"
                            >
                              <Plus className="w-4 h-4" />
                              {editingStopIndex?.form === 'new' ? 'Məkanı Saxla' : 'Məkanı Əlavə Et'}
                            </button>
                            {editingStopIndex?.form === 'new' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingStopIndex(null);
                                  setAuxStopName('');
                                  setAuxStopDuration('');
                                  setAuxStopDesc('');
                                  setAuxStopImg('');
                                  setAuxStopLat('');
                                  setAuxStopLng('');
                                }}
                                className="px-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl"
                              >
                                Ləğv Et
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="md:col-span-6 flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-500">Məkan haqqında Qısa Təsvir / Plan fəaliyyətləri</label>
                          <textarea
                            rows={2}
                            placeholder="Məsələn: Bu qədim qalada daxili bələdçimiz tərəfindən ustad dərsləri veriləcək, fotolar çəkiləcək."
                            value={auxStopDesc}
                            onChange={(e) => setAuxStopDesc(e.target.value)}
                            className="p-2 bg-white border rounded-xl text-xs leading-relaxed"
                          />
                        </div>
                      </div>
                    </div>


                    {/* ===== 2. DYNAMIC MEALS SECTION (Yemək Planı Bölməsi) ===== */}
                    <div className="md:col-span-3 border-t border-slate-100 pt-6 mt-4">
                      <div className="flex items-center justify-between mb-4 bg-amber-50/50 p-3.5 rounded-2xl border border-amber-100/50 select-none">
                        <div className="flex items-center gap-2">
                          <Coffee className="w-5 h-5 text-amber-600 shrink-0" />
                          <div className="text-left font-sans">
                            <h4 className="font-serif text-sm font-black text-navy-deep">Kulinar Səyahət • Dinamik Yemək Planı</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Turçular üçün tənzimlənən xüsusi qidalanma menyularını tənzimləyin. Turda yemək yoxdursa, hamısını silin.</p>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-amber-800 bg-amber-100/50 px-2.5 py-1 rounded-full font-sans">
                          {newTourCustomMeals.length} Menyu
                        </span>
                      </div>

                      {/* List of custom meals */}
                      <div className="space-y-3 mb-4 text-left font-sans text-xs">
                        {newTourCustomMeals.length === 0 ? (
                          <div className="bg-amber-50/30 border border-dashed border-amber-200 rounded-2xl p-4 text-center">
                            <p className="text-xs text-amber-700/80 italic font-medium">Bu tur üçün heç bir qidalanma menyüsü təyin edilməyib. Yemək Planı Bölməsi istifadəçi tərəfdə tamamilə gizlədiləcək.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {newTourCustomMeals.map((meal, idx) => (
                              <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col gap-3 relative hover:shadow-sm transition-all text-left">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                                      {meal.typeName}
                                    </span>
                                    <h4 className="font-bold text-navy-deep text-xs mt-1 font-sans">📍 Məkan: {meal.restaurantName || 'Təyin edilməyib'}</h4>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      disabled={idx === 0}
                                      onClick={() => {
                                        const list = [...newTourCustomMeals];
                                        const temp = list[idx];
                                        list[idx] = list[idx - 1];
                                        list[idx - 1] = temp;
                                        setNewTourCustomMeals(list);
                                      }}
                                      className="p-1 hover:bg-slate-200 text-slate-500 rounded disabled:opacity-30 cursor-pointer"
                                    >
                                      <ArrowUp className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={idx === newTourCustomMeals.length - 1}
                                      onClick={() => {
                                        const list = [...newTourCustomMeals];
                                        const temp = list[idx];
                                        list[idx] = list[idx + 1];
                                        list[idx + 1] = temp;
                                        setNewTourCustomMeals(list);
                                      }}
                                      className="p-1 hover:bg-slate-200 text-slate-500 rounded disabled:opacity-30 cursor-pointer"
                                    >
                                      <ArrowDown className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {meal.image && (
                                  <img src={meal.image} className="w-full h-24 object-cover rounded-xl border bg-white" alt="" referrerPolicy="no-referrer" />
                                )}

                                <div className="flex flex-wrap gap-1">
                                  {meal.items.map((item, i) => (
                                    <span key={i} className="bg-white border text-slate-650 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                      • {item}
                                    </span>
                                  ))}
                                </div>

                                <div className="border-t pt-2 mt-1 flex justify-end gap-2 text-left">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setAuxMealType(meal.typeName);
                                      setAuxMealRest(meal.restaurantName || '');
                                      setAuxMealImg(meal.image || '');
                                      setAuxMealItems(meal.items.join(', '));
                                      setEditingMealIndex({ form: 'new', index: idx });
                                    }}
                                    className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] rounded-lg cursor-pointer transition-colors"
                                  >
                                    Düzəliş et
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const list = newTourCustomMeals.filter((_, i) => i !== idx);
                                      setNewTourCustomMeals(list);
                                      if (editingMealIndex?.form === 'new' && editingMealIndex.index === idx) {
                                        setEditingMealIndex(null);
                                      }
                                    }}
                                    className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-[10px] rounded-lg cursor-pointer transition-colors"
                                  >
                                    Sil
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Mini Form to dynamic Add / Edit Custom Meal card */}
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-3 text-left font-sans text-xs">
                        <div className="flex flex-col gap-1 text-left">
                          <label className="text-[10px] font-bold text-slate-500">Yemək Tipi / Növü</label>
                          <select
                            value={auxMealType}
                            onChange={(e) => setAuxMealType(e.target.value)}
                            className="p-2 bg-white border rounded-xl text-xs font-bold"
                          >
                            <option value="Səhər yeməyi">☕ Səhər Yeməyi</option>
                            <option value="Nahar yeməyi">🍲 Nahar Yeməyi</option>
                            <option value="Axşam yeməyi">🍢 Axşam Yeməyi</option>
                            <option value="Piknik Menyu">🎒 Piknik Menyu</option>
                            <option value="BBQ Menyu">🔥 BBQ Menyu</option>
                            <option value="VIP Lüks Menyu">✨ VIP Lüks Menyu</option>
                            <option value="Çay süfrəsi">🫖 Çay süfrəsi</option>
                            <option value="Digər">Digər təamlar</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1 text-left">
                          <label className="text-[10px] font-bold text-slate-500 font-sans">Restoran və ya Dad Məkanı</label>
                          <input
                            type="text"
                            placeholder="Məs: Regional Dad Evi"
                            value={auxMealRest}
                            onChange={(e) => setAuxMealRest(e.target.value)}
                            className="p-2 bg-white border rounded-xl text-xs"
                          />
                        </div>
                        <div className="flex flex-col gap-1 text-left">
                          <label className="text-[10px] font-bold text-slate-500 font-sans">Yemək/Məkan Fotoşəkli</label>
                          <div className="flex items-center gap-1.5 bg-white p-1 border rounded-xl">
                            {auxMealImg && <img src={auxMealImg} className="w-5 h-5 object-cover rounded" alt="" referrerPolicy="no-referrer" />}
                            <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[9px] py-1 px-2 rounded cursor-pointer transition-all font-sans font-bold flex-1 text-center select-none truncate">
                              Foto Yüklə
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, setAuxMealImg)}
                              />
                            </label>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1 text-left">
                          <label className="text-[10px] font-bold text-slate-500 font-sans">&nbsp;</label>
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                if (!auxMealType.trim()) return;
                                const itemList = auxMealItems.split(',').map(s => s.trim()).filter(Boolean);
                                if (itemList.length === 0) {
                                  error('Yemək siyahısına ən azı bir dənə təam yazın (vergüllə ayıraraq).');
                                  return;
                                }

                                const payload: CustomMeal = {
                                  typeName: auxMealType,
                                  restaurantName: auxMealRest.trim() || undefined,
                                  items: itemList,
                                  image: auxMealImg || undefined
                                };

                                if (editingMealIndex && editingMealIndex.form === 'new') {
                                  const list = [...newTourCustomMeals];
                                  list[editingMealIndex.index] = payload;
                                  setNewTourCustomMeals(list);
                                  setEditingMealIndex(null);
                                  success('Kulinar menu uğurla yeniləndi!');
                                } else {
                                  setNewTourCustomMeals([...newTourCustomMeals, payload]);
                                  success('Yeni kulinar menu daxil edildi!');
                                }

                                setAuxMealRest('');
                                setAuxMealItems('');
                                setAuxMealImg('');
                              }}
                              className="p-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all flex-1 font-sans font-bold"
                            >
                              <Plus className="w-4 h-4" />
                              {editingMealIndex?.form === 'new' ? 'Menyunu FX' : 'Menu Əlavə Et'}
                            </button>
                            {editingMealIndex?.form === 'new' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingMealIndex(null);
                                  setAuxMealRest('');
                                  setAuxMealItems('');
                                  setAuxMealImg('');
                                }}
                                className="px-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl"
                              >
                                Ləğv et
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="md:col-span-4 flex flex-col gap-1 text-left">
                          <label className="text-[10px] font-bold text-slate-500">Menyu Məhsulları (Vergüllə ayıraraq qeyd edin)</label>
                          <input
                            type="text"
                            placeholder="Məs: Qaymaq, Naxçıvan Balı, Təndir Lavaş, Kətə, Motul pendiri, Şor qoğalı"
                            value={auxMealItems}
                            onChange={(e) => setAuxMealItems(e.target.value)}
                            className="p-2 bg-white border border-slate-200 rounded-xl text-xs"
                          />
                        </div>
                      </div>
                    </div>


                    {/* ===== 3. DYNAMIC HOTELS SECTION (Otellər Bölməsi) ===== */}
                    <div className="md:col-span-3 border-t border-slate-100 pt-6 mt-4">
                      <div className="flex items-center justify-between mb-4 bg-sky-50/50 p-3.5 rounded-2xl border border-sky-200 select-none">
                        <div className="flex items-center gap-2">
                          <Building className="w-5 h-5 text-sky-600 shrink-0" />
                          <div className="text-left font-sans">
                            <h4 className="font-serif text-sm font-black text-navy-deep">Səyahət Qonaqlama • Otellər Bölməsi</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Bu tura birləşdiriləcək mehmanxanaları (bir dənə və ya bir neçə) seçin. Gecələme yoxdursa, boş buraxın.</p>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-sky-850 bg-sky-100 px-2.5 py-1 rounded-full font-sans">
                          {newTourSelectedHotelIds.length} Seçilmiş Otel
                        </span>
                      </div>

                      {/* Hotel Selection list */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-left font-sans text-xs">
                        {hotels.map((hotel) => {
                          const isSelected = newTourSelectedHotelIds.includes(hotel.id);
                          return (
                            <div key={hotel.id} className={`p-3 rounded-2xl border transition-all flex justify-between items-center gap-3 ${isSelected ? 'border-sky-500 bg-sky-50/20' : 'border-slate-200 bg-white'}`}>
                              <label className="flex items-start gap-2.5 cursor-pointer flex-1 user-select-none">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {
                                    if (isSelected) {
                                      setNewTourSelectedHotelIds(newTourSelectedHotelIds.filter(id => id !== hotel.id));
                                    } else {
                                      setNewTourSelectedHotelIds([...newTourSelectedHotelIds, hotel.id]);
                                    }
                                  }}
                                  className="accent-sky-600 w-4 h-4 mt-1 cursor-pointer shrink-0"
                                />
                                <div className="min-w-0">
                                  <div className="font-bold text-navy-deep text-xs truncate flex items-center gap-1.5 font-sans">
                                    {hotel.name}
                                    <span className="text-[9px] text-amber-500 font-extrabold flex gap-0.5 leading-none shrink-0">
                                      {Array.from({ length: hotel.stars || 5 }).map((_, i) => '★')}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 truncate mt-0.5">📍 {hotel.address}</p>
                                </div>
                              </label>

                              {/* Mini Global Actions inside Tour Form */}
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => setEditingHotel(hotel)}
                                  className="p-1 text-indigo-500 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                                  title="Mehmanxananın Core Parametrlərini Redaktə Et"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (confirm(`"${hotel.name}" oteli sistemdən tamamilə silinsin? Bu geri qaytarıla bilməz!`)) {
                                      try {
                                        await api.hotels.delete(hotel.id);
                                        success('Mehmanxana uğurla ləğv edildi!');
                                        setNewTourSelectedHotelIds(newTourSelectedHotelIds.filter(id => id !== hotel.id));
                                        loadData();
                                      } catch (err: any) {
                                        error(err.message || 'Xəta yarandı.');
                                      }
                                    }
                                  }}
                                  className="p-1 text-red-550 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                  title="Oteli Bütün Siyahıdan Sil"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Expandable Inline Fast Hotel Creator Form */}
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left font-sans text-xs">
                        <div className="flex items-center gap-1.5 border-b pb-2 mb-3">
                          <PlusCircle className="w-4 h-4 text-sky-505" />
                          <span className="text-xs font-bold font-sans text-navy-deep">Sürətli Səyahət Oteli Profil Yaradılma Formu</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-slate-500">Mehmanxana Adı</label>
                            <input
                              type="text"
                              placeholder="Məs: Duzdağ Hotel & Sanatoriyası"
                              value={inlineHotelName}
                              onChange={(e) => setInlineHotelName(e.target.value)}
                              className="p-2 bg-white border rounded-xl text-xs"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-slate-500">Ünvanı</label>
                            <input
                              type="text"
                              placeholder="Məs: Naxçıvan şəhəri, Babək Rayonu b./q."
                              value={inlineHotelAddress}
                              onChange={(e) => setInlineHotelAddress(e.target.value)}
                              className="p-2 bg-white border rounded-xl text-xs"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-slate-500 font-sans">Otel Şəkli</label>
                            <div className="flex items-center gap-1 p-1 bg-white border rounded-xl">
                              {inlineHotelImg && <img src={inlineHotelImg} className="w-5 h-5 object-cover rounded" alt="" referrerPolicy="no-referrer" />}
                              <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[9px] py-1 px-1.5 rounded cursor-pointer font-sans font-bold flex-1 text-center select-none truncate">
                                Şəkil Yüklə
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleFileUpload(e, setInlineHotelImg)}
                                />
                              </label>
                            </div>
                          </div>

                          <div className="md:col-span-3 flex flex-col gap-1 text-left">
                            <label className="text-[10px] text-slate-500">Qısa Xidmətlər (Vergüllə ayırın)</label>
                            <input
                              type="text"
                              placeholder="Məs: WiFi, Hovuz, Sanatoriya müalicəsi, Səhər yeməyi, Restoran, Masaj, Pulsuz Parkinq"
                              value={inlineHotelAmenities}
                              onChange={(e) => setInlineHotelAmenities(e.target.value)}
                              className="p-2 bg-white border border-slate-200 rounded-xl text-xs"
                            />
                          </div>

                          <div className="md:col-span-2 flex flex-col gap-1 text-left">
                            <label className="text-[10px] text-slate-500 font-sans">Qısa Təsvir</label>
                            <input
                              type="text"
                              placeholder="Məsələn: Duz fizioterapevtik imkanları ilə zəngin 5 ulduzlu lüks kurort kompleksi."
                              value={inlineHotelDesc}
                              onChange={(e) => setInlineHotelDesc(e.target.value)}
                              className="p-2 bg-white border border-slate-200 rounded-xl text-xs"
                            />
                          </div>

                          <div className="flex flex-col gap-1 text-left font-sans text-xs">
                            <label className="text-[10px] text-slate-500">Otel Ulduzu</label>
                            <select
                              value={inlineHotelStars}
                              onChange={(e) => setInlineHotelStars(Number(e.target.value))}
                              className="p-2 bg-white border rounded-xl text-xs font-bold font-sans"
                            >
                              <option value="5">⭐⭐⭐⭐⭐ 5 Ulduzlu</option>
                              <option value="4">⭐⭐⭐⭐ 4 Ulduzlu</option>
                              <option value="3">⭐⭐⭐ 3 Ulduzlu</option>
                              <option value="2">⭐⭐ 2 Ulduzlu</option>
                              <option value="1">⭐ 1 Ulduzlu</option>
                            </select>
                          </div>

                          <div className="md:col-span-3 flex justify-end">
                            <button
                              type="button"
                              onClick={async () => {
                                if (!inlineHotelName.trim() || !inlineHotelAddress.trim()) {
                                  error('Otel adı və ünvanı mütləq yazılmalıdır.');
                                  return;
                                }

                                const amenitiesArray = inlineHotelAmenities.split(',').map(s => s.trim()).filter(Boolean);

                                const payload = {
                                  name: inlineHotelName.trim(),
                                  address: inlineHotelAddress.trim(),
                                  stars: inlineHotelStars,
                                  rooms: [
                                    {
                                      id: 'room-default-inline-' + Date.now(),
                                      name: 'Standard Deluxe Room',
                                      size: 30,
                                      bedType: '1 Double Bed və ya 2 Single Beds',
                                      maxGuests: 2,
                                      description: 'Konfortlu döşək, geniş pəncərə, kondisioner, sürətli pulsuz Wi-Fi.',
                                      basePrice: 100,
                                      currency: 'AZN',
                                      image: inlineHotelImg || 'https://images.unsplash.com/photo-1611891404106-a23bf045022d?q=80&w=350',
                                    }
                                  ],
                                  amenities: amenitiesArray.length > 0 ? amenitiesArray : ['WiFi', 'Kondisioner', 'Səhər Yeməyi'],
                                  restaurant: {
                                    name: 'Hotel Regional Restaurant',
                                    cuisine: 'Milli və Avropa mətbəxi',
                                    hours: '08:00 - 22:00'
                                  },
                                  phone: '+994 36 500 00 00',
                                  email: 'hotel@travelnaxcivan.az',
                                  images: inlineHotelImg ? [inlineHotelImg] : ['https://images.unsplash.com/photo-1566073771259-6a8506099901'],
                                  location: { lat: 39.2089, lng: 45.4122 },
                                  isActive: true,
                                  shortDescription: inlineHotelDesc.trim() || undefined,
                                  createdAt: new Date().toISOString()
                                };

                                try {
                                  const res = await api.hotels.create(payload as any);
                                  if (res) {
                                    success(`"${res.name}" oteli uğurla bazaya qeyd edildi!`);
                                    // Append created ID
                                    setNewTourSelectedHotelIds([...newTourSelectedHotelIds, res.id]);
                                    setInlineHotelName('');
                                    setInlineHotelAddress('');
                                    setInlineHotelDesc('');
                                    setInlineHotelImg('');
                                    loadData();
                                  }
                                } catch (err: any) {
                                  error(err.message || 'Məlumat yazıla bilmədi.');
                                }
                              }}
                              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-all shadow cursor-pointer font-sans font-bold"
                            >
                              <Plus className="w-3.5 h-3.5" /> Oteli Qeyd Et və Tura Qoş
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>


                    {/* ===== 4. DYNAMIC TRANSPORT SECTION (Nəqliyyat Bölməsi) ===== */}
                    <div className="md:col-span-3 border-t border-slate-100 pt-6 mt-4">
                      <div className="flex items-center justify-between mb-4 bg-indigo-50/50 p-3.5 rounded-2xl border border-indigo-100/50 select-none">
                        <div className="flex items-center gap-2">
                          <Car className="w-5 h-5 text-indigo-600 shrink-0" />
                          <div className="text-left font-sans">
                            <h4 className="font-serif text-sm font-black text-navy-deep">Səyahət Karvanı • Dinamik Nəqliyyat Profilləri</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5 font-medium font-sans">Turçular üçün istifadə olunacaq xüsusi transfer vasitələrini təyin edin. Əgər transfer yoxdursa, hamısını silin.</p>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-indigo-800 bg-indigo-100 px-2.5 py-1 rounded-full font-sans">
                          {newTourCustomTransports.length} Nəqliyyat
                        </span>
                      </div>

                      {/* List of custom transports */}
                      <div className="space-y-3 mb-4 text-left font-sans text-xs">
                        {newTourCustomTransports.length === 0 ? (
                          <div className="bg-indigo-50/20 border border-dashed border-indigo-200 rounded-2xl p-4 text-center">
                            <p className="text-xs text-indigo-700/80 italic font-medium">Özəlləşdirilmiş nəqliyyat təyin edilməyib. Nəqliyyat Bölməsi istifadəçi tərəfdə tamamilə gizlədiləcək.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {newTourCustomTransports.map((trans, idx) => (
                              <div key={idx} className="p-4 bg-slate-550 border border-slate-200 rounded-2xl flex flex-col gap-3 hover:shadow-sm transition-all relative text-left">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <span className="bg-indigo-100 text-indigo-800 text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase">
                                      {trans.type}
                                    </span>
                                    <h4 className="font-bold text-navy-deep text-xs mt-1 font-sans">{trans.model}</h4>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      disabled={idx === 0}
                                      onClick={() => {
                                        const list = [...newTourCustomTransports];
                                        const temp = list[idx];
                                        list[idx] = list[idx - 1];
                                        list[idx - 1] = temp;
                                        setNewTourCustomTransports(list);
                                      }}
                                      className="p-1 hover:bg-slate-200 text-slate-500 rounded disabled:opacity-30 cursor-pointer"
                                    >
                                      <ArrowUp className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={idx === newTourCustomTransports.length - 1}
                                      onClick={() => {
                                        const list = [...newTourCustomTransports];
                                        const temp = list[idx];
                                        list[idx] = list[idx + 1];
                                        list[idx + 1] = temp;
                                        setNewTourCustomTransports(list);
                                      }}
                                      className="p-1 hover:bg-slate-200 text-slate-500 rounded disabled:opacity-30 cursor-pointer"
                                    >
                                      <ArrowDown className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {trans.image && (
                                  <img src={trans.image} className="w-full h-24 object-cover rounded-xl border bg-white" alt="" referrerPolicy="no-referrer" />
                                )}

                                <div className="flex flex-wrap gap-1">
                                  {trans.features.map((feature, i) => (
                                    <span key={i} className="bg-white border text-slate-650 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                                      ✓ {feature}
                                    </span>
                                  ))}
                                </div>

                                <div className="border-t pt-2 mt-1 flex justify-end gap-2 text-left">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setAuxTransType(trans.type);
                                      setAuxTransModel(trans.model);
                                      setAuxTransImg(trans.image || '');
                                      setAuxTransFeatures(trans.features.join(', '));
                                      setEditingTransportIndex({ form: 'new', index: idx });
                                    }}
                                    className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] rounded-lg cursor-pointer transition-colors"
                                  >
                                    Düzəliş et
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const list = newTourCustomTransports.filter((_, i) => i !== idx);
                                      setNewTourCustomTransports(list);
                                      if (editingTransportIndex?.form === 'new' && editingTransportIndex.index === idx) {
                                        setEditingTransportIndex(null);
                                      }
                                    }}
                                    className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-[10px] rounded-lg cursor-pointer transition-colors font-sans font-bold"
                                  >
                                    Sil
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Mini Form to dynamic Add / Edit transport profiles */}
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-3 text-left font-sans text-xs">
                        <div className="flex flex-col gap-1 text-left">
                          <label className="text-[10px] font-bold text-slate-500">Nəqliyyat Növü</label>
                          <select
                            value={auxTransType}
                            onChange={(e) => setAuxTransType(e.target.value as any)}
                            className="p-2 bg-white border rounded-xl text-xs font-bold pointer-events-auto"
                          >
                            <option value="Mikroavtobus">Mikroavtobus</option>
                            <option value="Avtobus">Avtobus</option>
                            <option value="Minivan">Minivan</option>
                            <option value="VIP Avtomobil">VIP Avtomobil</option>
                            <option value="Offroad">Offroad SUV 4x4</option>
                            <option value="Digər">Digər</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1 text-left">
                          <label className="text-[10px] font-bold text-slate-500 font-sans">Avtomobilin Modeli</label>
                          <input
                            type="text"
                            placeholder="Məs: Mercedes Vito 2024"
                            value={auxTransModel}
                            onChange={(e) => setAuxTransModel(e.target.value)}
                            className="p-2 bg-white border rounded-xl text-xs"
                          />
                        </div>
                        <div className="flex flex-col gap-1 text-left">
                          <label className="text-[10px] font-bold text-slate-500 font-sans">Nəqliyyat Şəkli</label>
                          <div className="flex items-center gap-1.5 bg-white p-1 border rounded-xl">
                            {auxTransImg && <img src={auxTransImg} className="w-5 h-5 object-cover rounded" alt="" referrerPolicy="no-referrer" />}
                            <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[9px] py-1 px-2 rounded cursor-pointer transition-all font-sans font-bold flex-1 text-center select-none truncate">
                              Foto Yüklə
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, setAuxTransImg)}
                              />
                            </label>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1 text-left font-sans text-xs">
                          <label className="text-[10px] font-bold text-slate-500 font-mono">&nbsp;</label>
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                if (!auxTransModel.trim()) {
                                  error('Nəqliyyat vasitəsinin modeli daxil edilməlidir.');
                                  return;
                                }

                                const payload: CustomTransport = {
                                  type: auxTransType,
                                  model: auxTransModel.trim(),
                                  features: auxTransFeatures ? auxTransFeatures.split(',').map(f => f.trim()).filter(Boolean) : ['Kondisioner', 'Yeni model', 'Təmiz salon'],
                                  image: auxTransImg || undefined
                                };

                                if (editingTransportIndex && editingTransportIndex.form === 'new') {
                                  const list = [...newTourCustomTransports];
                                  list[editingTransportIndex.index] = payload;
                                  setNewTourCustomTransports(list);
                                  setEditingTransportIndex(null);
                                  success('Nəqliyyat uğurla yeniləndi!');
                                } else {
                                  setNewTourCustomTransports([...newTourCustomTransports, payload]);
                                  success('Yeni nəqliyyat daxil edildi!');
                                }

                                setAuxTransModel('');
                                setAuxTransFeatures('');
                                setAuxTransImg('');
                              }}
                              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all flex-1 font-sans font-bold"
                            >
                              <Plus className="w-4 h-4" />
                              {editingTransportIndex?.form === 'new' ? 'Yenilə' : 'Nəqliyyat Qoş'}
                            </button>
                            {editingTransportIndex?.form === 'new' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingTransportIndex(null);
                                  setAuxTransModel('');
                                  setAuxTransFeatures('');
                                  setAuxTransImg('');
                                }}
                                className="px-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-300 transition-colors"
                              >
                                İmtina
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="md:col-span-4 flex flex-col gap-1 text-left">
                          <label className="text-[10px] font-bold text-slate-500 font-sans">Nəqliyyatın Üstünlükləri (Vergüllə ayırın)</label>
                          <input
                            type="text"
                            placeholder="Məs: Kondisioner, Sürətli WiFi, Dəri Oturacaqlar, USB Şarj Portu, Soyuq İçkilər, Peşəkar Sürücü..."
                            value={auxTransFeatures}
                            onChange={(e) => setAuxTransFeatures(e.target.value)}
                            className="p-2 bg-white border border-slate-200 rounded-xl text-xs"
                          />
                        </div>
                      </div>
                    </div>


                    {/* ===== 5. NEW PHOTO GALLERY SECTION (Qalereya Bölməsi) ===== */}
                    <div className="md:col-span-3 border-t border-slate-100 pt-6 mt-4">
                      <div className="flex items-center justify-between mb-4 bg-fuchsia-50/50 p-3.5 rounded-2xl border border-fuchsia-100/50 select-none">
                        <div className="flex items-center gap-2">
                          <Image className="w-5 h-5 text-fuchsia-600 shrink-0" />
                          <div className="text-left font-sans">
                            <h4 className="font-serif text-sm font-black text-navy-deep font-sans">Foto Qalereya • Mediateka Bölməsi</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Turun təfərrüatlarında göstəriləcək çoxlu şəkillər əlavə edin. JPG, JPEG, PNG, WEBP formatları (Sürüşdür sırala).</p>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-fuchsia-800 bg-fuchsia-100 pixel px-2.5 py-1 rounded-full font-sans animate-pulse">
                          {newTourGallery.length} Şəkil
                        </span>
                      </div>

                      {/* Photo Grid with internal controls */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4 text-left font-sans">
                        {newTourGallery.map((imgUrl, idx) => (
                          <div key={idx} className="group relative rounded-2xl overflow-hidden border aspect-video bg-slate-100 shadow-sm border-slate-200 hover:shadow-md transition-all">
                            <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                            <div className="absolute top-1.5 left-1.5 bg-black/70 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-md backdrop-blur-sm">
                              #{idx + 1}
                            </div>
                            
                            {/* Overlay Controls */}
                            <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 flex flex-col justify-end p-2 transition-opacity gap-1.5 backdrop-blur-[2px]">
                              {/* Reorder controls */}
                              <div className="flex gap-1 justify-center">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => {
                                    const list = [...newTourGallery];
                                    const temp = list[idx];
                                    list[idx] = list[idx - 1];
                                    list[idx - 1] = temp;
                                    setNewTourGallery(list);
                                  }}
                                  className="bg-white/85 hover:bg-white text-navy-deep p-1 rounded-lg transition-colors cursor-pointer disabled:opacity-30"
                                  title="Sola Sürüşdür"
                                >
                                  <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === newTourGallery.length - 1}
                                  onClick={() => {
                                    const list = [...newTourGallery];
                                    const temp = list[idx];
                                    list[idx] = list[idx + 1];
                                    list[idx + 1] = temp;
                                    setNewTourGallery(list);
                                  }}
                                  className="bg-white/85 hover:bg-white text-navy-deep p-1 rounded-lg transition-colors cursor-pointer disabled:opacity-30"
                                  title="Sağa Sürüşdür"
                                >
                                  <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                                </button>
                                <label className="bg-sky-600 hover:bg-sky-750 text-white p-1 rounded-lg transition-colors cursor-pointer" title="Şəkli Əvəzlə">
                                  <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleFileUpload(e, (url) => {
                                      const list = [...newTourGallery];
                                      list[idx] = url;
                                      setNewTourGallery(list);
                                      success('Şəkil dəyişdirildi!');
                                    })}
                                  />
                                </label>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setNewTourGallery(newTourGallery.filter((_, i) => i !== idx));
                                    success('Şəkil qalereyadan çıxarıldı.');
                                  }}
                                  className="bg-red-500 hover:bg-red-650 text-white p-1 rounded-lg transition-all cursor-pointer"
                                  title="Sil"
                                >
                                  <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Interactive Drag & Drop Box with click upload */}
                        <div
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            const file = e.dataTransfer.files?.[0];
                            if (file) {
                              handleFileUpload(file, (url) => {
                                setNewTourGallery([...newTourGallery, url]);
                                success('Yeni şəkil sürüşdürülərək daxil edildi!');
                              });
                            }
                          }}
                          className="border-2 border-dashed border-slate-300 hover:border-fuchsia-500 rounded-2xl flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100/50 p-4 min-h-[110px] text-center cursor-pointer transition-all gap-2"
                        >
                          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer select-none">
                            <Upload className="w-5 h-5 text-fuchsia-550 animate-bounce" />
                            <span className="text-[11px] font-bold text-slate-700 font-sans mt-1">Sürüşdür / Seç</span>
                            <span className="text-[9px] text-slate-400 mt-0.5">JPG, PNG, WEBP</span>
                            <input
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/webp"
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, (url) => {
                                setNewTourGallery([...newTourGallery, url]);
                                success('Şəkil əlavə edildi!');
                              })}
                            />
                          </label>
                        </div>
                      </div>
                    </div>


                    {/* ===== 6. SEO METADATA SECTION ===== */}
                    <div className="md:col-span-3 border-t border-slate-100 pt-6 mt-4">
                      <div className="flex items-center justify-start gap-2 mb-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 select-none">
                        <Compass className="w-5 h-5 text-gold-primary shrink-0" />
                        <div className="text-left font-sans">
                          <h4 className="font-serif text-sm font-black text-navy-deep">SEO Optimizasiyası və Parametrləri (SEO Axtarış)</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-medium font-sans">Tur Səhifəsinin Google axtarış motorlarında yüksək yerlərdə çıxması üçün metadata başlıqlarını doldurun.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left font-sans bg-white pb-3 rounded-2xl">
                        <div className="flex flex-col gap-1 md:col-span-3 text-left">
                          <label className="text-[11px] font-bold text-slate-500">Axtarış Başlığı (SEO Title)</label>
                          <input
                            type="text"
                            placeholder="Məsələn: Premium Naxçıvan Turları 2026 - Ən yaxşı qiymətlərlə"
                            value={newTourSeoTitle}
                            onChange={(e) => setNewTourSeoTitle(e.target.value)}
                            className="p-2.5 bg-slate-50 border rounded-xl text-xs"
                          />
                        </div>
                        <div className="flex flex-col gap-1 md:col-span-3 text-left">
                          <label className="text-[11px] font-bold text-slate-500 font-sans">Axtarış Təsviri (SEO Description)</label>
                          <textarea
                            rows={2}
                            placeholder="Məsələn: Batabat gölü, Əlincə Qalası və Möminə Xatun daxil olan 3 günlük möhtəşəm Naxçıvan səyahəti. Otel və bələdçi daxildir, dərhal çat et!"
                            value={newTourSeoDesc}
                            onChange={(e) => setNewTourSeoDesc(e.target.value)}
                            className="p-2.5 bg-slate-50 border rounded-xl text-xs leading-normal"
                          />
                        </div>
                        <div className="flex flex-col gap-1 md:col-span-3 font-sans text-left">
                          <label className="text-[11px] font-bold text-slate-500">Axtarış Açar Sözləri (SEO Keywords - Vergüllə ayırın)</label>
                          <input
                            type="text"
                            placeholder="Məsələn: naxcivan turlari, elince qalasi, batabat turu, naxcivanda oteller"
                            value={newTourSeoKeywords}
                            onChange={(e) => setNewTourSeoKeywords(e.target.value)}
                            className="p-2.5 bg-slate-50 border rounded-xl text-xs"
                          />
                        </div>
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
                          onClick={() => setEditingTour(tour)}
                          className="py-1.5 px-3 bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white rounded-xl transition-all cursor-pointer flex items-center gap-1 font-semibold text-xs shrink-0"
                          title="Turu Redaktə Et"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Redaktə</span>
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
              
              {/* Analytics Panel */}
              {(() => {
                const companyStats = companies.map(comp => {
                  const companyTours = tours.filter(t => (t.companyId || '') === comp.id);
                  const activeToursCount = companyTours.filter(t => t.isActive).length;
                  const tourIds = companyTours.map(t => t.id);
                  const companyReservations = reservations.filter(res => res.type === 'tour' && tourIds.includes(res.refId));
                  const totalReservations = companyReservations.length;
                  const totalSales = companyReservations
                    .filter(res => res.status !== 'cancelled')
                    .reduce((sum, res) => sum + (res.totalPrice || 0), 0);
                  const rate = comp.commissionRate !== undefined && comp.commissionRate !== null ? comp.commissionRate : 10;
                  const commissionAmount = (totalSales * rate) / 100;
                  const netPayable = totalSales - commissionAmount;

                  return {
                    ...comp,
                    activeToursCount,
                    totalReservations,
                    totalSales,
                    commissionRate: rate,
                    commissionAmount,
                    netPayable,
                    rawReservations: companyReservations
                  };
                });

                const totalSalesAll = companyStats.reduce((sum, c) => sum + c.totalSales, 0);
                const totalCommissionAll = companyStats.reduce((sum, c) => sum + c.commissionAmount, 0);
                const topSalesCompany = [...companyStats].filter(c => c.totalSales > 0).sort((a, b) => b.totalSales - a.totalSales)[0] || null;
                const topReservationCompany = [...companyStats].filter(c => c.totalReservations > 0).sort((a, b) => b.totalReservations - a.totalReservations)[0] || null;

                const today = new Date();
                const currentMonth = today.getMonth();
                const currentYear = today.getFullYear();

                const currentMonthSales = companyStats.reduce((sum, comp) => {
                  const monthBookings = comp.rawReservations.filter(res => {
                    if (res.status === 'cancelled') return false;
                    const d = new Date(res.createdAt);
                    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                  });
                  return sum + monthBookings.reduce((s, b) => s + (b.totalPrice || 0), 0);
                }, 0);

                const currentYearSales = companyStats.reduce((sum, comp) => {
                  const yearBookings = comp.rawReservations.filter(res => {
                    if (res.status === 'cancelled') return false;
                    const d = new Date(res.createdAt);
                    return d.getFullYear() === currentYear;
                  });
                  return sum + yearBookings.reduce((s, b) => s + (b.totalPrice || 0), 0);
                }, 0);

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
                    {/* Card 1: Total Sales */}
                    <div className="bg-gradient-to-br from-navy-deep to-navy-mid p-6 rounded-3xl border border-gold-primary/20 shadow-sm text-white flex flex-col justify-between">
                      <div>
                        <p className="text-xs text-slate-300 font-bold uppercase tracking-wider">Ümumi Satış</p>
                        <h3 className="text-2xl font-serif font-black text-gold-primary mt-1 font-mono">
                          {totalSalesAll.toLocaleString()} AZN
                        </h3>
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[11px]">
                        <span className="text-slate-300">Bu il: <strong className="font-mono text-white">{currentYearSales.toLocaleString()} AZN</strong></span>
                        <span className="text-slate-300">Bu ay: <strong className="font-mono text-white">{currentMonthSales.toLocaleString()} AZN</strong></span>
                      </div>
                    </div>

                    {/* Card 2: Total Commission */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Ümumi Komissiya Gəliri</p>
                        <h3 className="text-2xl font-black text-emerald-600 mt-1 font-mono">
                          {totalCommissionAll.toLocaleString()} AZN
                        </h3>
                      </div>
                      <div className="mt-4 text-[11px] text-slate-500 border-t pt-3 flex items-center justify-between">
                        <span>Sistem mənfəəti</span>
                        <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-mono text-[10px] font-bold">FAAL</span>
                      </div>
                    </div>

                    {/* Card 3: Leaders */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between md:col-span-2 lg:col-span-1">
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Lider Şirkətlər</p>
                        <div className="mt-2 space-y-2 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">Ən çox satış edən:</span>
                            <span className="font-bold text-navy-deep truncate max-w-[140px]">
                              {topSalesCompany ? topSalesCompany.name : '—'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">Ən çox rezervasiya:</span>
                            <span className="font-bold text-navy-deep truncate max-w-[140px]">
                              {topReservationCompany ? topReservationCompany.name : '—'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="border-t pt-3 mt-2 text-[10px] text-slate-400 italic">
                        Real-vaxt analiz nəticələri
                      </div>
                    </div>
                  </div>
                );
              })()}

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
                    <label className="text-xs text-slate-550 font-semibold text-amber-600">Telefon Nömrəsi</label>
                    <input
                      type="text"
                      placeholder="+994 36 544 00 00"
                      value={newCompPhone}
                      onChange={(e) => setNewCompPhone(e.target.value)}
                      className="p-2.5 bg-slate-50 border rounded-xl"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-amber-600 flex items-center gap-1">
                      <span>WhatsApp Nömrəsi * (Routing)</span>
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Məs: +994501112233"
                      value={newCompWhatsapp}
                      onChange={(e) => setNewCompWhatsapp(e.target.value)}
                      className="p-2.5 bg-amber-50/20 border border-amber-500/20 rounded-xl focus:border-amber-500 focus:bg-white text-navy-deep font-bold"
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
                    <label className="text-xs text-slate-500">Şirkət Loqosu (Yalnız Loqo Yükləyin)</label>
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

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-550 font-semibold">İlkin Komissiya Faizi (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      placeholder="Faiz daxil edin. Məs: 10"
                      value={newCompCommission}
                      onChange={(e) => setNewCompCommission(Number(e.target.value))}
                      className="p-2.5 bg-slate-50 border rounded-xl font-mono font-bold text-navy-deep"
                    />
                  </div>

                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-xs text-slate-500">Sürətli Seçimlər</label>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5">
                      {[4, 5, 8, 10, 15].map(v => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setNewCompCommission(v)}
                          className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${newCompCommission === v ? 'bg-gold-primary text-navy-deep border-gold-primary' : 'bg-white text-slate-600 border-slate-200'}`}
                        >
                          {v}%
                        </button>
                      ))}
                    </div>
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
                <div className="flex flex-col gap-6">
                  {companies.length === 0 ? (
                    <div className="bg-white border rounded-3xl p-8 text-center text-slate-400">Heç bir turizm şirkəti qeydə alınmamışdır.</div>
                  ) : (
                    companies.map((comp) => {
                      const companyTours = tours.filter(t => (t.companyId || '') === comp.id);
                      const activeToursCount = companyTours.filter(t => t.isActive).length;
                      const tourIds = companyTours.map(t => t.id);
                      const companyReservations = reservations.filter(res => res.type === 'tour' && tourIds.includes(res.refId));
                      const totalReservations = companyReservations.length;
                      const totalSales = companyReservations
                        .filter(res => res.status !== 'cancelled')
                        .reduce((sum, res) => sum + (res.totalPrice || 0), 0);
                      
                      const rate = comp.commissionRate !== undefined && comp.commissionRate !== null ? comp.commissionRate : 10;
                      const commissionAmount = (totalSales * rate) / 100;
                      const netPayable = totalSales - commissionAmount;

                      const currentEditValue = editingRates[comp.id] !== undefined ? editingRates[comp.id] : String(rate);

                      return (
                        <div key={comp.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-6 font-sans">
                          {/* Header section of company card */}
                          {editingCompanyId === comp.id ? (
                            <div className="bg-slate-50/50 p-4 border border-slate-200/60 rounded-2xl space-y-4 text-left w-full">
                              <h5 className="font-bold text-navy-deep text-sm flex items-center gap-2">
                                <Edit3 className="w-4 h-4 text-amber-500" />
                                <span>Şirkət Məlumatlarını Redaktə Et</span>
                              </h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] uppercase font-bold text-slate-400">Şirkət Adı</label>
                                  <input 
                                    type="text" 
                                    value={editCompName} 
                                    onChange={e => setEditCompName(e.target.value)} 
                                    className="p-2 border bg-white rounded-xl text-xs font-bold text-navy-deep" 
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] uppercase font-bold text-slate-400">Telefon</label>
                                  <input 
                                    type="text" 
                                    value={editCompPhone} 
                                    onChange={e => setEditCompPhone(e.target.value)} 
                                    className="p-2 border bg-white rounded-xl text-xs" 
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] uppercase font-bold text-emerald-600">WhatsApp Nömrəsi (For routing)</label>
                                  <input 
                                    type="text" 
                                    value={editCompWhatsapp} 
                                    onChange={e => setEditCompWhatsapp(e.target.value)} 
                                    className="p-2 border border-emerald-300 rounded-xl bg-emerald-50/20 text-xs font-bold text-navy-deep" 
                                    placeholder="+994501112233"
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] uppercase font-bold text-slate-400">E-poçt</label>
                                  <input 
                                    type="email" 
                                    value={editCompEmail} 
                                    onChange={e => setEditCompEmail(e.target.value)} 
                                    className="p-2 border bg-white rounded-xl text-xs" 
                                  />
                                </div>
                                <div className="flex flex-col gap-1 md:col-span-2">
                                  <label className="text-[10px] uppercase font-bold text-slate-400">Təsvir (Description)</label>
                                  <textarea 
                                    rows={2} 
                                    value={editCompDesc} 
                                    onChange={e => setEditCompDesc(e.target.value)} 
                                    className="p-2 border bg-white rounded-xl text-xs leading-normal" 
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] uppercase font-bold text-slate-400">Ofis Ünvanı</label>
                                  <input 
                                    type="text" 
                                    value={editCompAddress} 
                                    onChange={e => setEditCompAddress(e.target.value)} 
                                    className="p-2 border bg-white rounded-xl text-xs" 
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] uppercase font-bold text-slate-400">Veb Sayt URL</label>
                                  <input 
                                    type="url" 
                                    value={editCompWebsite} 
                                    onChange={e => setEditCompWebsite(e.target.value)} 
                                    className="p-2 border bg-white rounded-xl text-xs font-mono" 
                                  />
                                </div>
                                <div className="flex flex-col gap-1 md:col-span-2">
                                  <label className="text-[10px] uppercase font-bold text-slate-400">Loqo Şəkil URL</label>
                                  <div className="flex gap-2">
                                    <input 
                                      type="text" 
                                      value={editCompLogo} 
                                      onChange={e => setEditCompLogo(e.target.value)} 
                                      className="flex-1 p-2 border bg-white rounded-xl text-xs font-mono" 
                                    />
                                    <label className="bg-navy-mid hover:bg-navy-deep text-gold-primary border border-gold-primary/30 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all inline-flex items-center">
                                      Yüklə
                                      <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden" 
                                        onChange={(e) => handleFileUpload(e, setEditCompLogo)} 
                                      />
                                    </label>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2 justify-end pt-2 border-t">
                                <button 
                                  type="button" 
                                  onClick={() => setEditingCompanyId(null)} 
                                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                >
                                  Ləğv Et
                                </button>
                                <button 
                                  type="button" 
                                  onClick={() => handleUpdateCompanySubmit(comp.id)} 
                                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                                >
                                  Yadda Saxla
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                              <div className="flex items-start gap-4 flex-1">
                                <img src={comp.logo || 'https://images.unsplash.com/photo-1549643276-fdf2fab574f5?q=80&w=150'} alt="" className="w-16 h-16 object-cover rounded-2xl bg-slate-100 border p-1" referrerPolicy="no-referrer" />
                                <div className="flex-1">
                                  <h4 className="font-bold text-lg text-navy-deep">{comp.name}</h4>
                                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{comp.description}</p>
                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 text-[11px] text-slate-400 font-mono">
                                    <span>Tel: <strong className="text-slate-600 font-sans">{comp.phone || 'Daxil edilməyib'}</strong></span>
                                    <span>WhatsApp: <strong className="text-emerald-600 bg-emerald-55/10 border border-emerald-500/20 px-1.5 py-0.5 rounded font-sans">{comp.whatsapp || 'Müəyyən edilməyib'}</strong></span>
                                    <span>E-poçt: <strong className="text-slate-600 font-sans">{comp.email || 'Daxil edilməyib'}</strong></span>
                                    <span>Veb: {comp.website ? <a href={comp.website} target="_blank" rel="noreferrer" className="text-gold-primary hover:underline">{comp.website}</a> : 'Yoxdur'}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-1.5 shrink-0 self-end md:self-start">
                                <button
                                  onClick={() => {
                                    setEditingCompanyId(comp.id);
                                    setEditCompName(comp.name);
                                    setEditCompPhone(comp.phone || '');
                                    setEditCompWhatsapp(comp.whatsapp || '');
                                    setEditCompEmail(comp.email || '');
                                    setEditCompAddress(comp.address || '');
                                    setEditCompWebsite(comp.website || '');
                                    setEditCompDesc(comp.description || '');
                                    setEditCompLogo(comp.logo || '');
                                  }}
                                  className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition-all cursor-pointer"
                                  title="Şirkət Məlumatlarını Düsturla Redaktə Et"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCompany(comp.id)}
                                  className="p-2 bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl border border-rose-100 transition-all cursor-pointer"
                                  title="Şirkəti Sil"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Dynamic Statistics Block & Commission Editor */}
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-slate-50/70 p-5 rounded-2xl border border-slate-100/50">
                            {/* Stats numbers columns */}
                            <div className="col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="flex flex-col bg-white p-3 rounded-xl border border-slate-100">
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Aktiv Turlar</span>
                                <span className="text-base font-black text-navy-deep mt-1 font-mono">{activeToursCount} / {companyTours.length}</span>
                              </div>
                              <div className="flex flex-col bg-white p-3 rounded-xl border border-slate-100">
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Rezervasiya</span>
                                <span className="text-base font-black text-navy-deep mt-1 font-mono">{totalReservations}</span>
                              </div>
                              <div className="flex flex-col bg-white p-3 rounded-xl border border-slate-100">
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold font-sans">Ümumi Satış</span>
                                <span className="text-base font-black text-navy-deep mt-1 font-mono text-amber-600">{totalSales.toLocaleString()} AZN</span>
                              </div>
                              <div className="flex flex-col bg-white p-3 rounded-xl border border-slate-100">
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Komissiya (Məbləğ)</span>
                                <span className="text-base font-black text-emerald-600 mt-1 font-mono">{commissionAmount.toLocaleString()} AZN</span>
                              </div>
                            </div>

                            {/* Net Payable to company box */}
                            <div className="flex flex-col justify-center bg-gradient-to-br from-navy-deep to-navy-mid p-3 rounded-xl border border-gold-primary/10 shadow-sm text-center">
                              <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Şirkətə Ödəniləcək Yekun</span>
                              <span className="text-lg font-black text-gold-primary mt-1 font-mono">{netPayable.toLocaleString()} AZN</span>
                            </div>
                          </div>

                          {/* Commission Management Toolbar */}
                          <div className="border-t border-slate-100 pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-navy-deep">Mövcud komissiya faizi:</span>
                              <span className="bg-amber-100 text-amber-800 border border-amber-200 text-xs font-black px-2.5 py-0.5 rounded-full font-mono">{rate}%</span>
                            </div>

                            <form 
                              onSubmit={(e) => {
                                e.preventDefault();
                                handleUpdateCompanyCommissionRate(comp.id, Number(currentEditValue));
                              }}
                              className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border"
                            >
                              <span className="text-xs text-slate-550 pl-2 font-semibold">Komissiya:</span>
                              <div className="flex flex-wrap items-center gap-1">
                                {[4, 5, 8, 10, 15].map(val => (
                                  <button
                                    key={val}
                                    type="button"
                                    onClick={() => {
                                      setEditingRates({ ...editingRates, [comp.id]: String(val) });
                                      handleUpdateCompanyCommissionRate(comp.id, val);
                                    }}
                                    className={`px-2 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${rate === val ? 'bg-gold-primary text-navy-deep border-gold-primary' : 'bg-white text-slate-600 border-slate-200'}`}
                                  >
                                    {val}%
                                  </button>
                                ))}
                              </div>
                              <div className="flex items-center gap-1 border-l pl-2">
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  placeholder="Özəl"
                                  value={currentEditValue}
                                  onChange={(e) => setEditingRates({ ...editingRates, [comp.id]: e.target.value })}
                                  className="w-14 p-1 text-center bg-white border rounded font-mono text-xs font-bold text-navy-deep"
                                />
                                <span className="text-xs text-slate-400 font-bold">%</span>
                                <button
                                  type="submit"
                                  disabled={Number(currentEditValue) === rate}
                                  className={`p-1 bg-navy-mid text-gold-primary rounded hover:bg-navy-deep transition-all cursor-pointer ${Number(currentEditValue) === rate ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  title="Komissiyanı Saxla"
                                >
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
              
            </div>
          )}

          {/* TAB 3: Otellər Desk */}
          {activeTab === 'hotels' && (
            <div className="flex flex-col gap-8" id="panel-hotels">
              
              <div className="bg-gradient-to-br from-navy-deep to-navy-mid border-2 border-gold-primary/20 p-8 rounded-3xl shadow-sm text-center relative overflow-hidden group select-none">
                <div className="absolute inset-0 bg-radial-gradient from-gold-primary/5 via-transparent to-transparent pointer-events-none opacity-40"></div>
                <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gold-primary/10 flex items-center justify-center border border-gold-primary/30 shadow-inner">
                    <Building className="w-8 h-8 text-gold-primary" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-white tracking-wide">Hərtərəfli Otel İdarəetmə Paneli</h3>
                  <p className="text-slate-300 text-sm leading-relaxed max-w-md font-sans">
                    Yeni otel profilini dərhal bütün parametrləri ilə birlikdə bir mərkəzdən yaradın: Loqo, media qalereyaları, ətraflı xəritə koordinatları, restoran menyusu və fərqli otaq növləri (Standard, Deluxe, Suite, Presidential) üzrə fərdi gecəlik/mövsümi qiymət və qonaq say tənzimləmələri.
                  </p>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setEditingHotel({
                        id: '',
                        name: '',
                        address: '',
                        stars: 5,
                        rooms: [
                          {
                            id: 'room-std-1',
                            name: 'Standard Room',
                            size: 28,
                            bedType: '1 King Bed və ya 2 Single Beds',
                            maxGuests: 2,
                            description: 'Özəl dizayn, yüksək keyfiyyətli mebellər, düz ekran TV, mini-bar, seyf, kofe-cay dəsti və pulsuz sürətli Wi-Fi ilə təmin olunmuş lüks otaq.',
                            basePrice: 90,
                            discountPrice: 80,
                            currency: 'AZN',
                            image: 'https://images.unsplash.com/photo-1611891404106-a23bf045022d?q=80&w=350',
                            seasonalPrice: { summer: 110, winter: 80 }
                          },
                          {
                            id: 'room-dlx-2',
                            name: 'Deluxe Suite',
                            size: 45,
                            bedType: '1 Super King Bed',
                            maxGuests: 3,
                            description: 'Muxtar Respublikamızın mənzərəsinə açılan panoramik şüşələr, geniş fərdi oturma sahəsi, xüsusi cakuzi xidməti, lüks vanna otağı ləvazimatları ilə premium lyuks xidməti.',
                            basePrice: 170,
                            discountPrice: 150,
                            currency: 'AZN',
                            image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=350',
                            seasonalPrice: { summer: 210, winter: 150 }
                          }
                        ],
                        amenities: [
                          'WiFi', 'Kondisioner', 'Smart LCD TV', 'Hovuz', 'Səhər Yeməyi', 'Fitnes', 'Pulsuz Parkinq', 'Mini Bar', 'Otaq Xidməti (24/7)'
                        ],
                        restaurant: {
                          name: 'Regional Dad Sarayı',
                          cuisine: 'Naxçıvanın qədim milli mətbəxi və Avropa ləzzətləri',
                          hours: '07:00 - 23:05'
                        },
                        phone: '+994 36 545 00 00',
                        email: 'info@hotel.naxcivan.az',
                        whatsapp: '+994 60 237 71 37',
                        logo: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=150',
                        images: [
                          'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600',
                          'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600'
                        ],
                        location: { lat: 39.2089, lng: 45.4122 },
                        isActive: true,
                        createdAt: new Date().toISOString()
                      } as any);
                    }}
                    className="mt-2 bg-gradient-to-r from-gold-primary to-amber-500 hover:from-gold-dark hover:to-amber-600 text-navy-deep font-sans font-bold text-xs md:text-sm px-8 py-3.5 rounded-2xl flex items-center gap-2 shadow-2xl shadow-gold-primary/20 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer transition-all uppercase tracking-wider"
                  >
                    <Plus className="w-5 h-5 stroke-[2.5]" />
                    Yeni Otel Yaradın (Hərtərəfli Panel)
                  </button>
                </div>
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
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingHotel(hotel)}
                          className="py-1.5 px-3 bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white rounded-xl transition-all cursor-pointer flex items-center gap-1 font-semibold text-xs shrink-0"
                          title="Oteli Redaktə Et"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Redaktə</span>
                        </button>
                        <button
                          onClick={() => handleDeleteHotel(hotel.id)}
                          className="p-2 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all cursor-pointer"
                          title="Oteli sil"
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
                  {/* Multiple Logo uploads */}
                  <div className="flex flex-col gap-4">
                    {/* Light Logo */}
                    <div className="bg-slate-50 p-3 rounded-2xl border">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-semibold text-slate-705">Açıq Rejim Loqosu (Light Mode Logo)</span>
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
                          <label className="bg-navy-mid hover:bg-navy-deep text-gold-primary text-[11px] font-bold px-3 py-1.5 rounded-lg inline-flex items-center cursor-pointer transition-all border border-gold-primary/20 select-none">
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
                    <div className="bg-slate-50 p-3 rounded-2xl border">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-semibold text-slate-705">Tünd Rejim Loqosu (Dark Mode Logo)</span>
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
                          <label className="bg-navy-mid hover:bg-navy-deep text-gold-primary text-[11px] font-bold px-3 py-1.5 rounded-lg inline-flex items-center cursor-pointer transition-all border border-gold-primary/20 select-none">
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

                    {/* Mobile Logo */}
                    <div className="bg-slate-50 p-3 rounded-2xl border">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-semibold text-slate-705">Mobil Görünüş Loqosu (Mobile Logo)</span>
                        <button
                          type="button"
                          onClick={() => openMediaPicker(setCfgLogoMobileUrl)}
                          className="text-xs text-gold-primary hover:underline flex items-center gap-1 cursor-pointer font-sans"
                        >
                          <Image className="w-3 h-3" /> Kitabxanadan Seç
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {cfgLogoMobileUrl ? (
                          <div className="w-14 h-14 rounded-lg bg-slate-100 border p-1 flex items-center justify-center shrink-0">
                            <img src={cfgLogoMobileUrl} alt="Mobile Logo" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-lg border-2 border-dashed flex items-center justify-center text-[10px] text-slate-400 font-sans shrink-0">Əsas istifadə olunacaq</div>
                        )}
                        <div className="flex-1">
                          <label className="bg-navy-mid hover:bg-navy-deep text-gold-primary text-[11px] font-bold px-3 py-1.5 rounded-lg inline-flex items-center cursor-pointer transition-all border border-gold-primary/20 select-none">
                            Yüklə
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, setCfgLogoMobileUrl)}
                            />
                          </label>
                          <p className="text-[10px] text-slate-400 mt-1">Mobil cihazlarda daha yığcam görünüş üçün xüsusi kiçilmiş loqo.</p>
                        </div>
                      </div>
                    </div>

                    {/* Footer Logo */}
                    <div className="bg-slate-50 p-3 rounded-2xl border">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-semibold text-slate-705"> Footer Loqosu (Footer Logo)</span>
                        <button
                          type="button"
                          onClick={() => openMediaPicker(setCfgLogoFooterUrl)}
                          className="text-xs text-gold-primary hover:underline flex items-center gap-1 cursor-pointer font-sans"
                        >
                          <Image className="w-3 h-3" /> Kitabxanadan Seç
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {cfgLogoFooterUrl ? (
                          <div className="w-14 h-14 rounded-lg bg-slate-100 border p-1 flex items-center justify-center shrink-0">
                            <img src={cfgLogoFooterUrl} alt="Footer Logo" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-lg border-2 border-dashed flex items-center justify-center text-[10px] text-slate-400 font-sans shrink-0">Xristian loqosu/Əsas</div>
                        )}
                        <div className="flex-1">
                          <label className="bg-navy-mid hover:bg-navy-deep text-gold-primary text-[11px] font-bold px-3 py-1.5 rounded-lg inline-flex items-center cursor-pointer transition-all border border-gold-primary/20 select-none">
                            Yüklə
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, setCfgLogoFooterUrl)}
                            />
                          </label>
                          <p className="text-[10px] text-slate-400 mt-1">Saytın alt hissəsində (Footer) görünəcək rəsmi loqo.</p>
                        </div>
                      </div>
                    </div>

                    {/* Favicon */}
                    <div className="bg-slate-50 p-3 rounded-2xl border">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-semibold text-slate-705">Sayt Favikonu (Favicon 16x16)</span>
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
                          <div className="w-14 h-14 rounded-lg border-2 border-dashed flex items-center justify-center text-[10px] text-slate-400 font-sans shrink-0">Standart</div>
                        )}
                        <div className="flex-1">
                          <label className="bg-navy-mid hover:bg-navy-deep text-gold-primary text-[11px] font-bold px-3 py-1.5 rounded-lg inline-flex items-center cursor-pointer transition-all border border-gold-primary/20 select-none">
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

                  {/* Sizing, Layout Variants, and Alignment configurations */}
                  <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl flex flex-col gap-4 font-sans text-xs">
                    <h5 className="font-bold text-xs text-navy-deep uppercase tracking-wider select-none mb-1 text-slate-700">Başlıq Dizayn variantları & Ölçüləri</h5>
                    
                    {/* Header Logo Variants */}
                    <div className="flex flex-col gap-1.5 bg-white border p-3 rounded-xl">
                      <label className="text-xs font-bold text-slate-600 block">Başlıq (Header) Loqo Variantı</label>
                      <div className="grid grid-cols-3 gap-2 mt-1">
                        <button
                          type="button"
                          onClick={() => setCfgLogoVariant('variant1')}
                          className={`p-2 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                            cfgLogoVariant === 'variant1' 
                              ? 'border-gold-primary bg-gold-primary/10 text-navy-deep shadow-sm' 
                              : 'border-slate-200 hover:bg-slate-50 text-slate-500'
                          }`}
                        >
                          <div className="text-xs font-bold">Variant 1</div>
                          <div className="text-[8px] font-medium mt-0.5 opacity-80 leading-none">Mərkəzi Geniş</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setCfgLogoVariant('variant2')}
                          className={`p-2 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                            cfgLogoVariant === 'variant2' 
                              ? 'border-gold-primary bg-gold-primary/10 text-navy-deep shadow-sm' 
                              : 'border-slate-200 hover:bg-slate-50 text-slate-500'
                          }`}
                        >
                          <div className="text-xs font-bold">Variant 2</div>
                          <div className="text-[8px] font-medium mt-0.5 opacity-80 leading-none">Sol Yığcam</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setCfgLogoVariant('variant3')}
                          className={`p-2 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                            cfgLogoVariant === 'variant3' 
                              ? 'border-gold-primary bg-gold-primary/10 text-navy-deep shadow-sm' 
                              : 'border-slate-200 hover:bg-slate-50 text-slate-500'
                          }`}
                        >
                          <div className="text-xs font-bold">Variant 3</div>
                          <div className="text-[8px] font-medium mt-0.5 opacity-80 leading-none">Mətn Loqo Only</div>
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                        Variant 1: Loqo bütöv ekranın üst hissəsində mərkəzdə geniş formada dayanır və menyu aşağı sətirə sürüşür.<br />
                        Variant 2: Klassik sol tərəfdə yığcam şəkildə yerləşir.<br />
                        Variant 3: Booking.com, Airbnb və Expedia üslubunda yalnız premium mətndən ibarət loqo sistemi.
                      </p>
                    </div>

                    {/* Variant 3 (Text Logo Only) Configurator Panel */}
                    {cfgLogoVariant === 'variant3' && (
                      <div className="border border-amber-500/30 p-4 rounded-xl bg-amber-500/5 space-y-4">
                        <span className="block font-bold text-slate-800 text-[11px] uppercase tracking-wider">Mətn Loqosu Redaktoru</span>
                        
                        {/* Live Previews */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white border rounded-xl p-4 flex flex-col justify-center items-center h-24 relative overflow-hidden">
                            <span className="absolute top-1 left-2 text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest select-none">Açıq Fon (Light)</span>
                            <Logo 
                              customLogoVariant="variant3"
                              customLogoText={cfgLogoText}
                              customFontSize={cfgLogoFontSize}
                              customFontWeight={cfgLogoFontWeight}
                              customFontFamily={cfgLogoFontFamily}
                              customTextColor={cfgLogoTextColor}
                              customAccentColor={cfgLogoAccentColor}
                              customSubtitle={cfgLogoSubtitle}
                            />
                          </div>
                          <div className="bg-navy-deep border border-navy-light rounded-xl p-4 flex flex-col justify-center items-center h-24 relative overflow-hidden">
                            <span className="absolute top-1 left-2 text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest select-none">Tünd Fon (Dark)</span>
                            <Logo 
                              customLogoVariant="variant3"
                              customLogoText={cfgLogoText}
                              customFontSize={cfgLogoFontSize}
                              customFontWeight={cfgLogoFontWeight}
                              customFontFamily={cfgLogoFontFamily}
                              customTextColor={cfgLogoTextColor}
                              customAccentColor={cfgLogoAccentColor}
                              customSubtitle={cfgLogoSubtitle}
                              forceLight={true}
                            />
                          </div>
                        </div>

                        {/* Text Inputs */}
                        <div className="grid grid-cols-2 gap-3 text-[11px]">
                          <div>
                            <label className="block text-slate-600 font-semibold mb-1">Loqo Mətni</label>
                            <input 
                              type="text"
                              value={cfgLogoText}
                              onChange={(e) => setCfgLogoText(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-250 rounded-lg text-slate-800 font-bold uppercase tracking-wider text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                              placeholder="NAXÇIVAN"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-600 font-semibold mb-1">Loqo Altbaşlığı (Köməkçi Mətn)</label>
                            <input 
                              type="text"
                              value={cfgLogoSubtitle}
                              onChange={(e) => setCfgLogoSubtitle(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-250 rounded-lg text-slate-800 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                              placeholder="TURİZM PORTALI"
                            />
                          </div>
                        </div>

                        {/* Font Family / Font Weight controls */}
                        <div className="grid grid-cols-2 gap-3 text-[11px]">
                          <div>
                            <label className="block text-slate-600 font-semibold mb-1">Şrift Ailəsi (Font Family)</label>
                            <select
                              value={cfgLogoFontFamily}
                              onChange={(e) => setCfgLogoFontFamily(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-250 rounded-lg text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                            >
                              <option value="Space Grotesk">Space Grotesk (Modern, Bold)</option>
                              <option value="Plus Jakarta Sans">Plus Jakarta Sans (Sleek Sans)</option>
                              <option value="Playfair Display">Playfair Display (Luxury Serif)</option>
                              <option value="Inter">Inter (Swiss Neutral)</option>
                              <option value="Montserrat">Montserrat (Expedia Geometric)</option>
                              <option value="Outfit">Outfit (High-tech Modern)</option>
                              <option value="JetBrains Mono">JetBrains Mono (Technical Mono)</option>
                              <option value="Syne">Syne (Creative Avant-garde)</option>
                              <option value="Cabinet Grotesk">Cabinet Grotesk (Display, Editorial)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-slate-600 font-semibold mb-1">Şrift Qalınlığı (Font Weight)</label>
                            <select
                              value={cfgLogoFontWeight}
                              onChange={(e) => setCfgLogoFontWeight(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-250 rounded-lg text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                            >
                              <option value="font-black">900 (Black)</option>
                              <option value="font-extrabold">800 (Extra Bold)</option>
                              <option value="font-bold">700 (Bold)</option>
                              <option value="font-semibold">600 (Semi Bold)</option>
                              <option value="font-medium">500 (Medium)</option>
                              <option value="font-normal">400 (Regular)</option>
                            </select>
                          </div>
                        </div>

                        {/* Sizes range */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-500">Mətn Şrift Ölçüsü (Font Size):</span>
                            <span className="font-mono font-bold text-navy-deep">{cfgLogoFontSize}px</span>
                          </div>
                          <input 
                            type="range"
                            min="14"
                            max="54"
                            step="1"
                            value={cfgLogoFontSize}
                            onChange={(e) => setCfgLogoFontSize(Number(e.target.value))}
                            className="w-full accent-gold-primary cursor-pointer bg-slate-200 h-1 rounded-lg"
                          />
                        </div>

                        {/* Color Pickers */}
                        <div className="grid grid-cols-2 gap-3 text-[11px]">
                          <div>
                            <label className="block text-slate-600 font-semibold mb-1">Əsas Rəng (Primary Color)</label>
                            <div className="flex gap-2 items-center">
                              <input 
                                type="color"
                                value={cfgLogoTextColor}
                                onChange={(e) => setCfgLogoTextColor(e.target.value)}
                                className="w-8 h-8 rounded border bg-transparent cursor-pointer shadow-sm"
                              />
                              <input 
                                type="text"
                                value={cfgLogoTextColor}
                                onChange={(e) => setCfgLogoTextColor(e.target.value)}
                                className="flex-1 px-2 py-1 border rounded bg-white text-[11px] font-mono text-center"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-slate-600 font-semibold mb-1">Vurğu Rəngi (Accent Dot)</label>
                            <div className="flex gap-2 items-center">
                              <input 
                                type="color"
                                value={cfgLogoAccentColor}
                                onChange={(e) => setCfgLogoAccentColor(e.target.value)}
                                className="w-8 h-8 rounded border bg-transparent cursor-pointer shadow-sm"
                              />
                              <input 
                                type="text"
                                value={cfgLogoAccentColor}
                                onChange={(e) => setCfgLogoAccentColor(e.target.value)}
                                className="flex-1 px-2 py-1 border rounded bg-white text-[11px] font-mono text-center"
                              />
                            </div>
                          </div>
                        </div>

                      </div>
                    )}

                    {/* Desktop dimensions */}
                    <div className="border border-slate-200/60 p-3 rounded-xl bg-white space-y-3">
                      <span className="block font-bold text-slate-700 text-[11px] uppercase tracking-wider">Masaüstü (Desktop) Ölçüləri</span>
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500">Masaüstü Loqo Eni (Width):</span>
                          <span className="font-mono font-bold text-navy-deep">{cfgDesktopWidth || cfgLogoWidth}px</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="400"
                          step="5"
                          value={cfgDesktopWidth || cfgLogoWidth}
                          onChange={(e) => {
                            setCfgDesktopWidth(Number(e.target.value));
                            setCfgLogoWidth(Number(e.target.value));
                          }}
                          className="w-full accent-gold-primary cursor-pointer bg-slate-200 h-1 rounded-lg"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500">Masaüstü Loqo Hündürlüyü (Height):</span>
                          <span className="font-mono font-bold text-navy-deep">{cfgDesktopHeight || cfgLogoHeight}px</span>
                        </div>
                        <input
                          type="range"
                          min="20"
                          max="180"
                          step="2"
                          value={cfgDesktopHeight || cfgLogoHeight}
                          onChange={(e) => {
                            setCfgDesktopHeight(Number(e.target.value));
                            setCfgLogoHeight(Number(e.target.value));
                          }}
                          className="w-full accent-gold-primary cursor-pointer bg-slate-200 h-1 rounded-lg"
                        />
                      </div>
                    </div>

                    {/* Mobile dimensions */}
                    <div className="border border-slate-200/60 p-3 rounded-xl bg-white space-y-3">
                      <span className="block font-bold text-slate-700 text-[11px] uppercase tracking-wider">Mobil Cihaz (Mobile) Ölçüləri</span>
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500">Mobil Loqo Eni (Width):</span>
                          <span className="font-mono font-bold text-navy-deep">{cfgMobileWidth}px</span>
                        </div>
                        <input
                          type="range"
                          min="40"
                          max="250"
                          step="5"
                          value={cfgMobileWidth}
                          onChange={(e) => setCfgMobileWidth(Number(e.target.value))}
                          className="w-full accent-gold-primary cursor-pointer bg-slate-200 h-1 rounded-lg"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500">Mobil Loqo Hündürlüyü (Height):</span>
                          <span className="font-mono font-bold text-navy-deep">{cfgMobileHeight}px</span>
                        </div>
                        <input
                          type="range"
                          min="15"
                          max="100"
                          step="2"
                          value={cfgMobileHeight}
                          onChange={(e) => setCfgMobileHeight(Number(e.target.value))}
                          className="w-full accent-gold-primary cursor-pointer bg-slate-200 h-1 rounded-lg"
                        />
                      </div>
                    </div>

                    {/* Fine positioning adjustments */}
                    <div className="border border-slate-200/60 p-3 rounded-xl bg-white space-y-3">
                      <span className="block font-bold text-slate-700 text-[11px] uppercase tracking-wider">Hassas Hizalama Tənzimləmələri</span>
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
                          <span className="text-slate-400">Vertical Offset (Position Y):</span>
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
                </div>

                {/* Real-time branding preview canvas */}
                <div className="mt-5 p-4 border border-slate-100 rounded-3xl flex flex-col items-center justify-center bg-slate-100 relative overflow-hidden">
                  <span className="absolute top-3 left-3 text-[9px] text-slate-500 uppercase font-mono tracking-widest pointer-events-none select-none font-bold">Canlı Başlıq (Header) Önizləmə</span>
                  <div className={`w-full max-w-xl bg-navy-deep py-4 px-6 rounded-2xl flex border border-white/5 transition-all text-white ${cfgLogoVariant === 'variant1' ? 'flex-col items-center gap-2' : 'flex-row items-center justify-between'}`}>
                    <div style={{ transform: `translate(${cfgLogoPositionX}px, ${cfgLogoPositionY}px)` }} className="transition-all select-none">
                      {cfgLogoLightUrl ? (
                        <img
                          src={cfgLogoLightUrl}
                          alt="Logo Preview"
                          style={{ width: `${cfgDesktopWidth || cfgLogoWidth}px`, height: `${cfgDesktopHeight || cfgLogoHeight}px` }}
                          className="object-contain"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-gold-primary font-serif font-bold tracking-widest text-lg">{cfgHeaderTitle || 'NAXÇIVAN'}</span>
                      )}
                    </div>
                    <div className="flex gap-4 text-[10px] text-slate-400 font-sans font-bold uppercase tracking-wider select-none border-t border-white/5 pt-1.5 w-full justify-center lg:border-t-0 lg:pt-0 lg:w-auto">
                      <span className="text-gold-primary border-b border-gold-primary">Ana Səhifə</span>
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

              {/* SECTION D.4: Interactive Welcome Screen Setup */}
              <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
                <h4 className="font-serif text-base font-bold text-navy-deep border-b pb-2 mb-4 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '20s' }} />
                  Giriş (Qarşılama) Ekranı / Welcome Banner
                </h4>
                <p className="text-xs text-slate-500 mb-6 font-sans">
                  Ana Səhifənin giriş hissəsində yer alan mətni (Naxçıvanı Kəşf Et), əsas başlığı, alt başlığı və arxa plan şəklini buradan idarə edə bilərsiniz.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  {/* Left Side: Inputs */}
                  <div className="lg:col-span-3 flex flex-col gap-5 text-left text-xs md:text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-700">Qarşılama Nişanı (Kiçik Tagline)</label>
                        <input
                          type="text"
                          value={cfgWelcomeBadge}
                          onChange={(e) => setCfgWelcomeBadge(e.target.value)}
                          placeholder="Məs: Naxçıvanı Kəşf Et"
                          className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-gold-primary transition-all text-xs"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-705">Qarşılama Başlığı (Headline)</label>
                        <input
                          type="text"
                          value={cfgWelcomeTitle}
                          onChange={(e) => setCfgWelcomeTitle(e.target.value)}
                          placeholder="Məs: Naxçıvanın Gözəlliklərini Kəşf Et"
                          className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-gold-primary transition-all text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-707">Alt Başlıq (Subtitle / Açıqlama Mətni)</label>
                      <textarea
                        rows={3}
                        value={cfgWelcomeDesc}
                        onChange={(e) => setCfgWelcomeDesc(e.target.value)}
                        placeholder="Qədim sivilizasiya beşiyi olan Naxçıvanda..."
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-gold-primary transition-all text-xs resize-none leading-relaxed"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-700">Giriş Ekranı Arxa Plan Şəkli (Background Image)</label>
                      <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 border border-slate-100 rounded-2xl w-full">
                        {cfgWelcomeBgImg ? (
                          <div className="relative w-32 h-20 rounded-xl overflow-hidden border bg-white shrink-0 shadow-sm flex items-center justify-center">
                            <img src={cfgWelcomeBgImg} className="w-full h-full object-cover" alt="Welcome Background Preview" referrerPolicy="no-referrer" />
                          </div>
                        ) : (
                          <div className="w-32 h-20 rounded-xl border border-dashed bg-slate-100 flex items-center justify-center text-xs text-slate-400 font-sans shrink-0">Şəkil yoxdur</div>
                        )}
                        
                        <div className="flex-1 text-left flex flex-wrap gap-2.5 items-center">
                          <label className="bg-navy-deep text-gold-primary hover:bg-navy-mid px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-gold-primary/20 select-none shadow-sm">
                            <Upload className="w-3.5 h-3.5 text-gold-primary" /> Kompüterdən Şəkil Yüklə
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, setCfgWelcomeBgImg)}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => openMediaPicker(setCfgWelcomeBgImg)}
                            className="bg-white border border-slate-205 text-navy-deep hover:bg-slate-100 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer select-none shadow-sm"
                          >
                            <Compass className="w-3.5 h-3.5 text-gold-primary" /> Media Kitabxanasından Seç
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Interactive Live Preview Block */}
                  <div className="lg:col-span-2 flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-700 tracking-wider uppercase flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Canlı Önizləmə (İnteraktiv)
                    </label>
                    <div className="relative w-full aspect-[16/11] rounded-2.5xl overflow-hidden shadow-md border border-slate-100 bg-slate-900 group">
                      {/* Live background image with elegant soft blur and dark overlay */}
                      <div 
                        className="absolute inset-0 bg-cover bg-center transition-all duration-500 scale-100 group-hover:scale-102"
                        style={{ 
                          backgroundImage: `url("${cfgWelcomeBgImg || 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=1200'}")` 
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-slate-950/20" />
                      
                      {/* Top mockup chrome bar */}
                      <div className="absolute top-0 inset-x-0 p-2.5 flex justify-between items-center bg-black/10 backdrop-blur-[2px] border-b border-white/5 text-[9px] text-white/50 font-mono font-bold">
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          <span>NAXÇIVAN PORTAL</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[8px]">
                          <span>12:00</span>
                          <span>WiFi 100%</span>
                        </div>
                      </div>

                      {/* Content representation */}
                      <div className="absolute inset-x-0 bottom-0 p-4.5 flex flex-col items-center text-center select-none">
                        {/* Live Badge */}
                        <div className="inline-block border border-gold-primary/30 bg-gold-primary/10 text-gold-primary text-[8px] font-bold tracking-widest px-2.5 py-1 rounded-full mb-2 uppercase scale-95 origin-center">
                          🌍 {cfgWelcomeBadge || 'Naxçıvanı Kəşf Et'}
                        </div>

                        {/* Live Title */}
                        <h2 className="font-serif text-white text-xs sm:text-sm md:text-base font-black leading-tight tracking-tight mb-1.5 max-w-[90%] text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-205 drop-shadow">
                          {cfgWelcomeTitle || 'Naxçıvanın Gözəlliklərini Kəşf Et'}
                        </h2>

                        {/* Live Subtitle */}
                        <p className="text-[9px] text-slate-300 leading-normal max-w-[92%] mb-3 font-sans line-clamp-2">
                          {cfgWelcomeDesc || 'Qədim sivilizasiya beşiyi olan Naxçıvanda...' }
                        </p>

                        {/* Simulated action buttons */}
                        <div className="flex gap-2 scale-90 origin-bottom">
                          <div className="bg-gold-primary text-navy-deep font-bold text-[8px] px-3.5 py-1.5 rounded-lg border border-gold-primary shadow">
                            Tarixi Məkanlar
                          </div>
                          <div className="border border-white/20 bg-white/5 text-white font-bold text-[8px] px-3.5 py-1.5 rounded-lg backdrop-blur-[1px]">
                            Əlaqə
                          </div>
                        </div>
                      </div>
                    </div>
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
                    <div key={idx} className="p-3 bg-slate-50 border rounded-2xl flex flex-col gap-3 text-xs">
                      {editingSliderIdx === idx ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                          <p className="md:col-span-2 font-bold text-xs text-navy-mid border-b pb-1">Slayderi Redaktə Et</p>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-slate-400 uppercase">Slayder başlığı</label>
                            <input
                              type="text"
                              value={editingSliderTitle}
                              onChange={(e) => setEditingSliderTitle(e.target.value)}
                              className="p-2 bg-white border rounded-lg text-xs"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-slate-400">Alt başlıq / Şüar</label>
                            <input
                              type="text"
                              value={editingSliderSubtitle}
                              onChange={(e) => setEditingSliderSubtitle(e.target.value)}
                              className="p-2 bg-white border rounded-lg text-xs"
                            />
                          </div>
                          <div className="flex flex-col gap-1 md:col-span-2">
                            <label className="text-[10px] text-slate-400">Arxa fon şəkli</label>
                            <div className="flex items-center gap-3 bg-white p-2 border rounded-lg">
                              {editingSliderImg ? (
                                <div className="relative w-10 h-10 rounded-md overflow-hidden border bg-slate-50 shrink-0">
                                  <img src={editingSliderImg} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
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
                                    onChange={(e) => handleFileUpload(e, setEditingSliderImg)}
                                  />
                                </label>
                                <button
                                  type="button"
                                  onClick={() => openMediaPicker(setEditingSliderImg)}
                                  className="text-[10px] text-gold-primary hover:underline font-sans cursor-pointer"
                                >
                                  Kitabxanadan seç
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="md:col-span-2 flex justify-end gap-2 mt-1">
                            <button
                              type="button"
                              onClick={() => setEditingSliderIdx(null)}
                              className="px-3 py-1.5 bg-white border hover:bg-slate-50 rounded-lg text-xs font-bold shrink-0 cursor-pointer text-slate-700"
                            >
                              Ləğv et
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...cfgSliders];
                                updated[idx] = {
                                  title: editingSliderTitle,
                                  subtitle: editingSliderSubtitle,
                                  image: editingSliderImg || 'https://images.unsplash.com/photo-1542332213-9b5a5a3fad35'
                                };
                                setCfgSliders(updated);
                                setEditingSliderIdx(null);
                              }}
                              className="px-3 py-1.5 bg-gold-primary hover:bg-gold-dark text-navy-deep rounded-lg text-xs font-bold shrink-0 cursor-pointer"
                            >
                              Yadda Saxla
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center gap-4">
                          <div className="flex items-center gap-3">
                            <img src={slider.image} alt="" className="w-10 h-10 object-cover rounded-lg" />
                            <div className="text-left">
                              <p className="font-bold text-navy-deep">{slider.title}</p>
                              <p className="text-[10px] text-slate-400">{slider.subtitle}</p>
                            </div>
                          </div>
                          <div className="flex gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingSliderIdx(idx);
                                setEditingSliderTitle(slider.title);
                                setEditingSliderSubtitle(slider.subtitle);
                                setEditingSliderImg(slider.image);
                              }}
                              className="p-1.5 bg-sky-50 text-sky-600 hover:bg-sky-550 hover:text-white rounded-lg border border-sky-100 cursor-pointer flex items-center justify-center"
                              title="Düzəliş Et"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setCfgSliders(cfgSliders.filter((_, i) => i !== idx))}
                              className="text-rose-500 hover:text-white hover:bg-rose-500 p-1.5 rounded-lg border border-rose-100 cursor-pointer flex items-center justify-center"
                              title="Sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
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
                 <div className="flex flex-wrap gap-3 text-xs md:text-sm">
                  <label className="bg-navy-deep text-gold-primary hover:bg-navy-mid px-5 py-3 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-gold-primary/30 shadow-sm">
                    <Upload className="w-4 h-4 text-gold-primary" /> Kompüterdən Şəkil Yüklə (JPG, PNG, WEBP)
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, (url) => setCfgGalleries([...cfgGalleries, url]))}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => openMediaPicker((url) => setCfgGalleries([...cfgGalleries, url]))}
                    className="bg-white border border-slate-200 text-navy-deep hover:bg-slate-50 px-5 py-3 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer select-none"
                  >
                    <Compass className="w-4 h-4 text-gold-primary" /> Media Kitabxanasından Seç
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

              {/* SECTION I: WhatsApp Settings */}
              <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
                <h4 className="font-serif text-base font-bold text-navy-deep border-b pb-2 mb-4 flex items-center gap-2 select-none">
                  <MessageSquare className="w-4 h-4 text-indigo-600 font-bold" />
                  WhatsApp Business API & Avtomatik Sifariş Bildirişləri
                </h4>

                <div className="space-y-6 text-sm font-sans" id="wa-settings-elements">
                  
                  {/* Mode Selector */}
                  <div className="bg-slate-50 border p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div>
                      <p className="font-bold text-navy-deep">WhatsApp API Çatdırılma Rejimi</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Sifarişlərin real və ya test (simulyasiya) rejimində göndərilməsini tənzimləyin.</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setWaIsRealMode(false)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          !waIsRealMode 
                          ? 'bg-amber-100 text-amber-800 border-2 border-amber-300' 
                          : 'bg-white text-slate-600 border hover:bg-slate-50'
                        }`}
                      >
                        Simulyasiya Modu (Məsləhət Görülən)
                      </button>
                      <button
                        type="button"
                        onClick={() => setWaIsRealMode(true)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          waIsRealMode 
                          ? 'bg-indigo-600 text-white border-2 border-indigo-800 shadow' 
                          : 'bg-white text-slate-600 border hover:bg-slate-50'
                        }`}
                      >
                        Canlı Meta Cloud API (Real Mode)
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Meta Phone ID */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-slate-500">Meta Telefon Nömrəsi ID-si (Phone Number ID)</label>
                      <input
                        type="text"
                        placeholder="Məsələn: 10938495038"
                        disabled={!waIsRealMode}
                        value={waPhoneId}
                        onChange={(e) => setWaPhoneId(e.target.value)}
                        className="p-2.5 bg-slate-50 border rounded-xl disabled:opacity-50 font-mono text-xs"
                      />
                    </div>

                    {/* Meta Access Token */}
                    <div className="flex flex-col gap-1 md:col-span-2">
                      <label className="text-xs text-slate-500">Meta Giriş Tokeni (Permanent System Access Token)</label>
                      <input
                        type="password"
                        placeholder="EAYH3847HDJHS..."
                        disabled={!waIsRealMode}
                        value={waAccessToken}
                        onChange={(e) => setWaAccessToken(e.target.value)}
                        className="p-2.5 bg-slate-50 border rounded-xl disabled:opacity-50 font-mono text-xs"
                      />
                    </div>
                  </div>

                  {/* Message Template Customizer */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-600">Avtomatik Sifariş Bildiriş Mətni Şablonu</label>
                      <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-medium">Tur & Otel üçün ortaq</span>
                    </div>
                    <textarea
                      rows={6}
                      placeholder="Bildiriş şablonunu daxil edin..."
                      value={waMessageTemplate}
                      onChange={(e) => setWaMessageTemplate(e.target.value)}
                      className="p-3 bg-slate-50 border rounded-xl font-sans text-xs md:text-sm mt-1 whitespace-pre-wrap leading-relaxed shadow-inner"
                    />
                    
                    {/* Dynamic Placeholders Helpers bar */}
                    <div className="mt-2 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 flex flex-col gap-1 w-full text-[10px] md:text-xs">
                      <span className="font-bold text-indigo-900 select-none">Mətndə istifadə edə biləcəyiniz dinamik sahələr:</span>
                      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 mt-1.5 font-mono">
                        <div className="p-1 px-2 border rounded bg-white text-[10px] font-sans truncate hover:border-indigo-400 cursor-pointer" title="Kopyala" onClick={() => { setWaMessageTemplate(waMessageTemplate + '{Müştəri Adı}'); success('{Müştəri Adı} əlavə edildi!'); }}>
                          <span className="font-bold text-indigo-600 font-mono">{`{Müştəri Adı}`}</span> <span className="text-slate-400 text-[9px]">(Ad & Soyad)</span>
                        </div>
                        <div className="p-1 px-2 border rounded bg-white text-[10px] font-sans truncate hover:border-indigo-400 cursor-pointer" title="Kopyala" onClick={() => { setWaMessageTemplate(waMessageTemplate + '{Tur Adı}'); success('{Tur Adı} əlavə edildi!'); }}>
                          <span className="font-bold text-indigo-600 font-mono">{`{Tur Adı}`}</span> <span className="text-slate-400 text-[9px]">(Tur/Otel)</span>
                        </div>
                        <div className="p-1 px-2 border rounded bg-white text-[10px] font-sans truncate hover:border-indigo-400 cursor-pointer" title="Kopyala" onClick={() => { setWaMessageTemplate(waMessageTemplate + '{Tur Tarixi}'); success('{Tur Tarixi} əlavə edildi!'); }}>
                          <span className="font-bold text-indigo-600 font-mono">{`{Tur Tarixi}`}</span> <span className="text-slate-400 text-[9px]">(Tarix)</span>
                        </div>
                        <div className="p-1 px-2 border rounded bg-white text-[10px] font-sans truncate hover:border-indigo-400 cursor-pointer" title="Kopyala" onClick={() => { setWaMessageTemplate(waMessageTemplate + '{Tur Başlama Saatı}'); success('{Tur Başlama Saatı} əlavə edildi!'); }}>
                          <span className="font-bold text-indigo-600 font-mono">{`{Tur Başlama Saatı}`}</span> <span className="text-slate-400 text-[9px]">(Saat)</span>
                        </div>
                        <div className="p-1 px-2 border rounded bg-white text-[10px] font-sans truncate hover:border-indigo-400 cursor-pointer" title="Kopyala" onClick={() => { setWaMessageTemplate(waMessageTemplate + '{Rezervasiya Nömrəsi}'); success('{Rezervasiya Nömrəsi} əlavə edildi!'); }}>
                          <span className="font-bold text-indigo-600 font-mono">{`{Rezervasiya Nömrəsi}`}</span> <span className="text-slate-400 text-[9px]">(ID)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Webhook Developer Information Card */}
                  <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3 font-sans text-left">
                    <p className="font-bold text-slate-700 text-xs select-none">🔗 Real Vaxt Webhook Qurulması (İnteqrasiya Faktı)</p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      E-ticarət portalında real vaxt status yenilənmələrini aktivləşdirmək üçün Meta Developer panelində bu Webhook tənzimləmələrini daxil edin:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                      <div className="p-2.5 bg-white border rounded-xl flex flex-col gap-1 shadow-sm">
                        <span className="text-[10px] font-sans font-bold text-slate-400">CALLBACK URL</span>
                        <span className="text-navy-deep font-bold truncate leading-none mt-1">{window.location.origin}/api/whatsapp/webhook</span>
                      </div>
                      <div className="p-2.5 bg-white border rounded-xl flex flex-col gap-1 shadow-sm relative">
                        <span className="text-[10px] font-sans font-bold text-slate-400">VERIFY TOKEN (DOĞRULAMA ŞİFRƏSİ)</span>
                        <input
                          type="text"
                          value={waVerifyToken}
                          onChange={(e) => setWaVerifyToken(e.target.value)}
                          className="p-1 border bg-slate-50 rounded text-xs select-all w-full mt-1 font-bold text-indigo-600"
                        />
                      </div>
                    </div>
                  </div>

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

          {/* TAB 12: Arxa Fon İdarəetməsi */}
          {activeTab === 'backgrounds' && (
            <div className="flex flex-col gap-8 text-left animate-fadeIn" id="panel-backgrounds">
              <div>
                <h3 className="font-serif text-2xl font-bold text-navy-deep">Portal Bölmələrinin Arxa Fon Şəkilləri</h3>
                <p className="text-xs text-slate-500 mt-1 font-sans leading-relaxed">
                  Ana səhifə, turlar, otellər və digər bütün əsas səhifələrin arxa plan mənzərələrini fərdi şəkildə dəyişdirin. 
                  Yüklənən şəkillər kompüterinizdə avtomatik sıxılıb, yüksək keyfiyyətli WebP formatına çevrilərək bulud mühitində sürətli yükləməni təmin edir!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="background-sections-grid">
                {[
                  { key: 'home', label: 'Ana Səhifə (Home)', defaultUrl: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=1920' },
                  { key: 'tours', label: 'Tur Paketləri (Tours)', defaultUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1920' },
                  { key: 'hotels', label: 'Lüks Otellər (Hotels)', defaultUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1920' },
                  { key: 'places', label: 'Gəzməli Yerlər (Places)', defaultUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1920' },
                  { key: 'museums', label: 'Muzeylər (Museums)', defaultUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1920' },
                  { key: 'transport', label: 'Nəqliyyat & Komfort (Transport)', defaultUrl: 'https://images.unsplash.com/photo-1549643276-fdf2fab574f5?q=80&w=1920' },
                  { key: 'about', label: 'Haqqımızda (About Us)', defaultUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1920' },
                  { key: 'contact', label: 'Əlaqə & Dəstək (Contact)', defaultUrl: 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?q=80&w=1920' },
                  { key: 'weather', label: 'Hava Durumu (Weather)', defaultUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1920' }
                ].map((sec) => {
                  const currentUrl = (settingsSchema?.backgroundSettings as any)?.[`${sec.key}Url`] || sec.defaultUrl;
                  return (
                    <div key={sec.key} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col gap-4 font-sans justify-between">
                      <div className="flex flex-col gap-1">
                        <h4 className="font-bold text-navy-deep text-sm">{sec.label}</h4>
                        <span className="text-[10px] text-slate-400 font-mono tracking-wide">key: bg_{sec.key}.webp</span>
                      </div>

                      {/* Cover Thumbnail view */}
                      <div className="h-32 bg-slate-100 border rounded-2xl overflow-hidden relative group">
                        <img 
                          src={currentUrl} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300 lazy-load" 
                          alt={sec.label} 
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                          <a href={currentUrl} target="_blank" rel="noreferrer" className="p-2 bg-white/95 rounded-lg text-slate-700 hover:text-navy-deep cursor-pointer transition-colors" title="Böyüt">
                            <ZoomIn className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>

                      {/* Manual Image URL Input */}
                      <div className="flex flex-col gap-1.5 text-xs">
                        <label className="font-bold text-slate-700">Şəkil Linki (URL):</label>
                        <input 
                          type="text" 
                          value={currentUrl}
                          onChange={async (e) => {
                            const val = e.target.value;
                            const originalSettings = settingsSchema || {};
                            const bgSettings = originalSettings.backgroundSettings || {};
                            const updatedBgSettings = {
                              ...bgSettings,
                              [`${sec.key}Url`]: val
                            };
                            
                            setSettingsSchema({
                              ...originalSettings,
                              backgroundSettings: updatedBgSettings
                            } as any);

                            await api.settings.update({
                              ...originalSettings,
                              backgroundSettings: updatedBgSettings
                            });
                          }}
                          className="w-full bg-slate-50 border p-2.5 rounded-xl text-xs text-slate-650"
                          placeholder="https://images.unsplash.com/..."
                        />
                      </div>

                      {/* Upload and Reset buttons */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] font-bold pt-2 border-t border-slate-50">
                        <label className="bg-navy-deep hover:bg-navy-mid text-gold-primary p-2.5 rounded-xl cursor-pointer transition-all text-center flex items-center justify-center gap-1.5 select-none">
                          <Upload className="w-3.5 h-3.5 shrink-0" />
                          Yüklə (WebP)
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleBackgroundUpload(sec.key, file);
                            }}
                          />
                        </label>

                        <button
                          type="button"
                          onClick={async () => {
                            if (!window.confirm("Bu bölmənin arxa fonunu rəsmi zavod sıfırlamasına qaytarmaq istəyirsiniz?")) return;
                            const originalSettings = settingsSchema || {};
                            const bgSettings = originalSettings.backgroundSettings || {};
                            const updatedBgSettings = {
                              ...bgSettings,
                              [`${sec.key}Url`]: sec.defaultUrl
                            };
                            
                            setSettingsSchema({
                              ...originalSettings,
                              backgroundSettings: updatedBgSettings
                            } as any);

                            await api.settings.update({
                              ...originalSettings,
                              backgroundSettings: updatedBgSettings
                            });
                            success(`${sec.label} Fon mənzərəsi ilkin vəziyyətinə qaytarıldı!`);
                            loadData();
                          }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-rose-600 p-2.5 rounded-xl cursor-pointer transition-all text-center flex items-center justify-center gap-1.5"
                        >
                          Zavod Fonu
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
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

      {/* WhatsApp Messages Logs Modal */}
      {isLogsModalOpen && selectedLogsRes && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[950] p-4 font-sans overflow-y-auto backdrop-blur-sm animate-fadeIn text-left">
          <div className="bg-white rounded-3xl w-full max-w-2xl flex flex-col max-h-[85vh] overflow-hidden shadow-2xl border border-slate-100 relative my-8 animate-slideUp">
            {/* Modal Header */}
            <div className="p-5 border-b flex justify-between items-center bg-slate-50 sticky top-0 z-10 select-none">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                <div>
                  <h4 className="font-serif text-base font-bold text-navy-deep leading-none">
                    WhatsApp Mesaj Tarixçəsi
                  </h4>
                  <p className="text-[10px] text-slate-400 font-sans mt-1 leading-none">
                    Müştəri: <span className="font-semibold text-slate-600">{selectedLogsRes.fullName}</span> ({selectedLogsRes.phone})
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => { setIsLogsModalOpen(false); setSelectedLogsRes(null); }} 
                className="p-1.5 bg-slate-100 hover:bg-rose-500 hover:text-white rounded-xl text-slate-500 cursor-pointer transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Contents */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {(!selectedLogsRes.whatsappLogs || selectedLogsRes.whatsappLogs.length === 0) ? (
                <div className="text-center py-8 text-slate-400 font-sans text-sm">
                  Bu rezervasiya üçün heç bir WhatsApp bildirişi göndərilməyib.
                </div>
              ) : (
                <div className="space-y-4" id="whatsapp-logs-container">
                  {selectedLogsRes.whatsappLogs.map((log: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-2xl border bg-slate-50/50 flex flex-col gap-2">
                      <div className="flex justify-between items-start gap-4">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          log.status === 'read' ? 'bg-sky-100 text-sky-800' :
                          log.status === 'sent' || log.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {log.status === 'read' ? 'Oxundu' :
                           log.status === 'sent' || log.status === 'delivered' ? 'Göndərildi' : 'Xəta baş verdi'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(log.timestamp).toLocaleString('az-AZ')}
                        </span>
                      </div>
                      
                      {log.messageId && (
                        <div className="text-[9px] text-slate-400 font-mono">
                          ID: {log.messageId}
                        </div>
                      )}

                      <div className="text-xs text-slate-700 bg-white border border-slate-100 rounded-xl p-3 whitespace-pre-wrap font-sans">
                        {log.message}
                      </div>

                      {log.error && (
                        <div className="text-[10px] text-rose-600 bg-rose-50 rounded-lg p-2 font-mono">
                          Xəta: {log.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t bg-slate-50 flex justify-end gap-2 sticky bottom-0 z-10 select-none">
              <button
                type="button"
                onClick={() => { setIsLogsModalOpen(false); setSelectedLogsRes(null); }}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer transition-all"
              >
                Bağla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. EDIT TOUR MODAL */}
      {editingTour && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[950] p-4 font-sans overflow-y-auto backdrop-blur-sm animate-fadeIn text-left">
          <div className="bg-white rounded-3xl w-full max-w-4xl flex flex-col md:max-h-[85vh] overflow-hidden shadow-2xl border border-slate-100 relative my-8 animate-slideUp">
            {/* Modal Header */}
            <div className="p-5 border-b flex justify-between items-center bg-slate-50 sticky top-0 z-10 select-none">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-gold-primary animate-spin-slow" />
                <div>
                  <h4 className="font-serif text-base font-bold text-navy-deep leading-none">
                    Tur Məlumatlarını Redaktə Et (Düzəliş)
                  </h4>
                  <p className="text-[10px] text-slate-400 font-sans mt-1 leading-none">Tur ID: {editingTour.id}</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setEditingTour(null)} 
                className="p-1.5 bg-slate-100 hover:bg-rose-500 hover:text-white rounded-xl text-slate-500 cursor-pointer transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleEditTourSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Tur Adı */}
                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500">Turun Adı</label>
                  <input
                    type="text"
                    required
                    value={editingTour.name || ''}
                    onChange={(e) => setEditingTour({ ...editingTour, name: e.target.value })}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
                  />
                </div>

                {/* Kateqoriya */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500">Kateqoriyası</label>
                  <select
                    value={editingTour.category || ''}
                    onChange={(e) => setEditingTour({ ...editingTour, category: e.target.value })}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white cursor-pointer"
                  >
                    <option value="Tarixi">Tarixi</option>
                    <option value="Ekskursiya">Ekskursiya</option>
                    <option value="Eko-Turizm">Eko-Turizm</option>
                    <option value="VIP">VIP</option>
                    <option value="Fərdi">Fərdi</option>
                  </select>
                </div>

                {/* Şirkət Seçimi */}
                <div className="flex flex-col gap-1 col-span-1 md:col-span-3">
                  <label className="text-xs font-bold text-slate-500">Turun Aid Olduğu Şirkət</label>
                  <select
                    value={editingTour.companyId || ''}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      const matchedCompany = companies.find(c => c.id === selectedId);
                      setEditingTour({
                        ...editingTour,
                        companyId: selectedId,
                        companyName: matchedCompany ? matchedCompany.name : ''
                      });
                    }}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-navy-deep focus:bg-white cursor-pointer"
                  >
                    <option value="">-- Şirkət Seçin --</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Qiymət */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500">Gecəlik / Ümumi Qiymət (₼)</label>
                  <input
                    type="number"
                    required
                    value={editingTour.price || 0}
                    onChange={(e) => setEditingTour({ ...editingTour, price: Number(e.target.value) })}
                    className="p-2.5 bg-slate-50 border rounded-xl text-xs font-bold text-amber-600 focus:bg-white"
                  />
                </div>

                {/* Endirimli Qiymət */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500">Endirimli Qiymət (₼ - istəyə görə)</label>
                  <input
                    type="number"
                    value={editingTour.discountPrice || ''}
                    onChange={(e) => setEditingTour({ ...editingTour, discountPrice: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="Məsələn: 120"
                    className="p-2.5 bg-slate-50 border rounded-xl text-xs font-bold text-emerald-600 focus:bg-white"
                  />
                </div>

                {/* Kontingent / Limit */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500">Maksimal Kontingent (Sərnişin limit)</label>
                  <input
                    type="number"
                    value={editingTour.contingent || ''}
                    onChange={(e) => setEditingTour({ ...editingTour, contingent: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="Məsələn: 24"
                    className="p-2.5 bg-slate-50 border rounded-xl text-xs font-semibold focus:bg-white"
                  />
                </div>

                {/* Müddət */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500">Müddət (Gün)</label>
                  <input
                    type="number"
                    required
                    value={editingTour.duration || 1}
                    onChange={(e) => setEditingTour({ ...editingTour, duration: Number(e.target.value) })}
                    className="p-2.5 bg-slate-50 border rounded-xl text-xs font-medium focus:bg-white"
                  />
                </div>

                {/* Əsas Şəkil */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500 font-sans">Karusel / Əsas Tur Şəkli</label>
                  <div className="flex items-center gap-2 bg-slate-50 p-2 border rounded-xl">
                    {editingTour.mainImage ? (
                      <img src={editingTour.mainImage} className="w-8 h-8 rounded object-cover shadow border shrink-0" alt="" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-8 h-8 rounded border-dashed border bg-white shrink-0" />
                    )}
                    <label className="bg-navy-mid hover:bg-navy-deep text-gold-primary text-[9px] font-bold px-2 py-1.5 rounded-lg cursor-pointer flex-1 text-center font-sans">
                      Şəkil Dəyiş
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, (url) => setEditingTour({ ...editingTour, mainImage: url }))}
                      />
                    </label>
                  </div>
                </div>

                {/* Təfərrüatlı qısa təsvir */}
                <div className="flex flex-col gap-1 md:col-span-3">
                  <label className="text-xs font-bold text-slate-500">Səyahət Proqramının Təsviri</label>
                  <textarea
                    rows={3}
                    value={editingTour.shortDescription || ''}
                    onChange={(e) => setEditingTour({ ...editingTour, shortDescription: e.target.value })}
                    className="p-2.5 bg-slate-50 border rounded-xl text-xs font-medium focus:bg-white"
                  />
                </div>

                {/* Daxil Olan Xidmətlər */}
                <div className="flex flex-col gap-1 md:col-span-3">
                  <label className="text-xs font-bold text-slate-500">Daxil Olan Xidmətlər (Vergüllə ayıraraq yeniləyin)</label>
                  <input
                    type="text"
                    value={Array.isArray(editingTour.includedServices) ? editingTour.includedServices.join(', ') : (editingTour.includedServices || '')}
                    onChange={(e) => setEditingTour({ ...editingTour, includedServices: e.target.value.split(',').map((s: string) => s.trim()) })}
                    className="p-2.5 bg-slate-50 border rounded-xl text-xs font-medium focus:bg-white"
                  />
                </div>

                {/* Nəqliyyat məlumatları */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500">Nəqliyyat Növü</label>
                  <input
                    type="text"
                    value={editingTour.transport?.type || ''}
                    onChange={(e) => setEditingTour({
                      ...editingTour,
                      transport: { ...(editingTour.transport || {}), type: e.target.value }
                    })}
                    className="p-2.5 bg-slate-50 border rounded-xl text-xs font-medium"
                  />
                </div>

                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500">Nəqliyyat Avtomobil Modeli</label>
                  <input
                    type="text"
                    value={editingTour.transport?.model || ''}
                    onChange={(e) => setEditingTour({
                      ...editingTour,
                      transport: { ...(editingTour.transport || {}), model: e.target.value }
                    })}
                    className="p-2.5 bg-slate-50 border rounded-xl text-xs font-medium"
                  />
                </div>

              </div>

              {/* DYNAMIC CULINARY Restorans and Foods Section in EDIT MODAL (Qidalanma Planı) */}
              <div className="border-t border-slate-100 pt-6 mt-4">
                <div className="flex items-center gap-2 mb-4 bg-amber-50/50 p-3 rounded-2xl border border-amber-100/50 justify-start select-none">
                  <Utensils className="w-5 h-5 text-gold-primary shrink-0 animate-pulse" />
                  <div className="text-left font-sans">
                    <h4 className="font-serif text-sm font-bold text-navy-deep">Tura Bağlı Restoran və Menu Bölmələri (Qidalanma Planı)</h4>
                    <p className="text-[10px] text-slate-400 leading-none mt-0.5 font-semibold">Buradan səhər, nahar və axşam yeməyi tərtib olunan restoran şəkli və menyusunu redaktə edin.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                  
                  {/* Səhər Yeməyi */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col gap-3">
                    <span className="text-xs font-bold text-navy-deep uppercase tracking-wider flex items-center gap-1">☕ Səhər Yeməyi</span>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-500 font-sans">Restoranın Adı</label>
                      <input
                        type="text"
                        value={editingTour.meals?.breakfast?.restaurantName || ''}
                        onChange={(e) => {
                          const meals = { ...(editingTour.meals || {}) };
                          meals.breakfast = { ...(meals.breakfast || { items: [] }), restaurantName: e.target.value };
                          setEditingTour({ ...editingTour, meals });
                        }}
                        className="p-2 bg-white border rounded-xl text-xs"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-500 font-sans">Restoran Şəkli</label>
                      <div className="flex items-center gap-2 bg-white p-2 border rounded-xl">
                        {editingTour.meals?.breakfast?.image ? (
                          <div className="relative w-10 h-10 rounded overflow-hidden border shrink-0 bg-slate-100 flex items-center justify-center">
                            <img src={editingTour.meals.breakfast.image} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                            <button
                              type="button"
                              onClick={() => {
                                const meals = { ...(editingTour.meals || {}) };
                                meals.breakfast = { ...(meals.breakfast || { items: [] }), image: '' };
                                setEditingTour({ ...editingTour, meals });
                              }}
                              className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[8px] font-bold opacity-0 hover:opacity-100 transition-all cursor-pointer"
                            >
                              Sil
                            </button>
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded border border-dashed bg-slate-100 flex items-center justify-center text-[8px] text-slate-450 shrink-0">Yoxdur</div>
                        )}
                        <label className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-[8px] font-bold px-2 py-1 rounded-lg cursor-pointer shrink-0 transition-all font-sans">
                          Şəkil Yüklə
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, (url) => {
                              const meals = { ...(editingTour.meals || {}) };
                              meals.breakfast = { ...(meals.breakfast || { items: [] }), image: url };
                              setEditingTour({ ...editingTour, meals });
                            })}
                          />
                        </label>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-500 font-sans">Menyu (Vergüllə ayıraraq)</label>
                      <input
                        type="text"
                        value={Array.isArray(editingTour.meals?.breakfast?.items) ? editingTour.meals?.breakfast?.items.join(', ') : ''}
                        onChange={(e) => {
                          const meals = { ...(editingTour.meals || {}) };
                          meals.breakfast = { ...(meals.breakfast || {}), items: e.target.value.split(',').map((s: string) => s.trim()) };
                          setEditingTour({ ...editingTour, meals });
                        }}
                        className="p-2 bg-white border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  {/* Nahar Yeməyi */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col gap-3">
                    <span className="text-xs font-bold text-navy-deep uppercase tracking-wider flex items-center gap-1">🍲 Nahar Yeməyi</span>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-500 font-sans">Restoranın Adı</label>
                      <input
                        type="text"
                        value={editingTour.meals?.lunch?.restaurantName || ''}
                        onChange={(e) => {
                          const meals = { ...(editingTour.meals || {}) };
                          meals.lunch = { ...(meals.lunch || { items: [] }), restaurantName: e.target.value };
                          setEditingTour({ ...editingTour, meals });
                        }}
                        className="p-2 bg-white border rounded-xl text-xs"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-500 font-sans">Restoran Şəkli</label>
                      <div className="flex items-center gap-2 bg-white p-2 border rounded-xl">
                        {editingTour.meals?.lunch?.image ? (
                          <div className="relative w-10 h-10 rounded overflow-hidden border shrink-0 bg-slate-100 flex items-center justify-center">
                            <img src={editingTour.meals.lunch.image} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                            <button
                              type="button"
                              onClick={() => {
                                const meals = { ...(editingTour.meals || {}) };
                                meals.lunch = { ...(meals.lunch || { items: [] }), image: '' };
                                setEditingTour({ ...editingTour, meals });
                              }}
                              className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[8px] font-bold opacity-0 hover:opacity-100 transition-all cursor-pointer"
                            >
                              Sil
                            </button>
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded border border-dashed bg-slate-100 flex items-center justify-center text-[8px] text-slate-450 shrink-0">Yoxdur</div>
                        )}
                        <label className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-[8px] font-bold px-2 py-1 rounded-lg cursor-pointer shrink-0 transition-all font-sans">
                          Şəkil Yüklə
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, (url) => {
                              const meals = { ...(editingTour.meals || {}) };
                              meals.lunch = { ...(meals.lunch || { items: [] }), image: url };
                              setEditingTour({ ...editingTour, meals });
                            })}
                          />
                        </label>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-500 font-sans font-sans">Menyu (Vergüllə ayıraraq)</label>
                      <input
                        type="text"
                        value={Array.isArray(editingTour.meals?.lunch?.items) ? editingTour.meals?.lunch?.items.join(', ') : ''}
                        onChange={(e) => {
                          const meals = { ...(editingTour.meals || {}) };
                          meals.lunch = { ...(meals.lunch || {}), items: e.target.value.split(',').map((s: string) => s.trim()) };
                          setEditingTour({ ...editingTour, meals });
                        }}
                        className="p-2 bg-white border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  {/* Axşam Yeməyi */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col gap-3">
                    <span className="text-xs font-bold text-navy-deep uppercase tracking-wider flex items-center gap-1">🍢 Axşam Yeməyi</span>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-500 font-sans">Restoranın Adı</label>
                      <input
                        type="text"
                        value={editingTour.meals?.dinner?.restaurantName || ''}
                        onChange={(e) => {
                          const meals = { ...(editingTour.meals || {}) };
                          meals.dinner = { ...(meals.dinner || { items: [] }), restaurantName: e.target.value };
                          setEditingTour({ ...editingTour, meals });
                        }}
                        className="p-2 bg-white border rounded-xl text-xs"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-500 font-sans">Restoran Şəkli</label>
                      <div className="flex items-center gap-2 bg-white p-2 border rounded-xl">
                        {editingTour.meals?.dinner?.image ? (
                          <div className="relative w-10 h-10 rounded overflow-hidden border shrink-0 bg-slate-100 flex items-center justify-center">
                            <img src={editingTour.meals.dinner.image} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                            <button
                              type="button"
                              onClick={() => {
                                const meals = { ...(editingTour.meals || {}) };
                                meals.dinner = { ...(meals.dinner || { items: [] }), image: '' };
                                setEditingTour({ ...editingTour, meals });
                              }}
                              className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[8px] font-bold opacity-0 hover:opacity-100 transition-all cursor-pointer"
                            >
                              Sil
                            </button>
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded border border-dashed bg-slate-100 flex items-center justify-center text-[8px] text-slate-455 shrink-0">Yoxdur</div>
                        )}
                        <label className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-[8px] font-bold px-2 py-1 rounded-lg cursor-pointer shrink-0 transition-all font-sans">
                          Şəkil Yüklə
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, (url) => {
                              const meals = { ...(editingTour.meals || {}) };
                              meals.dinner = { ...(meals.dinner || { items: [] }), image: url };
                              setEditingTour({ ...editingTour, meals });
                            })}
                          />
                        </label>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-500 font-sans font-sans">Menyu (Vergüllə ayıraraq)</label>
                      <input
                        type="text"
                        value={Array.isArray(editingTour.meals?.dinner?.items) ? editingTour.meals?.dinner?.items.join(', ') : ''}
                        onChange={(e) => {
                          const meals = { ...(editingTour.meals || {}) };
                          meals.dinner = { ...(meals.dinner || {}), items: e.target.value.split(',').map((s: string) => s.trim()) };
                          setEditingTour({ ...editingTour, meals });
                        }}
                        className="p-2 bg-white border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                </div>
              </div>

              {/* 1. DYNAMIC DESTINATIONS SECTION (Gediləcək Yerlər Bölməsi) */}
              <div className="border-t border-slate-100 pt-6 mt-6">
                <div className="flex items-center justify-between mb-4 bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100/50 select-none">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div className="text-left font-sans">
                      <h4 className="font-serif text-sm font-black text-navy-deep">Səyahət Proqramı • Gediləcək Yerlər Bölməsi</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Tur proqramına daxil olan ekskursiya nöqtələrini, müddəti və koordinatları idarə edin.</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/50 px-2.5 py-1 rounded-full font-sans">
                    {(editingTour.stops || []).length} Məkan
                  </span>
                </div>

                {/* List of current stops */}
                <div className="space-y-3 mb-4 text-left font-sans">
                  {(!editingTour.stops || editingTour.stops.length === 0) ? (
                    <p className="text-xs text-slate-400 italic py-2">Heç bir gediləcək məkan daxil edilməyib. Aşağıdan yeni məkan əlavə edin.</p>
                  ) : (
                    <div className="border border-slate-200/60 rounded-2xl divide-y overflow-hidden max-h-[350px] overflow-y-auto">
                      {editingTour.stops.map((stop: any, idx: number) => (
                        <div key={idx} className="p-3 bg-slate-50/50 hover:bg-white flex items-center justify-between gap-4 transition-colors">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {stop.image ? (
                              <img src={stop.image} className="w-10 h-10 rounded-lg object-cover shrink-0 border" alt="" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center shrink-0 border border-dashed"><MapPin className="w-4 h-4 text-slate-400" /></div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-bold text-navy-deep truncate">
                                  {idx + 1}. {stop.placeName}
                                </span>
                                <span className="text-[9px] bg-slate-200/80 text-slate-600 font-bold px-1.5 py-0.5 rounded">
                                  ⏱️ {stop.duration}
                                </span>
                                {(stop.lat || stop.lng) && (
                                  <span className="text-[9px] bg-sky-50 text-sky-700 font-mono px-1 rounded-sm">
                                    📍 GPS Ready
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{stop.description}</p>
                            </div>
                          </div>

                          {/* Sorting and Delete actions */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => {
                                const list = [...(editingTour.stops || [])];
                                const temp = list[idx];
                                list[idx] = list[idx - 1];
                                list[idx - 1] = temp;
                                setEditingTour({ ...editingTour, stops: list });
                              }}
                              className="p-1 hover:bg-slate-200 text-slate-500 rounded disabled:opacity-30 cursor-pointer"
                              title="Yuxarı Sürüşdür"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === editingTour.stops.length - 1}
                              onClick={() => {
                                const list = [...(editingTour.stops || [])];
                                const temp = list[idx];
                                list[idx] = list[idx + 1];
                                list[idx + 1] = temp;
                                setEditingTour({ ...editingTour, stops: list });
                              }}
                              className="p-1 hover:bg-slate-200 text-slate-500 rounded disabled:opacity-30 cursor-pointer"
                              title="Aşağı Sürüşdür"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const list = (editingTour.stops || []).filter((_: any, i: number) => i !== idx);
                                setEditingTour({ ...editingTour, stops: list });
                              }}
                              className="p-1 hover:bg-rose-100 text-rose-500 rounded cursor-pointer"
                              title="Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mini Form to dynamic add Landmark/Stop */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 md:grid-cols-6 gap-3 text-left font-sans">
                  <div className="md:col-span-3 flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-500">Məkan / Stop Adı</label>
                    <input
                      type="text"
                      placeholder="Məs: Əlincə Qalası"
                      value={auxStopName}
                      onChange={(e) => setAuxStopName(e.target.value)}
                      className="p-2 bg-white border rounded-xl text-xs"
                    />
                  </div>
                  <div className="md:col-span-1.5 flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-500">Sərf Olunan Müddət</label>
                    <input
                      type="text"
                      placeholder="Məs: 3 saat"
                      value={auxStopDuration}
                      onChange={(e) => setAuxStopDuration(e.target.value)}
                      className="p-2 bg-white border rounded-xl text-xs"
                    />
                  </div>
                  <div className="md:col-span-1.5 flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-500 font-sans">Məkan Şəkil URL-i</label>
                    <div className="flex items-center gap-1.5 bg-white p-1 border rounded-xl">
                      {auxStopImg && <img src={auxStopImg} className="w-5 h-5 object-cover rounded" alt="" referrerPolicy="no-referrer" />}
                      <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[9px] py-1 px-2.5 rounded cursor-pointer transition-all font-sans font-bold flex-1 text-center select-none">
                        Foto Yüklə
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, setAuxStopImg)}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="md:col-span-2 flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-500">Xəritə En dairəsi (Lat koordinatı)</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="Məs: 39.2065"
                      value={auxStopLat}
                      onChange={(e) => setAuxStopLat(e.target.value ? Number(e.target.value) : '')}
                      className="p-2 bg-white border rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div className="md:col-span-2 flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-500">Xəritə Uzunluq dairəsi (Lng koordinatı)</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="Məs: 45.4111"
                      value={auxStopLng}
                      onChange={(e) => setAuxStopLng(e.target.value ? Number(e.target.value) : '')}
                      className="p-2 bg-white border rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div className="md:col-span-2 flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-slate-400 select-none">&nbsp;</label>
                    <button
                      type="button"
                      onClick={() => {
                        if (!auxStopName.trim()) {
                          error('Ən azı məkan adı daxil edilməlidir.');
                          return;
                        }
                        const newStops = [...(editingTour.stops || [])];
                        newStops.push({
                          placeName: auxStopName.trim(),
                          duration: auxStopDuration.trim() || '2 saat',
                          description: auxStopDesc.trim() || 'Naxçıvanın gəzməli guşələri.',
                          image: auxStopImg || 'https://images.unsplash.com/photo-1541963463532-d68292c34b19',
                          lat: auxStopLat !== '' ? auxStopLat : undefined,
                          lng: auxStopLng !== '' ? auxStopLng : undefined
                        });
                        setEditingTour({ ...editingTour, stops: newStops });
                        setAuxStopName('');
                        setAuxStopDuration('');
                        setAuxStopDesc('');
                        setAuxStopImg('');
                        setAuxStopLat('');
                        setAuxStopLng('');
                        success('Gediləcək yer siyahıya əlavə edildi!');
                      }}
                      className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-97"
                    >
                      <Plus className="w-4 h-4" /> Məkanı Əlavə Et
                    </button>
                  </div>

                  <div className="md:col-span-6 flex flex-col gap-1 text-left">
                    <label className="text-[10px] font-bold text-slate-500">Məkan barədə qısa təsvir (Deskripsiya)</label>
                    <textarea
                      rows={1.5}
                      placeholder="Məs: Naxçıvanın qulaq batan, hündür qayalıqlarda yerləşən əzəmətli qalası..."
                      value={auxStopDesc}
                      onChange={(e) => setAuxStopDesc(e.target.value)}
                      className="p-2 bg-white border rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* 2. DYNAMIC MEALS SECTION (Qidalanma Planı) */}
              <div className="border-t border-slate-100 pt-6 mt-6">
                <div className="flex items-center justify-between mb-4 bg-orange-50/50 p-3.5 rounded-2xl border border-orange-100/50 select-none">
                  <div className="flex items-center gap-2">
                    <Coffee className="w-5 h-5 text-orange-600 shrink-0" />
                    <div className="text-left font-sans">
                      <h4 className="font-serif text-sm font-black text-navy-deep">Admin Qidalanma Planı Sistemi (Yeni)</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Turun qidalanma rejiminə istənilən sayda və adda xüsusi yemək saatları əlavə edin.</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-orange-850 bg-orange-100/50 px-2.5 py-1 rounded-full font-sans">
                    {(editingTour.customMeals || []).length} Menu növü
                  </span>
                </div>

                {/* List of custom meals */}
                <div className="space-y-3 mb-4 text-left font-sans">
                  {(!editingTour.customMeals || editingTour.customMeals.length === 0) ? (
                    <p className="text-xs text-slate-400 italic py-2">Hələ ki, heç bir xüsusi qidalanma menyusu əlavə olunmayıb.</p>
                  ) : (
                    <div className="border border-slate-200/60 rounded-2xl divide-y overflow-hidden max-h-[350px] overflow-y-auto">
                      {editingTour.customMeals.map((meal: any, idx: number) => (
                        <div key={idx} className="p-3 bg-slate-50/50 hover:bg-white flex items-center justify-between gap-4 transition-colors">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {meal.image ? (
                              <img src={meal.image} className="w-10 h-10 rounded-lg object-cover shrink-0 border" alt="" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center shrink-0 border border-dashed"><Coffee className="w-4 h-4 text-slate-400" /></div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-orange-600 uppercase tracking-wide">
                                  {meal.typeName}
                                </span>
                                {meal.restaurantName && (
                                  <span className="text-[10px] text-navy-deep font-bold">
                                    • {meal.restaurantName}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                                Menyu: {Array.isArray(meal.items) ? meal.items.join(', ') : meal.items}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => {
                                const list = [...(editingTour.customMeals || [])];
                                const temp = list[idx];
                                list[idx] = list[idx - 1];
                                list[idx - 1] = temp;
                                setEditingTour({ ...editingTour, customMeals: list });
                              }}
                              className="p-1 hover:bg-slate-200 text-slate-500 rounded disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === editingTour.customMeals.length - 1}
                              onClick={() => {
                                const list = [...(editingTour.customMeals || [])];
                                const temp = list[idx];
                                list[idx] = list[idx + 1];
                                list[idx + 1] = temp;
                                setEditingTour({ ...editingTour, customMeals: list });
                              }}
                              className="p-1 hover:bg-slate-200 text-slate-500 rounded disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const list = (editingTour.customMeals || []).filter((_: any, i: number) => i !== idx);
                                setEditingTour({ ...editingTour, customMeals: list });
                              }}
                              className="p-1 hover:bg-rose-100 text-rose-500 rounded cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mini Form to dynamic add meal */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-3 text-left font-sans">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-500">Qidalanma Növü</label>
                    <input
                      type="text"
                      placeholder="Məs: Səhər Yeməyi, Piknik menyusu, Barbekü"
                      value={auxMealType}
                      onChange={(e) => setAuxMealType(e.target.value)}
                      className="p-2 bg-white border rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-500">Restoran / Mətbəx adı</label>
                    <input
                      type="text"
                      placeholder="Məs: Kəklikotu Restoranı"
                      value={auxMealRest}
                      onChange={(e) => setAuxMealRest(e.target.value)}
                      className="p-2 bg-white border rounded-xl text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-500 font-sans">Süfrə / Yemək Şəkil URL-i</label>
                    <div className="flex items-center gap-1.5 bg-white p-1 border rounded-xl">
                      {auxMealImg && <img src={auxMealImg} className="w-5 h-5 object-cover rounded" alt="" referrerPolicy="no-referrer" />}
                      <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[9px] py-1 px-2 rounded cursor-pointer transition-all font-sans font-bold flex-1 text-center select-none">
                        Foto Sechin
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, setAuxMealImg)}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-500 font-mono">&nbsp;</label>
                    <button
                      type="button"
                      onClick={() => {
                        if (!auxMealType.trim() || !auxMealItems.trim()) {
                          error('Ən azı qidalanma növü və menyu məhsulları daxil edilməlidir.');
                          return;
                        }
                        const list = [...(editingTour.customMeals || [])];
                        list.push({
                          typeName: auxMealType.trim(),
                          restaurantName: auxMealRest.trim() || undefined,
                          items: auxMealItems.split(',').map(s => s.trim()).filter(Boolean),
                          image: auxMealImg || undefined
                        });
                        setEditingTour({ ...editingTour, customMeals: list });
                        setAuxMealType('Səhər yeməyi');
                        setAuxMealRest('');
                        setAuxMealItems('');
                        setAuxMealImg('');
                        success('Yeni qidalanma növü əlavə edildi!');
                      }}
                      className="p-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-97"
                    >
                      <Plus className="w-4 h-4" /> Menyunu Əlavə Et
                    </button>
                  </div>
                  <div className="md:col-span-4 flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-500">Menyu Məhsulları (Vergüllə ayıraraq daxil edin)</label>
                    <input
                      type="text"
                      placeholder="Məs: Təndir Kebabı, Şor Qoğalı, Samovar Çayı, Ağ Pendir, Bal, Pomidor-Yumurta..."
                      value={auxMealItems}
                      onChange={(e) => setAuxMealItems(e.target.value)}
                      className="p-2 bg-white border rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* 3. HOTELS SELECTION SECTION (Otellər Bölməsi) */}
              <div className="border-t border-slate-100 pt-6 mt-6">
                <div className="flex items-center justify-between mb-4 bg-sky-50/50 p-3.5 rounded-2xl border border-sky-100/50 select-none">
                  <div className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-sky-600 shrink-0" />
                    <div className="text-left font-sans">
                      <h4 className="font-serif text-sm font-black text-navy-deep">Turun Mehmanxanaları (Yerləşdirmə Otelləri)</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Tur çərçivəsində rezervasiya üçün təklif olunan ulduzlu otelləri seçin (Birdən çox oluna bilər).</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-sky-850 bg-sky-100/50 px-2.5 py-1 rounded-full font-sans">
                    {(editingTour.hotelIds || []).length} Otel Seçilib
                  </span>
                </div>

                {/* Multiselect checkboxes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left font-sans">
                  {hotels.length === 0 ? (
                    <p className="md:col-span-2 text-xs text-slate-450 italic py-2">Sistemdə heç bir otel qeydiyyatdan keçməyib. Əvvəlcə Mehmanxanalar bölməsində otel yaradın.</p>
                  ) : (
                    hotels.map((hotel: Hotel) => {
                      const isSelected = (editingTour.hotelIds || []).includes(hotel.id);
                      return (
                        <label
                          key={hotel.id}
                          className={`p-3 rounded-2xl border-2 flex items-center justify-between gap-3 cursor-pointer transition-all hover:border-sky-300 ${
                            isSelected ? 'bg-sky-50/20 border-sky-500/80' : 'bg-slate-50/50 border-slate-200/80'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                const checkedIds = [...(editingTour.hotelIds || [])];
                                if (checkedIds.includes(hotel.id)) {
                                  const filtered = checkedIds.filter(id => id !== hotel.id);
                                  setEditingTour({ ...editingTour, hotelIds: filtered });
                                } else {
                                  checkedIds.push(hotel.id);
                                  setEditingTour({ ...editingTour, hotelIds: checkedIds });
                                }
                              }}
                              className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500 cursor-pointer"
                            />
                            {hotel.images?.[0] ? (
                              <img src={hotel.images[0]} className="w-9 h-9 object-cover rounded border" alt="" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-9 h-9 rounded bg-slate-200 flex items-center justify-center shrink-0 border"><Building className="w-4 h-4 text-slate-400" /></div>
                            )}
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-navy-deep block truncate">{hotel.name}</span>
                              <span className="text-[10px] text-amber-500 font-bold block">
                                {'★'.repeat(hotel.stars)}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-400 font-semibold">{hotel.address}</span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              {/* 4. DYNAMIC TRANSPORT SECTION (Nəqliyyat Bölməsi) */}
              <div className="border-t border-slate-100 pt-6 mt-6">
                <div className="flex items-center justify-between mb-4 bg-indigo-50/50 p-3.5 rounded-2xl border border-indigo-100/50 select-none">
                  <div className="flex items-center gap-2">
                    <Car className="w-5 h-5 text-indigo-600 shrink-0" />
                    <div className="text-left font-sans">
                      <h4 className="font-serif text-sm font-black text-navy-deep">Turun Nəqliyyat Vasitələrinin Siyahısı</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-medium font-sans">Ekskursiyada istifadə olunacaq qonaq daşıma nəqliyyat modellərini və üstünlüklərini idarə edin.</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-indigo-850 bg-indigo-100/50 px-2.5 py-1 rounded-full font-sans">
                    {(editingTour.customTransports || []).length} Avtomobil
                  </span>
                </div>

                {/* List of custom transports */}
                <div className="space-y-3 mb-4 text-left font-sans">
                  {(!editingTour.customTransports || editingTour.customTransports.length === 0) ? (
                    <p className="text-xs text-slate-400 italic py-2">Tur üçün ayrıca heç bir xüsusi nəqliyyat profilə daxil edilməyib.</p>
                  ) : (
                    <div className="border border-slate-200/60 rounded-2xl divide-y overflow-hidden max-h-[300px] overflow-y-auto">
                      {editingTour.customTransports.map((trans: any, idx: number) => (
                        <div key={idx} className="p-3 bg-slate-50/50 hover:bg-white flex items-center justify-between gap-4 transition-colors">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {trans.image ? (
                              <img src={trans.image} className="w-10 h-10 rounded-lg object-cover shrink-0 border" alt="" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center shrink-0 border border-dashed"><Car className="w-4 h-4 text-slate-400" /></div>
                            )}
                            <div className="min-w-0 flex-1 bg-white p-2 border rounded-xl shadow-sm">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-bold text-indigo-700 uppercase tracking-dense">
                                  {trans.type}
                                </span>
                                <span className="text-xs text-navy-deep font-bold font-sans">
                                  — {trans.model}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-0.5 font-medium line-clamp-1">
                                Özəllikləri: {Array.isArray(trans.features) ? trans.features.join(', ') : trans.features}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => {
                                const list = [...(editingTour.customTransports || [])];
                                const temp = list[idx];
                                list[idx] = list[idx - 1];
                                list[idx - 1] = temp;
                                setEditingTour({ ...editingTour, customTransports: list });
                              }}
                              className="p-1 hover:bg-slate-200 text-slate-500 rounded disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === editingTour.customTransports.length - 1}
                              onClick={() => {
                                const list = [...(editingTour.customTransports || [])];
                                const temp = list[idx];
                                list[idx] = list[idx + 1];
                                list[idx + 1] = temp;
                                setEditingTour({ ...editingTour, customTransports: list });
                              }}
                              className="p-1 hover:bg-slate-200 text-slate-500 rounded disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const list = (editingTour.customTransports || []).filter((_: any, i: number) => i !== idx);
                                setEditingTour({ ...editingTour, customTransports: list });
                              }}
                              className="p-1 hover:bg-rose-100 text-rose-500 rounded cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Addition Form */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-3 text-left font-sans">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-500">Nəqliyyat Növü</label>
                    <select
                      value={auxTransType}
                      onChange={(e) => setAuxTransType(e.target.value as any)}
                      className="p-2 bg-white border rounded-xl text-xs font-bold"
                    >
                      <option value="Mikroavtobus">Mikroavtobus</option>
                      <option value="Avtobus">Avtobus</option>
                      <option value="Minivan">Minivan</option>
                      <option value="VIP Avtomobil">VIP Avtomobil</option>
                      <option value="Offroad">Offroad SUV 4x4</option>
                      <option value="Digər">Digər</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-500 font-sans">Avtomobilin Modeli</label>
                    <input
                      type="text"
                      placeholder="Məs: Mercedes Vito 2024"
                      value={auxTransModel}
                      onChange={(e) => setAuxTransModel(e.target.value)}
                      className="p-2 bg-white border rounded-xl text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-500 font-sans font-sans font-sans">Nəqliyyat Şəkli</label>
                    <div className="flex items-center gap-1.5 bg-white p-1 border rounded-xl">
                      {auxTransImg && <img src={auxTransImg} className="w-5 h-5 object-cover rounded" alt="" referrerPolicy="no-referrer" />}
                      <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[9px] py-1 px-2 rounded cursor-pointer transition-all font-sans font-bold flex-1 text-center select-none">
                        Foto Yüklə
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, setAuxTransImg)}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-500 font-mono">&nbsp;</label>
                    <button
                      type="button"
                      onClick={() => {
                        if (!auxTransModel.trim()) {
                          error('Nəqliyyat vasitəsinin modeli boş ola bilməz.');
                          return;
                        }
                        const list = [...(editingTour.customTransports || [])];
                        list.push({
                          type: auxTransType,
                          model: auxTransModel.trim(),
                          features: auxTransFeatures ? auxTransFeatures.split(',').map(f => f.trim()).filter(Boolean) : ['Kondisioner', 'Yeni model', 'Təmiz salon'],
                          image: auxTransImg || undefined
                        });
                        setEditingTour({ ...editingTour, customTransports: list });
                        setAuxTransModel('');
                        setAuxTransFeatures('');
                        setAuxTransImg('');
                        success('Xüsusi nəqliyyat tura daxil edildi!');
                      }}
                      className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-97"
                    >
                      <Plus className="w-4 h-4" /> Nəqliyyat Əlavə Et
                    </button>
                  </div>
                  <div className="md:col-span-4 flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-500 font-sans">Nəqliyyatın Üstünlükləri & Konseptləri (Vergüllə ayıraraq daxil edin)</label>
                    <input
                      type="text"
                      placeholder="Məs: Kondisioner, Sürətli WiFi, Dəri Oturacaqlar, USB Şarj Portu, Soyuq İçkilər, Peşəkar Sürücü..."
                      value={auxTransFeatures}
                      onChange={(e) => setAuxTransFeatures(e.target.value)}
                      className="p-2 bg-white border rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* 5. SEO SETTINGS SECTION */}
              <div className="border-t border-slate-100 pt-6 mt-6">
                <div className="flex items-center justify-start gap-2 mb-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 select-none">
                  <Compass className="w-5 h-5 text-gold-primary shrink-0" />
                  <div className="text-left font-sans">
                    <h4 className="font-serif text-sm font-black text-navy-deep">SEO Optimizasiyası və Parametrləri (SEO Axtarış)</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Tur səhifəsinin Google axtarış motorlarında yüksək yerlərdə çıxması üçün metadata başlıqlarını doldurun.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left font-sans">
                  <div className="flex flex-col gap-1 md:col-span-3">
                    <label className="text-[11px] font-bold text-slate-500">Axtarış Başlığı (SEO Title)</label>
                    <input
                      type="text"
                      placeholder="Məsələn: Premium Naxçıvan Turları 2026 - Ən yaxşı qiymətlərlə"
                      value={editingTour.seoSettings?.title || ''}
                      onChange={(e) => {
                        const seo = { ...(editingTour.seoSettings || {}) };
                        seo.title = e.target.value;
                        setEditingTour({ ...editingTour, seoSettings: seo });
                      }}
                      className="p-2.5 bg-slate-50 border rounded-xl text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1 md:col-span-3">
                    <label className="text-[11px] font-bold text-slate-500">Axtarış Təsviri (SEO Description)</label>
                    <textarea
                      rows={2}
                      placeholder="Məsələn: Batabat gölü, Əlincə Qalası və Möminə Xatun daxil olan 3 günlük möhtəşəm Naxçıvan səyahəti. Otel və bələdçi daxildir, dərhal çat et!"
                      value={editingTour.seoSettings?.description || ''}
                      onChange={(e) => {
                        const seo = { ...(editingTour.seoSettings || {}) };
                        seo.description = e.target.value;
                        setEditingTour({ ...editingTour, seoSettings: seo });
                      }}
                      className="p-2.5 bg-slate-50 border rounded-xl text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1 md:col-span-3 font-sans">
                    <label className="text-[11px] font-bold text-slate-500">Axtarış Açar Sözləri (SEO Keywords - Vergüllə ayırın)</label>
                    <input
                      type="text"
                      placeholder="Məsələn: naxcivan turlari, elince qalasi, batabat turu, naxcivanda oteller"
                      value={editingTour.seoSettings?.keywords || ''}
                      onChange={(e) => {
                        const seo = { ...(editingTour.seoSettings || {}) };
                        seo.keywords = e.target.value;
                        setEditingTour({ ...editingTour, seoSettings: seo });
                      }}
                      className="p-2.5 bg-slate-50 border rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Submit panel */}
              <div className="p-4 border-t flex justify-end gap-2 bg-slate-50 sticky bottom-0 z-10 -mx-6 -mb-6">
                <button
                  type="submit"
                  className="bg-gold-primary hover:bg-gold-dark text-navy-deep font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-md font-sans"
                >
                  <Check className="w-4 h-4" />
                  Saxla və Çıx
                </button>
                <button
                  type="button"
                  onClick={() => setEditingTour(null)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-750 font-bold px-4 py-2.5 rounded-xl text-xs cursor-pointer transition-all font-sans"
                >
                  Geri Qayıt
                </button>
              </div>

            </form>
          </div>
        </div>
      )}


      {/* 2. EDIT HOTEL MODAL */}
      {editingHotel && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[950] p-4 font-sans overflow-y-auto backdrop-blur-sm animate-fadeIn text-left">
          <div className="bg-white rounded-3xl w-full max-w-4xl flex flex-col md:max-h-[85vh] overflow-hidden shadow-2xl border border-slate-100 relative my-8 animate-slideUp">
            {/* Modal Header */}
            <div className="p-5 border-b flex justify-between items-center bg-slate-50 sticky top-0 z-10 select-none">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-gold-primary animate-pulse" />
                <div>
                  <h4 className="font-serif text-base font-bold text-navy-deep leading-none">
                    Mehmanxana və Tarifləri Redaktə Et
                  </h4>
                  <p className="text-[10px] text-slate-400 font-sans mt-1 leading-none">Otel ID: {editingHotel.id}</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setEditingHotel(null)} 
                className="p-1.5 bg-slate-100 hover:bg-rose-500 hover:text-white rounded-xl text-slate-500 cursor-pointer transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleEditHotelSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Otel Adı */}
                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500">Mehmanxananın (Otel) Adı</label>
                  <input
                    type="text"
                    required
                    value={editingHotel.name || ''}
                    onChange={(e) => setEditingHotel({ ...editingHotel, name: e.target.value })}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
                  />
                </div>

                {/* Ulduz Sayı */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500">Ulduz Sayı</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    required
                    value={editingHotel.stars || 4}
                    onChange={(e) => setEditingHotel({ ...editingHotel, stars: Number(e.target.value) })}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white"
                  />
                </div>

                {/* Ünvan */}
                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500">Fiziki Ünvanı</label>
                  <input
                    type="text"
                    required
                    value={editingHotel.address || ''}
                    onChange={(e) => setEditingHotel({ ...editingHotel, address: e.target.value })}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
                  />
                </div>

                {/* Əsas Əlaqə Nömrəsi */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500 font-sans">Əlaqə Telefonu/WhatsApp</label>
                  <input
                    type="text"
                    value={editingHotel.contact?.phone || ''}
                    onChange={(e) => {
                      const contact = { ...(editingHotel.contact || {}) };
                      contact.phone = e.target.value;
                      setEditingHotel({ ...editingHotel, contact });
                    }}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>

                {/* Əlaqə Email */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500">Email Ünvanı</label>
                  <input
                    type="email"
                    value={editingHotel.contact?.email || ''}
                    onChange={(e) => {
                      const contact = { ...(editingHotel.contact || {}) };
                      contact.email = e.target.value;
                      setEditingHotel({ ...editingHotel, contact });
                    }}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>

                {/* Check In / Out */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500">Giriş saatı (Check-In)</label>
                  <input
                    type="text"
                    value={editingHotel.checkInTime || '14:00'}
                    onChange={(e) => setEditingHotel({ ...editingHotel, checkInTime: e.target.value })}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500">Çıxış saatı (Check-Out)</label>
                  <input
                    type="text"
                    value={editingHotel.checkOutTime || '12:00'}
                    onChange={(e) => setEditingHotel({ ...editingHotel, checkOutTime: e.target.value })}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>

                {/* Hotel Təsviri */}
                <div className="flex flex-col gap-1 md:col-span-3">
                  <label className="text-xs font-bold text-slate-500">Mehmanxananın Ətraflı Təsviri</label>
                  <textarea
                    rows={3}
                    value={editingHotel.description || ''}
                    onChange={(e) => setEditingHotel({ ...editingHotel, description: e.target.value })}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>

              </div>

              {/* UNLIMITED DYNAMIC ROOM TYPES EDITOR WITH SEASONAL PRICING */}
              <div className="border-t border-slate-100 pt-6">
                <div className="flex justify-between items-center mb-4 select-none">
                  <div>
                    <h4 className="font-serif text-sm font-bold text-navy-deep">Otaq Növləri, Mövsümlük Tariflər və Paketlər</h4>
                    <p className="text-[10px] text-slate-400 font-sans leading-none mt-0.5">Çarpayı sayı, mövsümlük yaz/yay/qış gecəlik rüsumları və təsviri ətraflı qeyd edin.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const rooms = Array.isArray(editingHotel.rooms) ? [...editingHotel.rooms] : [];
                      rooms.push({
                        id: 'room_' + Date.now(),
                        name: 'İkiNəfərlik Komfort Otaq',
                        image: 'https://images.unsplash.com/photo-1611891405914-ee72af1a8979',
                        capacity: 2,
                        size: '30m²',
                        bedType: '1 Böyük King Size Çarpayı',
                        price: 100,
                        discountPrice: 90,
                        seasonalPrices: { spring: 100, summer: 130, autumn: 95, winter: 80, holidays: 150 },
                        amenities: ['Wifi', 'İsti su', 'Kondisioner', 'Smart LCD TV'],
                        description: 'Tam mövsümlük klimatizasiya sistemi, dadlı səhər yeməyi daxil, şık mənzərəli geniş otaq.'
                      });
                      setEditingHotel({ ...editingHotel, rooms });
                    }}
                    className="bg-navy-mid hover:bg-navy-deep text-gold-primary text-xs font-bold py-1.5 px-3.5 rounded-xl flex items-center gap-1 cursor-pointer transition-all shadow-sm font-sans"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Yeni Otaq Növü Əlavə Et
                  </button>
                </div>

                <div className="space-y-4 max-h-[350px] overflow-y-auto p-2 border border-slate-200 rounded-2xl bg-slate-50/50">
                  {Array.isArray(editingHotel.rooms) && editingHotel.rooms.length > 0 ? (
                    editingHotel.rooms.map((room, roomIdx) => (
                      <div key={room.id || roomIdx} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col gap-3 relative text-left">
                        <button
                          type="button"
                          onClick={() => {
                            const rooms = editingHotel.rooms.filter((_: any, i: number) => i !== roomIdx);
                            setEditingHotel({ ...editingHotel, rooms });
                          }}
                          className="absolute top-2 right-2 p-1 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all text-xs cursor-pointer"
                          title="Bu otağı sil"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                          {/* Otaq şəkli */}
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-slate-500 font-sans">Otaq Şəkli</label>
                            <div className="flex items-center gap-1.5 bg-slate-50 p-1 border rounded-lg">
                              {room.image ? (
                                <img src={room.image} className="w-8 h-8 rounded object-cover shadow shrink-0" alt="" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="w-8 h-8 rounded bg-slate-200 shrink-0" />
                              )}
                              <label className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-[8px] font-bold px-1.5 py-1 rounded cursor-pointer text-center flex-1 font-sans select-none">
                                Şəkil Yüklə
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleFileUpload(e, (url) => {
                                    const rooms = [...editingHotel.rooms];
                                    rooms[roomIdx] = { ...rooms[roomIdx], image: url };
                                    setEditingHotel({ ...editingHotel, rooms });
                                  })}
                                />
                              </label>
                            </div>
                          </div>

                          {/* Otaq Adı */}
                          <div className="flex flex-col gap-1 md:col-span-2">
                            <label className="text-[10px] text-slate-500 font-sans font-semibold">Otaq və ya Paket Adı</label>
                            <input
                              type="text"
                              value={room.name || ''}
                              onChange={(e) => {
                                const rooms = [...editingHotel.rooms];
                                rooms[roomIdx] = { ...rooms[roomIdx], name: e.target.value };
                                setEditingHotel({ ...editingHotel, rooms });
                              }}
                              className="p-1.5 border border-slate-200 rounded-lg text-xs"
                            />
                          </div>

                          {/* Tutum / İştirakçı sayısı */}
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-slate-500 font-sans">Maks. Qonaq (Tutum)</label>
                            <input
                              type="number"
                              value={room.capacity || 2}
                              onChange={(e) => {
                                const rooms = [...editingHotel.rooms];
                                rooms[roomIdx] = { ...rooms[roomIdx], capacity: Number(e.target.value) };
                                setEditingHotel({ ...editingHotel, rooms });
                              }}
                              className="p-1.5 border border-slate-200 rounded-lg text-xs"
                            />
                          </div>

                          {/* Sahə */}
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-slate-500 font-sans">Otaq Sahəsi (m²)</label>
                            <input
                              type="text"
                              value={room.size || ''}
                              onChange={(e) => {
                                const rooms = [...editingHotel.rooms];
                                rooms[roomIdx] = { ...rooms[roomIdx], size: e.target.value };
                                setEditingHotel({ ...editingHotel, rooms });
                              }}
                              className="p-1.5 border border-slate-200 rounded-lg text-xs"
                              placeholder="Məs. 35m²"
                            />
                          </div>

                          {/* Çarpayı Tipi */}
                          <div className="flex flex-col gap-1 md:col-span-2">
                            <label className="text-[10px] text-slate-500 font-sans">Çarpayı Tipi</label>
                            <input
                              type="text"
                              value={room.bedType || ''}
                              onChange={(e) => {
                                const rooms = [...editingHotel.rooms];
                                rooms[roomIdx] = { ...rooms[roomIdx], bedType: e.target.value };
                                setEditingHotel({ ...editingHotel, rooms });
                              }}
                              className="p-1.5 border border-slate-200 rounded-lg text-xs"
                              placeholder="Məs. 1 Böyük King Size çarpayı"
                            />
                          </div>

                          {/* Standart Qiymət */}
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-slate-500 font-sans font-semibold">Standard Gecəlik Qiymət (₼)</label>
                            <input
                              type="number"
                              value={room.price || 0}
                              onChange={(e) => {
                                const rooms = [...editingHotel.rooms];
                                rooms[roomIdx] = { ...rooms[roomIdx], price: Number(e.target.value) };
                                setEditingHotel({ ...editingHotel, rooms });
                              }}
                              className="p-1.5 border border-slate-200 rounded-lg text-xs font-bold text-amber-600"
                            />
                          </div>

                          {/* Endirimli Qiymət */}
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-slate-500 font-sans font-semibold">Endirimli Gecəlik Qiymət (₼)</label>
                            <input
                              type="number"
                              value={room.discountPrice || 0}
                              onChange={(e) => {
                                const rooms = [...editingHotel.rooms];
                                rooms[roomIdx] = { ...rooms[roomIdx], discountPrice: Number(e.target.value) };
                                setEditingHotel({ ...editingHotel, rooms });
                              }}
                              className="p-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-rose-500"
                            />
                          </div>

                          {/* SEASONAL PRICING MATRIX SPECIFIC TO ROOMS */}
                          <div className="col-span-1 md:col-span-4 border-t border-slate-100 pt-2 grid grid-cols-2 md:grid-cols-5 gap-2 bg-slate-50 p-2 rounded-lg mt-1 font-sans">
                            <div className="flex flex-col gap-0.5">
                              <label className="text-[9px] text-slate-500 font-semibold leading-none mb-0.5">🌸 Yaz Rüsumu (₼)</label>
                              <input
                                type="number"
                                value={room.seasonalPrices?.spring || 0}
                                onChange={(e) => {
                                  const rooms = [...editingHotel.rooms];
                                  const seasonalPrices = { ...(rooms[roomIdx].seasonalPrices || {}) };
                                  seasonalPrices.spring = Number(e.target.value);
                                  rooms[roomIdx] = { ...rooms[roomIdx], seasonalPrices };
                                  setEditingHotel({ ...editingHotel, rooms });
                                }}
                                className="p-1 border border-slate-200 rounded bg-white text-[10px]"
                              />
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <label className="text-[9px] text-slate-500 font-semibold leading-none mb-0.5">☀️ Yay Rüsumu (₼)</label>
                              <input
                                type="number"
                                value={room.seasonalPrices?.summer || 0}
                                onChange={(e) => {
                                  const rooms = [...editingHotel.rooms];
                                  const seasonalPrices = { ...(rooms[roomIdx].seasonalPrices || {}) };
                                  seasonalPrices.summer = Number(e.target.value);
                                  rooms[roomIdx] = { ...rooms[roomIdx], seasonalPrices };
                                  setEditingHotel({ ...editingHotel, rooms });
                                }}
                                className="p-1 border border-slate-200 rounded bg-white text-[10px]"
                              />
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <label className="text-[9px] text-slate-500 font-semibold leading-none mb-0.5">🍁 Payız Rüsumu (₼)</label>
                              <input
                                type="number"
                                value={room.seasonalPrices?.autumn || 0}
                                onChange={(e) => {
                                  const rooms = [...editingHotel.rooms];
                                  const seasonalPrices = { ...(rooms[roomIdx].seasonalPrices || {}) };
                                  seasonalPrices.autumn = Number(e.target.value);
                                  rooms[roomIdx] = { ...rooms[roomIdx], seasonalPrices };
                                  setEditingHotel({ ...editingHotel, rooms });
                                }}
                                className="p-1 border border-slate-200 rounded bg-white text-[10px]"
                              />
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <label className="text-[9px] text-slate-500 font-semibold leading-none mb-0.5">❄️ Qış Rüsumu (₼)</label>
                              <input
                                type="number"
                                value={room.seasonalPrices?.winter || 0}
                                onChange={(e) => {
                                  const rooms = [...editingHotel.rooms];
                                  const seasonalPrices = { ...(rooms[roomIdx].seasonalPrices || {}) };
                                  seasonalPrices.winter = Number(e.target.value);
                                  rooms[roomIdx] = { ...rooms[roomIdx], seasonalPrices };
                                  setEditingHotel({ ...editingHotel, rooms });
                                }}
                                className="p-1 border border-slate-200 rounded bg-white text-[10px]"
                              />
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <label className="text-[9px] text-slate-500 font-semibold leading-none mb-0.5">🎉 Bayram / Özel (₼)</label>
                              <input
                                type="number"
                                value={room.seasonalPrices?.holidays || 0}
                                onChange={(e) => {
                                  const rooms = [...editingHotel.rooms];
                                  const seasonalPrices = { ...(rooms[roomIdx].seasonalPrices || {}) };
                                  seasonalPrices.holidays = Number(e.target.value);
                                  rooms[roomIdx] = { ...rooms[roomIdx], seasonalPrices };
                                  setEditingHotel({ ...editingHotel, rooms });
                                }}
                                className="p-1 border border-slate-200 rounded bg-white text-[10px]"
                              />
                            </div>
                          </div>

                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-xs text-slate-400">Heç bir otaq təsnifatı yoxdur. Başlamaq üçün yuxarıdakı "Otaq Tipi Əlavə Et" düyməsinə klikləyin.</div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 border-t flex justify-end gap-2 bg-slate-50 sticky bottom-0 z-10 -mx-6 -mb-6">
                <button
                  type="submit"
                  className="bg-gold-primary hover:bg-gold-dark text-navy-deep font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-md font-sans"
                >
                  <Check className="w-4 h-4" />
                  Oteli və Otaqları Yadda Saxla
                </button>
                <button
                  type="button"
                  onClick={() => setEditingHotel(null)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-750 font-bold px-4 py-2.5 rounded-xl text-xs cursor-pointer transition-all font-sans"
                >
                  Geri Çəkil
                </button>
              </div>

            </form>
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
