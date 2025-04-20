import { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { searchLocation } from '../utils/weatherApi';
import { GeoLocation } from '../types/weather';
import { useWeather } from '../context/WeatherContext';
import toast from 'react-hot-toast';

export default function SearchBar() {
  const { setLocation } = useWeather();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeoLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const handleSearch = async () => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const locations = await searchLocation(query);
      setResults(locations);
      setShowResults(true);
    } catch (error) {
      toast.error('Error searching locations');
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLocationSelect = (location: GeoLocation) => {
    setLocation(location);
    setQuery('');
    setShowResults(false);
    toast.success(`Weather updated for ${location.name}, ${location.country}`);
  };

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (query.trim().length >= 2) {
        handleSearch();
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a city..."
          className="w-full px-4 py-2 pl-10 bg-white bg-opacity-20 backdrop-blur-lg border border-white border-opacity-30 rounded-full focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-40 text-white placeholder-white placeholder-opacity-70"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-white text-opacity-70" />
        </div>
        {isSearching && (
          <div className="absolute right-3 top-2.5">
            <div className="animate-spin h-5 w-5 border-2 border-white border-opacity-60 rounded-full border-t-transparent"></div>
          </div>
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute mt-2 w-full bg-white bg-opacity-20 backdrop-blur-xl rounded-lg shadow-lg border border-white border-opacity-20 z-10 overflow-hidden animate-slideUp">
          <ul>
            {results.map((item, index) => (
              <li
                key={`${item.lat}-${item.lon}-${index}`}
                onClick={() => handleLocationSelect(item)}
                className="px-4 py-3 hover:bg-white hover:bg-opacity-30 cursor-pointer text-white border-b border-white border-opacity-10 last:border-b-0 transition-colors duration-150"
              >
                {item.name}, {item.country}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}