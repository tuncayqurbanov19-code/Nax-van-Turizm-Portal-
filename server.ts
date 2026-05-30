import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { db, hashPassword } from './server/db';
import { signToken, verifyToken } from './server/auth';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// -------------------------------------------------------------------------
// Authentication Middlewares
// -------------------------------------------------------------------------

const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Lütfən, birinci daxil olun (Sessiya tapılmadı).' });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(403).json({ message: 'Sessiyanızın vaxtı bitib və ya keçərsizdir. Yenidən daxil olun.' });
    return;
  }

  const user = db.users.findById(payload.id);
  if (!user) {
    res.status(403).json({ message: 'İstifadəçi tapılmadı.' });
    return;
  }

  if (user.isBlocked) {
    res.status(403).json({ message: 'Sizin hesabınız bloklanıb. Giriş qadağandır.' });
    return;
  }

  (req as any).user = user;
  next();
};

const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const user = (req as any).user;
  if (!user || user.role !== 'admin') {
    res.status(403).json({ message: 'Bu səhifəyə giriş icazəniz yoxdur. Sizin idarəçi icazəniz yoxdur.' });
    return;
  }
  next();
};

// -------------------------------------------------------------------------
// AUTHENTICATION API ROUTES
// -------------------------------------------------------------------------

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    res.status(400).json({ message: 'Bu xanalar boş qala bilməz. Lütfən bütün məlumatları doldurun.' });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ message: 'Şifrə minimum 8 simvol olmalıdır.' });
    return;
  }

  // Simple email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: 'Düzgün email ünvanı daxil edin.' });
    return;
  }

  const existing = db.users.findOne({ email });
  if (existing) {
    res.status(400).json({ message: 'Bu email ünvanı ilə artıq qeydiyyatdan keçilib.' });
    return;
  }

  const hashedPassword = hashPassword(password);
  const newUser = db.users.create({
    fullName,
    email,
    passwordHash: hashedPassword,
    role: 'user',
    isBlocked: false
  });

  const token = signToken({ id: newUser.id, email: newUser.email, role: newUser.role });

  res.status(201).json({
    token,
    user: {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role
    }
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password, adminCode } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'Bu xanalar boş qala bilməz.' });
    return;
  }

  const user = db.users.findOne({ email });
  if (!user) {
    res.status(400).json({ message: 'Daxil edilən email və ya şifrə yanlışdır.' });
    return;
  }

  if (user.isBlocked) {
    res.status(403).json({ message: 'Sizin hesabınız bloklanıb. Portal sahibləri ilə əlaqə saxlayın.' });
    return;
  }

  if (user.passwordHash !== hashPassword(password)) {
    res.status(400).json({ message: 'Daxil edilən email və ya şifrə yanlışdır.' });
    return;
  }

  // Admin secret access code check
  if (user.role === 'admin') {
    if (!adminCode) {
      res.status(400).json({ message: 'İdarəçi girişi üçün məxfi admin kodu daxil edilməlidir!' });
      return;
    }
    if (adminCode !== 'naxcivan2026') {
      res.status(401).json({ message: 'Giriş bloklandı: Daxil edilən məxfi admin kodu yanlışdır!' });
      return;
    }
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });

  res.json({
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role
    }
  });
});

// Get currently logged-in user session
app.get('/api/auth/me', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user;
  res.json({
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role
    }
  });
});

// -------------------------------------------------------------------------
// TOURS ENDPOINTS
// -------------------------------------------------------------------------

app.get('/api/tours', (req: Request, res: Response) => {
  const tours = db.tours.find();
  const activeTours = tours.filter(t => t.isActive);
  res.json(activeTours);
});

// Admin endpoint to retrieve all tours regardless of status
app.get('/api/tours/all', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  res.json(db.tours.find());
});

app.get('/api/tours/:id', (req: Request, res: Response) => {
  const tour = db.tours.findById(req.params.id);
  if (!tour) {
    res.status(404).json({ message: 'Axtardığınız tur paketi tapılmadı.' });
    return;
  }
  res.json(tour);
});

app.post('/api/tours', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  try {
    const newTour = db.tours.create({
      ...req.body,
      isActive: true
    });
    res.status(201).json(newTour);
  } catch (error: any) {
    res.status(400).json({ message: 'Turu əlavə etmək mümkün olmadı: ' + error.message });
  }
});

