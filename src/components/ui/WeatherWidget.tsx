import React, { useEffect, useState } from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudDrizzle, Wind, Droplets, Thermometer, RefreshCw, CalendarDays, MapPin } from 'lucide-react';
import { api } from '../../services/api';

interface CurrentWeatherData {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  isDay: boolean;
  time: string;
}

interface ForecastDayData {
  date: string;
  tempMin: number;
  tempMax: number;
  weatherCode: number;
}

const LANDSCAPES = [
  {
    id: 'batabat',
    name: "Batabat Gölü",
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200",
    desc: "Üzən adası ilə unikal alp gölü"
  },
  {
    id: 'elinceqala',
    name: "Əlincəqala",
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200",
    desc: "14 il müqavimət göstərən təkrarolunmaz qala"
  },
  {
    id: 'mominexatun',
    name: "Möminə Xatun",
    url: "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1200",
    desc: "XII əsr milli memarlıq şah əsəri"
  },
  {
    id: 'duzdag',
    name: "Duzdağ",
    url: "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?q=80&w=1200",
    desc: "Müalicəvi təbii duz mağarası"
  },
  {
    id: 'eshabikeyf',
    name: "Əshabi-Kəhf",
    url: "https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?q=80&w=1200",
    desc: "Ziyarat edilən qədim müqəddəs inanc mağarası"
  }
];

