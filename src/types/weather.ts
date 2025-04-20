export interface WeatherData {
  name: string;
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  weather: [
    {
      id: number;
      main: string;
      description: string;
      icon: string;
    }
  ];
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  clouds: {
    all: number;
  };
  visibility: number;
  dt: number;
  timezone: number;
  coord: {
    lat: number;
    lon: number;
  };
  // Additional global climate data
  aqi?: {
    co: number;
    no2: number;
    o3: number;
    so2: number;
    pm2_5: number;
    pm10: number;
    'us-epa-index': number;
    'gb-defra-index': number;
  };
  uv_index?: number;
  precipitation?: number;
  alerts?: Array<{
    title: string;
    description: string;
    severity: string;
    time: string;
    expires: string;
  }>;
  region?: string;
  local_time?: string;
}

export interface ForecastData {
  list: ForecastItem[];
  city: {
    name: string;
    country: string;
    sunrise: number;
    sunset: number;
  };
}

export interface ForecastItem {
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
    gust?: number;
  };
  visibility: number;
  pop: number;
  dt_txt: string;
  // Additional forecast data
  uv?: number;
  precipitation_mm?: number;
  chance_of_rain?: number;
  chance_of_snow?: number;
  air_quality?: {
    co?: number;
    no2?: number;
    o3?: number;
    so2?: number;
    pm2_5?: number;
    pm10?: number;
    'us-epa-index'?: number;
  };
}

export interface GeoLocation {
  lat: number;
  lon: number;
  name?: string;
  country?: string;
}

export type TemperatureUnit = 'metric' | 'imperial';