app.put('/api/tours/:id', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const updated = db.tours.findByIdAndUpdate(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ message: 'Göstərilən tur tapılmadı.' });
    return;
  }
  res.json(updated);
});

app.delete('/api/tours/:id', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const deleted = db.tours.findByIdAndDelete(req.params.id);
  if (!deleted) {
    res.status(404).json({ message: 'Göstərilən tur tapılmadı və ya silinmə bilmədi.' });
    return;
  }
  res.json({ success: true, message: 'Tur uğurla silindi.' });
});

// -------------------------------------------------------------------------
// HOTELS ENDPOINTS
// -------------------------------------------------------------------------

app.get('/api/hotels', (req: Request, res: Response) => {
  const hotels = db.hotels.find();
  const activeHotels = hotels.filter(h => h.isActive);
  res.json(activeHotels);
});

app.get('/api/hotels/all', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  res.json(db.hotels.find());
});

app.get('/api/hotels/:id', (req: Request, res: Response) => {
  const hotel = db.hotels.findById(req.params.id);
  if (!hotel) {
    res.status(404).json({ message: 'Axtardığınız otel tapılmadı.' });
    return;
  }
  res.json(hotel);
});

app.post('/api/hotels', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  try {
    const newHotel = db.hotels.create({
      ...req.body,
      isActive: true
    });
    res.status(201).json(newHotel);
  } catch (error: any) {
    res.status(400).json({ message: 'Oteli əlavə etmək mümkün olmadı: ' + error.message });
  }
});

app.put('/api/hotels/:id', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const updated = db.hotels.findByIdAndUpdate(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ message: 'Göstərilən otel tapılmadı.' });
    return;
  }
  res.json(updated);
});

app.delete('/api/hotels/:id', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const deleted = db.hotels.findByIdAndDelete(req.params.id);
  if (!deleted) {
    res.status(404).json({ message: 'Göstərilən otel silinə bilmədi.' });
    return;
  }
  res.json({ success: true, message: 'Otel uğurla silindi.' });
});

// -------------------------------------------------------------------------
// LANDMARKS & PLACES ENDPOINTS
// -------------------------------------------------------------------------

app.get('/api/places', (req: Request, res: Response) => {
  const places = db.places.find();
  const activePlaces = places.filter(p => p.isActive);
  res.json(activePlaces);
});

app.get('/api/places/all', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  res.json(db.places.find());
});

app.get('/api/places/:id', (req: Request, res: Response) => {
  const place = db.places.findById(req.params.id);
  if (!place) {
    res.status(404).json({ message: 'Göstərilən tarixi məkan tapılmadı.' });
    return;
  }
  res.json(place);
});

app.post('/api/places', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  try {
    const newPlace = db.places.create({
      ...req.body,
      isActive: true
    });
    res.status(201).json(newPlace);
  } catch (error: any) {
    res.status(400).json({ message: 'Tarixi məkanı əlavə etmək mümkün olmadı.' });
  }
});

app.put('/api/places/:id', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const updated = db.places.findByIdAndUpdate(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ message: 'Göstərilən tarixi yer tapılmadı.' });
    return;
  }
  res.json(updated);
});

app.delete('/api/places/:id', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const deleted = db.places.findByIdAndDelete(req.params.id);
  if (!deleted) {
    res.status(404).json({ message: 'Silinmə mümkün olmadı.' });
    return;
  }
  res.json({ success: true, message: 'Məkan uğurla silindi.' });
});

// -------------------------------------------------------------------------
// RESERVATIONS ENDPOINTS
// -------------------------------------------------------------------------

app.get('/api/reservations', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user.role === 'admin') {
    res.json(db.reservations.find());
  } else {
    res.json(db.reservations.findByUser(user.id));
  }
});

app.post('/api/reservations', authenticateToken, (req: Request, res: Response) => {
  const { type, refId, fullName, email, phone, checkIn, checkOut, guests, notes, totalPrice } = req.body;
  const user = (req as any).user;

  if (!fullName || !email || !phone || !checkIn || !guests) {
    res.status(400).json({ message: 'Bu xana boş qala bilməz. Zəhmət olmasa ulduzlu sahələri doldurun.' });
    return;
  }

  // Validate date logic
  const checkInDate = new Date(checkIn);
  const checkOutDate = checkOut ? new Date(checkOut) : null;
  if (checkOutDate && checkInDate >= checkOutDate) {
    res.status(400).json({ message: 'Giriş tarixi çıxış tarixindən əvvəl olmalıdır.' });
    return;
  }

  try {
    const reservation = db.reservations.create({
      userId: user.id,
      type,
      refId,
      fullName,
      email,
      phone,
      checkIn,
      checkOut: checkOut || checkIn,
      guests: Number(guests),
      notes: notes || '',
      status: 'pending',
      totalPrice: Number(totalPrice) || 0
    });

    res.status(201).json(reservation);
  } catch (error) {
    res.status(500).json({ message: 'Rezervasiyanı yaratmaq mümkün olmadı.' });
  }
});

