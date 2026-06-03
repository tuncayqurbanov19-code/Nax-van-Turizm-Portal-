import React, { useEffect, useState } from 'react';
import { Mail, Phone, MapPin, Send, HelpCircle, Heart } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../components/ui/Toast';

interface ContactProps {
  onNavigate: (path: string) => void;
}

export default function Contact({ onNavigate }: ContactProps) {
  const [bgUrl, setBgUrl] = useState('https://images.unsplash.com/photo-1423666639041-f56000c27a9a?q=80&w=1920');
  const { success, error } = useToast();

  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formMsg, setFormMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadBg() {
      try {
        const cfg = await api.settings.get();
        if (cfg?.backgroundSettings?.contactUrl) {
          setBgUrl(cfg.backgroundSettings.contactUrl);
        }
      } catch (e) {
        // Fallback
      }
    }
    loadBg();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !formMsg.trim()) {
      error("Zəhmət olmasa bütün sahələri doldurun.");
      return;
    }
    try {
      setSubmitting(true);
      // Simulate submission
      await new Promise(r => setTimeout(r, 600));
      success("Mesajınız rəsmi olaraq qəbul edildi! Əməkdaşlarımız 24 saat daxilində sizinlə əlaqə saxlayacaqlar.");
      setFormName('');
      setFormEmail('');
      setFormMsg('');
    } catch {
      error("Mesaj göndərilən zaman xəta baş verdi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-16 relative z-10 max-w-7xl mx-auto px-4 md:px-12 font-sans antialiased" id="contact-page">
      
      {/* Dynamic Header Banner */}
      <div className="relative overflow-hidden rounded-3xl min-h-[220px] md:min-h-[280px] p-8 md:p-12 mb-10 flex flex-col justify-center text-white select-none shadow-xl border border-white/10" id="contact-banner">
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-700 hover:scale-[1.01]" 
            style={{ backgroundImage: `url("${bgUrl}")` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/95 via-navy-deep/80 to-navy-mid/45 backdrop-blur-[1px]" />
        </div>
        
        <div className="relative z-10 text-left max-w-2xl">
          <span className="bg-gold-primary/20 text-gold-primary border border-gold-primary/30 text-[10px] font-black tracking-widest px-3 py-1.5 rounded-full uppercase">
            Sualınız Var? Bizə Yazın
          </span>
          <h1 className="text-3xl md:text-5xl font-serif font-black text-white mt-3 leading-tight drop-shadow-md">Bizimlə Əlaqə & Dəstək</h1>
          <p className="text-xs md:text-sm text-slate-200 mt-2.5 leading-relaxed">
            Bizə sual verin, turlar barədə sorğu göndərin və ya fərdi səyahət xidmətləri ilə maraqlanın. Onlayn köməkçi komandamız hər an yanınızdadır.
          </p>
        </div>
      </div>

      {/* Grid: Left address cards, Right contact form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 text-left">
        
        {/* Left Side detail cards */}
        <div className="lg:col-span-5 flex flex-col gap-6 font-sans">
          <h3 className="font-serif font-bold text-navy-deep text-lg select-none">Rəsmi Əlaqə Kanalları</h3>
          
          <div className="bg-white border rounded-2xl p-5 flex items-start gap-4">
            <Phone className="w-5 h-5 text-gold-primary shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-navy-deep text-xs uppercase tracking-wider">Çağrı Mərkəzi</h4>
              <p className="text-sm font-semibold text-slate-700 mt-1">+994 (60) 123-4567</p>
              <p className="text-[10px] text-slate-400 mt-0.5">7/24 fəal fərdi turlar şöbəsi</p>
            </div>
          </div>

          <div className="bg-white border rounded-2xl p-5 flex items-start gap-4">
            <Mail className="w-5 h-5 text-gold-primary shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-navy-deep text-xs uppercase tracking-wider">E-Poçt Ünvanı</h4>
              <p className="text-sm font-semibold text-slate-700 mt-1">support@visitnaxcivan.az</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Bütün rəsmi tərəfdaşlıq təklifləri üçün</p>
            </div>
          </div>

          <div className="bg-white border rounded-2xl p-5 flex items-start gap-4">
            <MapPin className="w-5 h-5 text-gold-primary shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-navy-deep text-xs uppercase tracking-wider">Rəsmi Ofis</h4>
              <p className="text-sm font-semibold text-slate-700 mt-1">Naxçıvan şəhəri, Heydər Əliyev prospekti 12.</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Qonaqların üzbəüz qəbulu şöbəsi</p>
            </div>
          </div>

          {/* FAQ prompt block */}
          <div className="bg-gold-primary/5 border border-gold-primary/20 rounded-3xl p-6.5 mt-2 flex items-start gap-4 select-none">
            <HelpCircle className="w-5 h-5 text-gold-primary shrink-0 mt-0.5" />
            <div>
              <h4 className="font-serif font-bold text-navy-deep text-xs uppercase tracking-wider">Tez-Tez Soruşulanlar</h4>
              <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                Turların rezervasiyası zamanı ödənişlər tam təhlükəsiz şəkildə rəqəmsal bank kanalları vasitəsilə həyata keçirilir. İstənilən ləğvetmə turlar başlamazdan 48 saat əvvələ qədər ödənişsizdir.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side Input form */}
        <div className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm">
          <h3 className="font-serif font-bold text-navy-deep text-lg mb-6 text-left select-none">Yazılı Sorğu Göndərin</h3>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-xs">
            <div className="flex flex-col md:flex-row gap-4 font-sans">
              <div className="flex-1 flex flex-col gap-1.5 text-left">
                <label className="font-bold text-slate-700">Tam Adınız:</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Məsələn: İlqar Məmmədov"
                  className="w-full bg-slate-50 border p-3 rounded-xl focus:outline-none focus:border-gold-primary focus:bg-white text-xs text-slate-650"
                />
              </div>
              <div className="flex-1 flex flex-col gap-1.5 text-left">
                <label className="font-bold text-slate-700">E-Poçtunuz:</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="ornek@domain.com"
                  className="w-full bg-slate-50 border p-3 rounded-xl focus:outline-none focus:border-gold-primary focus:bg-white text-xs text-slate-650"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 text-left font-sans">
              <label className="font-bold text-slate-700">Sualınız və ya Mesajınız:</label>
              <textarea
                value={formMsg}
                onChange={(e) => setFormMsg(e.target.value)}
                rows={5}
                placeholder="Naxçıvana səyahətiniz, turlarımız və ya otellər barədə sualınızı daxil edin..."
                className="w-full bg-slate-50 border p-3 rounded-xl focus:outline-none focus:border-gold-primary focus:bg-white text-xs text-slate-650 resize-none leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 w-full bg-navy-deep hover:bg-gold-primary hover:text-navy-deep text-gold-primary font-bold py-3.5 rounded-xl transition-all font-sans text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {submitting ? "Göndərilir..." : "Sorğunu Rəsmən Göndər"}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
