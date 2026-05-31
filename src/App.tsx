import React, { useState, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Tours from './pages/Tours';
import TourDetail from './pages/TourDetail';
import Hotels from './pages/Hotels';
import HotelDetail from './pages/HotelDetail';
import Places from './pages/Places';
import PlaceDetail from './pages/PlaceDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider, useToast } from './components/ui/Toast';
import { api } from './services/api';
import { SettingsSchema } from './types';

function AppContent() {
  const [currentPath, setCurrentPath] = useState('/');
  const [settings, setSettings] = useState<SettingsSchema | null>(null);

  // Fetch settings once for global layout integrations
  useEffect(() => {
    async function fetchSettings() {
      try {
        const config = await api.settings.get();
        if (config) {
          setSettings(config);
          
          // Apply dynamic browser document title based on SEO requirements
          if (config.seoSettings?.title) {
            document.title = config.seoSettings.title;
          }
        }
      } catch (err) {
        console.error('Failed to load global settings in App:', err);
      }
    }
    fetchSettings();
  }, [currentPath]);

  // Synchronize state-based path updates with browser back-buttons support
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.hash.slice(1) || '/');
    };
    
    // Read initial hash path or fall back to home
    if (window.location.hash) {
      setCurrentPath(window.location.hash.slice(1) || '/');
    } else {
      window.location.hash = '#/';
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (path: string) => {
    window.location.hash = `#${path}`;
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Router parser
  const renderPage = () => {
    // Exact routes matching
    if (currentPath === '/') return <Home onNavigate={handleNavigate} />;
    if (currentPath === '/tours') return <Tours onNavigate={handleNavigate} />;
    if (currentPath === '/hotels') return <Hotels onNavigate={handleNavigate} />;
    if (currentPath === '/places') return <Places onNavigate={handleNavigate} />;
    if (currentPath === '/login') return <Login onNavigate={handleNavigate} />;
    if (currentPath === '/register') return <Register onNavigate={handleNavigate} />;
    if (currentPath === (settings?.adminPath || '/admin')) return <Admin onNavigate={handleNavigate} />;

    // Subpath matches e.g. /tours/:id, etc.
    const tourDetailMatch = currentPath.match(/^\/tours\/([a-zA-Z0-9_\-]+)$/);
    if (tourDetailMatch) {
      return <TourDetail tourId={tourDetailMatch[1]} onNavigate={handleNavigate} />;
    }

    const hotelDetailMatch = currentPath.match(/^\/hotels\/([a-zA-Z0-9_\-]+)$/);
    if (hotelDetailMatch) {
      return <HotelDetail hotelId={hotelDetailMatch[1]} onNavigate={handleNavigate} />;
    }

    const placeDetailMatch = currentPath.match(/^\/places\/([a-zA-Z0-9_\-]+)$/);
    if (placeDetailMatch) {
      return <PlaceDetail placeId={placeDetailMatch[1]} onNavigate={handleNavigate} />;
    }

    // Unmatched fallback state
    return <NotFound onNavigate={handleNavigate} />;
  };

  return (
    <div className="flex flex-col min-h-screen bg-cream-bg text-text-primary relative select-text selection:bg-gold-primary/30 selection:text-navy-deep">
      
      {/* Global Navbar */}
      <Navbar currentPath={currentPath} onNavigate={handleNavigate} />

      {/* Render current main page scene */}
      <main className="flex-1 w-full bg-cream-bg relative overflow-hidden">
        {renderPage()}
      </main>

      {/* Unified footer linkboard */}
      <Footer onNavigate={handleNavigate} settings={settings} />


    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
