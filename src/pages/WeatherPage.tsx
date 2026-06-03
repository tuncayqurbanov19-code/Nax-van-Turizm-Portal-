import React, { useEffect, useState } from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudDrizzle, Wind, Droplets, Thermometer, RefreshCw, CalendarDays, MapPin } from 'lucide-react';
import { api } from '../services/api';

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
    name: "Batabat Yaylası",
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
    name: "Möminə Xatun Türbəsi",
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
    desc: "Müqəddəs inanc mağarası"
  }
];

export default function WeatherPage() {
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
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  async function fetchWeather() {
    setRefreshing(true);
    try {
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

      try {
        const settings = await api.settings.get();
        if (settings?.backgroundSettings?.weatherUrl) {
          setCustomBg(settings.backgroundSettings.weatherUrl);
        }
      } catch (e) {
        // Fallback gracefully
      }
    } catch (err: any) {
      console.error('Weather dashboard page error:', err);
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
      case 71:
        return { text: "Zəif qar", icon: CloudSnow, color: "text-sky-100", bg: "bg-sky-100/10" };
      case 73:
        return { text: "Mutedil qar", icon: CloudSnow, color: "text-sky-200", bg: "bg-sky-200/10" };
      case 75:
        return { text: "Güclü qar", icon: CloudSnow, color: "text-white", bg: "bg-white/10" };
      case 77:
        return { text: "Dənəvər qar", icon: CloudSnow, color: "text-sky-50", bg: "bg-sky-50/10" };
      case 80:
      case 81:
      case 82:
        return { text: "Güclü yağış leysanı", icon: CloudRain, color: "text-blue-400", bg: "bg-blue-400/10" };
      case 85:
      case 86:
        return { text: "Qar leysanı", icon: CloudSnow, color: "text-sky-150", bg: "bg-sky-150/10" };
      case 95:
      case 96:
      case 99:
        return { text: "Şimşəkli fırtına", icon: CloudLightning, color: "text-amber-500", bg: "bg-amber-500/10" };
      default:
        return { text: "Buludlu", icon: Cloud, color: "text-slate-400", bg: "bg-slate-400/10" };
    }
  }

  const activeLandscape = LANDSCAPES[bgImageIndex];
  const finalBg = customBg || activeLandscape.url;

  return (
    <div className="min-h-screen pt-28 pb-16 relative z-10 max-w-7xl mx-auto px-4 md:px-12 font-sans antialiased" id="weather-standalone-page">
      
      {/* Immersive glassmorphic weather showcase board */}
      <div className="relative rounded-[32px] overflow-hidden shadow-2xl border border-white/10 text-white min-h-[550px] flex flex-col justify-between p-6 md:p-12 transition-all duration-1000 select-none">
        
        {/* Absolute Background Layer */}
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-[1.03]"
            style={{ backgroundImage: `url("${finalBg}")` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/95 via-navy-deep/80 to-navy-mid/40 backdrop-blur-[3px]" />
        </div>

        {/* Top Header Row of the Showcase */}
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6 w-full">
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="p-1 px-2.5 bg-gold-primary/20 text-gold-primary border border-gold-primary/30 text-[9px] font-black tracking-widest uppercase rounded-md">
                Canlı Hava Durumu
              </span>
              <span className="text-[10px] text-slate-300 font-mono">Yenilənib: {current?.time || '--:--'}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mt-2.5 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gold-primary animate-pulse" />
              Naxçıvan Hava Proqnozu
            </h1>
            <p className="text-xs text-slate-300 mt-1.5 font-sans italic max-w-md">
              {!customBg && `Arxa fon mənzərəsi: ${activeLandscape.name} (${activeLandscape.desc})`}
              {customBg && `Xüsusi İdarə Olunan Arxa Plan Mənzərəsi`}
            </p>
          </div>

          <button
            onClick={fetchWeather}
            disabled={refreshing}
            className="flex items-center gap-2 p-3 bg-white/10 hover:bg-white/20 border border-white/25 rounded-2xl transition-all text-xs font-bold leading-none cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Proqnozu Yenilə
          </button>
        </div>

        {/* Middle Main Content Row */}
        {loading ? (
          <div className="relative z-10 flex-grow flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <span className="w-10 h-10 border-3 border-gold-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-300">Canlı hava verisi alınır...</p>
            </div>
          </div>
        ) : error ? (
          <div className="relative z-10 flex-grow flex items-center justify-center py-20">
            <p className="text-rose-400 font-semibold text-sm">{error}</p>
          </div>
        ) : current ? (
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 my-8 items-center w-full">
            
            {/* Left Box: Large degrees */}
            <div className="lg:col-span-5 flex items-center gap-6 md:gap-8 justify-start">
              <div className="p-5.5 rounded-full bg-white/10 border border-white/15 shadow-xl shrink-0">
                {(() => {
                  const details = getWeatherDetails(current.weatherCode);
                  const IconComponent = details.icon;
                  return <IconComponent className={`w-16 h-16 md:w-20 md:h-20 ${details.color}`} />;
                })()}
              </div>

              <div className="text-left font-sans">
                <span className="text-6xl md:text-8xl font-black tracking-tighter leading-none block text-white drop-shadow-md">
                  {current.temperature}°C
                </span>
                <span className="text-base md:text-lg text-slate-200 mt-2 block font-semibold">
                  {getWeatherDetails(current.weatherCode).text}
                </span>
                <span className="text-[11px] text-slate-300 mt-0.5 block font-mono">
                  Hiss edilən: {current.apparentTemperature}°C
                </span>
              </div>
            </div>

            {/* Right Box: Atmospheric indicators in high contrast bento panels */}
            <div className="lg:col-span-7 grid grid-cols-3 gap-3 md:gap-4 w-full">
              
              <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 md:p-5 rounded-2xl text-left flex flex-col gap-1.5 justify-between">
                <div className="flex items-center gap-2">
                  <Wind className="w-4.5 h-4.5 text-sky-400 shrink-0" />
                  <span className="text-[10px] text-slate-300 font-sans tracking-wide">Külək Sürəti</span>
                </div>
                <span className="text-base md:text-lg font-bold font-mono text-white block">{current.windSpeed} km/h</span>
              </div>

              <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 md:p-5 rounded-2xl text-left flex flex-col gap-1.5 justify-between">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4.5 h-4.5 text-blue-450 shrink-0" />
                  <span className="text-[10px] text-slate-300 font-sans tracking-wide">Rütubət Oranı</span>
                </div>
                <span className="text-base md:text-lg font-bold font-mono text-white block">{current.humidity}%</span>
              </div>

              <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 md:p-5 rounded-2xl text-left flex flex-col gap-1.5 justify-between">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                  <span className="text-[10px] text-slate-300 font-sans tracking-wide">Hiss Edilən</span>
                </div>
                <span className="text-base md:text-lg font-bold font-mono text-white block">{current.apparentTemperature}°C</span>
              </div>

            </div>

          </div>
        ) : null}

        {/* Bottom Forecast Row */}
        {!loading && forecast.length > 0 && (
          <div className="relative z-10 w-full pt-6 border-t border-white/10 select-none">
            <h3 className="font-serif text-sm font-bold text-white text-left mb-4 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-gold-primary" />
              Növbəti 5 Günlük Hava Proqnozu
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {forecast.map((day, idx) => {
                const details = getWeatherDetails(day.weatherCode);
                const IconComponent = details.icon;
                const dateStr = new Date(day.date).toLocaleDateString('az', { weekday: 'short', month: 'short', day: 'numeric' });
                return (
                  <div key={idx} className="bg-white/10 hover:bg-white/15 border border-white/10 p-3.5 rounded-2xl flex flex-col items-center justify-between gap-2.5 transition-all">
                    <span className="text-[10px] font-sans font-bold text-slate-300 text-center uppercase tracking-wider">{dateStr}</span>
                    <IconComponent className={`w-7 h-7 ${details.color}`} />
                    <div className="text-center">
                      <span className="text-xs text-slate-200 block font-sans">{details.text}</span>
                      <span className="text-xs font-mono font-bold mt-1 block">
                        <span className="text-sky-350">{day.tempMin}°</span>
                        <span className="text-slate-400 mx-1">/</span>
                        <span className="text-amber-400">{day.tempMax}°</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
