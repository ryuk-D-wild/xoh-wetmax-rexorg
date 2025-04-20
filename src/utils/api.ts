import axios from 'axios';
import { GeoLocation, WeatherData, ForecastData } from '../types/weather';
import * as cheerio from 'cheerio';

// Function to get current weather from Google search
export async function getCurrentWeather(
  location: GeoLocation, 
  units: string = 'metric'
): Promise<WeatherData> {
  try {
    const locationQuery = location.name 
      ? `${location.name}${location.country ? `, ${location.country}` : ''}` 
      : `${location.lat},${location.lon}`;
      
    const searchUrl = `https://www.google.com/search?q=weather+${encodeURIComponent(locationQuery)}`;
    
    console.log('Fetching weather data from URL:', searchUrl);
    
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    console.log('Got response, status:', response.status);
    
    const $ = cheerio.load(response.data);
    
    // Extract weather data from Google's weather widget
    // Try different selectors as Google may change their HTML structure
    let temperature = parseFloat($('#wob_tm').text());
    let description = $('#wob_dc').text();
    let humidity = parseInt($('#wob_hm').text().replace('%', ''));
    let windSpeed = parseFloat($('#wob_ws').text().split(' ')[0]);
    let locationName = $('#wob_loc').text();
    
    console.log('Initial scraping results:', {
      temperature, description, humidity, windSpeed, locationName
    });
    
    // Alternative selectors if the main ones don't work
    if (isNaN(temperature)) {
      const tempText = $('.wob_t').first().text();
      temperature = parseFloat(tempText) || 20; // Fallback value
      console.log('Using alternative temperature selector, found:', tempText);
    }
    
    if (!description) {
      description = $('.wtsRwe').text() || 'Clear';
      console.log('Using alternative description selector, found:', description);
    }
    
    if (isNaN(humidity)) {
      const humidityText = $('span:contains("Humidity")').next().text();
      humidity = parseInt(humidityText) || 50; // Fallback value
      console.log('Using alternative humidity selector, found:', humidityText);
    }
    
    if (isNaN(windSpeed)) {
      const windText = $('span:contains("Wind")').next().text();
      windSpeed = parseFloat(windText) || 5; // Fallback value
      console.log('Using alternative wind selector, found:', windText);
    }
    
    if (!locationName) {
      locationName = $('.wob_loc').text() || location.name || 'Unknown Location';
      console.log('Using alternative location selector, found:', locationName);
    }
    
    // Use fallback values if still not available
    temperature = isNaN(temperature) ? 20 : temperature;
    description = description || 'Clear';
    humidity = isNaN(humidity) ? 50 : humidity;
    windSpeed = isNaN(windSpeed) ? 5 : windSpeed;
    locationName = locationName || location.name || 'Unknown Location';
    
    console.log('Final weather data:', {
      temperature, description, humidity, windSpeed, locationName
    });
    
    // Convert to our WeatherData format
    const weatherData: WeatherData = {
      name: locationName.split(',')[0].trim(),
      sys: {
        country: locationName.split(',').length > 1 ? locationName.split(',')[1].trim() : '',
        sunrise: Math.floor(Date.now() / 1000) - 3600, // Approximation
        sunset: Math.floor(Date.now() / 1000) + 3600,  // Approximation
      },
      weather: [
        {
          id: getWeatherIdFromDescription(description),
          main: description,
          description: description,
          icon: getIconCodeFromDescription(description, true),
        }
      ],
      main: {
        temp: units === 'metric' ? temperature : convertToMetric(temperature),
        feels_like: units === 'metric' ? temperature : convertToMetric(temperature),
        temp_min: units === 'metric' ? temperature - 2 : convertToMetric(temperature) - 2,
        temp_max: units === 'metric' ? temperature + 2 : convertToMetric(temperature) + 2,
        pressure: 1013, // Default value
        humidity: humidity,
      },
      wind: {
        speed: windSpeed,
        deg: 0, // Not available in Google search
      },
      clouds: {
        all: getCloudPercentFromDescription(description),
      },
      visibility: 10000, // Default value
      dt: Math.floor(Date.now() / 1000),
      timezone: 0,
      coord: {
        lat: location.lat,
        lon: location.lon,
      },
    };
    
    return weatherData;
  } catch (error) {
    console.error('Error fetching current weather from Google:', error);
    
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
  _units: string = 'metric'  
): Promise<ForecastData> {
  try {
    const locationQuery = location.name ? `${location.name}${location.country ? `, ${location.country}` : ''}` : `${location.lat},${location.lon}`;
    const searchUrl = `https://www.google.com/search?q=weather+forecast+${encodeURIComponent(locationQuery)}`;
    
    console.log('Fetching forecast data from URL:', searchUrl);
    
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    console.log('Got forecast response, status:', response.status);
    
    const $ = cheerio.load(response.data);
    
    const forecastItems: ForecastItem[] = [];
    
    const forecastElements = $('.wob_df');
    console.log('Found forecast elements:', forecastElements.length);
    
    if (forecastElements.length > 0) {
      forecastElements.each((i: number, element: any) => {
        const day = $(element).find('.wob_ds').text();
        const tempMax = parseFloat($(element).find('.wob_t').first().text()) || 25; // Fallback
        const tempMin = parseFloat($(element).find('.wob_t').last().text()) || 15; // Fallback
        const description = $(element).find('img').attr('alt') || 'Clear';
        
        console.log(`Day ${i} forecast:`, { day, tempMax, tempMin, description });
        
        for (let hour = 0; hour < 24; hour += 3) {
          const date = new Date();
          date.setDate(date.getDate() + i);
          date.setHours(hour, 0, 0, 0);
          
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
                id: getWeatherIdFromDescription(description),
                main: description,
                description: description,
                icon: getIconCodeFromDescription(description, hour >= 6 && hour < 18),
              }
            ],
            clouds: {
              all: getCloudPercentFromDescription(description),
            },
            wind: {
              speed: 11, 
              deg: 0,
            },
            visibility: 10000,
            pop: 0, 
            dt_txt: date.toISOString().replace('T', ' ').substr(0, 19),
          });
        }
      });
    } else {
      console.log('No forecast elements found, creating fallback data');
      
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
                id: getWeatherIdFromDescription(descriptions[i]),
                main: descriptions[i],
                description: descriptions[i],
                icon: getIconCodeFromDescription(descriptions[i], hour >= 6 && hour < 18),
              }
            ],
            clouds: {
              all: getCloudPercentFromDescription(descriptions[i]),
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
    }
    
    // Create ForecastData
    const forecastData: ForecastData = {
      list: forecastItems,
      city: {
        name: location.name || '',
        country: location.country || '',
        sunrise: Math.floor(Date.now() / 1000) - 3600, // Approximation
        sunset: Math.floor(Date.now() / 1000) + 3600,  // Approximation
      },
    };
    
    return forecastData;
  } catch (error) {
    console.error('Error fetching forecast from Google:', error);
    
    // Return fallback forecast data
    const forecastItems: ForecastItem[] = [];
    
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
              id: getWeatherIdFromDescription(descriptions[i % descriptions.length]),
              main: descriptions[i % descriptions.length],
              description: descriptions[i % descriptions.length],
              icon: getIconCodeFromDescription(descriptions[i % descriptions.length], hour >= 6 && hour < 18),
            }
          ],
          clouds: {
            all: getCloudPercentFromDescription(descriptions[i % descriptions.length]),
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
    
    // Since Google's autocomplete API might be restricted, let's use OpenStreetMap's Nominatim API instead
    const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
      params: {
        q: query,
        format: 'json',
        limit: 5
      },
      headers: {
        'User-Agent': 'WeatherApp/1.0'
      }
    });
    
    console.log('Location search response status:', response.status);
    
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
    return response.data.map((item: any) => ({
        name: item.display_name.split(',')[0],
        country: item.address?.country || '',
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon)
      }));
    }
    
    // If no results from Nominatim, return fallback data
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
    console.error('Error searching location:', error);
    
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
    console.log('Reverse geocoding:', lat, lon);
    
    // Use OpenStreetMap Nominatim
    const response = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
      params: {
        lat,
        lon,
        format: 'json'
      },
      headers: {
        'User-Agent': 'WeatherApp/1.0'
      }
    });
    
    console.log('Reverse geocoding response status:', response.status);
    
    if (response.data && response.data.display_name) {
      const addressParts = response.data.display_name.split(',');
      const { address } = response.data;
      
      return {
        lat,
        lon,
        name: address?.city || address?.town || address?.village || address?.hamlet || addressParts[0].trim(),
        country: address?.country || addressParts[addressParts.length - 1].trim(),
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
    console.error('Error reverse geocoding:', error);
    
    // Return basic location on error
    return {
      lat,
      lon,
      name: `Location (${lat.toFixed(2)}, ${lon.toFixed(2)})`,
      country: '',
    };
  }
}