app.put('/api/reservations/:id/status', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const { status } = req.body; // pending, confirmed, cancelled
  if (!status) {
    res.status(400).json({ message: 'Status daxil edilməlidir.' });
    return;
  }

  const updated = db.reservations.findByIdAndUpdate(req.params.id, { status });
  if (!updated) {
    res.status(404).json({ message: 'Rezervasiya tapılmadı.' });
    return;
  }

  res.json(updated);
});

// -------------------------------------------------------------------------
// COMMENTS & REVIEWS ENDPOINTS
// -------------------------------------------------------------------------

app.get('/api/comments/place/:placeId', (req: Request, res: Response) => {
  res.json(db.comments.findByPlace(req.params.placeId));
});

app.get('/api/comments', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  res.json(db.comments.find());
});

app.post('/api/comments', authenticateToken, (req: Request, res: Response) => {
  const { placeId, rating, text } = req.body;
  const user = (req as any).user;

  if (!placeId || !rating || !text) {
    res.status(400).json({ message: 'Rəy məzmunu boş ola bilməz.' });
    return;
  }

  const newComment = db.comments.create({
    placeId,
    userName: user.fullName,
    rating: Number(rating),
    text,
  });

  res.status(201).json(newComment);
});

app.delete('/api/comments/:id', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const deleted = db.comments.findByIdAndDelete(req.params.id);
  if (!deleted) {
    res.status(404).json({ message: 'Rəy tapılmadı.' });
    return;
  }
  res.json({ success: true, message: 'Rəy uğurla silindi.' });
});

// -------------------------------------------------------------------------
// USERS MANAGEMENT ENDPOINTS (ADMINS ONLY)
// -------------------------------------------------------------------------

app.get('/api/users', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  res.json(db.users.find());
});

app.put('/api/users/:id/role', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const { role } = req.body;
  if (role !== 'user' && role !== 'admin') {
    res.status(400).json({ message: 'Yanlış rol formatı.' });
    return;
  }

  const updated = db.users.findByIdAndUpdate(req.params.id, { role });
  if (!updated) {
    res.status(404).json({ message: 'İstifadəçi tapılmadı.' });
    return;
  }

  res.json(updated);
});

app.put('/api/users/:id/block', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const { isBlocked } = req.body;
  if (typeof isBlocked !== 'boolean') {
    res.status(400).json({ message: 'Yanlış format.' });
    return;
  }

  // Prevent self blocking
  const currentUser = (req as any).user;
  if (currentUser.id === req.params.id) {
    res.status(400).json({ message: 'Öz hesabınızı bloklaya bilməzsiniz.' });
    return;
  }

  const updated = db.users.findByIdAndUpdate(req.params.id, { isBlocked });
  if (!updated) {
    res.status(404).json({ message: 'İstifadəçi tapılmadı.' });
    return;
  }

  res.json(updated);
});

app.delete('/api/users/:id', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const currentUser = (req as any).user;
  if (currentUser.id === req.params.id) {
    res.status(400).json({ message: 'Öz hesabınızı silə bilməzsiniz.' });
    return;
  }

  const deleted = db.users.findByIdAndDelete(req.params.id);
  if (!deleted) {
    res.status(404).json({ message: 'İstifadəçi silinə bilmədi.' });
    return;
  }

  res.json({ success: true, message: 'İstifadəçi uğurla silindi.' });
});

// -------------------------------------------------------------------------
// RESTAURANTS ENDPOINTS
// -------------------------------------------------------------------------
app.get('/api/restaurants', (req: Request, res: Response) => {
  const list = db.restaurants.find();
  res.json(list.filter(r => r.isActive));
});

app.get('/api/restaurants/all', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  res.json(db.restaurants.find());
});

app.get('/api/restaurants/:id', (req: Request, res: Response) => {
  const item = db.restaurants.findById(req.params.id);
  if (!item) {
    res.status(404).json({ message: 'Restoran tapılmadı.' });
    return;
  }
  res.json(item);
});

