import React, { useState, useEffect } from 'react';
import { useTranslations } from '../hooks/useTranslations';

// --- New Animated Logo ---
const LiveWeatherLogo: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 64 64" className={className}>
        <defs>
            <linearGradient id="weather-sun-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FBBF24" />
                <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
            <linearGradient id="weather-cloud-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F9FAFB" />
                <stop offset="100%" stopColor="#E5E7EB" />
            </linearGradient>
            <filter id="weather-shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.1" />
            </filter>
        </defs>
        <g className="animate-float-subtle">
            <circle cx="32" cy="32" r="14" fill="url(#weather-sun-grad)" />
            <path d="M 45,52 C 35,62 15,62 5,52 C -5,42 0,27 10,22 C 5,12 15,2 25,7 C 35,2 45,12 45,17 C 55,22 55,42 45,52 Z" 
                  transform="translate(10, -5)"
                  fill="url(#weather-cloud-grad)" 
                  stroke="#D1D5DB" 
                  strokeWidth="1"
                  style={{ filter: 'url(#weather-shadow)' }}/>
        </g>
    </svg>
);


// --- Weather Condition Icons ---
const SunIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);
const CloudyIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
    </svg>
);
const RainIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.5 15.75c-1.42 0-2.73-.54-3.75-1.5M19.5 15.75v3.375c0 .621-.504 1.125-1.125 1.125H9.375c-.621 0-1.125-.504-1.125-1.125V11.25c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v3.375m0 0c0 .621.504 1.125 1.125 1.125h1.125c.621 0 1.125-.504 1.125-1.125v-3.375m0 0c1.02.96 2.33 1.5 3.75 1.5M3 11.25a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 11.25v6.75a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18V11.25z" />
    </svg>
);
const ThunderstormIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.375 3.375 0 0014 18.442V19.5a.75.75 0 01-.75.75h-2.5a.75.75 0 01-.75-.75v-1.059a3.375 3.375 0 00-.75-2.252l-.548-.547z" />
    </svg>
);
const SnowIcon: React.FC<{className?: string}> = ({ className }) => (
     <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 21h4m-2-4v4M10 4h4m-2-4v4M4 14h4m-2-4v4M16 14h4m-2-4v4M12 6l3.464 6L12 18l-3.464-6L12 6z" /></svg>
);
const FogIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" /></svg>
);

const getWeatherInfo = (code: number): { textKey: string; Icon: React.FC<{className?: string}> } => {
    if (code === 0) return { textKey: 'weatherCondition_Clear', Icon: SunIcon };
    if (code >= 1 && code <= 3) return { textKey: 'weatherCondition_PartlyCloudy', Icon: CloudyIcon };
    if (code === 45 || code === 48) return { textKey: 'weatherCondition_Fog', Icon: FogIcon };
    if (code >= 51 && code <= 57) return { textKey: 'weatherCondition_Drizzle', Icon: RainIcon };
    if (code >= 61 && code <= 67) return { textKey: 'weatherCondition_Rain', Icon: RainIcon };
    if (code >= 80 && code <= 82) return { textKey: 'weatherCondition_Rain', Icon: RainIcon };
    if (code >= 71 && code <= 77) return { textKey: 'weatherCondition_Snow', Icon: SnowIcon };
    if (code >= 85 && code <= 86) return { textKey: 'weatherCondition_Snow', Icon: SnowIcon };
    if (code >= 95 && code <= 99) return { textKey: 'weatherCondition_Thunderstorm', Icon: ThunderstormIcon };
    return { textKey: 'weatherCondition_Clear', Icon: SunIcon };
};

interface WeatherData {
    temperature: number;
    weatherCode: number;
    apparentTemperature: number;
}

const WeatherWidget: React.FC<{ language: string }> = ({ language }) => {
    const { t } = useTranslations(language);
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
                });
                const { latitude, longitude } = position.coords;

                const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,weather_code&timeformat=unixtime`);
                if (!response.ok) throw new Error('Failed to fetch weather data');
                
                const data = await response.json();
                setWeatherData({
                    temperature: Math.round(data.current.temperature_2m),
                    weatherCode: data.current.weather_code,
                    apparentTemperature: Math.round(data.current.apparent_temperature),
                });
                setError(null);
            } catch (err) {
                // Log the actual error object for better debugging
                console.error("Weather fetch error:", err);

                // Determine the type of error to show a more specific message
                if (err && typeof err === 'object' && 'code' in err) {
                    const geoError = err as GeolocationPositionError;
                    if (geoError.code === geoError.PERMISSION_DENIED) {
                        setError(t('weatherError_locationPermission'));
                    } else {
                        setError(t('weatherError_locationGeneral'));
                    }
                } else {
                    // Assume it's a network or API error if it's not a geo error
                    setError(t('weatherError_api'));
                }
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
        const intervalId = setInterval(fetchWeather, 15 * 60 * 1000); // Refresh every 15 minutes

        return () => clearInterval(intervalId);
    }, [t]);

    const renderContent = () => {
        if (loading) {
            return <div className="flex items-center justify-center h-full"><div className="w-6 h-6 border-2 border-dashed rounded-full animate-spin border-primary"></div><span className="ml-2 text-sm text-copy-secondary-light dark:text-copy-secondary-dark">{t('weatherLoading')}</span></div>;
        }
        if (error) {
            return <div className="flex items-center justify-center h-full text-sm text-red-500">{error}</div>;
        }
        if (weatherData) {
            const { textKey, Icon } = getWeatherInfo(weatherData.weatherCode);
            return (
                <>
                    <div className="flex items-center justify-between">
                        <LiveWeatherLogo className="w-20 h-20" />
                        <div className="text-right">
                            <p className="text-5xl font-extrabold text-copy-primary-light dark:text-copy-primary-dark">
                                {weatherData.temperature}°C
                            </p>
                            <div className="flex items-center justify-end gap-1.5 -mt-1">
                                <Icon className="w-5 h-5 text-copy-secondary-light dark:text-copy-secondary-dark" />
                                <p className="font-semibold text-copy-secondary-light dark:text-copy-secondary-dark">{t(textKey)}</p>
                            </div>
                        </div>
                    </div>
                    <p className="w-full text-sm font-medium text-copy-primary-light dark:text-copy-primary-dark text-center bg-black/5 dark:bg-white/10 p-2.5 rounded-lg mt-2">
                        {t('weatherFeelsLike').replace('{temp}', weatherData.apparentTemperature.toString())}
                    </p>
                </>
            );
        }
        return null;
    };

    return (
        <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-md border border-border-light dark:border-border-dark p-4 h-full flex flex-col">
            <h3 className="font-bold text-md text-copy-primary-light dark:text-copy-primary-dark mb-2">{t('weatherWidgetTitle')}</h3>
            <div className="flex-grow flex flex-col justify-center">
                {renderContent()}
            </div>
        </div>
    );
};

export default WeatherWidget;