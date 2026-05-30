import React, { useState } from 'react';
import { Clock, Users } from 'lucide-react';
import { Tour } from '../../types';

interface TourCardProps {
  key?: any;
  tour: Tour;
  onClick: (id: string) => void;
}

export default function TourCard({ tour, onClick }: TourCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div
      onClick={() => onClick(tour.id)}
      className="bg-white rounded-2xl border-b-4 border-b-transparent hover:border-b-gold-primary border border-slate-100 shadow-sm md:shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden cursor-pointer group flex flex-col h-full"
      id={`tour-card-${tour.id}`}
    >
      {/* Top Image with Badges */}
      <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden shrink-0">
        {!imgLoaded && <div className="absolute inset-0 shimmer" />}
        <img
          src={tour.mainImage}
          alt={tour.name}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImgLoaded(true)}
          referrerPolicy="no-referrer"
          id={`tour-image-${tour.id}`}
        />

        {/* Category overlay */}
        <span className="absolute top-4 left-4 bg-navy-mid text-gold-primary text-[10px] font-bold tracking-wider uppercase px-2.5 py-1.5 rounded-lg border border-gold-primary/20">
          {tour.category}
        </span>

        {/* Duration badge overlay */}
        <span className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold flex items-center gap-1 px-2.5 py-1.5 rounded-lg">
          <Clock className="w-3 h-3 text-gold-primary" />
          {tour.duration} Gün
        </span>
      </div>

      {/* Details Box */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="font-serif text-lg font-bold text-navy-deep group-hover:text-gold-dark transition-colors line-clamp-1 leading-snug">
            {tour.name}
          </h4>
          <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
            {tour.shortDescription}
          </p>

          {/* Featured quick details */}
          <div className="flex gap-4 mt-4 text-xs text-slate-400 font-sans">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-gold-primary" />
              Qrup turları
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-gold-primary" />
              Gündəlik xidmət
            </span>
          </div>
        </div>

        {/* Price display row */}
        <div className="flex items-center justify-between border-t border-slate-100 mt-5 pt-4">
          <div>
            <p className="text-[10px] text-slate-400 font-sans uppercase tracking-wider leading-none">Paket qiyməti</p>
            <p className="text-gold-primary font-mono text-base font-bold mt-1">
              ₼ {tour.price} <span className="text-xs text-slate-500 font-sans font-normal">/ nəfər</span>
            </p>
          </div>
          <span className="text-xs font-semibold text-gold-primary group-hover:translate-x-1.5 transition-all flex items-center gap-1 font-sans">
            Ətraflı →
          </span>
        </div>
      </div>
    </div>
  );
}
