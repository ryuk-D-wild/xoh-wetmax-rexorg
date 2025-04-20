import { ForecastItem } from '../types/weather';

// Convert temperature between units
export function formatTemperature(temp: number, unit: 'metric' | 'imperial'): string {
  const value = Math.round(temp);
  return `${value}°${unit === 'metric' ? 'C' : 'F'}`;
}

// Format date to display day of week
export function formatDay(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

// Format time with AM/PM
export function formatTime(timestamp: number, timezone?: number): string {
  const date = new Date(timestamp * 1000 + (timezone || 0) * 1000);
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
}

// Group forecast by day
export function groupForecastByDay(forecastList: ForecastItem[]): ForecastItem[][] {
  const grouped: { [key: string]: ForecastItem[] } = {};
  
  forecastList.forEach(item => {
    const date = new Date(item.dt * 1000).toLocaleDateString('en-US');
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(item);
  });
  
  return Object.values(grouped);
}

// Get daily summary from grouped forecast
export function getDailySummary(dayForecast: ForecastItem[]): ForecastItem {
  // Use noon forecast as the representative for the day
  const noonForecast = dayForecast.find(item => {
    const hour = new Date(item.dt * 1000).getHours();
    return hour >= 11 && hour <= 13;
  });
  
  if (noonForecast) {
    return noonForecast;
  }
  
  // Fallback to the middle item if no noon forecast
  return dayForecast[Math.floor(dayForecast.length / 2)];
}

// Get appropriate weather background based on weather condition and time
export function getWeatherBackground(weatherId: number, isDaytime: boolean): string {
  // Weather condition codes: https://openweathermap.org/weather-conditions
  
  // Clear sky
  if (weatherId === 800) {
    return isDaytime 
      ? 'bg-gradient-to-br from-blue-400 to-blue-600' 
      : 'bg-gradient-to-br from-gray-900 to-blue-900';
  }
  
  // Few clouds, scattered clouds
  if (weatherId >= 801 && weatherId <= 802) {
    return isDaytime 
      ? 'bg-gradient-to-br from-blue-300 to-blue-500' 
      : 'bg-gradient-to-br from-gray-800 to-blue-800';
  }
  
  // Broken clouds, overcast
  if (weatherId >= 803 && weatherId <= 804) {
    return isDaytime 
      ? 'bg-gradient-to-br from-blue-200 to-gray-400' 
      : 'bg-gradient-to-br from-gray-700 to-gray-900';
  }
  
  // Rain, drizzle
  if ((weatherId >= 300 && weatherId <= 321) || (weatherId >= 500 && weatherId <= 531)) {
    return isDaytime 
      ? 'bg-gradient-to-br from-gray-400 to-blue-600' 
      : 'bg-gradient-to-br from-gray-800 to-blue-900';
  }
  
  // Thunderstorm
  if (weatherId >= 200 && weatherId <= 232) {
    return 'bg-gradient-to-br from-gray-700 to-gray-900';
  }
  
  // Snow
  if (weatherId >= 600 && weatherId <= 622) {
    return isDaytime 
      ? 'bg-gradient-to-br from-blue-100 to-gray-300' 
      : 'bg-gradient-to-br from-gray-600 to-blue-800';
  }
  
  // Mist, fog, etc.
  if (weatherId >= 701 && weatherId <= 781) {
    return isDaytime 
      ? 'bg-gradient-to-br from-gray-300 to-gray-500' 
      : 'bg-gradient-to-br from-gray-700 to-gray-900';
  }
  
  // Default
  return isDaytime 
    ? 'bg-gradient-to-br from-blue-400 to-blue-600' 
    : 'bg-gradient-to-br from-gray-900 to-blue-900';
}

// Check if it's daytime based on sunrise, sunset and current time
export function isDaytime(current: number, sunrise: number, sunset: number): boolean {
  return current >= sunrise && current <= sunset;
}

// Format wind speed and add unit
export function formatWindSpeed(speed: number, unit: 'metric' | 'imperial'): string {
  return `${Math.round(speed)} ${unit === 'metric' ? 'm/s' : 'mph'}`;
}

// Get weather icon URL
export function getWeatherIconUrl(iconCode: string): string {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}