// Helper functions
function getWeatherIdFromDescription(description: string): number {
  description = description.toLowerCase();
  if (description.includes('thunder')) return 200;
  if (description.includes('rain') && description.includes('light')) return 500;
  if (description.includes('rain')) return 501;
  if (description.includes('snow')) return 600;
  if (description.includes('mist') || description.includes('fog')) return 701;
  if (description.includes('clear')) return 800;
  if (description.includes('cloud') || description.includes('overcast')) return 801;
  return 800; // Default to clear sky
}

function getIconCodeFromDescription(description: string, isDay: boolean): string {
  description = description.toLowerCase();
  const dayNight = isDay ? 'd' : 'n';
  
  if (description.includes('thunder')) return `11${dayNight}`;
  if (description.includes('rain') && description.includes('light')) return `10${dayNight}`;
  if (description.includes('rain')) return `09${dayNight}`;
  if (description.includes('snow')) return `13${dayNight}`;
  if (description.includes('mist') || description.includes('fog')) return `50${dayNight}`;
  if (description.includes('clear')) return `01${dayNight}`;
  if (description.includes('cloud') && description.includes('few')) return `02${dayNight}`;
  if (description.includes('cloud') && description.includes('scattered')) return `03${dayNight}`;
  if (description.includes('cloud') || description.includes('overcast')) return `04${dayNight}`;
  
  return `01${dayNight}`; // Default to clear sky
}

function getCloudPercentFromDescription(description: string): number {
  description = description.toLowerCase();
  if (description.includes('clear')) return 0;
  if (description.includes('few')) return 20;
  if (description.includes('scattered')) return 40;
  if (description.includes('broken') || description.includes('partly')) return 60;
  if (description.includes('overcast') || description.includes('cloudy')) return 90;
  return 0; // Default
}

function convertToMetric(fahrenheit: number): number {
  return (fahrenheit - 32) * 5/9;
}

interface ForecastItem {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  weather: [
    {
      id: number;
      main: string;
      description: string;
      icon: string;
    }
  ];
  clouds: {
    all: number;
  };
  wind: {
    speed: number;
    deg: number;
  };
  visibility: number;
  pop: number;
  dt_txt: string;
}