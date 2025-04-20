import React from 'react';
import { MapPin, Droplets, Wind, Eye, Thermometer, Compass } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { formatTemperature, formatTime, isDaytime, formatWindSpeed, getWeatherIconUrl } from '../utils/helpers';

export default function CurrentWeather() {
  const { currentWeather, temperatureUnit, isLoading } = useWeather();

  if (isLoading || !currentWeather) {
    return (
      <div className="w-full animate-pulse">
        <div className="glass rounded-xl p-6 mb-6">
          <div className="h-8 bg-white bg-opacity-30 rounded-md mb-4"></div>
          <div className="h-20 bg-white bg-opacity-30 rounded-md mb-4"></div>
          <div className="h-8 bg-white bg-opacity-30 rounded-md"></div>
        </div>
      </div>
    );
  }

  const daytime = isDaytime(
    currentWeather.dt,
    currentWeather.sys.sunrise,
    currentWeather.sys.sunset
  );

  return (
    <div className="w-full animate-fadeIn">
      <div className="glass rounded-xl p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-semibold text-white flex items-center">
              <MapPin className="h-5 w-5 mr-1" strokeWidth={2.5} />
              {currentWeather.name}, {currentWeather.sys.country}
            </h2>
            <p className="text-white text-opacity-80 mt-1">
              Updated at {formatTime(currentWeather.dt, currentWeather.timezone)}
            </p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold text-white text-shadow-md">
              {formatTemperature(currentWeather.main.temp, temperatureUnit)}
            </div>
            <div className="text-white text-opacity-80 mt-1">
              Feels like {formatTemperature(currentWeather.main.feels_like, temperatureUnit)}
            </div>
          </div>
        </div>

        <div className="flex items-center mt-6">
          <div className="mr-4">
            <img 
              src={getWeatherIconUrl(currentWeather.weather[0].icon)} 
              alt={currentWeather.weather[0].description} 
              className="w-16 h-16"
            />
          </div>
          <div>
            <p className="text-xl font-medium text-white capitalize">
              {currentWeather.weather[0].description}
            </p>
            <div className="flex text-white text-opacity-80 space-x-4 mt-1">
              <span>
                {formatTemperature(currentWeather.main.temp_max, temperatureUnit)} High
              </span>
              <span>
                {formatTemperature(currentWeather.main.temp_min, temperatureUnit)} Low
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white bg-opacity-10 rounded-lg p-3">
            <div className="flex items-center text-white text-opacity-70 mb-1">
              <Droplets className="h-4 w-4 mr-1" /> Humidity
            </div>
            <div className="text-white font-medium">
              {currentWeather.main.humidity}%
            </div>
          </div>
          
          <div className="bg-white bg-opacity-10 rounded-lg p-3">
            <div className="flex items-center text-white text-opacity-70 mb-1">
              <Wind className="h-4 w-4 mr-1" /> Wind
            </div>
            <div className="text-white font-medium">
              {formatWindSpeed(currentWeather.wind.speed, temperatureUnit)}
            </div>
          </div>
          
          <div className="bg-white bg-opacity-10 rounded-lg p-3">
            <div className="flex items-center text-white text-opacity-70 mb-1">
              <Eye className="h-4 w-4 mr-1" /> Visibility
            </div>
            <div className="text-white font-medium">
              {(currentWeather.visibility / 1000).toFixed(1)} km
            </div>
          </div>
          
          <div className="bg-white bg-opacity-10 rounded-lg p-3">
            <div className="flex items-center text-white text-opacity-70 mb-1">
              <Thermometer className="h-4 w-4 mr-1" /> Pressure
            </div>
            <div className="text-white font-medium">
              {currentWeather.main.pressure} hPa
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-6 text-white">
          <div className="flex flex-col items-center">
            <span className="text-white text-opacity-70 mb-1">Sunrise</span>
            <span className="font-medium">{formatTime(currentWeather.sys.sunrise, currentWeather.timezone)}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-white text-opacity-70 mb-1">Sunset</span>
            <span className="font-medium">{formatTime(currentWeather.sys.sunset, currentWeather.timezone)}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-white text-opacity-70 mb-1">Wind Direction</span>
            <div className="flex items-center font-medium">
              <Compass className="h-4 w-4 mr-1" style={{ transform: `rotate(${currentWeather.wind.deg}deg)` }} />
              {currentWeather.wind.deg}°
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}