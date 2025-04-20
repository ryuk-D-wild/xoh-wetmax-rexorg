import React from 'react';
import { ForecastItem } from '../types/weather';
import { formatDay, formatTemperature, getWeatherIconUrl } from '../utils/helpers';
import { useWeather } from '../context/WeatherContext';

interface ForecastCardProps {
  forecast: ForecastItem;
}

export default function ForecastCard({ forecast }: ForecastCardProps) {
  const { temperatureUnit } = useWeather();
  
  return (
    <div className="glass rounded-lg p-4 flex flex-col items-center transition-transform hover:scale-105">
      <div className="text-white font-medium">
        {formatDay(forecast.dt)}
      </div>
      
      <img 
        src={getWeatherIconUrl(forecast.weather[0].icon)} 
        alt={forecast.weather[0].description} 
        className="w-12 h-12 my-2"
      />
      
      <div className="text-white font-semibold text-lg">
        {formatTemperature(forecast.main.temp, temperatureUnit)}
      </div>
      
      <div className="text-white text-opacity-80 text-sm text-center capitalize mt-1">
        {forecast.weather[0].description}
      </div>
      
      <div className="flex justify-between w-full mt-2 text-xs text-white text-opacity-70">
        <span>💧 {forecast.main.humidity}%</span>
        <span>💨 {Math.round(forecast.wind.speed)}{temperatureUnit === 'metric' ? 'm/s' : 'mph'}</span>
      </div>
    </div>
  );
}