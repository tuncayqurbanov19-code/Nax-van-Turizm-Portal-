import React, { useState } from 'react';
import { Compass, MapPin } from 'lucide-react';
import { Place } from '../../types';

interface PlaceCardProps {
  key?: any;
  place: Place;
  onClick: (id: string) => void;
}

export default function PlaceCard({ place, onClick }: PlaceCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div
      onClick={() => onClick(place.id)}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm md:shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden cursor-pointer group flex flex-col h-full"
      id={`place-card-${place.id}`}
    >
      {/* Visual Cover Header */}
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden shrink-0">
        {!imgLoaded && (
          <div className="absolute inset-0 shimmer" />
        )}
        <img
          src={place.images[0]}
          alt={place.name}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImgLoaded(true)}
          referrerPolicy="no-referrer"
          id={`place-image-${place.id}`}
        />

        {/* Category Badge overlay on Left */}
        <span className="absolute top-4 left-4 bg-navy-deep/85 backdrop-blur-sm text-gold-primary text-xs font-semibold px-3 py-1.5 rounded-full border border-gold-primary/20">
          {place.category}
        </span>
      </div>

      {/* Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="font-serif text-lg font-bold text-navy-deep group-hover:text-gold-dark transition-colors line-clamp-1 leading-snug">
            {place.name}
          </h4>
          <p className="text-xs text-slate-400 font-sans mt-1">
            {place.historicalPeriod}
          </p>
          <p className="text-xs text-slate-500 font-sans mt-3 line-clamp-2 leading-relaxed">
            {place.description}
          </p>
        </div>

        {/* Footer row details */}
        <div className="flex items-center justify-between border-t border-slate-100 mt-4 pt-3 text-xs font-sans">
          <div className="flex items-center gap-1.5 text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-gold-primary" />
            <span className="truncate max-w-[120px]">Naxçıvan</span>
          </div>
          <span className="text-gold-primary font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
            Ətraflı Bax →
          </span>
        </div>
      </div>
    </div>
  );
}
