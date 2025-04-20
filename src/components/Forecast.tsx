import React from 'react';
import { useWeather } from '../context/WeatherContext';
import ForecastCard from './ForecastCard';
import { groupForecastByDay, getDailySummary } from '../utils/helpers';

export default function Forecast() {
  const { forecast, isLoading } = useWeather();

  if (isLoading || !forecast) {
    return (
      <div className="w-full mt-6">
        <h2 className="text-xl font-semibold text-white mb-4">5-Day Forecast</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass rounded-lg p-4 h-32"></div>
          ))}
        </div>
      </div>
    );
  }

  const dailyForecasts = groupForecastByDay(forecast.list)
    .slice(0, 5) // Get only the first 5 days
    .map(dayForecast => getDailySummary(dayForecast));

  return (
    <div className="w-full mt-6 animate-fadeIn">
      <h2 className="text-xl font-semibold text-white mb-4">5-Day Forecast</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {dailyForecasts.map((dayForecast, index) => (
          <ForecastCard key={index} forecast={dayForecast} />
        ))}
      </div>
    </div>
  );
}