import React, { useEffect, useState } from 'react';
import { ArrowLeft, MapPin, Calendar, Clock, Landmark, MessageSquare, Send, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Place, Comment } from '../types';
import StarRating from '../components/ui/StarRating';

interface PlaceDetailProps {
  placeId: string;
  onNavigate: (path: string) => void;
}

export default function PlaceDetail({ placeId, onNavigate }: PlaceDetailProps) {
  const [place, setPlace] = useState<Place | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { success, error } = useToast();

  // Review states
  const [newCommentRating, setNewCommentRating] = useState(5);
  const [newCommentText, setNewCommentText] = useState('');
  const [commentingLoading, setCommentingLoading] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const data = await api.places.getDetail(placeId);
      setPlace(data);
      if (data) {
        const reviews = await api.comments.getByPlace(placeId);
        setComments(reviews || []);
      }
    } catch (e: any) {
      error(e.message || 'Məkan tapılmadı.');
      onNavigate('/places');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [placeId]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      error('Rəy bildirmək üçün lütfən daxil olun.', 'Sessiya tələb olunur');
      return;
    }

    if (!newCommentText.trim()) {
      error('Rəy mətni boş qala bilməz.');
      return;
    }

    try {
      setCommentingLoading(true);
      const res = await api.comments.create({
        placeId,
        userName: user.fullName,
        rating: newCommentRating,
        text: newCommentText
      });

      if (res && res.id) {
        success('Rəyiniz uğurla əlavə edildi!');
        setNewCommentText('');
        setNewCommentRating(5);
        // Refresh local review lists
        const updated = await api.comments.getByPlace(placeId);
        setComments(updated || []);
      }
    } catch (e: any) {
      error(e.message || 'Rəy əlavə edilərkən xəta yarandı.');
    } finally {
      setCommentingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-16 flex justify-center items-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <span className="w-12 h-12 border-4 border-gold-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-sans text-sm animate-pulse">Zəhmət olmasa gözləyin, tarixi məkan yüklənir...</p>
        </div>
      </div>
    );
  }

  if (!place) return null;

  return (
    <div className="min-h-screen pb-24 relative z-10" id="place-detail-page">
      
      {/* 1. Large Hero Header Cover with Category badges */}
      <div className="relative w-full h-[480px] bg-navy-deep">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: `url("${place.images[0]}")` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/40 to-black/35" />

        {/* Header container */}
        <div className="absolute inset-x-0 inset-y-0 flex flex-col justify-between max-w-7xl mx-auto px-4 md:px-12 py-8 relative">
          
          <button
            onClick={() => onNavigate('/places')}
            className="w-fit flex items-center gap-2 bg-navy-deep/85 text-white rounded-xl px-4 py-2 border border-white/10 hover:border-gold-primary transition-all text-xs font-sans font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Məkanlara Qayıt
          </button>

          <div id="place-cover-details" className="mb-4">
            <span className="bg-gold-primary text-navy-deep text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg">
              {place.category}
            </span>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mt-4 max-w-4xl tracking-tight leading-tight">
              {place.name}
            </h1>
            <p className="text-sm md:text-base text-slate-300 font-sans mt-3 max-w-2xl leading-relaxed">
              Tarixi Dövrü: {place.historicalPeriod}
            </p>
          </div>

        </div>
      </div>

      {/* Main split details content layout */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-10 mt-12">
        
        {/* Left main columns: Rich history and reviews (65%) */}
        <div className="lg:col-span-8 flex flex-col gap-8" id="place-left-column">
          
          {/* Detailed rich text history section */}
          <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-3xl shadow-md">
            <h3 className="font-serif text-xl font-bold text-navy-deep border-b border-slate-100 pb-3 mb-6 select-none flex items-center gap-2">
              <Landmark className="w-5 h-5 text-gold-primary" />
              Tarixi Məlumat
            </h3>
            <p className="text-sm md:text-base text-slate-600 font-sans leading-relaxed text-balance">
              {place.description}
            </p>
          </div>

          {/* Photo gallery preview thumbnails of this place */}
          {place.images.length > 1 && (
            <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-3xl shadow-md">
              <h3 className="font-serif text-lg font-bold text-navy-deep mb-4 select-none">Məkanın digər şəkilləri</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {place.images.map((photo, index) => (
                  <div key={index} className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-50 border">
                    <img src={photo} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments and Reviews Feed Engine widget */}
          <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-3xl shadow-md flex flex-col gap-6" id="place-comments-box">
            <h3 className="font-serif text-xl font-bold text-navy-deep border-b border-slate-100 pb-3 mb-2 flex items-center gap-2 select-none">
              <MessageSquare className="w-5 h-5 text-gold-primary" />
              Ziyarətçi Rəyləri ({comments.length})
            </h3>

            {/* List of comments */}
            <div className="flex flex-col gap-4">
              {comments.length === 0 ? (
                <p className="text-sm text-slate-400 font-sans italic py-4 select-none">Bu məkan haqqında hələ rəy yazılmayıb. İlk yazan siz olun!</p>
              ) : (
                comments.map((comm) => (
                  <div key={comm.id} className="bg-slate-50 border border-slate-100 p-5 rounded-2xl flex flex-col gap-2 font-sans hover:bg-slate-100/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-navy-deep text-sm">{comm.userName}</h4>
                      <StarRating rating={comm.rating} size={12} />
                    </div>
                    <p className="text-xs text-slate-500 leading-normal">{comm.text}</p>
                    <span className="text-[9px] text-slate-400 font-mono text-left self-start">{new Date(comm.createdAt).toLocaleDateString('az-AZ')}</span>
                  </div>
                ))
              )}
            </div>

            {/* Add Review Form */}
            {user ? (
              <form onSubmit={handleCommentSubmit} className="border-t border-slate-100 pt-6 mt-2 flex flex-col gap-4 font-sans">
                <h4 className="text-sm font-bold text-slate-700 flex items-center gap-1.5 select-none">
                  <Sparkles className="w-4 h-4 text-gold-primary" />
                  Təəssüratınızı bölüşün
                </h4>
                
                {/* Star level rate selector */}
                <div className="flex items-center gap-4 select-none">
                  <span className="text-xs text-slate-500 font-medium">Qiymətləndirin:</span>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((starIdx) => (
                      <button
                        key={starIdx}
                        type="button"
                        onClick={() => setNewCommentRating(starIdx)}
                        className={`text-lg transition-transform focus:outline-none hover:scale-110 cursor-pointer ${
                          starIdx <= newCommentRating ? 'text-gold-primary' : 'text-slate-200'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    rows={4}
                    required
                    placeholder="Məkan haqqında fikirlərinizi yazın, digər turistlərə faydalı olsun..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-205 rounded-2xl text-sm focus:outline-none focus:border-gold-primary leading-relaxed font-sans"
                  />
                </div>

                <button
                  type="submit"
                  disabled={commentingLoading}
                  className="w-fit bg-gold-primary hover:bg-gold-dark text-navy-deep font-sans font-bold py-3 px-6 rounded-xl text-xs transition-all flex items-center gap-2 active:scale-97 self-end cursor-pointer"
                >
                  {commentingLoading ? 'Göndərilir...' : 'Rəyi Göndər'}
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <div className="bg-amber-50 border border-amber-250 p-4 rounded-2xl flex items-start gap-3 mt-4 text-left select-none">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-800">Qeydiyyat Məhdudiyyəti</p>
                  <p className="text-[10px] text-amber-600 mt-1 leading-normal">
                    Tarixi abidə haqqında rəsmi şəxsi rəyinizi, hekayənizi yazmaq və ulduz vermək üçün lütfən portala daxil olun.
                  </p>
                  <button
                    onClick={() => onNavigate('/login')}
                    className="text-xs font-bold text-gold-primary hover:text-gold-dark mt-3 block cursor-pointer"
                  >
                    Giriş edin →
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Right side specifications details sidebar (35%) */}
        <div className="lg:col-span-4 select-none">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-md flex flex-col gap-5 sticky top-24 z-10 border-t-4 border-t-gold-primary">
            
            <h3 className="font-serif text-lg font-bold text-navy-deep border-b border-slate-100 pb-3 mb-1">
              Giriş Məlumatları
            </h3>

            <div className="flex flex-col gap-4 font-sans text-xs">
              
              {/* Working hours spec */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gold-primary/10 text-gold-primary flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-slate-400">Ziyarət Saatları</h4>
                  <p className="font-bold text-navy-deep text-sm mt-0.5">{place.workingHours}</p>
                </div>
              </div>

              {/* Ticket pricing value */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gold-primary/10 text-gold-primary flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-slate-400">Giriş Bileti</h4>
                  <p className="font-bold text-navy-deep text-sm mt-0.5">{place.entryFee}</p>
                </div>
              </div>

              {/* Architectural Epoch/Era */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gold-primary/10 text-gold-primary flex items-center justify-center shrink-0">
                  <Landmark className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-slate-400">Tarixi Epoch</h4>
                  <p className="font-bold text-navy-deep text-sm mt-0.5">{place.historicalPeriod}</p>
                </div>
              </div>

              {/* Region geographic info */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gold-primary/10 text-gold-primary flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-slate-400">Yerləşdiyi Unikal Ərazi</h4>
                  <p className="font-bold text-navy-deep text-sm mt-0.5">Naxçıvan Muxtar Respublikası</p>
                </div>
              </div>

            </div>

            <hr className="border-slate-100" />

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
              <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                Təşkil etdiyimiz unikal turlar çərçivəsində bələdçimiz və nəqliyyatımız sizi birbaşa ünvandan götürəcəkdir.
              </p>
              <button
                onClick={() => onNavigate('/tours')}
                className="mt-4 w-full bg-navy-mid text-gold-primary hover:bg-navy-deep font-bold font-sans py-2.5 rounded-xl text-xs transition-all cursor-pointer"
              >
                Turlara İndi Bax
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
