"use client";
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Image from 'next/image';

type Car = {
  _id: string;
  model: string;
  regestrationNumber: string;
  type: string;
  year: number;
  location: string;
  pricePerDay: number;
  status: string;
  image?: string;
  features?: string[];
};

const CarCard: React.FC<{ car: Car }> = ({ car }) => {
  return (
    <div className="bg-light rounded-lg shadow-default overflow-hidden transition-default hover:shadow-primary">
      <div className="p-4">
        <div className="flex items-start gap-4">
          {car.image && (
            <Image
              width={96}
              height={96}
              src={car.image} 
              alt={car.model}
              className="w-24 h-24 object-cover rounded-md"
            />
          )}
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-bold text-primary">{car.model}</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${
                car.status === 'available' ? 'bg-available text-light' :
                car.status === 'rented' ? 'bg-unavailable text-light' :
                'bg-maintenance text-light'
              }`}>
                {car.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <p className="text-sm text-earth-light">Reg No:</p>
                <p className="font-medium text-earth">{car.regestrationNumber}</p>
              </div>
              <div>
                <p className="text-sm text-earth-light">Year:</p>
                <p className="font-medium text-earth">{car.year}</p>
              </div>
              <div>
                <p className="text-sm text-earth-light">Type:</p>
                <p className="font-medium text-earth">{car.type}</p>
              </div>
              <div>
                <p className="text-sm text-earth-light">Price/Day:</p>
                <p className="font-medium text-earth">KSh {car.pricePerDay.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
        
        {car.features && car.features.length > 0 && (
          <div className="mt-3">
            <p className="text-sm text-earth-light mb-1">Features:</p>
            <div className="flex flex-wrap gap-2">
              {car.features.map((feature, index) => (
                <span key={index} className="px-2 py-1 bg-secondary-dark text-earth text-xs rounded-full">
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CarSearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<Car[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [allCars, setAllCars] = useState<Car[]>([]);
  const [foundCars, setFoundCars] = useState<Car[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch all cars from API
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await axios.get('/api/cars');
        if (response.data.success) {
          setAllCars(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching cars:', error);
      }
    };
    fetchCars();
  }, []);

  // Handle clicks outside the search box
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update suggestions when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '' || searchTerm.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const filtered = allCars.filter(car =>
      car.regestrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.model.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 10);

    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  }, [searchTerm, allCars]);

  const handleSearch = async (car?: Car) => {
    setIsSearching(true);
    setErrorMessage('');
    try {
      if (car) {
        // Add the selected car to found cars if not already present
        setFoundCars(prev => 
          prev.some(c => c._id === car._id) ? prev : [...prev, car]
        );
        setSearchTerm('');
      } else {
        // First try exact match by registration number
        const exactMatch = allCars.find(c => 
          c.regestrationNumber.toLowerCase() === searchTerm.toLowerCase()
        );
        
        if (exactMatch) {
          setFoundCars(prev => 
            prev.some(c => c._id === exactMatch._id) ? prev : [...prev, exactMatch]
          );
          setSearchTerm('');
        } else {
          // If no exact match, show error message
          setErrorMessage('Car not found. Please register this car or contact admin');
        }
      }
    } catch (error) {
      console.error('Error searching cars:', error);
      setErrorMessage('Error searching for cars. Please try again.');
    } finally {
      setIsSearching(false);
      setShowSuggestions(false);
    }
  };

  const handleRemoveCar = (carId: string) => {
    setFoundCars(prev => prev.filter(car => car._id !== carId));
  };

  return (
    <div className="min-h-screen bg-secondary-dark p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-6">Car Owner Management</h1>
        
        {/* Search Section */}
        <div className="bg-light p-4 rounded-lg shadow-default mb-6" ref={searchRef}>
          <h2 className="text-lg font-semibold text-earth mb-3">Search Cars by Registration Number</h2>
          <div className="relative">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Enter registration number (e.g. KDE 123A)"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (e.target.value.length >= 3) setShowSuggestions(true);
                  }}
                  onFocus={() => searchTerm.length >= 3 && setShowSuggestions(true)}
                  className="w-full px-4 py-2 border border-earth-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <ul className="absolute z-10 w-full mt-1 bg-light border border-earth-light rounded-md shadow-lg max-h-60 overflow-auto">
                    {suggestions.map((car) => (
                      <li
                        key={car._id}
                        className="px-4 py-2 hover:bg-secondary-dark cursor-pointer transition-default flex justify-between items-center"
                        onClick={() => handleSearch(car)}
                      >
                        <div>
                          <div className="font-medium text-earth">{car.model}</div>
                          <div className="text-sm text-earth-light">{car.regestrationNumber}</div>
                        </div>
                        <span className="text-xs bg-primary text-light px-2 py-1 rounded-full">
                          {car.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button
                onClick={() => handleSearch()}
                disabled={isSearching || !searchTerm.trim()}
                className="px-4 py-2 bg-accent text-light rounded-md hover:bg-accent-light transition-default disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent-light"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
            {errorMessage && (
              <div className="mt-2 text-danger text-sm">
                {errorMessage} <a href="/admin/cars/add" className="text-primary hover:underline">Register new car</a>
              </div>
            )}
          </div>
        </div>

        {/* Status Message */}
        {isSearching && (
          <div className="mb-6 p-3 bg-info text-light rounded-md">
            Searching for cars...
          </div>
        )}

        {/* Found Cars Section */}
        {foundCars.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-primary">
                Found {foundCars.length} {foundCars.length === 1 ? 'Car' : 'Cars'}
              </h2>
              <button 
                onClick={() => {
                  setFoundCars([]);
                  setErrorMessage('');
                }}
                className="text-sm text-danger hover:underline"
              >
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {foundCars.map(car => (
                <div key={car._id} className="relative">
                  <CarCard car={car} />
                  <button
                    onClick={() => handleRemoveCar(car._id)}
                    className="absolute top-2 right-2 bg-danger text-light p-1 rounded-full hover:bg-opacity-90 transition-default"
                    aria-label="Remove car"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isSearching && searchTerm && foundCars.length === 0 && !errorMessage && (
          <div className="p-6 bg-light rounded-lg shadow-default text-center">
            <p className="text-earth">No cars found matching your search</p>
            <p className="text-sm text-earth-light mt-2">Try a different registration number</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CarSearchPage;