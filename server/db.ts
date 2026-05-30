import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Path to file persistence database
const DB_FILE = path.join(process.cwd(), 'db.json');

// Interface definition for data structures
export interface User {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
  isBlocked: boolean;
  createdAt: string;
}

export interface Place {
  id: string;
  name: string;
  category: 'Türbələr' | 'Qalalar' | 'Təbiət Məkanları' | 'Muzeylər' | 'Dini Yerlər' | 'Tarixi Yerlər';
  description: string;
  entryFee: string; // e.g. "₼ 2" or "Pulsuz"
  workingHours: string; // e.g. "09:00–18:00"
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
  duration: number; // in days
  price: number; // base price in AZN
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
    model3D: string; // Type or style of 3D view
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

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  category: 'logo' | 'tour' | 'hotel' | 'place' | 'restaurant' | 'blog' | 'other' | 'document';
  fileSize?: string;
  createdAt: string;
}

export interface Reservation {
  id: string;
  userId: string;
  type: 'tour' | 'hotel';
  refId: string; // ID of tour or hotel
  fullName: string;
  email: string;
  phone: string;
  checkIn: string; // ISO Date String
  checkOut: string; // ISO Date String
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

interface DatabaseSchema {
  users: User[];
  places: Place[];
  hotels: Hotel[];
  tours: Tour[];
  reservations: Reservation[];
  comments: Comment[];
  restaurants: Restaurant[];
  blogs: Blog[];
  settings: SettingsSchema;
  companies: TourismCompany[];
  media?: MediaItem[];
}

// Password hashing helper using standard Node crypto
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Initial seed data generator
function getSeedData(): DatabaseSchema {
  const adminPasswordHash = hashPassword('naxcivan2025');
  const userPasswordHash = hashPassword('naxcivan2025');

  const users: User[] = [
    {
      id: 'usr_admin',
      fullName: 'Tuncay Qurbanov',
      email: 'tuncayqurbanov19@gmail.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
      isBlocked: false,
      createdAt: new Date('2026-05-01').toISOString()
    },
    {
      id: 'usr_demo',
      fullName: 'Elnur Məmmədov',
      email: 'turist@tourism.naxcivan',
      passwordHash: userPasswordHash,
      role: 'user',
      isBlocked: false,
      createdAt: new Date('2026-05-15').toISOString()
    }
  ];

  const places: Place[] = [
    {
      id: 'plc_1',
      name: 'Möminə Xatun Türbəsi',
      category: 'Türbələr',
      description: 'Möminə Xatun Türbəsi 1186-cı ildə dahi memar Əcəmi Naxçıvani tərəfindən tikilmişdir. Azərbaycan memarlığının şah əsərlərindən biri hesab olunur və UNESCO Ümumdünya İrsi namizədidir. Türbə dayanıqlı kərpic naxışları, fəlsəfi kitabələri və həndəsi ornamentləri ilə məşhurdur. Şərq İntibahının Möminə Xatunun şərəfinə ucaldılmış bu abidəsi onun güclü xarakterini və dövlətçilikdəki rolunu əks etdirir.',
      entryFee: '₼ 2',
      workingHours: '09:00–18:00',
      images: [
        'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1200&auto=format&fit=crop', // Islamic architecture
        'https://images.unsplash.com/photo-1608958416719-f81d19dcaece?q=80&w=600&auto=format&fit=crop'
      ],
      location: { lat: 39.2065, lng: 45.4111 },
      historicalPeriod: 'XII əsr (1186)',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'plc_2',
      name: 'Əlincəqala',
      category: 'Qalalar',
      description: 'Əlincəqala Əlincə çayının sağ sahilində yerləşən və sıldırım dağ zirvəsində ucalan qədim hərbi qaladır (IV əsr). Bu qala monqol-tatarların, həmçinin Teymurilərin hücumlarına düz 14 il ərzində qəhrəmancasına müqavimət göstərərək Azərbaycan tarixində yenilməzlik rəmzi kimi qalmışdır. Deniz səviyyəsindən 1,800 metr yüksəklikdə yerləşən qalaya çıxan turistlərə möhtəşəm panorama açılır.',
      entryFee: 'Pulsuz',
      workingHours: 'Hər zaman açıq',
      images: [
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop', // Ridge
        'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop'
      ],
      location: { lat: 39.1930, lng: 45.6980 },
      historicalPeriod: 'Qədim Eranın IV əsri',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'plc_3',
      name: 'Duzdağ Fizioterapiya Mərkəzi',
      category: 'Təbiət Məkanları',
      description: 'Duzdağ Fizioterapiya Mərkəzi Naxçıvan şəhərindən 10 km məsafədə yerləşən unikal təbii duz mağaralarıdır. Mağaralardakı natrium-xlorid ionları ilə zəngin olan mikroiqlim tənəffüs orqanları xəstəliklərindən (xüsusən də bronxial astma) əziyyət çəkənlər üçün əvəzedilməz sığınacaq və müalicə ocağıdır. İllik minlərlə xarici və yerli qonaq müalicə üçün duz şaxtalarına gəlir.',
      entryFee: '₼ 5',
      workingHours: '08:00–20:00',
      images: [
        'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?q=80&w=1200&auto=format&fit=crop', // Salt cave/wellness feeling
        'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=600&auto=format&fit=crop'
      ],
      location: { lat: 39.2500, lng: 45.3800 },
      historicalPeriod: 'Təbii Məkan (Qədim Dövr)',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'plc_4',
      name: 'Xan Sarayı',
      category: 'Muzeylər',
      description: 'Xan Sarayı — XVIII əsrə aid olan və Naxçıvan xanlarının yaşayış iqamətgahı olmuş tarixi saraydır. Şərq memarlıq üslubunda tikilmiş bina hazırda Dövlət Tarix-Memarlıq Muzeyi kimi fəaliyyət göstərir. Muzeydə Naxçıvan xanlığına, xüsusən Kəngərlilər sülaləsinə aid nadir silahlar, qədim xalçalar, miniatürlər, məişət əşyaları və sənədlər qorunub saxlanılır.',
      entryFee: '₼ 3',
      workingHours: '10:00–17:00',
      images: [
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1200&auto=format&fit=crop', // Palace interior/classic
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600&auto=format&fit=crop'
      ],
      location: { lat: 39.2085, lng: 45.4050 },
      historicalPeriod: 'XVIII əsr',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'plc_5',
      name: 'Nuh Peyğəmbər Məqbərəsi',
      category: 'Dini Yerlər',
      description: 'Nuh Peyğəmbər Məqbərəsi qədim dini və tarixi əhəmiyyətə malik, Naxçıvan şəhərinin cənub hissəsində (Köhnəqala daxilində) ucalan ziyarətgahdır. İnanca görə Ümumdünya tufanından sağ çıxan Nuh Peyğəmbərin qəbri burada yerləşir. Hazırkı məqbərə qədim bünövrələr üzərində bərpa olunmuş, milli ornamentlərlə bəzədilmiş səkkizbucaqlı gümbəzlə örtülmüşdür.',
      entryFee: 'Pulsuz',
      workingHours: 'Hər zaman açıq',
      images: [
        'https://images.unsplash.com/photo-1590073844006-33379778ae09?q=80&w=1200&auto=format&fit=crop', // Landmark dome
        'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=600&auto=format&fit=crop'
      ],
      location: { lat: 39.2000, lng: 45.4150 },
      historicalPeriod: 'Tunc Dövrü bünövrəsi',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'plc_6',
      name: 'Batabat Gölü',
      category: 'Təbiət Məkanları',
      description: 'Batabat Gölü dəniz səviyyəsindən 2350 metr yüksəklikdə, Şahbuz Dövlət Təbiət Qoruğunun tərkibində yerləşən alp gölüdür. Gölün ən heyranedici xüsusiyyəti, suyun üzərində sərbəst hərəkət edən meşəlik torf adasıdır (üzən ada). Batabat zəngin florası, təmiz mineral bulaqları (Zor bulaq) və füsunkar mənzərəsi ilə ekoturizmin əsas ünvanlarından biridir.',
      entryFee: 'Pulsuz',
      workingHours: 'Hər zaman açıq',
      images: [
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop', // Mountain lake
        'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=600&auto=format&fit=crop'
      ],
      location: { lat: 39.5333, lng: 45.7167 },
      historicalPeriod: 'Təbii Alp Gölü',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'plc_7',
      name: 'Aşağı Əylis Kilsəsi',
      category: 'Tarixi Yerlər',
      description: 'Aşağı Əylis kilsəsi Ordubad rayonunun tarixi Əylis kəndində yerləşən, qədim Qafqaz Albaniyası dövrünə və orta əsrlərə aid tarixi məbəd xarabalıqlarıdır. Bölgənin qədim xristian və daş memarlığını əks etdirən bu struktur, Naxçıvanın multikultural keçmişini və zəngin dini fərqliliyini nümayiş etdirir.',
      entryFee: 'Pulsuz',
      workingHours: 'Hər zaman açıq',
      images: [
        'https://images.unsplash.com/photo-1548625361-155deee2627e?q=80&w=1200&auto=format&fit=crop', // Ancient ruins/walls
        'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop'
      ],
      location: { lat: 38.9317, lng: 45.9817 },
      historicalPeriod: 'IV - XVII əsrlər',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'plc_8',
      name: 'Naxçıvan Tarix Muzeyi',
      category: 'Muzeylər',
      description: 'Naxçıvan Tarix Muzeyi — bölgənin ən qədim muzeyidir (1924-cü ildə təsis olunub). Muzeydə paleolit dövründən tutmuş müasir dövrə qədər olan 48,000-dən çox nadir eksponat qorunub saxlanılır: tunc təkərlər, qədim naxışlı saxsı qablar, pullar, əlyazmalar və naxçıvanlı generalların şərəfli hərbi geyimləri.',
      entryFee: '₼ 2',
      workingHours: '09:00–17:00',
      images: [
        'https://images.unsplash.com/photo-1566121318576-537f8d164530?q=80&w=1200&auto=format&fit=crop', // Museum/artifacts
        'https://images.unsplash.com/photo-1447069387593-a5de0862481e?q=80&w=600&auto=format&fit=crop'
      ],
      location: { lat: 39.2050, lng: 45.4100 },
      historicalPeriod: 'XIX əsr binası (Muzey 1924)',
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ];

  const hotels: Hotel[] = [
    {
      id: 'htl_1',
      name: 'Saat Meydanı Qonaq Evi',
      address: 'Naxçıvan şəhəri, Saat Meydanı Kompleksi',
      stars: 4,
      rooms: [
        { type: 'Standart Otaq', price: 90, capacity: 2 },
        { type: 'Deluxe Suite', price: 150, capacity: 3 },
        { type: 'Ailəvi Otaq', price: 180, capacity: 4 }
      ],
      amenities: ['WiFi', 'Restoran', 'Parkinq', 'Otaq Xidməti', 'Kondisioner', 'Lift'],
      restaurant: {
        name: 'Saat Cafe-Bistro',
        cuisine: 'Avropa və Milli Mətbəx',
        hours: '08:00–23:00'
      },
      phone: '+994 36 544 55 22',
      email: 'info@saatmeydani.az',
      images: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop', // Hotel exterior
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=600&auto=format&fit=crop', // Bed
        'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=600&auto=format&fit=crop'
      ],
      location: { lat: 39.2105, lng: 45.4125 },
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'htl_2',
      name: 'Təbriz Premium Hotel',
      address: 'Naxçıvan şəhəri, Heydər Əliyev prospekti 17',
      stars: 5,
      rooms: [
        { type: 'Executive Single', price: 120, capacity: 1 },
        { type: 'Premium Double', price: 160, capacity: 2 },
        { type: 'Presidential Suite', price: 320, capacity: 4 }
      ],
      amenities: ['WiFi', 'Hovuz', 'Restoran', 'Spa', 'Parkinq', 'Fitness', 'Otaq Xidməti', 'Lift'],
      restaurant: {
        name: 'Panorama Roof Restoran',
        cuisine: 'Füzyon, Azərbaycan, Türk mətbəxi',
        hours: '07:00–00:00'
      },
      phone: '+994 36 550 40 40',
      email: 'contact@tebrizhotel.az',
      images: [
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop', // Grand hotel
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=600&auto=format&fit=crop', // Pool
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=600&auto=format&fit=crop'
      ],
      location: { lat: 39.2082, lng: 45.4085 },
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'htl_3',
      name: 'Duzdağ Sanatoriya Kompleksi',
      address: 'Duzdağ Şaxtaları Ətrafı, Naxçıvan',
      stars: 5,
      rooms: [
        { type: 'Therapy Standard', price: 110, capacity: 2 },
        { type: 'Therapy Family', price: 170, capacity: 4 },
        { type: 'Salt View Suite', price: 230, capacity: 2 }
      ],
      amenities: ['WiFi', 'Hovuz', 'Restoran', 'Spa', 'Parkinq', 'Fitness', 'Müalicə Mərkəzi'],
      restaurant: {
        name: 'Şəfa Salt Restaurant',
        cuisine: 'Dietik və Milli Kulinariya',
        hours: '08:00–22:00'
      },
      phone: '+994 36 544 01 02',
      email: 'booking@duzdaghotel.az',
      images: [
        'https://images.unsplash.com/photo-1517840901100-8179e982acb7?q=80&w=1200&auto=format&fit=crop', // Spa hotel
        'https://images.unsplash.com/photo-1455587734955-081b22074882?q=80&w=600&auto=format&fit=crop'
      ],
      location: { lat: 39.2482, lng: 45.3850 },
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'htl_4',
      name: 'Ağbulaq Dağ İstirahət Mərkəzi',
      address: 'Şahbuz rayonu, Ağbulaq Kənd Kurortu',
      stars: 3,
      rooms: [
        { type: 'Meşə kənar Kottec', price: 70, capacity: 2 },
        { type: 'Double Dağ mənzərə', price: 85, capacity: 2 },
        { type: 'İki Mərtəbəli Villa', price: 160, capacity: 6 }
      ],
      amenities: ['WiFi', 'Restoran', 'Kondisioner', 'Parkinq', 'Xizək İcarəsi', 'Uşaq Meydançası'],
      restaurant: {
        name: 'YayLaq Qril Evi',
        cuisine: 'Əsl Kənd Məhsulları, Manqal Xörəkləri',
        hours: '08:00–22:00'
      },
      phone: '+994 36 554 11 99',
      email: 'info@agbulaqski.az',
      images: [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200&auto=format&fit=crop', // Mountain lodge
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop'
      ],
      location: { lat: 39.4200, lng: 45.8500 },
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ];

  const tours: Tour[] = [
    {
      id: 'tour_1',
      name: 'Naxçıvanın Tarixi Şah Əsərləri',
      category: 'Tarixi',
      duration: 3,
      price: 250,
      shortDescription: 'Memar Əcəminin şah əsərlərindən, yenilməz Əlincəqalaya və qədim Nuh məqbərəsinə qədər uzanan, zəngin tarixi bələdçi müşayiəti ilə möhtəşəm 3 günlük paket.',
      mainImage: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=1200&auto=format&fit=crop', // Islamic architecture/tower
      gallery: [
        'https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600&auto=format&fit=crop'
      ],
      stops: [
        {
          placeName: 'Möminə Xatun Türbəsi',
          duration: 'Day 1 - 2 saat',
          description: 'Naxçıvan memarlıq məktəbinin ulduzu hesab olunan Mominə Xatun türbəsi ilə tura möhtəşəm başlanğıc.',
          image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=400'
        },
        {
          placeName: 'Xan Sarayı Dövlət Muzeyi',
          duration: 'Day 1 - 1.5 saat',
          description: 'Naxçıvan xanlarının taxt-tac otaqlarını və xanlığın fəaliyyətini göstərən orijinal eksponatları ziyarət edirik.',
          image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=400'
        },
        {
          placeName: 'Əlincəqala Zirvəsi',
          duration: 'Day 2 - 4 saat',
          description: 'Yenilməz qalanın yüzlərlə pilləkənli cığırı ilə zirvəyə qalxaraq möhtəşəm Naxçıvan mənzərəsini seyr edirik.',
          image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=400'
        },
        {
          placeName: 'Nuh Peyğəmbər Məqbərəsi',
          duration: 'Day 3 - 1.5 saat',
          description: 'Tufan öncəsi tarixin bünövrələrinə qonaq olaraq, Nuh peyğəmbərin qəbri üzərində qurulmuş məqbərədə dualar edirik.',
          image: 'https://images.unsplash.com/photo-1590073844006-33379778ae09?q=80&w=400'
        }
      ],
      meals: {
        breakfast: {
          restaurantName: 'Təbriz Səhər Süfrəsi',
          items: ['Naxçıvan şoru', 'Kənd yumurtası', 'Qaymaq', 'Bal', 'Qoğal və isti təndir çörəyi']
        },
        lunch: {
          restaurantName: 'Xanlıq Şərq Restoranı',
          items: ['Naxçıvan Qovurması', 'Təzə kənd qatığı', 'Göyərti salatı', 'Ordubad limon şərbəti']
        },
        dinner: {
          restaurantName: 'Millixan Təndir Evi',
          items: ['Ordubad qayqanağı', 'Quzu basdırması', 'Sumaq salatı', 'Samovar çayı və şirniyyat']
        }
      },
      accommodation: {
        hotelName: 'Təbriz Premium Hotel',
        roomType: 'Premium Double Room',
        amenities: ['Premium WiFi', 'Hovuz', 'Fin Hamamı', 'Fitnes zalı', 'Səhər yeməyi']
      },
      transport: {
        type: 'Mikroavtobus',
        model: 'Mercedes-Benz Sprinter Tourist',
        features: ['Wifi', 'Kondisioner', 'USB Şarj ports', 'Geniş Oturacaqlar', 'Su və Qəlyanaltı xidməti'],
        model3D: 'mercedes_sprinter'
      },
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'tour_2',
      name: 'Duzdağ Sağlamlıq və Təbiət Eko-Turu',
      category: 'Eko-Turizm',
      duration: 2,
      price: 180,
      shortDescription: 'Təbii duz mağaralarında unikal nəfəs müalicəsi və Batabat gölünün füsunkar alp təmiz havasının möhtəşəm vəhdəti.',
      mainImage: 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?q=80&w=1200&auto=format&fit=crop', // cave
      gallery: [
        'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop'
      ],
      stops: [
        {
          placeName: 'Duzdağ Şor Şaxtaları',
          duration: 'Day 1 - 4 saat müalicəvi seans',
          description: 'Ağciyərlərin təmizlənməsi üçün duz mağarasının 300 metr dərinliyindəki salonlarda istirahət pansionatı.',
          image: 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?q=80&w=400'
        },
        {
          placeName: 'Batabat Gölü və Üzən Adalar',
          duration: 'Day 2 - Gündüz pikniki və tracking',
          description: 'Üzən adanı su üzərində izləyərək mineral su mənbələrindən buz kimi saf bulaq suları içirik.',
          image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=400'
        }
      ],
      meals: {
        breakfast: {
          restaurantName: 'Yaylaq Səhər Guşəsi',
          items: ['Qatıq', 'Bal', 'Kərə yağı', 'Biz kənd pendiri', 'Təndirdə isti kətə']
        },
        lunch: {
          restaurantName: 'Batabat Kənar Alagöz Restoranı',
          items: ['Göl balığı kababı', 'Səbzi qovurma plov', 'Ağbulaq kəklikotu çayı']
        },
        dinner: {
          restaurantName: 'Şəfa Salt Restoranı',
          items: ['Yarpaq dolması', 'Badımcan və pomidor dolması', 'Duzdağ dietik salat']
        }
      },
      accommodation: {
        hotelName: 'Duzdağ Sanatoriya Kompleksi',
        roomType: 'Therapy Standard Room',
        amenities: ['Pulsuz astma otağı seansı', 'Qapalı hovuz', 'Mineral bulaq vannaları']
      },
      transport: {
        type: 'Miniven Comfort',
        model: 'Toyota Alphard Executive',
        features: ['Baqaj yerləri', 'Kondisioner', 'USB Şüşə portları', 'Yatalaq oturacaqlar', 'Mineral duzlu sular'],
        model3D: 'toyota_alphard'
      },
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ];

  const reservations: Reservation[] = [
    {
      id: 'res_1',
      userId: 'usr_demo',
      type: 'tour',
      refId: 'tour_1',
      fullName: 'Elnur Məmmədov',
      email: 'turist@tourism.naxcivan',
      phone: '+994 50 123 45 67',
      checkIn: new Date().toISOString(),
      checkOut: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      guests: 2,
      notes: 'Bələdçinin ingilis dilli olması arzuolunandır.',
      status: 'pending',
      totalPrice: 500,
      createdAt: new Date().toISOString()
    },
    {
      id: 'res_2',
      userId: 'usr_demo',
      type: 'hotel',
      refId: 'htl_2',
      fullName: 'Elnur Məmmədov',
      email: 'turist@tourism.naxcivan',
      phone: '+994 50 123 45 67',
      checkIn: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      checkOut: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
      guests: 2,
      notes: 'Sakit, həyət mənzərəli premium otaq olsun.',
      status: 'confirmed',
      totalPrice: 320,
      createdAt: new Date().toISOString()
    }
  ];

  const comments: Comment[] = [
    {
      id: 'comm_1',
      placeId: 'plc_1',
      userName: 'Arif Məmmədov',
      rating: 5,
      text: 'Möminə Xatun türbəsi həqiqətən də memarlıq möcüzəsidir. Kərpic ornamentləri heyranedicidir.',
      createdAt: new Date().toISOString()
    },
    {
      id: 'comm_2',
      placeId: 'plc_2',
      userName: 'Günel Hüseynova',
      rating: 5,
      text: 'Əlincə Qalasına qalxmaq çətin olsa da, yuxarıdan görünən mənzərə mütləq dəyər!',
      createdAt: new Date().toISOString()
    }
  ];

  const restaurants: Restaurant[] = [
    {
      id: 'rest_1',
      name: 'Naxçıvan Xan Süfrəsi',
      description: 'Tarixi Xan Sarayının yaxınlığında yerləşən, tamamilə milli üslubda dizayn edilmiş premium restoran. Naxçıvanın ən ləziz qutabları, dolmaları və kababları burada təqdim olunur.',
      address: 'Heydər Əliyev Prospekti 12, Naxçıvan',
      phone: '+994 36 545 12 12',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=600',
      hours: '11:00 - 23:00',
      cuisine: 'Milli Naxçıvan Mətbəxi',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'rest_2',
      name: 'Batabat Göl Restoranı',
      description: 'Batabat yaylağının mərkəzində, üzən adanın mənzərəsinə qarşı möhtəşəm bir təbiət restoranı. Təmiz dağ havası və təbii kənd məhsulları ilə hazırlanan yeməklər.',
      address: 'Batabat Yaylağı, Şahbuz',
      phone: '+994 70 300 40 50',
      image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=600',
      hours: '09:00 - 21:00',
      cuisine: 'Kabablar və Dağ Yeməkləri',
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ];

  const blogs: Blog[] = [
    {
      id: 'blog_1',
      title: 'Əshabi-Kəhf Mağarasının Sirləri',
      content: 'Əshabi-Kəhf haqqında Qurani-Kərimdə "Əl-Kəhf" surəsində bəhs edilir. Naxçıvandakı bu müqəddəs və mistik məkan əsrlərdir ziyarət edilir. İnanclara görə, mağaradakı daşlardan damlayan su şəfavericidir.',
      image: 'https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?auto=format&fit=crop&q=80&w=600',
      category: 'Tarix və İnanc',
      createdAt: new Date().toISOString(),
      isActive: true,
      author: 'Elnur Sadıqlı'
    },
    {
      id: 'blog_2',
      title: 'Naxçıvan Kulinariyası: Qabaq Aşı və Alana',
      content: 'Naxçıvanın özünəməxsus kulinariya mədəniyyəti var. Alana daxili doldurulmuş qurudulmuş şaftalıdır və dadı misilsizdir. Qabaq aşı, fərqli düyü və balqabaq qarışımı ilə fərqli bir damaq dadı təqdim edir.',
      image: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&q=80&w=600',
      category: 'Kulinariya',
      createdAt: new Date().toISOString(),
      isActive: true,
      author: 'Günel Rzayeva'
    }
  ];

  const settings: SettingsSchema = {
    heroSliders: [
      {
        title: "Naxçıvanın Möhtəşəm Tarixi Dünyasını Kəşf Edin",
        subtitle: "Əsrlərin izi, sirli Əlincəqala və şəfa mənbəyi Duzdağ sizi gözləyir.",
        image: "https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?auto=format&fit=crop&q=80&w=1224"
      },
      {
        title: "Lüks Otellər və Komfortlu Səyahət Paketi",
        subtitle: "Naxçıvanda yerləşən 5 ulduzlu otellərdə unudulmaz gecələr keçirin.",
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=1224"
      }
    ],
    testimonials: [
      {
        name: "Aysel Abdullayeva",
        text: "Naxçıvan turları çox yüksək səviyyədə təşkil olunmuşdu. Xüsusilə Əlincəqalada gün batımı mənzərəsini heç vaxt unutmayacağam!",
        role: "Turist",
        rating: 5
      },
      {
        name: "Murad Qasımov",
        text: "Biz Batabat turuna qatıldıq, hər şey mükəmməl idi. Bələdçimiz hər tarixlə bağlı ətraflı məlumat verdi. Çox razı qaldıq.",
        role: "Səyahətçi",
        rating: 5
      }
    ],
    videos: [
      {
        title: "Naxçıvanın Tanıtım Video Çarxı",
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        description: "Böyük Naxçıvanın kəşf olunmamış gözəllikləri rəsmi video görüntüsü."
      }
    ],
    photoGalleries: [
      'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=800',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800',
      'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?q=80&w=800'
    ],
    contactInfo: {
      phone: "+994 70 353 82 83",
      email: "info@naxcivan.travel",
      address: "Azərbaycan, Naxçıvan Muxtar Respublikası, Naxçıvan şəhəri"
    },
    socialMediaLinks: {
      facebook: "https://facebook.com",
      instagram: "https://instagram.com",
      telegram: "https://telegram.org"
    },
    seoSettings: {
      title: "Naxçıvan Turizm Portalı - Nakhchivan Travel",
      description: "Naxçıvanın tarixi, otelləri, turları, restoranları və kulinariyası haqqında rəsmi bələdçi.",
      keywords: "Naxçıvan, turizm, səyahət, Əlincəqala, Möminə Xatun, Batabat"
    },
    headerFooter: {
      headerTitle: "NAXÇIVAN",
      footerText: "© 2026 Naxçıvan Turizm Platforması. Bütün hüquqlar qorunur."
    },
    promoBanners: [
      {
        title: "Yay Turlarına Xüsusi 20% Endirim!",
        text: "Bütün tarixi yerlər və Batabat turunda endirimlərdən indi yararlanın.",
        isActive: true,
        image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800"
      }
    ],
    themeSettings: {
      primaryColor: "#F59E0B",
      darkScheme: true
    },
    logoSettings: {
      logoLightUrl: "https://images.unsplash.com/photo-1549643276-fdf2fab574f5?q=80&w=150",
      logoDarkUrl: "https://images.unsplash.com/photo-1549643276-fdf2fab574f5?q=80&w=150",
      faviconUrl: "/favicon.ico",
      logoWidth: 150,
      logoHeight: 40,
      logoPositionX: 0,
      logoPositionY: 0
    }
  };

  const companies: TourismCompany[] = [
    {
      id: 'comp_1',
      name: 'Naxçıvan Cahan Səyahət',
      logo: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=150',
      description: 'Naxçıvan Muxtar Respublikasının aparıcı turizm agentliyi. 20 ildən artıq təcrübə ilə Batabat, Əlincəqala və Əshabi-Kəhf turlarının peşəkar təşkili.',
      phone: '+994 36 544 11 22',
      email: 'cahan@naxcivan.travel',
      address: 'Naxçıvan şəhəri, Heydər Əliyev prospekti 15',
      website: 'https://cahan.naxcivan.travel',
      socialMedia: {
        facebook: 'https://facebook.com/cahantravel',
        instagram: 'https://instagram.com/cahantravel',
        telegram: 'https://t.me/cahantravel'
      },
      isActive: true,
      createdAt: new Date('2026-04-10').toISOString()
    },
    {
      id: 'comp_2',
      name: 'Baku Travel & Tours (Naxçıvan Filialı)',
      logo: 'https://images.unsplash.com/photo-1549643276-fdf2fab574f5?q=80&w=150',
      description: 'Azərbaycan üzrə geniş şəbəkəyə malik premium səyahət şirkəti. Naxçıvan filialımız qonaqlara ən yüksək səviyyədə nəqliyyat, bələdçi və otel rezervasiya xidmətləri göstərir.',
      phone: '+994 12 400 90 90',
      email: 'baku@naxcivan.travel',
      address: 'Bakı şəhəri, Nizami küçəsi 44 / Naxçıvan şəhər ofisi',
      website: 'https://bakutravel.az',
      socialMedia: {
        facebook: 'https://facebook.com/bakutravel',
        instagram: 'https://instagram.com/bakutravel'
      },
      isActive: true,
      createdAt: new Date('2026-05-01').toISOString()
    }
  ];

  return { users, places, hotels, tours, reservations, comments, restaurants, blogs, settings, companies, media: [] };
}

// Simple and highly resilient JSON DB Handler
class FileDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = getSeedData();
    this.initialize();
  }

  private initialize() {
    try {
      if (!fs.existsSync(DB_FILE)) {
        this.write();
        console.log('Database seeded and created successfully at ' + DB_FILE);
      } else {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        if (fileContent.trim() === '') {
          this.write();
        } else {
          this.data = JSON.parse(fileContent);
          // Ensure new fields are backward compatible and initialized!
          const defaults = getSeedData();
          if (!this.data.restaurants) this.data.restaurants = defaults.restaurants;
          if (!this.data.blogs) this.data.blogs = defaults.blogs;
          if (!this.data.settings) this.data.settings = defaults.settings;
          if (!this.data.companies) this.data.companies = defaults.companies || [];
          if (!this.data.media) this.data.media = [];

          if (this.data.media.length === 0) {
            const mediaSet = new Set<string>();
            const mediaList: MediaItem[] = [];

            const addMedia = (url: string, category: 'logo' | 'tour' | 'hotel' | 'place' | 'restaurant' | 'blog' | 'other' | 'document', name: string) => {
              if (url && url.startsWith('http') && !mediaSet.has(url)) {
                mediaSet.add(url);
                mediaList.push({
                  id: 'med_' + Math.random().toString(36).substring(2, 11),
                  name,
                  url,
                  category,
                  fileSize: '124 KB',
                  createdAt: new Date().toISOString()
                });
              }
            };

            this.data.tours.forEach(t => {
              addMedia(t.mainImage, 'tour', t.name);
              if (t.gallery) t.gallery.forEach(img => addMedia(img, 'tour', t.name + ' Qalereya'));
            });
            this.data.hotels.forEach(h => {
              if (h.images) h.images.forEach(img => addMedia(img, 'hotel', h.name));
            });
            this.data.places.forEach(p => {
              if (p.images) p.images.forEach(img => addMedia(img, 'place', p.name));
            });
            this.data.restaurants.forEach(r => {
              addMedia(r.image, 'restaurant', r.name);
            });
            this.data.blogs.forEach(b => {
              addMedia(b.image, 'blog', b.title);
            });

            this.data.media = mediaList;
            this.write();
          }
        }
      }
    } catch (e) {
      console.error('Error initializing database file, running on defaults:', e);
    }
  }

  private write() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write database file:', e);
    }
  }