app.post('/api/restaurants', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  try {
    const newItem = db.restaurants.create({ ...req.body, isActive: true });
    res.status(201).json(newItem);
  } catch (err: any) {
    res.status(400).json({ message: 'Xəta: ' + err.message });
  }
});

app.put('/api/restaurants/:id', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const updated = db.restaurants.findByIdAndUpdate(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ message: 'Restoran tapılmadı.' });
    return;
  }
  res.json(updated);
});

app.delete('/api/restaurants/:id', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const deleted = db.restaurants.findByIdAndDelete(req.params.id);
  if (!deleted) {
    res.status(404).json({ message: 'Restoran silinə bilmədi.' });
    return;
  }
  res.json({ success: true, message: 'Silindi.' });
});

// -------------------------------------------------------------------------
// BLOGS / NEWS ENDPOINTS
// -------------------------------------------------------------------------
app.get('/api/blogs', (req: Request, res: Response) => {
  const list = db.blogs.find();
  res.json(list.filter(b => b.isActive));
});

app.get('/api/blogs/all', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  res.json(db.blogs.find());
});

app.get('/api/blogs/:id', (req: Request, res: Response) => {
  const item = db.blogs.findById(req.params.id);
  if (!item) {
    res.status(404).json({ message: 'Bloq yazısı tapılmadı.' });
    return;
  }
  res.json(item);
});

app.post('/api/blogs', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  try {
    const newItem = db.blogs.create({ ...req.body, isActive: true });
    res.status(201).json(newItem);
  } catch (err: any) {
    res.status(400).json({ message: 'Xəta' });
  }
});

app.put('/api/blogs/:id', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const updated = db.blogs.findByIdAndUpdate(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ message: 'Bloq yazısı tapılmadı.' });
    return;
  }
  res.json(updated);
});

app.delete('/api/blogs/:id', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const deleted = db.blogs.findByIdAndDelete(req.params.id);
  if (!deleted) {
    res.status(404).json({ message: 'Bloq yazısı silinə bilmədi.' });
    return;
  }
  res.json({ success: true, message: 'Silindi.' });
});

// -------------------------------------------------------------------------
// DYNAMIC SETTINGS ENDPOINTS
// -------------------------------------------------------------------------
app.get('/api/settings', (req: Request, res: Response) => {
  res.json(db.settings.get());
});

app.put('/api/settings', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  try {
    const updated = db.settings.update(req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ message: 'Xəta: ' + err.message });
  }
});

// -------------------------------------------------------------------------
// TOURISM COMPANIES ENDPOINTS
// -------------------------------------------------------------------------
app.get('/api/companies', (req: Request, res: Response) => {
  const companies = db.companies.find();
  const activeCompanies = companies.filter((c: any) => c.isActive);
  res.json(activeCompanies);
});

app.get('/api/companies/all', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  res.json(db.companies.find());
});

app.get('/api/companies/:id', (req: Request, res: Response) => {
  const company = db.companies.findById(req.params.id);
  if (!company) {
    res.status(404).json({ message: 'Axtardığınız turizm şirkəti tapılmadı.' });
    return;
  }
  res.json(company);
});

app.post('/api/companies', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  try {
    const newCompany = db.companies.create({
      ...req.body,
      isActive: true
    });
    res.status(201).json(newCompany);
  } catch (error: any) {
    res.status(400).json({ message: 'Şirkəti əlavə etmək mümkün olmadı: ' + error.message });
  }
});

app.put('/api/companies/:id', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const updated = db.companies.findByIdAndUpdate(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ message: 'Şirkət tapılmadı.' });
    return;
  }
  res.json(updated);
});

app.delete('/api/companies/:id', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const deleted = db.companies.findByIdAndDelete(req.params.id);
  if (!deleted) {
    res.status(404).json({ message: 'Şirkət silinə bilmədi.' });
    return;
  }
  res.json({ success: true, message: 'Şirkət uğurla silindi.' });
});