export default function WeatherWidget() {
  const [current, setCurrent] = useState<CurrentWeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDayData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [bgImageIndex, setBgImageIndex] = useState<number>(0);
  const [customBg, setCustomBg] = useState<string | null>(null);

  // Auto-carousel timer
  useEffect(() => {
    const interval = setInterval(() => {
      setBgImageIndex((prev) => (prev + 1) % LANDSCAPES.length);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  async function fetchWeather() {
    setRefreshing(true);
    try {
      // 1. Fetch weather
      const url = 'https://api.open-meteo.com/v1/forecast?latitude=39.2089&longitude=45.4122&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Hava proqnozu məlumatlarını almaq mümkün olmadı.');
      }
      const data = await response.json();

      if (data.current && data.daily) {
        setCurrent({
          temperature: Math.round(data.current.temperature_2m),
          apparentTemperature: Math.round(data.current.apparent_temperature),
          humidity: data.current.relative_humidity_2m,
          windSpeed: Math.round(data.current.wind_speed_10m),
          weatherCode: data.current.weather_code,
          isDay: data.current.is_day === 1,
          time: new Date(data.current.time).toLocaleTimeString('az', { hour: '2-digit', minute: '2-digit' })
        });

        const forecastList: ForecastDayData[] = [];
        for (let i = 0; i < 5; i++) {
          forecastList.push({
            date: data.daily.time[i],
            tempMin: Math.round(data.daily.temperature_2m_min[i]),
            tempMax: Math.round(data.daily.temperature_2m_max[i]),
            weatherCode: data.daily.weather_code[i]
          });
        }
        setForecast(forecastList);
        setError(null);
      }

      // 2. Fetch background settings if any
      try {
        const settings = await api.settings.get();
        if (settings?.backgroundSettings?.weatherUrl) {
          setCustomBg(settings.backgroundSettings.weatherUrl);
        }
      } catch (e) {
        // Fallback gracefully
      }
    } catch (err: any) {
      console.error('Weather widget error:', err);
      setError(err.message || 'Xəta baş verdi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchWeather();
  }, []);

  function getWeatherDetails(code: number) {
    switch (code) {
      case 0:
        return { text: "Açıq hava", icon: Sun, color: "text-amber-400", bg: "bg-amber-400/10" };
      case 1:
        return { text: "Əsasən açıq", icon: Sun, color: "text-amber-300", bg: "bg-amber-300/10" };
      case 2:
        return { text: "Qismən buludlu", icon: Cloud, color: "text-sky-300", bg: "bg-sky-300/10" };
      case 3:
        return { text: "Tutqun buludlu", icon: Cloud, color: "text-slate-300", bg: "bg-slate-300/10" };
      case 45:
      case 48:
        return { text: "Dumanlı", icon: Cloud, color: "text-zinc-300", bg: "bg-zinc-300/10" };
      case 51:
      case 53:
      case 55:
        return { text: "Çiskinli yağış", icon: CloudDrizzle, color: "text-blue-300", bg: "bg-blue-300/10" };
      case 56:
      case 57:
        return { text: "Dondurucu çiskin", icon: CloudSnow, color: "text-sky-200", bg: "bg-sky-200/10" };
      case 61:
        return { text: "Zəif yağış", icon: CloudRain, color: "text-blue-400", bg: "bg-blue-400/10" };
      case 63:
        return { text: "Mutedil yağış", icon: CloudRain, color: "text-indigo-400", bg: "bg-indigo-400/10" };
      case 65:
        return { text: "Güclü yağış", icon: CloudRain, color: "text-indigo-300", bg: "bg-indigo-300/10" };
      case 66:
      case 67:
        return { text: "Sulu dondurucu yağış", icon: CloudSnow, color: "text-sky-350", bg: "bg-sky-350/10" };
      case 71:
        return { text: "Zəif qar", icon: CloudSnow, color: "text-sky-100", bg: "bg-sky-100/10" };
      case 73:
        return { text: "Qar yağışı", icon: CloudSnow, color: "text-sky-200", bg: "bg-sky-200/10" };
      case 75:
        return { text: "Güclü qar", icon: CloudSnow, color: "text-sky-300", bg: "bg-sky-300/10" };
      case 77:
        return { text: "Qar dənəcikləri", icon: CloudSnow, color: "text-sky-200", bg: "bg-sky-200/10" };
      case 80:
      case 81:
      case 82:
        return { text: "Leysan", icon: CloudRain, color: "text-blue-400", bg: "bg-blue-400/10" };
      case 85:
      case 86:
        return { text: "Sulu qar", icon: CloudSnow, color: "text-sky-200", bg: "bg-sky-200/10" };
      case 95:
      case 96:
      case 99:
        return { text: "Tufan və ildırım", icon: CloudLightning, color: "text-purple-300", bg: "bg-purple-300/10" };
      default:
        return { text: "Açıq hava", icon: Sun, color: "text-amber-400", bg: "bg-amber-400/10" };
    }
  }

  function getDayName(dateString: string) {
    const date = new Date(dateString);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      return "Bugün";
    }

    return date.toLocaleDateString('az', { weekday: 'long' });
  }

  if (loading) {
    return (
      <div className="w-full bg-navy-deep border border-white/10 rounded-3xl p-8 shadow-sm flex flex-col justify-center items-center h-[340px] font-sans antialiased">
        <RefreshCw className="w-8 h-8 text-gold-primary animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-300 select-none">Hava məlumatları yüklənir...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-navy-deep border border-rose-900/40 rounded-3xl p-8 shadow-sm flex flex-col justify-center items-center h-[340px] text-center font-sans antialiased text-white select-none">
        <span className="text-3xl mb-2">⚠️</span>
        <h4 className="font-serif font-bold text-white text-base mb-1.5">Məlumat yüklənərkən xəta baş verdi</h4>
        <p className="text-xs text-rose-300 max-w-xs leading-relaxed mb-4">{error}</p>
        <button
          onClick={fetchWeather}
          className="bg-gold-primary hover:bg-gold-dark text-navy-deep font-sans font-bold text-xs py-2.5 px-5 rounded-xl cursor-pointer transition-colors shadow-sm inline-flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Yenidən cəhd et
        </button>
      </div>
    );
  }

  if (!current) return null;

  const currentDetails = getWeatherDetails(current.weatherCode);
  const CurrentIcon = currentDetails.icon;

  // Active Background
  const currentLandscape = customBg || LANDSCAPES[bgImageIndex].url;

  return (
    <div className="w-full rounded-3xl shadow-xl font-sans antialiased text-left select-none overflow-hidden transition-all duration-300 hover:shadow-2xl relative border border-white/15 min-h-[440px] flex flex-col justify-between text-white" id="weather-section-container">
      
      {/* 1. Backdrop Landscapes with Blur Overlay */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out scale-102 filter blur-[3px]"
          style={{ backgroundImage: `url("${currentLandscape}")` }}
        />
        {/* Blur details, gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-tr from-navy-deep/95 via-navy-deep/80 to-navy-mid/45 backdrop-blur-[2px]" />
      </div>

      {/* 2. Glassmorphic UI Content */}
      <div className="relative z-10 p-6 md:p-8 flex flex-col justify-between h-full flex-1">
        
        {/* Top Header Row */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="bg-gold-primary/20 text-gold-primary p-2 rounded-xl border border-gold-primary/20">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-black text-white tracking-wide uppercase">Naxçıvan Muxtar Respublikası</h4>
              <p className="text-[10px] text-slate-300 font-sans mt-0.5">Real-vaxt İqlim & 5 Günlük Proqnoz</p>
            </div>
          </div>
          <button
            onClick={fetchWeather}
            disabled={refreshing}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 opacity-90 border border-white/15 hover:opacity-100 text-gold-primary text-xs font-semibold"
            title="Havanı yenilə"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-gold-primary' : ''}`} />
            <span className="hidden sm:inline">Yenilə ({current.time})</span>
          </button>
        </div>

        {/* Middle Main Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left Side: Current Glowing Glassmorphism Details */}
          <div className="lg:col-span-5 flex flex-col md:flex-row lg:flex-col items-center lg:items-start gap-6 border-b lg:border-b-0 lg:border-r border-white/10 pb-6 md:pb-0 lg:pr-8 text-center md:text-left">
            
            <div className="flex items-center gap-5">
              {/* Giant Weather Icon */}
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg text-white shrink-0 animate-pulse">
                <CurrentIcon className={`w-14 h-14 ${currentDetails.color} stroke-[2] drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]`} />
              </div>
              <div>
                <div className="flex items-start">
                  <span className="text-5xl md:text-6xl font-mono font-black text-white tracking-tighter leading-none">{current.temperature}</span>
                  <span className="text-xl font-bold text-slate-200 -mt-1 ml-0.5">°C</span>
                </div>
                <p className="text-xs font-black text-gold-primary mt-1.5 uppercase tracking-widest">{currentDetails.text}</p>
              </div>
            </div>

            {/* Minor climate attributes */}
            <div className="grid grid-cols-3 md:grid-cols-1 gap-2.5 w-full">
              <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl flex flex-col md:flex-row items-center gap-2 backdrop-blur-sm">
                <Thermometer className="w-4 h-4 text-rose-400 shrink-0" />
                <div className="text-center md:text-left leading-tight">
                  <span className="text-[9px] text-slate-350 block font-medium">Hiss edilən</span>
                  <span className="text-xs font-black text-white font-mono">{current.apparentTemperature}°C</span>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl flex flex-col md:flex-row items-center gap-2 backdrop-blur-sm">
                <Droplets className="w-4 h-4 text-blue-400 shrink-0" />
                <div className="text-center md:text-left leading-tight">
                  <span className="text-[9px] text-slate-350 block font-medium">Nəmlik</span>
                  <span className="text-xs font-black text-white font-mono">{current.humidity}%</span>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl flex flex-col md:flex-row items-center gap-2 backdrop-blur-sm">
                <Wind className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="text-center md:text-left leading-tight">
                  <span className="text-[9px] text-slate-350 block font-medium">Külək</span>
                  <span className="text-xs font-black text-white font-mono">{current.windSpeed} km/h</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Side: 5 Days Forecast */}
          <div className="lg:col-span-7 flex flex-col justify-between h-full">
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays className="w-4 h-4 text-gold-primary shrink-0" />
              <h5 className="font-serif font-black text-xs text-white uppercase tracking-wider">5 Günlük Hava Proqnozu</h5>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 w-full">
              {forecast.map((day, i) => {
                const dayDetails = getWeatherDetails(day.weatherCode);
                const DayIcon = dayDetails.icon;
                return (
                  <div 
                    key={day.date} 
                    className={`bg-white/5 backdrop-blur-md border ${i === 0 ? 'border-gold-primary/40 bg-gold-primary/5' : 'border-white/10'} p-3 rounded-2xl flex flex-col items-center justify-between text-center transition-all hover:scale-103 hover:bg-white/10 cursor-help`}
                    title={dayDetails.text}
                  >
                    <span className="text-[11px] font-bold text-slate-200 block truncate w-full mb-1">
                      {i === 0 ? "Bugün" : getDayName(day.date).split(' ')[0]}
                    </span>
                    
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 my-2 shrink-0 border border-white/5">
                      <DayIcon className="w-5 h-5 stroke-[2] text-white" />
                    </div>

                    <div className="text-[9px] text-slate-400 uppercase tracking-widest leading-none block my-1">
                      {dayDetails.text.split(' ')[0]}
                    </div>

                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-xs font-black text-white font-mono">{day.tempMax}°</span>
                      <span className="text-[10px] font-medium text-slate-400 font-mono">{day.tempMin}°</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Choose Landscape Scenery controls */}
            {!customBg && (
              <div className="mt-5 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 select-none">
                <span className="text-[10px] text-slate-350 font-sans tracking-wide">
                  🏞️ Panorama mənzərəni dəyişdirin:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {LANDSCAPES.map((land, idx) => (
                    <button
                      key={land.id}
                      onClick={() => setBgImageIndex(idx)}
                      className={`text-[9px] font-bold px-2 py-1 rounded-md transition-all cursor-pointer ${
                        bgImageIndex === idx 
                          ? 'bg-gold-primary text-navy-deep font-black' 
                          : 'bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10'
                      }`}
                      title={land.desc}
                    >
                      {land.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Footer info line */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/15">
          <span className="text-[9px] text-slate-400">
            Batabat, Əlincəqala, Möminə Xatun, Duzdağ, Əshabi-Kəhf mənzərə kərpicləri ilə.
          </span>
          <span className="text-[9px] font-medium text-slate-400 flex items-center gap-1 bg-white/5 py-1 px-2.5 rounded-full border border-white/5">
            ℹ️ Açıq-Mənbə xidmət (Open-Meteo)
          </span>
        </div>

      </div>

    </div>
  );
}
