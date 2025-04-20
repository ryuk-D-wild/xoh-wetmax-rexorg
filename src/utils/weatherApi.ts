import axios from 'axios';
import { GeoLocation, WeatherData, ForecastData } from '../types/weather';

// WeatherAPI.com API key - free tier with generous limits
const API_KEY = '510cba4a8f2045758aa150311251904'; 
const BASE_URL = 'https://api.weatherapi.com/v1';

// Convert from WeatherAPI format to our app's format
function mapCurrentWeather(data: any, units: string): WeatherData {
  // Map condition code to OpenWeatherMap-like ID
  const getWeatherId = (code: number): number => {
    if (code >= 1000 && code <= 1003) return 800; // Clear/Sunny to partly cloudy
    if (code >= 1004 && code <= 1009) return 803; // Cloudy
    if (code >= 1030 && code <= 1039) return 701; // Mist, fog, etc
    if (code >= 1063 && code <= 1069) return 500; // Rain
    if (code >= 1114 && code <= 1117) return 601; // Blowing snow
    if (code >= 1135 && code <= 1147) return 741; // Fog
    if (code >= 1150 && code <= 1201) return 501; // Rain
    if (code >= 1204 && code <= 1237) return 600; // Sleet/Snow
    if (code >= 1240 && code <= 1246) return 501; // Rain
    if (code >= 1249 && code <= 1264) return 600; // Sleet/Snow
    if (code >= 1273 && code <= 1282) return 200; // Thunder
    return 800; // Default to clear
  };
  
  // Map icon code
  const getIconCode = (code: number, isDay: boolean): string => {
    const day = isDay ? 'd' : 'n';
    if (code >= 1000 && code <= 1003) return `01${day}`; // Clear/Sunny
    if (code >= 1004 && code <= 1006) return `02${day}`; // Partly cloudy
    if (code >= 1007 && code <= 1009) return `04${day}`; // Cloudy
    if (code >= 1030 && code <= 1039) return `50${day}`; // Mist
    if (code >= 1063 && code <= 1069) return `09${day}`; // Rain
    if (code >= 1114 && code <= 1117) return `13${day}`; // Snow
    if (code >= 1135 && code <= 1147) return `50${day}`; // Fog
    if (code >= 1150 && code <= 1201) return `10${day}`; // Rain
    if (code >= 1204 && code <= 1237) return `13${day}`; // Sleet/Snow
    if (code >= 1240 && code <= 1246) return `09${day}`; // Rain
    if (code >= 1249 && code <= 1264) return `13${day}`; // Sleet/Snow
    if (code >= 1273 && code <= 1282) return `11${day}`; // Thunder
    return `01${day}`; // Default to clear
  };

  // Convert 12-hour time format to timestamp
  const timeStringToTimestamp = (timeStr: string, dateEpoch: number): number => {
    if (!timeStr) return Math.floor(Date.now() / 1000);
    
    // Parse time string like "06:30 AM"
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    // Convert to 24-hour format
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    // Create date object from dateEpoch
    const date = new Date(dateEpoch * 1000);
    date.setHours(hours, minutes, 0, 0);
    
    return Math.floor(date.getTime() / 1000);
  };

  // Get sunrise and sunset timestamps
  let sunriseTimestamp = Math.floor(Date.now() / 1000) - 3600; // fallback
  let sunsetTimestamp = Math.floor(Date.now() / 1000) + 3600;  // fallback
  
  if (data.forecast?.forecastday?.[0]?.astro) {
    const astro = data.forecast.forecastday[0].astro;
    sunriseTimestamp = timeStringToTimestamp(astro.sunrise, data.location.localtime_epoch);
    sunsetTimestamp = timeStringToTimestamp(astro.sunset, data.location.localtime_epoch);
  }

  // Get air quality data if available
  const airQuality = data.current?.air_quality || {};
  const aqiDetails = {
    co: airQuality.co || 0,
    no2: airQuality.no2 || 0,
    o3: airQuality.o3 || 0,
    so2: airQuality.so2 || 0,
    pm2_5: airQuality.pm2_5 || 0,
    pm10: airQuality.pm10 || 0,
    'us-epa-index': airQuality['us-epa-index'] || 0,
    'gb-defra-index': airQuality['gb-defra-index'] || 0
  };

  // Extract alert information
  const alerts = data.alerts?.alert || [];
  const alertHeadline = alerts.length > 0 ? alerts[0].headline : null;

  return {
    name: data.location.name,
    sys: {
      country: data.location.country,
      sunrise: sunriseTimestamp,
      sunset: sunsetTimestamp,
    },
    weather: [
      {
        id: getWeatherId(data.current.condition.code),
        main: data.current.condition.text + (alertHeadline ? ` - ALERT: ${alertHeadline}` : ''),
        description: data.current.condition.text + (alertHeadline ? ` - ALERT: ${alertHeadline}` : ''),
        icon: getIconCode(data.current.condition.code, data.current.is_day === 1),
      }
    ],
    main: {
      temp: units === 'metric' ? data.current.temp_c : data.current.temp_f,
      feels_like: units === 'metric' ? data.current.feelslike_c : data.current.feelslike_f,
      temp_min: units === 'metric' ? data.forecast?.forecastday[0]?.day?.mintemp_c || data.current.temp_c - 2 : data.forecast?.forecastday[0]?.day?.mintemp_f || data.current.temp_f - 5,
      temp_max: units === 'metric' ? data.forecast?.forecastday[0]?.day?.maxtemp_c || data.current.temp_c + 2 : data.forecast?.forecastday[0]?.day?.maxtemp_f || data.current.temp_f + 5,
      pressure: data.current.pressure_mb,
      humidity: data.current.humidity,
    },
    wind: {
      speed: units === 'metric' ? data.current.wind_kph * 0.277778 : data.current.wind_mph, // Convert kph to m/s for metric
      deg: data.current.wind_degree,
      gust: units === 'metric' ? data.current.gust_kph * 0.277778 : data.current.gust_mph, // Add gust information
    },
    clouds: {
      all: data.current.cloud,
    },
    visibility: data.current.vis_km * 1000, // Convert to meters
    dt: data.current.last_updated_epoch,
    timezone: data.location.localtime_epoch - Math.floor(Date.now() / 1000),
    coord: {
      lat: data.location.lat,
      lon: data.location.lon,
    },
    // Add additional climate data
    aqi: aqiDetails,
    uv_index: data.current.uv,
    precipitation: data.current.precip_mm,
    alerts: alerts.map((alert: any) => ({
      title: alert.headline,
      description: alert.desc,
      severity: alert.severity,
      time: alert.effective,
      expires: alert.expires
    })),
    region: data.location.region,
    local_time: data.location.localtime
  };
}

