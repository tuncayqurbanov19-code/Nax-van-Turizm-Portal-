import React, { useEffect, useState } from 'react';

interface BackgroundSilhouettesProps {
  opacityOverride?: number;
}

export default function BackgroundSilhouettes({ opacityOverride }: BackgroundSilhouettesProps) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const parallaxOffset = scrollY * 0.25;

  // Let's create beautiful inline SVG path silhouettes representing Nakhchivan's iconic structures 
  return (
    <div 
      className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden" 
      aria-hidden="true"
      id="background-silhouettes-container"
    >
      {/* 1. Möminə Xatun Türbəsi - Tall tower with conical roof (dodecagonal) */}
      <svg
        className="absolute transition-transform duration-75"
        style={{
          bottom: `${100 - parallaxOffset * 0.4}px`,
          left: '5%',
          transform: 'scale(0.85)',
          opacity: opacityOverride !== undefined ? opacityOverride : 'var(--silhouette-opacity, 0.035)',
          '--silhouette-opacity': '0.035',
        } as React.CSSProperties}
        width="110"
        height="400"
        viewBox="0 0 110 400"
        fill="#0F172A"
        id="silhouette-momine-xatun"
      >
        {/* Draw the dodecagonal Möminə Xatun tower with highly stylized multi-layered geometric lines & pointed conical roof */}
        {/* Conical pointed roof top */}
        <polygon points="55,10 15,100 95,100" />
        <polygon points="55,10 35,100 75,100" fillOpacity="0.8" />
        {/* Main 12-sided tall tower body */}
        <polygon points="15,100 95,100 90,380 20,380" />
        {/* Geometric tall panels representing the vertical arch carvings */}
        <rect x="25" y="110" width="10" height="250" fillOpacity="0.4" />
        <rect x="38" y="110" width="10" height="250" fillOpacity="0.2" />
        <rect x="50" y="110" width="10" height="250" fillOpacity="0.5" />
        <rect x="62" y="110" width="10" height="250" fillOpacity="0.2" />
        <rect x="75" y="110" width="10" height="250" fillOpacity="0.4" />
        {/* Base decorative molding */}
        <rect x="15" y="375" width="80" height="15" rx="2" />
      </svg>

      {/* 2. Əlincəqala Fortress - Wide rock fortress mountain profile */}
      <svg
        className="absolute transition-transform duration-75 hidden md:block"
        style={{
          bottom: `${50 - parallaxOffset * 0.2}px`,
          right: '8%',
          transform: 'scale(1)',
          opacity: opacityOverride !== undefined ? opacityOverride : '0.03',
        }}
        width="520"
        height="220"
        viewBox="0 0 520 220"
        fill="#0F172A"
        id="silhouette-alincagala"
      >
        {/* Draw rugged mountain ridge outline with castle wall battlements on top */}
        <path d="M 10,210 
                 L 40,160 
                 L 80,170 
                 L 110,120 
                 L 130,120 L 130,105 L 140,105 L 140,120 L 150,120 L 150,105 L 160,105 L 160,120 
                 L 210,110 
                 L 240,60 
                 L 260,60 L 260,45 L 275,45 L 275,60 L 290,60 L 290,45 L 305,45 L 305,60 
                 L 350,90 
                 L 390,100 L 390,85 L 405,85 L 405,100 L 420,100 L 420,85 L 435,85 L 435,100 
                 L 480,150 
                 L 510,210 Z" />
        {/* Inner mountain ridge highlights to suggest deep volume */}
        <path d="M 240,60 L 290,110 L 320,210 L 210,210 Z" fillOpacity="0.3" />
        <path d="M 110,120 L 160,160 L 180,210 L 80,210 Z" fillOpacity="0.2" />
      </svg>

      {/* 3. Xan Sarayı - Classical palace facade with arched windows and central dome */}
      <svg
        className="absolute transition-transform duration-75"
        style={{
          top: `${350 + parallaxOffset * 0.15}px`,
          right: '5%',
          transform: 'scale(0.75)',
          opacity: opacityOverride !== undefined ? opacityOverride : '0.025',
        }}
        width="340"
        height="220"
        viewBox="0 0 340 220"
        fill="#0F172A"
        id="silhouette-xan-sarayi"
      >
        {/* Central dome */}
        <path d="M 140,80 C 140,40 200,40 200,80 Z" />
        <rect x="167" y="30" width="6" height="15" />
        {/* Side columns */}
        <rect x="20" y="80" width="300" height="130" rx="4" />
        {/* Architectural roof line trims */}
        <rect x="15" y="70" width="310" height="10" rx="1" fillOpacity="0.9" />
        {/* Arched windows row */}
        <rect x="40" y="100" width="25" height="40" rx="12" fillOpacity="0.3" />
        <rect x="80" y="100" width="25" height="40" rx="12" fillOpacity="0.3" />
        <rect x="120" y="100" width="25" height="40" rx="12" fillOpacity="0.3" />
        <rect x="160" y="95" width="25" height="50" rx="12" fillOpacity="0.5" /> {/* Larger center gate */}
        <rect x="200" y="100" width="25" height="40" rx="12" fillOpacity="0.3" />
        <rect x="240" y="100" width="25" height="40" rx="12" fillOpacity="0.3" />
        <rect x="280" y="100" width="25" height="40" rx="12" fillOpacity="0.3" />
        {/* Base layer */}
        <rect x="10" y="210" width="320" height="10" />
      </svg>

      {/* 4. Nuh Peyğəmbər Məqbərəsi - Simple regional mausoleum structure with a rounded dome */}
      <svg
        className="absolute transition-transform duration-75 hidden lg:block"
        style={{
          top: `${140 + parallaxOffset * 0.2}px`,
          left: '12%',
          transform: 'scale(0.8)',
          opacity: opacityOverride !== undefined ? opacityOverride : '0.02',
        }}
        width="210"
        height="250"
        viewBox="0 0 210 250"
        fill="#0F172A"
        id="silhouette-nuh-maqbarasi"
      >
        {/* Octagonal/square tomb body with centered prominent circular dome */}
        {/* Dome top */}
        <path d="M 50,110 C 50,50 160,50 160,110 Z" />
        <rect x="102" y="40" width="6" height="15" />
        {/* Main tomb rectangular tower block */}
        <rect x="35" y="110" width="140" height="120" rx="2" />
        {/* Arch detailing */}
        <path d="M 70,230 L 70,160 C 70,140 140,140 140,160 L 140,230 Z" fillOpacity="0.4" />
        {/* Side decorative columns */}
        <rect x="25" y="100" width="10" height="135" />
        <rect x="175" y="100" width="10" height="135" />
        <rect x="20" y="235" width="170" height="10" />
      </svg>

      {/* 5. Duzdağ Salt Mountain - Gentle rolling mountain peak profile with cave suggestions */}
      <svg
        className="absolute transition-transform duration-75"
        style={{
          bottom: `${20 - parallaxOffset * 0.15}px`,
          left: '42%',
          transform: 'translateX(-50%) scale(1.1)',
          opacity: opacityOverride !== undefined ? opacityOverride : '0.018',
        }}
        width="450"
        height="180"
        viewBox="0 0 450 180"
        fill="#0F172A"
        id="silhouette-duzdag"
      >
        {/* Rolling double hill salt-mountain skyline */}
        <path d="M 0,170 C 50,120 120,70 180,90 C 230,105 300,50 450,170 Z" />
        {/* Salt mine therapeutic cave openings */}
        <path d="M 120,150 C 120,130 150,130 150,150 Z" fillOpacity="0.5" />
        <path d="M 240,145 C 240,125 270,125 270,145 Z" fillOpacity="0.5" />
        <path d="M 320,155 C 320,138 345,138 345,155 Z" fillOpacity="0.4" />
      </svg>

      {/* Decorative Mobile Optimized Grid to make backgrounds elegant with raw SVG styling details on outer edges */}
      <div className="absolute inset-0 border border-gold-primary/5 pointer-events-none m-4 md:m-8 lg:m-12 select-none" />
    </div>
  );
}
