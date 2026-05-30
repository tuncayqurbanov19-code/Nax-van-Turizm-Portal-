import React, { useState } from 'react';
import { MapPin, ArrowRight } from 'lucide-react';
import StarRating from './StarRating';
import { Hotel } from '../../types';

interface HotelCardProps {
  key?: any;
  hotel: Hotel;
  onClick: (id: string) => void;
}

export default function HotelCard({ hotel, onClick }: HotelCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);

  // Find lowest price
  const basePrice = hotel.rooms.length > 0 
    ? Math.min(...hotel.rooms.map(r => r.price)) 
    : 100;

  return (
    <div
      onClick={() => onClick(hotel.id)}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm md:shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden cursor-pointer group flex flex-col h-full"
      id={`hotel-card-${hotel.id}`}
    >
      {/* Cover Image Wrapper */}
      <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden shrink-0">
        {!imgLoaded && <div className="absolute inset-0 shimmer" />}
        <img
          src={hotel.images[0]}
          alt={hotel.name}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImgLoaded(true)}
          referrerPolicy="no-referrer"
          id={`hotel-image-${hotel.id}`}
        />

        {/* Stars overlay on Left corner */}
        <div className="absolute top-4 left-4 bg-navy-deep/80 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-white/5">
          <StarRating rating={hotel.stars} size={13} />
        </div>
      </div>

      {/* Body Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start gap-1 justify-between">
            <h4 className="font-serif text-lg font-bold text-navy-deep group-hover:text-gold-dark transition-colors line-clamp-1 leading-snug">
              {hotel.name}
            </h4>
          </div>
          
          <div className="flex items-center gap-1.5 text-slate-500 mt-1.5 text-xs font-sans">
            <MapPin className="w-3.5 h-3.5 text-gold-primary shrink-0" />
            <span className="truncate">{hotel.address}</span>
          </div>

          {/* Quick lists of amenities as badge labels */}
          <div className="flex flex-wrap gap-1.5 mt-4">
            {hotel.amenities.slice(0, 4).map((a, i) => (
              <span 
                key={i} 
                className="bg-slate-50 border border-slate-100 text-slate-500 text-[10px] font-sans px-2 py-0.5 rounded-md"
              >
                {a}
              </span>
            ))}
            {hotel.amenities.length > 4 && (
              <span className="bg-slate-50 border border-slate-100 text-slate-400 text-[10px] font-sans px-1.5 py-0.5 rounded-md">
                +{hotel.amenities.length - 4}
              </span>
            )}
          </div>
        </div>

        {/* Bottom Booking row */}
        <div className="flex items-center justify-between border-t border-slate-100 mt-5 pt-4">
          <div>
            <p className="text-[10px] text-slate-400 font-sans uppercase tracking-wider leading-none">Gecəlik qiymət</p>
            <p className="text-gold-primary font-mono text-base font-bold mt-1">
              ₼ {basePrice} <span className="text-xs text-slate-500 font-sans font-normal">/ gecə</span>
            </p>
          </div>
          <button
            className="flex items-center gap-2 bg-slate-50 hover:bg-gold-primary hover:text-navy-deep text-navy-deep border border-slate-100 hover:border-gold-primary group-hover:bg-gold-primary group-hover:text-navy-deep group-hover:border-gold-primary font-sans font-semibold text-xs py-2 px-4 rounded-xl transition-all h-9 cursor-pointer"
          >
            Ətraflı
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