  public getUsers() { this.initialize(); return this.data.users; }
  public saveUsers(users: User[]) { this.data.users = users; this.write(); }

  public getPlaces() { this.initialize(); return this.data.places; }
  public savePlaces(places: Place[]) { this.data.places = places; this.write(); }

  public getHotels() { this.initialize(); return this.data.hotels; }
  public saveHotels(hotels: Hotel[]) { this.data.hotels = hotels; this.write(); }

  public getTours() { this.initialize(); return this.data.tours; }
  public saveTours(tours: Tour[]) { this.data.tours = tours; this.write(); }

  public getReservations() { this.initialize(); return this.data.reservations; }
  public saveReservations(reservations: Reservation[]) { this.data.reservations = reservations; this.write(); }

  public getComments() { this.initialize(); return this.data.comments || []; }
  public saveComments(comments: Comment[]) { this.data.comments = comments; this.write(); }

  public getRestaurants() { this.initialize(); return this.data.restaurants || []; }
  public saveRestaurants(restaurants: Restaurant[]) { this.data.restaurants = restaurants; this.write(); }

  public getBlogs() { this.initialize(); return this.data.blogs || []; }
  public saveBlogs(blogs: Blog[]) { this.data.blogs = blogs; this.write(); }

  public getSettings() { this.initialize(); return this.data.settings || getSeedData().settings; }
  public saveSettings(settings: SettingsSchema) { this.data.settings = settings; this.write(); }