export async function getCurrentWeather(
  location: GeoLocation, 
  units: string = 'metric'
): Promise<WeatherData> {
  try {
    console.log('Fetching weather data from WeatherAPI.com');
    
    const locationQuery = location.name 
      ? location.name
      : `${location.lat},${location.lon}`;
      
    const response = await axios.get(`${BASE_URL}/forecast.json`, {
      params: {
        key: API_KEY,
        q: locationQuery,
        days: 1,
        aqi: 'yes', // Include air quality data
        alerts: 'yes', // Include weather alerts
        lang: 'en' // Ensure English language response
      },
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    console.log('Got WeatherAPI.com response, status:', response.status);
    
    return mapCurrentWeather(response.data, units);
  } catch (error) {
    console.error('Error fetching weather from WeatherAPI.com:', error);
    
    // Return fallback data
    return {
      name: location.name || 'Unknown Location',
      sys: {
        country: location.country || '',
        sunrise: Math.floor(Date.now() / 1000) - 3600,
        sunset: Math.floor(Date.now() / 1000) + 3600,
      },
      weather: [
        {
          id: 800,
          main: 'Clear',
          description: 'clear sky',
          icon: '01d',
        }
      ],
      main: {
        temp: 20,
        feels_like: 20,
        temp_min: 18,
        temp_max: 22,
        pressure: 1013,
        humidity: 50,
      },
      wind: {
        speed: 5,
        deg: 0,
      },
      clouds: {
        all: 0,
      },
      visibility: 10000,
      dt: Math.floor(Date.now() / 1000),
      timezone: 0,
      coord: {
        lat: location.lat,
        lon: location.lon,
      },
    };
  }
}

export async function getForecast(
  location: GeoLocation, 
  units: string = 'metric'
): Promise<ForecastData> {
  try {
    console.log('Fetching forecast data from WeatherAPI.com');
    
    const locationQuery = location.name 
      ? location.name
      : `${location.lat},${location.lon}`;
      
    const response = await axios.get(`${BASE_URL}/forecast.json`, {
      params: {
        key: API_KEY,
        q: locationQuery,
        days: 10, // Get a 10-day forecast for more comprehensive data
        aqi: 'yes', // Include air quality data
        alerts: 'yes', // Include weather alerts
        lang: 'en' // Ensure English language
      },
      headers: {
        'Cache-Control': 'no-cache', // Prevent caching to ensure fresh data
        'Pragma': 'no-cache'
      }
    });
    
    console.log('Got WeatherAPI.com forecast response, status:', response.status);
    
    // Format the forecast data to match our app's expected format
    const forecastItems: any[] = [];
    
    if (response.data.forecast && response.data.forecast.forecastday) {
      response.data.forecast.forecastday.forEach((day: any) => {
        // For each day, get hours or create 3-hour intervals
        if (day.hour && day.hour.length > 0) {
          // Use actual hourly data
          day.hour.forEach((hour: any) => {
            const getWeatherId = (code: number): number => {
              if (code >= 1000 && code <= 1003) return 800;
              if (code >= 1004 && code <= 1009) return 803;
              if (code >= 1030 && code <= 1039) return 701;
              if (code >= 1063 && code <= 1069) return 500;
              return 800;
            };
            
            const getIconCode = (code: number, isDay: boolean): string => {
              const dayStr = isDay ? 'd' : 'n';
              if (code >= 1000 && code <= 1003) return `01${dayStr}`;
              if (code >= 1004 && code <= 1009) return `04${dayStr}`;
              if (code >= 1030 && code <= 1039) return `50${dayStr}`;
              if (code >= 1063 && code <= 1069) return `10${dayStr}`;
              return `01${dayStr}`;
            };
            
            const dt = hour.time_epoch;
            const date = new Date(dt * 1000);
            const isDay = date.getHours() >= 6 && date.getHours() < 18;
            
            // Extract air quality data if available
            const airQuality = hour.air_quality || {};

            forecastItems.push({
              dt: dt,
              main: {
                temp: units === 'metric' ? hour.temp_c : hour.temp_f,
                feels_like: units === 'metric' ? hour.feelslike_c : hour.feelslike_f,
                temp_min: units === 'metric' ? day.day.mintemp_c : day.day.mintemp_f,
                temp_max: units === 'metric' ? day.day.maxtemp_c : day.day.maxtemp_f,
                pressure: hour.pressure_mb,
                humidity: hour.humidity,
              },
              weather: [
                {
                  id: getWeatherId(hour.condition.code),
                  main: hour.condition.text,
                  description: hour.condition.text,
                  icon: getIconCode(hour.condition.code, isDay),
                }
              ],
              clouds: {
                all: hour.cloud,
              },
              wind: {
                speed: units === 'metric' ? hour.wind_kph * 0.277778 : hour.wind_mph, // Convert kph to m/s for metric
                deg: hour.wind_degree,
                gust: units === 'metric' ? hour.gust_kph * 0.277778 : hour.gust_mph,
              },
              visibility: hour.vis_km * 1000,
              pop: hour.chance_of_rain / 100,
              dt_txt: hour.time,
              // Add enhanced global climate data
              uv: hour.uv,
              precipitation_mm: hour.precip_mm,
              chance_of_rain: hour.chance_of_rain,
              chance_of_snow: hour.chance_of_snow,
              air_quality: {
                co: airQuality.co,
                no2: airQuality.no2,
                o3: airQuality.o3,
                so2: airQuality.so2,
                pm2_5: airQuality.pm2_5,
                pm10: airQuality.pm10,
                'us-epa-index': airQuality['us-epa-index']
              }
            });
          });
        } else {
          // Create 3-hour intervals from day data
          for (let hour = 0; hour < 24; hour += 3) {
            const date = new Date(day.date_epoch * 1000);
            date.setHours(hour, 0, 0, 0);
            const isDay = hour >= 6 && hour < 18;
            
            forecastItems.push({
              dt: Math.floor(date.getTime() / 1000),
              main: {
                temp: units === 'metric'
                  ? hour < 12 ? day.day.mintemp_c : day.day.maxtemp_c
                  : hour < 12 ? day.day.mintemp_f : day.day.maxtemp_f,
                feels_like: units === 'metric'
                  ? hour < 12 ? day.day.mintemp_c : day.day.maxtemp_c
                  : hour < 12 ? day.day.mintemp_f : day.day.maxtemp_f,
                temp_min: units === 'metric' ? day.day.mintemp_c : day.day.mintemp_f,
                temp_max: units === 'metric' ? day.day.maxtemp_c : day.day.maxtemp_f,
                pressure: 1013, // Default
                humidity: day.day.avghumidity,
              },
              weather: [
                {
                  id: day.day.condition.code >= 1000 && day.day.condition.code <= 1003 ? 800 : 500,
                  main: day.day.condition.text,
                  description: day.day.condition.text,
                  icon: isDay ? '01d' : '01n', // Simplified
                }
              ],
              clouds: {
                all: 0, // Not available
              },
              wind: {
                speed: units === 'metric' ? day.day.maxwind_kph * 0.277778 : day.day.maxwind_mph,
                deg: 0, // Not available
              },
              visibility: 10000, // Default
              pop: day.day.daily_chance_of_rain / 100,
              dt_txt: date.toISOString().replace('T', ' ').substr(0, 19),
            });
          }
        }
      });
    }
    
    // Sort by timestamp
    forecastItems.sort((a, b) => a.dt - b.dt);
    
    // Get sunrise/sunset from forecast data
    let sunriseTimestamp = Math.floor(Date.now() / 1000) - 3600; // fallback
    let sunsetTimestamp = Math.floor(Date.now() / 1000) + 3600;  // fallback
    
    if (response.data.forecast?.forecastday?.[0]?.astro) {
      const astro = response.data.forecast.forecastday[0].astro;
      const timeStringToTimestamp = (timeStr: string, dateEpoch: number): number => {
        if (!timeStr) return Math.floor(Date.now() / 1000);
        
        // Parse time string like "06:30 AM"
        const [time, period] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        
        // Convert to 24-hour format
        if (period === 'PM' && hours < 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        
        // Create date object from dateEpoch
        const date = new Date(dateEpoch * 1000);
        date.setHours(hours, minutes, 0, 0);
        
        return Math.floor(date.getTime() / 1000);
      };
      
      sunriseTimestamp = timeStringToTimestamp(astro.sunrise, response.data.location.localtime_epoch);
      sunsetTimestamp = timeStringToTimestamp(astro.sunset, response.data.location.localtime_epoch);
    }
    
    return {
      list: forecastItems,
      city: {
        name: response.data.location.name,
        country: response.data.location.country,
        sunrise: sunriseTimestamp,
        sunset: sunsetTimestamp,
      },
    };
  } catch (error) {
    console.error('Error fetching forecast from WeatherAPI.com:', error);
    
    // Return fallback forecast data
    const forecastItems: any[] = [];
    
    // Create fallback forecast data for 5 days
    for (let i = 0; i < 5; i++) {
      for (let hour = 0; hour < 24; hour += 3) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        date.setHours(hour, 0, 0, 0);
        
        const tempMax = 25 - i;  // Decrease temperature each day
        const tempMin = 15 - i;
        const descriptions = ['Clear', 'Clouds', 'Rain', 'Clear', 'Clouds'];
        
        forecastItems.push({
          dt: Math.floor(date.getTime() / 1000),
          main: {
            temp: hour < 12 ? tempMin : tempMax,
            feels_like: hour < 12 ? tempMin : tempMax,
            temp_min: tempMin,
            temp_max: tempMax,
            pressure: 1013,
            humidity: 70,
          },
          weather: [
            {
              id: hour < 12 ? 800 : 801,
              main: descriptions[i % descriptions.length],
              description: descriptions[i % descriptions.length],
              icon: hour >= 6 && hour < 18 ? '01d' : '01n',
            }
          ],
          clouds: {
            all: hour < 12 ? 0 : 30,
          },
          wind: {
            speed: 5,
            deg: 0,
          },
          visibility: 10000,
          pop: 0,
          dt_txt: date.toISOString().replace('T', ' ').substr(0, 19),
        });
      }
    }
    
    return {
      list: forecastItems,
      city: {
        name: location.name || 'Unknown Location',
        country: location.country || '',
        sunrise: Math.floor(Date.now() / 1000) - 3600,
        sunset: Math.floor(Date.now() / 1000) + 3600,
      },
    };
  }
}

export async function searchLocation(query: string): Promise<GeoLocation[]> {
  try {
    console.log('Searching for location:', query);
    
    const response = await axios.get(`${BASE_URL}/search.json`, {
      params: {
        key: API_KEY,
        q: query
      }
    });
    
    console.log('WeatherAPI.com location search response status:', response.status);
    
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      return response.data.map((item: any) => ({
        name: item.name,
        country: item.country,
        lat: item.lat,
        lon: item.lon
      }));
    }
    
    // If no results from WeatherAPI, return fallback data
    console.log('No location results, returning fallback');
    return [
      {
        name: query,
        country: '',
        lat: 40.7128, // New York coordinates as fallback
        lon: -74.0060
      }
    ];
  } catch (error) {
    console.error('Error searching location from WeatherAPI.com:', error);
    
    // Return fallback data
    return [
      {
        name: query,
        country: '',
        lat: 40.7128, // New York coordinates as fallback
        lon: -74.0060
      }
    ];
  }
}

export async function reverseGeocode(lat: number, lon: number): Promise<GeoLocation | null> {
  try {
    console.log('Reverse geocoding using WeatherAPI.com:', lat, lon);
    
    const response = await axios.get(`${BASE_URL}/search.json`, {
      params: {
        key: API_KEY,
        q: `${lat},${lon}`
      }
    });
    
    console.log('WeatherAPI.com reverse geocoding response status:', response.status);
    
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      const item = response.data[0];
      return {
        lat,
        lon,
        name: item.name,
        country: item.country
      };
    }
    
    // If geocoding fails, return basic location
    console.log('No reverse geocoding results, returning basic location');
    return {
      lat,
      lon,
      name: `Location (${lat.toFixed(2)}, ${lon.toFixed(2)})`,
      country: '',
    };
  } catch (error) {
    console.error('Error reverse geocoding from WeatherAPI.com:', error);
    
    // Return basic location on error
    return {
      lat,
      lon,
      name: `Location (${lat.toFixed(2)}, ${lon.toFixed(2)})`,
      country: '',
    };
  }
} 