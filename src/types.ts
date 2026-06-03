export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'user' | 'admin';
  isBlocked: boolean;
  createdAt: string;
}

export interface Place {
  id: string;
  name: string;
  category: 'Türbələr' | 'Qalalar' | 'Təbiət Məkanları' | 'Muzeylər' | 'Dini Yerlər' | 'Tarixi Yerlər';
  description: string;
  entryFee: string;
  workingHours: string;
  images: string[];
  location: {
    lat: number;
    lng: number;
  };
  historicalPeriod: string;
  isActive: boolean;
  createdAt: string;
}

export interface HotelRoom {
  type: string;
  price: number;
  capacity: number;
  name?: string;
  image?: string;
  area?: number;
  bedType?: string;
  description?: string;
  discountPrice?: number;
  seasonalPrices?: { season: string; price: number }[];
  amenities?: string[];
}

export interface HotelMeal {
  menu: string;
  image?: string;
  price: number;
  isIncluded: boolean;
}

export interface Hotel {
  id: string;
  name: string;
  address: string;
  stars: number;
  rooms: HotelRoom[];
  amenities: string[];
  restaurant: {
    name: string;
    cuisine: string;
    hours: string;
  };
  phone: string;
  email: string;
  images: string[];
  location: {
    lat: number;
    lng: number;
  };
  isActive: boolean;
  createdAt: string;
  logo?: string;
  shortDescription?: string;
  description?: string;
  whatsapp?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    telegram?: string;
  };
  checkInTime?: string;
  checkOutTime?: string;
  meals?: {
    breakfast?: HotelMeal;
    lunch?: HotelMeal;
    dinner?: HotelMeal;
  };
  priceNightly?: number;
  priceWeekly?: number;
  priceMonthly?: number;
  priceSeasonal?: string;
  priceHoliday?: string;
}

export interface TourStop {
  placeName: string;
  duration: string;
  description: string;
  image: string;
  lat?: number;
  lng?: number;
}

export interface CustomMeal {
  typeName: string; // e.g. "Səhər yeməyi", "BBQ", etc.
  restaurantName?: string;
  items: string[];
  image?: string;
}

export interface CustomTransport {
  type: 'Avtobus' | 'Mikroavtobus' | 'Minivan' | 'VIP Avtomobil' | 'Offroad' | 'Digər';
  model: string;
  features: string[];
  image?: string;
}

export interface Tour {
  id: string;
  name: string;
  category: 'Tarixi' | 'Ekskursiya' | 'Eko-Turizm' | 'VIP' | 'Fərdi';
  duration: number;
  price: number;
  discountPrice?: number; // Endirimli qiymət
  contingent?: number;     // Kontingent / Limit
  shortDescription: string;
  mainImage: string;
  gallery: string[];
  stops: TourStop[];
  meals: {
    breakfast: { restaurantName: string; items: string[]; image?: string };
    lunch: { restaurantName: string; items: string[]; image?: string };
    dinner: { restaurantName: string; items: string[]; image?: string };
  };
  customMeals?: CustomMeal[]; // Dynamic custom meals system
  accommodation: {
    hotelName: string;
    roomType: string;
    amenities: string[];
  };
  hotelIds?: string[]; // Selected registered hotel IDs
  transport: {
    type: string;
    model: string;
    features: string[];
    model3D: string;
    displayMode?: 'image' | '3d';
    image?: string;
  };
  customTransports?: CustomTransport[]; // Dynamic custom transports system
  isActive: boolean;
  createdAt: string;
  vehicleType?: string;
  companyId?: string;
  companyName?: string;
  includedServices?: string[];
  pdfDocuments?: string[];
  seoSettings?: {
    title?: string;
    description?: string;
    keywords?: string;
  };
}

export interface TourismCompany {
  id: string;
  name: string;
  logo: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  website: string;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    telegram?: string;
  };
  isActive: boolean;
  createdAt: string;
  commissionRate?: number;
}

export interface WhatsAppLog {
  timestamp: string;
  message: string;
  status: 'sent' | 'read' | 'failed' | 'delivered';
  error?: string;
  messageId?: string;
}

export interface Reservation {
  id: string;
  userId: string;
  type: 'tour' | 'hotel';
  refId: string;
  fullName: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  notes: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  totalPrice: number;
  createdAt: string;
  viaWhatsapp?: boolean;
  whatsappStatus?: 'pending_send' | 'sent' | 'read' | 'failed' | 'not_sent';
  whatsappLogs?: WhatsAppLog[];
}

export interface Comment {
  id: string;
  placeId: string;
  userName: string;
  rating: number;
  text: string;
  createdAt: string;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  image: string;
  hours: string;
  cuisine: string;
  isActive: boolean;
  createdAt: string;
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  image: string;
  category: string;
  createdAt: string;
  isActive: boolean;
  author: string;
}

export interface HeroSlider {
  title: string;
  subtitle: string;
  image: string;
}

export interface Testimonial {
  name: string;
  text: string;
  role: string;
  rating: number;
}

export interface VideoItem {
  title: string;
  url: string;
  description: string;
}

export interface PromoBanner {
  title: string;
  text: string;
  isActive: boolean;
  image: string;
}

export interface WhatsAppSettings {
  phoneId: string;
  accessToken: string;
  verifyToken: string;
  messageTemplate: string;
  isRealMode: boolean;
}

export interface SettingsSchema {
  heroSliders: HeroSlider[];
  testimonials: Testimonial[];
  videos: VideoItem[];
  photoGalleries: string[];
  contactInfo: {
    phone: string;
    email: string;
    address: string;
  };
  socialMediaLinks: {
    facebook: string;
    instagram: string;
    telegram: string;
  };
  seoSettings: {
    title: string;
    description: string;
    keywords: string;
  };
  headerFooter: {
    headerTitle: string;
    footerText: string;
  };
  promoBanners: PromoBanner[];
  themeSettings: {
    primaryColor: string;
    darkScheme: boolean;
  };
  logoSettings?: {
    logoLightUrl: string;
    logoDarkUrl: string;
    logoMobileUrl?: string;
    logoFooterUrl?: string;
    faviconUrl: string;
    logoWidth: number;
    logoHeight: number;
    logoPositionX: number;
    logoPositionY: number;
    logoVariant?: 'variant1' | 'variant2' | 'variant3';
    mobileWidth?: number;
    mobileHeight?: number;
    desktopWidth?: number;
    desktopHeight?: number;
    logoText?: string;
    logoFontSize?: number;
    logoFontWeight?: string;
    logoFontFamily?: string;
    logoTextColor?: string;
    logoAccentColor?: string;
    logoSubtitle?: string;
  };
  whatsappSettings?: WhatsAppSettings;
  welcomeSettings?: {
    badgeText: string;
    titleText: string;
    descriptionText: string;
    backgroundImageUrl: string;
  };
  backgroundSettings?: {
    homeUrl?: string;
    toursUrl?: string;
    hotelsUrl?: string;
    placesUrl?: string;
    museumsUrl?: string;
    transportUrl?: string;
    aboutUrl?: string;
    contactUrl?: string;
    weatherUrl?: string;
  };
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  category: 'logo' | 'tour' | 'hotel' | 'place' | 'restaurant' | 'blog' | 'other' | 'document';
  fileSize?: string;
  createdAt: string;
}

