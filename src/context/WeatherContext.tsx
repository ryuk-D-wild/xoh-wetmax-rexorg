import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GeoLocation, WeatherData, ForecastData, TemperatureUnit } from '../types/weather';
import { getCurrentWeather, getForecast, reverseGeocode, searchLocation } from '../utils/weatherApi';
import toast from 'react-hot-toast';

interface WeatherContextType {
  currentWeather: WeatherData | null;
  forecast: ForecastData | null;
  location: GeoLocation | null;
  isLoading: boolean;
  error: string | null;
  temperatureUnit: TemperatureUnit;
  setLocation: (location: GeoLocation) => void;
  toggleTemperatureUnit: () => void;
  refreshWeather: () => Promise<void>;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export function WeatherProvider({ children }: { children: ReactNode }) {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [temperatureUnit, setTemperatureUnit] = useState<TemperatureUnit>('metric');

  const toggleTemperatureUnit = () => {
    setTemperatureUnit(prev => (prev === 'metric' ? 'imperial' : 'metric'));
  };

  const fetchWeatherData = async (loc: GeoLocation) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [weatherData, forecastData] = await Promise.all([
        getCurrentWeather(loc, temperatureUnit),
        getForecast(loc, temperatureUnit)
      ]);
      
      setCurrentWeather(weatherData);
      setForecast(forecastData);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to fetch weather data. Please try again.');
      setIsLoading(false);
      toast.error('Failed to fetch weather data');
      console.error('Error fetching weather data:', err);
    }
  };

  const refreshWeather = async () => {
    if (location) {
      await fetchWeatherData(location);
    }
  };

  // Get user's location on initial load
  useEffect(() => {
    const getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              const locationData = await reverseGeocode(latitude, longitude);
              
              if (locationData) {
                setLocation(locationData);
              } else {
                setLocation({ lat: latitude, lon: longitude });
              }
            } catch (err) {
              setError('Failed to get location name');
              setLocation({ lat: position.coords.latitude, lon: position.coords.longitude });
            }
          },
          (err) => {
            console.error('Error getting user location:', err);
            setError('Unable to access your location. Please search for a city manually.');
            setIsLoading(false);
            toast.error('Location access denied. Please search for a city.');
            
            // Set a default location (New York)
            setLocation({ lat: 40.7128, lon: -74.0060 });
          }
        );
      } else {
        setError('Geolocation is not supported by your browser');
        setIsLoading(false);
        toast.error('Geolocation not supported');
        
        // Set a default location (New York)
        setLocation({ lat: 40.7128, lon: -74.0060 });
      }
    };

    getUserLocation();
  }, []);

  // Fetch weather data when location or temperature unit changes
  useEffect(() => {
    if (location) {
      fetchWeatherData(location);
    }
  }, [location, temperatureUnit]);

  const value = {
    currentWeather,
    forecast,
    location,
    isLoading,
    error,
    temperatureUnit,
    setLocation,
    toggleTemperatureUnit,
    refreshWeather
  };

  return <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>;
}

export function useWeather() {
  const context = useContext(WeatherContext);
  if (context === undefined) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
}