// -------------------------------------------------------------------------
// AI ASSISTANT CHAT ENDPOINT
// -------------------------------------------------------------------------
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  const { messages } = req.body; // array of {role: 'user'|'model', text: string}
  
  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ message: 'Mesajlar göndərilməyib.' });
    return;
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    // If apiKey is completely missing or is a mock, we return simulated localized AI answers
    if (!apiKey) {
      const lastMessage = messages[messages.length - 1]?.text || "";
      const lowerText = lastMessage.toLowerCase();
      
      let reply = "Salam! Mən sizin virtual Naxçıvan Turizm bələdçinizəm. Sizə necə kömək edə bilərəm?";
      if (lowerText.includes("şəhər") || lowerText.includes("baki") || lowerText.includes("baku")) {
        reply = "Naxçıvanda gəzməli çox gözəl yerlər var. Möminə Xatun türbəsi, Xan Sarayı, Nuh Peyğəmbər məqbərəsi və Saat Meydanı əsas görməli yerləndir. Əgər Bakı ilə müqayisə etsək, Naxçıvan daha sakit, qədim və mistik havası ilə seçilir.";
      } else if (lowerText.includes("tur") || lowerText.includes("təklif") || lowerText.includes("tour")) {
        reply = "Sizə iki möhtəşəm tur paketimiz olan 'Naxçıvanın Tarixi Şah Əsərləri' (3 günlük, 250 AZN) və ya 'Duzdağ Sağlamlıq və Təbiət Eko-Turu' (2 günlük, 180 AZN) paketlərini tövsiyə edirəm. Çox ləzzətli yeməklər və rahat nəqliyyat daxildir!";
      } else if (lowerText.includes("duz") || lowerText.includes("sağlam") || lowerText.includes("astma")) {
        reply = "Naxçıvanın məşhur Duzdağ Fizioterapiya Mərkəzi tənəffüs sistemi, xüsusən astma xəstələri üçün unikal təbii müalicə ocağıdır. Orada duz mağaralarında gecələyərək bədəninizi bərpa edə bilərsiniz. Duzdağ turumuz bu seansları təmin edir.";
      } else if (lowerText.includes("yer") || lowerText.includes("görməli") || lowerText.includes("məkan")) {
        reply = "Naxçıvanda mütləq Əlincəqalaya (Azərbaycanın Maçu Piçusu) çıxmalı, Mominə Xatun türbəsini ziyarət etməli, Şahbuz rayonunda Batabat gölünü və ordakı üzən torf adasını seyr etməli və Ordubadda qədim məhəllələri gəzməlisiniz.";
      } else if (lowerText.includes("kəh") || lowerText.includes("əshab") || lowerText.includes("ziyarət")) {
        reply = "Əshabi-Kəhf Mağarası Naxçıvanda ən müqəddəs və inanc yerlərindən biridir. Qurani-Kərimdə bəhs olunan əfsanəvi 7 gənc və onların sadiq iti Kətmirlə bağlı olan bu məkan həm yerli, həm xristian/musəlman turistlərin sevimli yeridir.";
      } else if (lowerText.includes("limon") || lowerText.includes("yemək") || lowerText.includes("qayqanaq")) {
        reply = "Naxçıvanın Ordubad limonunun qoxusu əvəzedilməzdir. Kulinariyamızda Naxçıvan qovurması, Ordubad qayqanağı, balqabaqlı qabaq aşı və şaftalı içinə doldurulmuş alana şirniyyatı mütləq dadılmalıdır!";
      } else {
        reply = "Naxçıvan qədim sivilizasiyaların beşiyidir! Sizə turlarımızı axtarmaqda, tarixi məkanları kəşf etməkdə bələdçilik etməkdən məmnun olaram. Azərbaycan və Naxçıvanın turizm potensialı haqqında istədiyiniz sualı verə bilərsiniz.";
      }

      setTimeout(() => {
        res.json({ text: reply });
      }, 300);
      return;
    }

    const { GoogleGenAI } = require('@google/genai');
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are a professional AI Travel Assistant for the Nakhchivan and Azerbaijan Tourism Platform, speaking fluent Azerbaijani. 
    Your name is 'Naxçıvan Travel AI'. 
    You MUST adhere strictly to the following rules:
    1. Only recommend tours, destinations, hotels, and food that are in Nakhchivan or general Azerbaijan.
    2. Suggest similar Azerbaijani destinations if the user asks.
    3. Answer Azerbaijani tourism related questions, recommend travel tips, and cultural highlights.
    4. Provide friendly, accurate, and welcoming answers in the Azerbaijani language as the primary interface.
    5. Mention local delicacies (Ordubad qayqanağı, alana, Naxçıvan qovurması), attractions (Duzdağ, Əlincəqala, Batabat, Möminə Xatun), and local hotels.
    6. Maintain a helpful and polite tone.`;

    const contents: any[] = [];
    messages.forEach((msg: any) => {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      });
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ message: 'Süni intellekt cavab verərkən xəta baş verdi: ' + error.message });
  }
});

// -------------------------------------------------------------------------
// Local File Upload Endpoint (Protected - Admins Only)
// Supported Formats: JPG, JPEG, PNG, WEBP, SVG, PDF
// -------------------------------------------------------------------------
app.post('/api/upload', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const { fileName, fileData } = req.body; // fileData is base64 string
  
  if (!fileData) {
    res.status(400).json({ message: 'Fayl məlumatı yüklənməyib.' });
    return;
  }

  try {
    const matches = fileData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let mimeType = '';
    let base64Buffer: Buffer;

    if (matches && matches.length === 3) {
      mimeType = matches[1];
      base64Buffer = Buffer.from(matches[2], 'base64');
    } else {
      mimeType = req.body.mimeType || 'image/jpeg';
      base64Buffer = Buffer.from(fileData, 'base64');
    }

    // Strict validation
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml', 'application/pdf'];
    if (!allowedMimeTypes.includes(mimeType)) {
      res.status(400).json({ message: 'Yalnız JPG, JPEG, PNG, WEBP, SVG və PDF formatları dəstəklənir!' });
      return;
    }

    let ext = '.jpg';
    if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') ext = '.jpg';
    else if (mimeType === 'image/png') ext = '.png';
    else if (mimeType === 'image/webp') ext = '.webp';
    else if (mimeType === 'image/svg+xml') ext = '.svg';
    else if (mimeType === 'application/pdf') ext = '.pdf';

    const cleanName = (fileName || 'fayl').replace(/[^a-zA-Z0-9_-]/g, '_');
    const finalName = `${cleanName}_${Date.now()}${ext}`;

    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    fs.writeFileSync(path.join(uploadDir, finalName), base64Buffer);

    const sizeInKb = Math.round(base64Buffer.length / 1024) + ' KB';
    
    // Categorize media automatically based on file type / name
    let cat: 'logo' | 'tour' | 'hotel' | 'place' | 'restaurant' | 'blog' | 'other' | 'document' = 'other';
    if (ext === '.pdf') cat = 'document';
    else if (cleanName.toLowerCase().includes('logo')) cat = 'logo';
    else if (cleanName.toLowerCase().includes('tur') || cleanName.toLowerCase().includes('tour')) cat = 'tour';
    else if (cleanName.toLowerCase().includes('otel') || cleanName.toLowerCase().includes('hotel')) cat = 'hotel';
    else if (cleanName.toLowerCase().includes('restoran') || cleanName.toLowerCase().includes('restaurant')) cat = 'restaurant';
    else if (cleanName.toLowerCase().includes('blog')) cat = 'blog';
    else if (cleanName.toLowerCase().includes('place') || cleanName.toLowerCase().includes('yer')) cat = 'place';

    const newMedia = (db as any).media.create({
      name: fileName || finalName,
      url: `/uploads/${finalName}`,
      category: cat,
      fileSize: sizeInKb
    });

    res.json({
      url: `/uploads/${finalName}`,
      name: finalName,
      mediaItem: newMedia
    });
  } catch (err: any) {
    console.error('File write error:', err);
    res.status(500).json({ message: 'Fayl yazılarkən xəta baş verdi: ' + err.message });
  }
});

// Centralized Media Library Endpoints
app.get('/api/media', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  try {
    const list = (db as any).media.find();
    res.json(list || []);
  } catch (err: any) {
    res.status(500).json({ message: 'Media siyahısı alınarkən xəta baş verdi: ' + err.message });
  }
});

app.delete('/api/media/:id', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const mediaItem = (db as any).media.findById(id);
    if (!mediaItem) {
      res.status(404).json({ message: 'Media faylı tapılmadı.' });
      return;
    }
    
    // If it is stored locally in /uploads/, unlink it!
    if (mediaItem.url.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), mediaItem.url.replace(/^\//, ''));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    (db as any).media.findByIdAndDelete(id);
    res.json({ message: 'Media faylı platformadan uğurla silindi.' });
  } catch (err: any) {
    res.status(500).json({ message: 'Media faylı silinərkən xəta baş verdi: ' + err.message });
  }
});

// -------------------------------------------------------------------------
// VITE DEV / PRODUCTION INTEGRATION
// -------------------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
