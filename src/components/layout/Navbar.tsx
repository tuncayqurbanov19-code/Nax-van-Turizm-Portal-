import React, { useState, useEffect } from 'react';
import { Menu, X, Landmark, Compass, User as UserIcon, ShieldAlert, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { SettingsSchema } from '../../types';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export default function Navbar({ currentPath, onNavigate }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const [settings, setSettings] = useState<SettingsSchema | null>(null);

  useEffect(() => {
    api.settings.get()
      .then(res => setSettings(res))
      .catch(err => console.error('Error loading navbar branding:', err));
  }, [currentPath]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Ana Səhifə', path: '/' },
    { name: 'Turlar', path: '/tours' },
    { name: 'Otellər', path: '/hotels' },
    { name: 'Tarixi Yerlər', path: '/places' }
  ];

  const handleLinkClick = (path: string) => {
    onNavigate(path);
    setIsDrawerOpen(false);
  };

  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const logoVariant = settings?.logoSettings?.logoVariant || 'variant2';
  const logoUrl = settings?.logoSettings?.logoLightUrl || '';
  const currentLogo = (windowWidth < 768 && settings?.logoSettings?.logoMobileUrl)
    ? settings?.logoSettings?.logoMobileUrl
    : (settings?.logoSettings?.logoLightUrl || logoUrl);

  const logoWidth = windowWidth < 768
    ? (settings?.logoSettings?.mobileWidth || settings?.logoSettings?.logoWidth || 120)
    : (settings?.logoSettings?.desktopWidth || settings?.logoSettings?.logoWidth || 150);

  const logoHeight = windowWidth < 768
    ? (settings?.logoSettings?.mobileHeight || settings?.logoSettings?.logoHeight || 30)
    : (settings?.logoSettings?.desktopHeight || settings?.logoSettings?.logoHeight || 40);

  const posX = settings?.logoSettings?.logoPositionX || 0;
  const posY = settings?.logoSettings?.logoPositionY || 0;
  const siteTitle = settings?.headerFooter?.headerTitle || 'NAXÇIVAN';

  const isVariant1 = logoVariant === 'variant1' && windowWidth >= 1024;

  return (
    <>
      <nav 
        id="main-navbar"
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-305 flex px-4 md:px-12 ${
          isScrolled 
            ? 'bg-navy-deep shadow-lg backdrop-blur-md border-b border-white/[0.05]' 
            : 'bg-navy-deep/40 backdrop-blur-[2px]'
        } ${
          isVariant1 
            ? 'min-h-[140px] md:min-h-[170px] py-4 flex-col justify-center' 
            : 'h-20 items-center'
        }`}
      >
        {isVariant1 ? (
          /* VARIANT 1: Large Centered or Wide Logo layout on Top Row, Navigation items on Bottom Row */
          <div className="w-full max-w-7xl mx-auto flex flex-col justify-center items-center gap-3">
            {/* Row 1: Large Center Format Logo */}
            <div 
              onClick={() => handleLinkClick('/')}
              className="flex items-center justify-center cursor-pointer shrink-0 group select-none hover:opacity-95 transition-opacity"
              id="navbar-logo"
              style={{ transform: `translate(${posX}px, ${posY}px)` }}
            >
              {currentLogo ? (
                <img 
                  src={currentLogo} 
                  alt="Website Logo" 
                  style={{ width: `${logoWidth}px`, height: `${logoHeight}px` }} 
                  className="object-contain"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <>
                  <div className="w-9 h-9 bg-gold-primary/20 hover:scale-105 active:scale-95 text-gold-primary flex items-center justify-center rounded-lg border border-gold-primary/30 transition-all mr-2">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.82 0 3.53-.49 5-1.35-1.85-.3-3.51-1.15-4.82-2.46-1.74-1.74-2.68-4.07-2.68-6.54 0-2.43.91-4.73 2.57-6.4 1.34-1.35 3.03-2.22 4.93-2.5C15.53 2.49 13.82 2 12 2zm3.5 6c.28 0 .5.22.5.5s-.22.5-.5.5-.5-.22-.5-.5.22-.5.5-.5zm2.5 2c.28 0 .5.22.5.5s-.22.5-.5.5-.5-.22-.5-.5.22-.5.5-.5zm-1 3.5c.28 0 .5.22.5.5s-.22.5-.5.5-.5-.22-.5-.5.22-.5.5-.5z" />
                    </svg>
                  </div>
                  <span className="text-xl md:text-2xl font-serif tracking-widest font-bold text-gold-primary group-hover:text-gold-dark transition-colors">
                    {siteTitle}
                  </span>
                </>
              )}
            </div>

            {/* Row 2: Separated aligned Navigation Elements */}
            <div className="w-full flex items-center justify-between border-t border-white/[0.08] pt-2 w-full">
              {/* Left Side: Navigation Links */}
              <div className="flex items-center gap-8 text-sm" id="desktop-nav-menu">
                {navLinks.map((link) => {
                  const active = currentPath === link.path;
                  return (
                    <button
                      key={link.path}
                      onClick={() => handleLinkClick(link.path)}
                      className={`relative font-sans text-xs uppercase font-bold tracking-widest py-1.5 transition-colors cursor-pointer ${
                        active ? 'text-gold-primary' : 'text-slate-200 hover:text-white'
                      }`}
                    >
                      {link.name}
                      {active && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-primary rounded-full animate-fadeIn" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Right Side: Identity Controls */}
              <div className="flex items-center gap-4 text-sm" id="desktop-user-actions">
                {user ? (
                  <div className="flex items-center gap-3">
                    {isAdmin && (
                      <button
                        onClick={() => handleLinkClick('/admin-panel-x72k')}
                        className="flex items-center gap-2 bg-gold-primary/15 border border-gold-primary/40 text-gold-primary font-semibold hover:bg-gold-primary/35 px-3 py-1.5 rounded-lg transition-all font-sans cursor-pointer text-xs"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        İdarə Paneli
                      </button>
                    )}

                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 text-white px-3 py-1.5 rounded-lg text-xs font-sans">
                      <UserIcon className="w-3.5 h-3.5 text-gold-primary" />
                      <span className="font-semibold max-w-[100px] truncate">{user.fullName}</span>
                    </div>

                    <button
                      onClick={logout}
                      className="w-8 h-8 bg-white/5 border border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 text-slate-300 flex items-center justify-center rounded-lg transition-all cursor-pointer"
                      title="Çıxış"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLinkClick('/login')}
                      className="border border-gold-primary text-gold-primary hover:bg-gold-primary hover:text-navy-deep font-sans font-bold tracking-wide px-4 py-1.5 rounded-lg text-xs transition-all cursor-pointer"
                    >
                      Daxil ol
                    </button>
                    <button
                      onClick={() => handleLinkClick('/register')}
                      className="bg-gold-primary hover:bg-gold-dark text-navy-deep hover:shadow-lg active:scale-97 font-sans font-bold tracking-wide px-4 py-1.5 rounded-lg text-xs transition-all cursor-pointer"
                    >
                      Qeydiyyat
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* VARIANT 2 (OR MOBILE VIEWPORT): Classical left-aligned logo option with full flexibility */
          <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
            {/* Logo area */}
            <div 
              onClick={() => handleLinkClick('/')}
              className="flex items-center gap-3 cursor-pointer shrink-0 group select-none"
              id="navbar-logo"
              style={{ transform: `translate(${posX}px, ${posY}px)` }}
            >
              {currentLogo ? (
                <img 
                  src={currentLogo} 
                  alt="Website Logo" 
                  style={{ width: `${logoWidth}px`, height: `${logoHeight}px` }} 
                  className="object-contain"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <>
                  <div className="w-9 h-9 bg-gold-primary/20 hover:scale-105 active:scale-95 text-gold-primary flex items-center justify-center rounded-lg border border-gold-primary/30 transition-all">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.82 0 3.53-.49 5-1.35-1.85-.3-3.51-1.15-4.82-2.46-1.74-1.74-2.68-4.07-2.68-6.54 0-2.43.91-4.73 2.57-6.4 1.34-1.35 3.03-2.22 4.93-2.5C15.53 2.49 13.82 2 12 2zm3.5 6c.28 0 .5.22.5.5s-.22.5-.5.5-.5-.22-.5-.5.22-.5.5-.5zm2.5 2c.28 0 .5.22.5.5s-.22.5-.5.5-.5-.22-.5-.5.22-.5.5-.5zm-1 3.5c.28 0 .5.22.5.5s-.22.5-.5.5-.5-.22-.5-.5.22-.5.5-.5z" />
                    </svg>
                  </div>
                  <span className="text-xl md:text-2xl font-serif tracking-widest font-bold text-gold-primary group-hover:text-gold-dark transition-colors">
                    {siteTitle}
                  </span>
                </>
              )}
            </div>

            {/* Desktop Navigation Link row */}
            <div className="hidden lg:flex items-center gap-8 text-sm" id="desktop-nav-menu">
              {navLinks.map((link) => {
                const active = currentPath === link.path;
                return (
                  <button
                    key={link.path}
                    onClick={() => handleLinkClick(link.path)}
                    className={`relative font-sans text-sm font-medium tracking-wide py-2 transition-colors cursor-pointer ${
                      active ? 'text-gold-primary' : 'text-slate-200 hover:text-white'
                    }`}
                  >
                    {link.name}
                    {active && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-primary rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* User Session Action Buttons */}
            <div className="hidden lg:flex items-center gap-4 text-sm" id="desktop-user-actions">
              {user ? (
                <div className="flex items-center gap-3">
                  {isAdmin && (
                    <button
                      onClick={() => handleLinkClick('/admin-panel-x72k')}
                      className="flex items-center gap-2 bg-gold-primary/15 border border-gold-primary/40 text-gold-primary font-semibold hover:bg-gold-primary/35 px-4 py-2 rounded-xl transition-all font-sans cursor-pointer animate-fadeIn"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      İdarə Paneli
                    </button>
                  )}

                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 text-white px-4 py-2 rounded-xl">
                    <UserIcon className="w-4 h-4 text-gold-primary" />
                    <span className="font-medium font-sans text-xs max-w-[120px] truncate">{user.fullName}</span>
                  </div>

                  <button
                    onClick={logout}
                    className="w-10 h-10 bg-white/5 border border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 text-slate-300 flex items-center justify-center rounded-xl transition-all cursor-pointer"
                    title="Çıxış"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => handleLinkClick('/login')}
                    className="border border-gold-primary text-gold-primary hover:bg-gold-primary hover:text-navy-deep font-sans font-semibold tracking-wide px-5 py-2 rounded-xl transition-all cursor-pointer animate-fadeIn"
                  >
                    Daxil ol
                  </button>
                  <button
                    onClick={() => handleLinkClick('/register')}
                    className="bg-gold-primary hover:bg-gold-dark text-navy-deep hover:shadow-lg active:scale-97 font-sans font-bold tracking-wide px-5 py-2 rounded-xl transition-all cursor-pointer animate-fadeIn"
                  >
                    Qeydiyyat
                  </button>
                </>
              )}
            </div>

            {/* Hamburger mobile toggle icon */}
            <button
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className="lg:hidden p-2 text-slate-100 hover:text-white transition-colors cursor-pointer w-11 h-11 flex items-center justify-center border border-white/10 rounded-xl bg-white/5"
              id="mobile-drawer-toggle"
              aria-label="Menu"
            >
              {isDrawerOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        )}
      </nav>

      {/* Slide-in Mobile Menu Drawer on Right side */}
      <div 
        id="mobile-drawer-overlay"
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden ${
          isDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsDrawerOpen(false)}
      >
        <div 
          id="mobile-drawer-surface"
          className={`absolute top-0 right-0 bottom-0 w-72 bg-navy-mid border-l border-white/10 p-6 flex flex-col gap-8 transition-transform duration-300 select-none ${
            isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drawer Title header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <span className="font-serif text-lg tracking-wider font-bold text-gold-primary">MENU</span>
            <button 
              onClick={() => setIsDrawerOpen(false)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Links list */}
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => {
              const active = currentPath === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => handleLinkClick(link.path)}
                  className={`text-left font-sans text-base font-medium py-2.5 px-4 rounded-xl transition-colors cursor-pointer ${
                    active ? 'bg-gold-primary/10 text-gold-primary border-l-4 border-gold-primary' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {link.name}
                </button>
              );
            })}
          </div>

          <hr className="border-white/5" />

          {/* Small identity or user info controls */}
          <div className="flex flex-col gap-4 mt-auto">
            {user ? (
              <div className="flex flex-col gap-3">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <p className="text-xs text-slate-400 font-sans">Sessiya sahibi:</p>
                  <p className="text-sm font-semibold text-white font-sans mt-1 truncate">{user.fullName}</p>
                  <p className="text-xs text-slate-500 font-sans mt-0.5 truncate">{user.email}</p>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => handleLinkClick('/admin-panel-x72k')}
                    className="w-full flex items-center justify-center gap-2 bg-gold-primary text-navy-deep font-bold py-3 rounded-xl transition-all font-sans cursor-pointer"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    İdarə Paneli
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 py-3 rounded-xl transition-all cursor-pointer font-sans"
                >
                  <LogOut className="w-4 h-4" />
                  Çıxış Et
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => handleLinkClick('/login')}
                  className="w-full border border-gold-primary text-gold-primary py-3 rounded-xl text-center font-sans font-semibold cursor-pointer"
                >
                  Daxil ol
                </button>
                <button
                  onClick={() => handleLinkClick('/register')}
                  className="w-full bg-gold-primary text-navy-deep py-3 rounded-xl text-center font-sans font-bold cursor-pointer"
                >
                  Qeydiyyat
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
