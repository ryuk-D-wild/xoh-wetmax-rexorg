import React from 'react';
import { Cloud, RefreshCw, Thermometer } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import SearchBar from './SearchBar';
import toast from 'react-hot-toast';

export default function WeatherHeader() {
  const { toggleTemperatureUnit, temperatureUnit, refreshWeather, isLoading } = useWeather();
  
  const handleRefresh = async () => {
    try {
      await refreshWeather();
      toast.success('Weather data updated!');
    } catch (error) {
      toast.error('Failed to update weather data');
    }
  };

  return (
    <header className="w-full py-4 px-4 flex flex-col md:flex-row justify-between items-center mb-6">
      <div className="flex items-center mb-4 md:mb-0">
        <Cloud className="h-8 w-8 text-white mr-2" />
        <h1 className="text-2xl font-bold text-white">Weather Forecast</h1>
      </div>
      
      <div className="flex flex-col md:flex-row items-center w-full md:w-auto space-y-4 md:space-y-0 md:space-x-4">
        <SearchBar />
        
        <div className="flex space-x-2">
          <button
            onClick={toggleTemperatureUnit}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-2 rounded-full transition-colors duration-200 flex items-center"
            aria-label="Toggle temperature unit"
          >
            <Thermometer className="h-5 w-5 mr-1" />
            {temperatureUnit === 'metric' ? '°C' : '°F'}
          </button>
          
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className={`bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-2 rounded-full transition-colors duration-200 flex items-center ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            aria-label="Refresh weather data"
          >
            <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
}