import { WeatherProvider, useWeather } from './context/WeatherContext';
import CurrentWeather from './components/CurrentWeather';
import Forecast from './components/Forecast';
import WeatherHeader from './components/WeatherHeader';
import { getWeatherBackground, isDaytime } from './utils/helpers';
import { Toaster } from 'react-hot-toast';

// Main Weather App Component
function WeatherApp() {
  const { currentWeather,} = useWeather();
  
  // Determine the background based on weather conditions
  const backgroundClass = currentWeather
    ? getWeatherBackground(
        currentWeather.weather[0].id,
        isDaytime(currentWeather.dt, currentWeather.sys.sunrise, currentWeather.sys.sunset)
      )
    : 'bg-gradient-to-br from-blue-400 to-blue-800';

  return (
    <div className={`min-h-screen transition-colors duration-1000 ${backgroundClass}`}>
      <div className="container mx-auto px-4 py-6">
        <WeatherHeader />
        
        <main className="max-w-4xl mx-auto">
          <CurrentWeather />
          <Forecast />
        </main>
        
        <footer className="mt-10 text-center text-white text-opacity-70 text-sm">
          <p>
            Data provided by{' '}
            <a
              href="https://www.weatherapi.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white"
            >
              WeatherAPI.com
            </a>
          </p>
        </footer>
      </div>
      
      <Toaster position="top-right" />
    </div>
  );
}

// Root App with Provider
function App() {
  return (
    <WeatherProvider>
      <WeatherApp />
    </WeatherProvider>
  );
}

export default App;