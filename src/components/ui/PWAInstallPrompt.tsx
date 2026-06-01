import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Laptop } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if the app is already running in standalone mode (installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone 
      || document.referrer.includes('android-app://');
    
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Show the install promotion bar after a small delay
      const wasDismissed = localStorage.getItem('pwa-installed-prompt-dismissed');
      if (!wasDismissed) {
        setTimeout(() => setIsVisible(true), 4000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If it's iOS and not standalone, we can show iOS install instructions of Android/iOS app variant
    if (isIosDevice) {
      const wasDismissed = localStorage.getItem('pwa-installed-prompt-dismissed');
      if (!wasDismissed) {
        setTimeout(() => setIsVisible(true), 6000);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    // We've used the prompt, and can't use it again
    setDeferredPrompt(null);
    setIsVisible(false);
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Don't disturb user for next 7 days
    localStorage.setItem('pwa-installed-prompt-dismissed', 'true');
  };

  if (isInstalled || !isVisible) return null;

  return (
    <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-8 z-50 p-0 animate-fadeIn font-sans max-w-sm w-auto">
      <div className="bg-gradient-to-br from-navy-deep to-navy-mid border-2 border-gold-primary/30 text-white rounded-2.5xl p-5 shadow-[0_15px_30px_rgba(11,21,40,0.5)] relative overflow-hidden backdrop-blur-md">
        {/* Glow decoration */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-gold-primary/10 rounded-full blur-xl" />
        
        {/* Dismiss Button */}
        <button 
          onClick={handleDismiss}
          className="absolute top-3.5 right-3.5 text-slate-400 hover:text-white transition-colors cursor-pointer p-1 rounded-full hover:bg-white/5"
          id="pwa-close-btn"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4 pr-4">
          <div className="bg-gold-primary/15 border border-gold-primary/30 p-2.5 rounded-2xl shrink-0 text-gold-primary animate-pulse">
            <Smartphone className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h4 className="font-serif font-black text-sm text-gold-primary tracking-wide">Mobil Tətbiqi Yüklə!</h4>
            <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
              {isIOS 
                ? "Naxçıvan Portalını mobil proqram kimi yükləyin: Safari brauzerində 'Paylaş' (Share) düyməsinə klikləyib 'Ana ekrana əlavə et' (Add to Home Screen) seçin."
                : "Portalımız artıq Android platformasını tam dəstəkləyir! İndi bir kliklə rəsmi mobil tətbiqimizi telefonunuza quraşdırın."
              }
            </p>
            
            {!isIOS && (
              <button
                onClick={handleInstallClick}
                className="mt-3.5 bg-gold-primary hover:bg-gold-primary/95 text-navy-deep font-sans font-black text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-98 cursor-pointer border border-gold-primary"
              >
                <Download className="w-3.5 h-3.5" /> İndi Quraşdır (Mobil App)
              </button>
            )}

            {isIOS && (
              <div className="mt-2 text-[10px] text-amber-500 font-bold flex items-center gap-1">
                🌟 Tam pulsuz rəsmi mobil versiya
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