  public getCompanies() { this.initialize(); return this.data.companies || []; }
  public saveCompanies(companies: TourismCompany[]) { this.data.companies = companies; this.write(); }

  public getMedia() { this.initialize(); return this.data.media || []; }
  public saveMedia(media: MediaItem[]) { this.data.media = media; this.write(); }
}

export const dbInstance = new FileDatabase();

// Mongoose-like CRUD Layer for easy schema routing:
export const db = {
  users: {
    find: () => dbInstance.getUsers(),
    findOne: (query: Partial<User>) => {
      const users = dbInstance.getUsers();
      return users.find(u => {
        return Object.entries(query).every(([key, val]) => (u as any)[key] === val);
      }) || null;
    },
    findById: (id: string) => {
      return dbInstance.getUsers().find(u => u.id === id) || null;
    },
    create: (userData: Omit<User, 'id' | 'createdAt'>) => {
      const users = dbInstance.getUsers();
      const newUser: User = {
        ...userData,
        id: 'usr_' + Date.now().toString(36),
        createdAt: new Date().toISOString()
      };
      users.push(newUser);
      dbInstance.saveUsers(users);
      return newUser;
    },
    findByIdAndUpdate: (id: string, updates: Partial<User>) => {
      const users = dbInstance.getUsers();
      const idx = users.findIndex(u => u.id === id);
      if (idx === -1) return null;
      users[idx] = { ...users[idx], ...updates };
      dbInstance.saveUsers(users);
      return users[idx];
    },
    findByIdAndDelete: (id: string) => {
      const users = dbInstance.getUsers();
      const filtered = users.filter(u => u.id !== id);
      dbInstance.saveUsers(filtered);
      return true;
    }
  },

  places: {
    find: () => dbInstance.getPlaces(),
    findById: (id: string) => {
      return dbInstance.getPlaces().find(p => p.id === id) || null;
    },
    create: (data: Omit<Place, 'id' | 'createdAt'>) => {
      const list = dbInstance.getPlaces();
      const newItem: Place = {
        ...data,
        id: 'plc_' + Date.now().toString(36),
        createdAt: new Date().toISOString()
      };
      list.push(newItem);
      dbInstance.savePlaces(list);
      return newItem;
    },
    findByIdAndUpdate: (id: string, updates: Partial<Place>) => {
      const list = dbInstance.getPlaces();
      const idx = list.findIndex(p => p.id === id);
      if (idx === -1) return null;
      list[idx] = { ...list[idx], ...updates };
      dbInstance.savePlaces(list);
      return list[idx];
    },
    findByIdAndDelete: (id: string) => {
      const list = dbInstance.getPlaces();
      const filtered = list.filter(p => p.id !== id);
      dbInstance.savePlaces(filtered);
      return true;
    }
  },

  hotels: {
    find: () => dbInstance.getHotels(),
    findById: (id: string) => {
      return dbInstance.getHotels().find(h => h.id === id) || null;
    },
    create: (data: Omit<Hotel, 'id' | 'createdAt'>) => {
      const list = dbInstance.getHotels();
      const newItem: Hotel = {
        ...data,
        id: 'htl_' + Date.now().toString(36),
        createdAt: new Date().toISOString()
      };
      list.push(newItem);
      dbInstance.saveHotels(list);
      return newItem;
    },
    findByIdAndUpdate: (id: string, updates: Partial<Hotel>) => {
      const list = dbInstance.getHotels();
      const idx = list.findIndex(h => h.id === id);
      if (idx === -1) return null;
      list[idx] = { ...list[idx], ...updates };
      dbInstance.saveHotels(list);
      return list[idx];
    },
    findByIdAndDelete: (id: string) => {
      const list = dbInstance.getHotels();
      const filtered = list.filter(h => h.id !== id);
      dbInstance.saveHotels(filtered);
      return true;
    }
  },

  tours: {
    find: () => dbInstance.getTours(),
    findById: (id: string) => {
      return dbInstance.getTours().find(t => t.id === id) || null;
    },
    create: (data: Omit<Tour, 'id' | 'createdAt'>) => {
      const list = dbInstance.getTours();
      const newItem: Tour = {
        ...data,
        id: 'tour_' + Date.now().toString(36),
        createdAt: new Date().toISOString()
      };
      list.push(newItem);
      dbInstance.saveTours(list);
      return newItem;
    },
    findByIdAndUpdate: (id: string, updates: Partial<Tour>) => {
      const list = dbInstance.getTours();
      const idx = list.findIndex(t => t.id === id);
      if (idx === -1) return null;
      list[idx] = { ...list[idx], ...updates };
      dbInstance.saveTours(list);
      return list[idx];
    },
    findByIdAndDelete: (id: string) => {
      const list = dbInstance.getTours();
      const filtered = list.filter(t => t.id !== id);
      dbInstance.saveTours(filtered);
      return true;
    }
  },

  reservations: {
    find: () => dbInstance.getReservations(),
    findById: (id: string) => {
      return dbInstance.getReservations().find(r => r.id === id) || null;
    },
    findByUser: (userId: string) => {
      return dbInstance.getReservations().filter(r => r.userId === userId);
    },
    create: (data: Omit<Reservation, 'id' | 'createdAt'>) => {
      const list = dbInstance.getReservations();
      const newItem: Reservation = {
        ...data,
        id: 'res_' + Date.now().toString(36),
        createdAt: new Date().toISOString()
      };
      list.push(newItem);
      dbInstance.saveReservations(list);
      return newItem;
    },
    findByIdAndUpdate: (id: string, updates: Partial<Reservation>) => {
      const list = dbInstance.getReservations();
      const idx = list.findIndex(r => r.id === id);
      if (idx === -1) return null;
      list[idx] = { ...list[idx], ...updates };
      dbInstance.saveReservations(list);
      return list[idx];
    },
    findByIdAndDelete: (id: string) => {
      const list = dbInstance.getReservations();
      const filtered = list.filter(r => r.id !== id);
      dbInstance.saveReservations(filtered);
      return true;
    }
  },

  comments: {
    find: () => dbInstance.getComments(),
    findByPlace: (placeId: string) => {
      return dbInstance.getComments().filter(c => c.placeId === placeId);
    },
    create: (data: Omit<Comment, 'id' | 'createdAt'>) => {
      const list = dbInstance.getComments();
      const newItem: Comment = {
        ...data,
        id: 'comm_' + Date.now().toString(36),
        createdAt: new Date().toISOString()
      };
      list.push(newItem);
      dbInstance.saveComments(list);
      return newItem;
    },
    findByIdAndDelete: (id: string) => {
      const list = dbInstance.getComments();
      const filtered = list.filter(c => c.id !== id);
      dbInstance.saveComments(filtered);
      return true;
    }
  },

  restaurants: {
    find: () => dbInstance.getRestaurants(),
    findById: (id: string) => {
      return dbInstance.getRestaurants().find(r => r.id === id) || null;
    },
    create: (data: Omit<Restaurant, 'id' | 'createdAt'>) => {
      const list = dbInstance.getRestaurants();
      const newItem: Restaurant = {
        ...data,
        id: 'rest_' + Date.now().toString(36),
        createdAt: new Date().toISOString()
      };
      list.push(newItem);
      dbInstance.saveRestaurants(list);
      return newItem;
    },
    findByIdAndUpdate: (id: string, updates: Partial<Restaurant>) => {
      const list = dbInstance.getRestaurants();
      const idx = list.findIndex(r => r.id === id);
      if (idx === -1) return null;
      list[idx] = { ...list[idx], ...updates };
      dbInstance.saveRestaurants(list);
      return list[idx];
    },
    findByIdAndDelete: (id: string) => {
      const list = dbInstance.getRestaurants();
      const filtered = list.filter(r => r.id !== id);
      dbInstance.saveRestaurants(filtered);
      return true;
    }
  },

  blogs: {
    find: () => dbInstance.getBlogs(),
    findById: (id: string) => {
      return dbInstance.getBlogs().find(b => b.id === id) || null;
    },
    create: (data: Omit<Blog, 'id' | 'createdAt'>) => {
      const list = dbInstance.getBlogs();
      const newItem: Blog = {
        ...data,
        id: 'blog_' + Date.now().toString(36),
        createdAt: new Date().toISOString()
      };
      list.push(newItem);
      dbInstance.saveBlogs(list);
      return newItem;
    },
    findByIdAndUpdate: (id: string, updates: Partial<Blog>) => {
      const list = dbInstance.getBlogs();
      const idx = list.findIndex(b => b.id === id);
      if (idx === -1) return null;
      list[idx] = { ...list[idx], ...updates };
      dbInstance.saveBlogs(list);
      return list[idx];
    },
    findByIdAndDelete: (id: string) => {
      const list = dbInstance.getBlogs();
      const filtered = list.filter(b => b.id !== id);
      dbInstance.saveBlogs(filtered);
      return true;
    }
  },

  settings: {
    get: () => dbInstance.getSettings(),
    update: (updates: SettingsSchema) => {
      dbInstance.saveSettings(updates);
      return dbInstance.getSettings();
    }
  },

  companies: {
    find: () => dbInstance.getCompanies(),
    findById: (id: string) => {
      return dbInstance.getCompanies().find(c => c.id === id) || null;
    },
    create: (data: Omit<TourismCompany, 'id' | 'createdAt'>) => {
      const list = dbInstance.getCompanies();
      const newItem: TourismCompany = {
        ...data,
        id: 'comp_' + Date.now().toString(36),
        createdAt: new Date().toISOString()
      };
      list.push(newItem);
      dbInstance.saveCompanies(list);
      return newItem;
    },
    findByIdAndUpdate: (id: string, updates: Partial<TourismCompany>) => {
      const list = dbInstance.getCompanies();
      const idx = list.findIndex(c => c.id === id);
      if (idx === -1) return null;
      list[idx] = { ...list[idx], ...updates };
      dbInstance.saveCompanies(list);
      return list[idx];
    },
    findByIdAndDelete: (id: string) => {
      const list = dbInstance.getCompanies();
      const filtered = list.filter(c => c.id !== id);
      dbInstance.saveCompanies(filtered);
      return true;
    }
  },

  media: {
    find: () => dbInstance.getMedia(),
    findById: (id: string) => {
      return dbInstance.getMedia().find(m => m.id === id) || null;
    },
    create: (data: Omit<MediaItem, 'id' | 'createdAt'>) => {
      const list = dbInstance.getMedia();
      const newItem: MediaItem = {
        ...data,
        id: 'med_' + Date.now().toString(36),
        createdAt: new Date().toISOString()
      };
      list.push(newItem);
      dbInstance.saveMedia(list);
      return newItem;
    },
    findByIdAndUpdate: (id: string, updates: Partial<MediaItem>) => {
      const list = dbInstance.getMedia();
      const idx = list.findIndex(m => m.id === id);
      if (idx === -1) return null;
      list[idx] = { ...list[idx], ...updates };
      dbInstance.saveMedia(list);
      return list[idx];
    },
    findByIdAndDelete: (id: string) => {
      const list = dbInstance.getMedia();
      const filtered = list.filter(m => m.id !== id);
      dbInstance.saveMedia(filtered);
      return true;
    }
  }
};
