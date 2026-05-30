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
}

export interface TourStop {
  placeName: string;
  duration: string;
  description: string;
  image: string;
}

export interface Tour {
  id: string;
  name: string;
  category: 'Tarixi' | 'Ekskursiya' | 'Eko-Turizm' | 'VIP' | 'Fərdi';
  duration: number;
  price: number;
  shortDescription: string;
  mainImage: string;
  gallery: string[];
  stops: TourStop[];
  meals: {
    breakfast: { restaurantName: string; items: string[] };
    lunch: { restaurantName: string; items: string[] };
    dinner: { restaurantName: string; items: string[] };
  };
  accommodation: {
    hotelName: string;
    roomType: string;
    amenities: string[];
  };
  transport: {
    type: string;
    model: string;
    features: string[];
    model3D: string;
  };
  isActive: boolean;
  createdAt: string;
  vehicleType?: string;
  companyId?: string;
  companyName?: string;
  includedServices?: string[];
  pdfDocuments?: string[];
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
    faviconUrl: string;
    logoWidth: number;
    logoHeight: number;
    logoPositionX: number;
    logoPositionY: number;
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

