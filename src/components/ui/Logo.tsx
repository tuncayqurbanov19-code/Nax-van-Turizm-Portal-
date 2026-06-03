import React, { useEffect, useState } from 'react';
import { Compass } from 'lucide-react';
import { SettingsSchema } from '../../types';
import { api } from '../../services/api';

interface LogoProps {
  settings?: SettingsSchema | null;
  forceLight?: boolean;
  forceDark?: boolean;
  
  // High-fidelity local custom overrides for live settings preview in the Admin Panel
  customLogoVariant?: 'variant1' | 'variant2' | 'variant3';
  customLogoText?: string;
  customFontSize?: number;
  customFontWeight?: string;
  customFontFamily?: string;
  customTextColor?: string;
  customAccentColor?: string;
  customSubtitle?: string;
}

export default function Logo({
  settings: propSettings,
  forceLight = false,
  forceDark = false,
  customLogoVariant,
  customLogoText,
  customFontSize,
  customFontWeight,
  customFontFamily,
  customTextColor,
  customAccentColor,
  customSubtitle
}: LogoProps) {
  const [internalSettings, setInternalSettings] = useState<SettingsSchema | null>(null);

  // Fetch settings internally if not provided as a prop
  useEffect(() => {
    if (!propSettings) {
      api.settings.get()
        .then(res => setInternalSettings(res))
        .catch(err => console.error('Error fetching settings for logo:', err));
    }
  }, [propSettings]);

  const activeSettings = propSettings || internalSettings;
  const logoSettings = activeSettings?.logoSettings;

  // Resolve values (prioritize custom preview overrides, then db settings, then absolute fallbacks)
  const variant = customLogoVariant || logoSettings?.logoVariant || 'variant2';
  const logoText = customLogoText !== undefined ? customLogoText : (logoSettings?.logoText || 'NAXÇIVAN');
  const fontSize = customFontSize !== undefined ? customFontSize : (logoSettings?.logoFontSize || 26);
  const fontWeight = customFontWeight !== undefined ? customFontWeight : (logoSettings?.logoFontWeight || 'font-black');
  const fontFamily = customFontFamily !== undefined ? customFontFamily : (logoSettings?.logoFontFamily || 'Space Grotesk');
  
  const originalTextColor = customTextColor !== undefined ? customTextColor : (logoSettings?.logoTextColor || '#0F172A');
  const originalAccentColor = customAccentColor !== undefined ? customAccentColor : (logoSettings?.logoAccentColor || '#F59E0B');
  const subtitle = customSubtitle !== undefined ? customSubtitle : (logoSettings?.logoSubtitle || '');

  // Smart background color contrast adjustments for the Text Logo
  // Header and Footer are primarily very dark Navy blue (#090D16, #111A2E) in the design, while some fields (like printed login page or admin forms) are white.
  // Hence, when forceLight is active, or if the layout requires light text on dark backgrounds, we intelligently override the slate/primary color.
  let primaryColorResolved = originalTextColor;
  let accentColorResolved = originalAccentColor;

  if (forceLight) {
    primaryColorResolved = '#FFFFFF';
  } else if (forceDark) {
    primaryColorResolved = '#0F172A';
  }

  // Load selected Google Font dynamically on demand
  useEffect(() => {
    if (!fontFamily) return;
    const fontId = `google-font-${fontFamily.replace(/\s+/g, '-').toLowerCase()}`;
    if (document.getElementById(fontId)) return;
    
    const link = document.createElement('link');
    link.id = fontId;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@300;400;500;600;700;800;900&display=swap`;
    document.head.appendChild(link);
  }, [fontFamily]);

  // If Logo is Variant 3 (Premium Text Logo Only)
  if (variant === 'variant3') {
    // Generate styled branding text. Inspired by Booking.com, Airbnb, Expedia styling.
    // Clean styling with custom highlighted letters or colors.
    // For luxurious brand name, we split the text or highlight the first/last characters, 
    // or keep the whole core in primaryColor with a sleek accent colored dot, and accent subtitle below.
    return (
      <div className="flex flex-col text-left leading-tight tracking-[0.03em] select-none" id="premium-text-logo">
        <div className="flex items-baseline gap-0.5">
          <span 
            style={{ 
              fontFamily: `"${fontFamily}", var(--font-sans), sans-serif`,
              fontSize: `${fontSize}px`,
              color: primaryColorResolved,
            }}
            className={`font-sans tracking-tight leading-none uppercase ${fontWeight} transition-all duration-300`}
          >
            {logoText}
          </span>
          <span 
            style={{ 
              fontSize: `${Math.max(fontSize * 0.45, 12)}px`,
              color: accentColorResolved,
            }}
            className="font-black leading-none animate-pulse"
          >
            ●
          </span>
        </div>
        {subtitle && (
          <span 
            style={{ 
              color: forceLight ? '#94A3B8' : '#64748B',
              letterSpacing: '0.28em',
              fontSize: `${Math.max(fontSize * 0.3, 8)}px`
            }}
            className="font-mono uppercase text-[9px] font-bold tracking-widest mt-0.5 leading-none"
          >
            {subtitle}
          </span>
        )}
      </div>
    );
  }

  // Fallbacks for Image-based Variant 1 & Variant 2 logos
  const siteTitle = activeSettings?.headerFooter?.headerTitle || 'NAXÇIVAN';
  const logoUrl = forceLight ? (logoSettings?.logoLightUrl || logoSettings?.logoMobileUrl || '') : (logoSettings?.logoDarkUrl || logoSettings?.logoLightUrl || '');
  
  if (logoUrl) {
    return (
      <img 
        src={logoUrl} 
        alt="Travel Platform Logo" 
        style={{ 
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain'
        }} 
        className="transition-opacity duration-300 filter"
        referrerPolicy="no-referrer"
      />
    );
  }

  // Double fallback if logoUrl doesn't exist either
  return (
    <div className="flex items-center gap-2 select-none group">
      <div className="relative w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-tr from-amber-500/10 to-amber-500/30 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)] group-hover:scale-105 transition-all mr-1">
        <Compass className="w-5 h-5 text-gold-primary" />
        <div className="absolute inset-0 border border-dashed border-gold-primary/30 rounded-full animate-[spin_40s_linear_infinite]" />
      </div>
      <div className="flex flex-col text-left leading-none">
        <span className="text-base md:text-lg font-serif font-black tracking-[0.16em] text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-450 to-amber-550 uppercase">
          {siteTitle}
        </span>
        <span className="text-[8px] font-mono tracking-[0.28em] text-slate-400 font-bold uppercase mt-0.5">
          PREMIUM TRAVELS
        </span>
      </div>
    </div>
  );
}
