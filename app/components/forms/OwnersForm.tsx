"use client";
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiCheck, FiSave, FiX } from 'react-icons/fi';

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

type OwnerFormData = {
  name: string;
  email: string;
  phone: string;
  location: string;
  joinedDate: string;
  status: 'active' | 'inactive';
};

const CarSearchPage: React.FC = () => {
  // Owner Form State
  const [formData, setFormData] = useState<OwnerFormData>({
    name: '',
    email: '',
    phone: '',
    location: '',
    joinedDate: new Date().toISOString().slice(0, 7),
    status: 'active'
  });
  const [errors, setErrors] = useState<Partial<OwnerFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Car Search State
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name as keyof OwnerFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

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
          setErrorMessage('Car not found. Please register this car first');
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

  const validateForm = (): boolean => {
    const newErrors: Partial<OwnerFormData> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (foundCars.length === 0) {
      setErrorMessage('Please add at least one car for this owner');
      return;
    }

    setIsSubmitting(true);
    try {
      // First create the owner
      const ownerResponse = await axios.post('/api/owners', formData);
      
      if (ownerResponse.data.success) {
        const ownerId = ownerResponse.data.data._id;
        
        // Associate cars with owner
        await Promise.all(
          foundCars.map(car => 
            axios.put(`/api/cars/${car._id}`, { owner: ownerId })
          )
        );
        
        setSubmitSuccess(true);
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          location: '',
          joinedDate: new Date().toISOString().slice(0, 7),
          status: 'active'
        });
        setFoundCars([]);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrorMessage('Error saving owner. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      location: '',
      joinedDate: new Date().toISOString().slice(0, 7),
      status: 'active'
    });
    setFoundCars([]);
    setErrors({});
    setErrorMessage('');
    setSubmitSuccess(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light/90 via-secondary to-primary">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary-light/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-accent/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 right-1/3 w-72 h-72 bg-primary/15 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="relative bg-light/80 backdrop-blur-sm shadow-lg border-b border-primary-light/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-primary to-primary-dark p-2 rounded-xl shadow-lg">
              <FiUser className="h-5 w-5 sm:h-6 sm:w-6 text-light" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary-dark to-primary bg-clip-text text-transparent">
                Add New Car Owner
              </h1>

            </div>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {submitSuccess && (
          <div className="mb-6 p-4 bg-success text-light rounded-xl shadow-md">
            Owner and cars added successfully!
          </div>
        )}

        <div className="bg-light/90 backdrop-blur-sm rounded-2xl shadow-xl border border-light/20 overflow-hidden mb-8">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Field */}
              <div className="md:col-span-2">
                <label htmlFor="name" className="flex items-center space-x-2 text-sm font-medium text-gray-900 mb-2">
                  <FiUser className="h-4 w-4 text-primary" />
                  <span>Full Name</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Sarah Wanjiku"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200 bg-light/70 backdrop-blur-sm ${
                    errors.name ? 'border-danger' : 'border-primary-light/40'
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-danger flex items-center space-x-1">
                    <FiX className="h-3 w-3" />
                    <span>{errors.name}</span>
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="flex items-center space-x-2 text-sm font-medium text-gray-900 mb-2">
                  <FiMail className="h-4 w-4 text-primary" />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="e.g., sarah.wanjiku@email.com"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200 bg-light/70 backdrop-blur-sm ${
                    errors.email ? 'border-danger' : 'border-primary-light/40'
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-danger flex items-center space-x-1">
                    <FiX className="h-3 w-3" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label htmlFor="phone" className="flex items-center space-x-2 text-sm font-medium text-gray-900 mb-2">
                  <FiPhone className="h-4 w-4 text-primary" />
                  <span>Phone Number</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="e.g., +254 712 345 678"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200 bg-light/70 backdrop-blur-sm ${
                    errors.phone ? 'border-danger' : 'border-primary-light/40'
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-danger flex items-center space-x-1">
                    <FiX className="h-3 w-3" />
                    <span>{errors.phone}</span>
                  </p>
                )}
              </div>

              {/* Location Field */}
              <div>
                <label htmlFor="location" className="flex items-center space-x-2 text-sm font-medium text-gray-900 mb-2">
                  <FiMapPin className="h-4 w-4 text-primary" />
                  <span>Location</span>
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Westlands, Nairobi"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200 bg-light/70 backdrop-blur-sm ${
                    errors.location ? 'border-danger' : 'border-primary-light/40'
                  }`}
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-danger flex items-center space-x-1">
                    <FiX className="h-3 w-3" />
                    <span>{errors.location}</span>
                  </p>
                )}
              </div>

              {/* Joined Date Field */}
              <div>
                <label htmlFor="joinedDate" className="flex items-center space-x-2 text-sm font-medium text-gray-900 mb-2">
                  <FiCalendar className="h-4 w-4 text-primary" />
                  <span>Joined Date</span>
                </label>
                <input
                  type="month"
                  id="joinedDate"
                  name="joinedDate"
                  value={formData.joinedDate}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200 bg-light/70 backdrop-blur-sm ${
                    errors.joinedDate ? 'border-danger' : 'border-primary-light/40'
                  }`}
                />
                {errors.joinedDate && (
                  <p className="mt-1 text-sm text-danger flex items-center space-x-1">
                    <FiX className="h-3 w-3" />
                    <span>{errors.joinedDate}</span>
                  </p>
                )}
              </div>

              {/* Status Field */}
              <div className="md:col-span-2">
                <label htmlFor="status" className="flex items-center space-x-2 text-sm font-medium text-gray-900 mb-2">
                  <FiCheck className="h-4 w-4 text-primary" />
                  <span>Status</span>
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={formData.status === 'active'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-primary border-primary-light/40 focus:ring-primary focus:ring-2"
                    />
                    <span className="text-sm text-gray-900">Active</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="inactive"
                      checked={formData.status === 'inactive'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-primary border-primary-light/40 focus:ring-primary focus:ring-2"
                    />
                    <span className="text-sm text-gray-900">Inactive</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Car Search Section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Owner&lsquo;s Vehicles</h3>
              
              <div className="bg-light/70 p-4 rounded-xl border border-primary-light/30 mb-6" ref={searchRef}>
                <div className="relative">
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-grow">
                      <input
                        type="text"
                        placeholder="Search cars by registration number (e.g. KDE 123A)"
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          if (e.target.value.length >= 3) setShowSuggestions(true);
                        }}
                        onFocus={() => searchTerm.length >= 3 && setShowSuggestions(true)}
                        className="w-full px-4 py-3 border border-primary-light/40 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200"
                      />
                      {showSuggestions && suggestions.length > 0 && (
                        <ul className="absolute z-10 w-full mt-1 bg-light border border-primary-light/40 rounded-xl shadow-lg max-h-60 overflow-auto">
                          {suggestions.map((car) => (
                            <li
                              key={car._id}
                              className="px-4 py-3 hover:bg-secondary-dark cursor-pointer transition-default flex justify-between items-center"
                              onClick={() => handleSearch(car)}
                            >
                              <div>
                                <div className="font-medium text-earth">{car.model}</div>
                                <div className="text-sm text-earth-light">{car.regestrationNumber}</div>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                car.status === 'available' ? 'bg-available text-light' :
                                car.status === 'rented' ? 'bg-unavailable text-light' :
                                'bg-maintenance text-light'
                              }`}>
                                {car.status}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSearch()}
                      disabled={isSearching || !searchTerm.trim()}
                      className="px-4 py-3 bg-accent text-light rounded-xl hover:bg-accent-light transition-default disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent-light"
                    >
                      {isSearching ? 'Searching...' : 'Search'}
                    </button>
                  </div>
                  {errorMessage && (
                    <p className="mt-2 text-sm text-danger flex items-center space-x-1">
                      <FiX className="h-3 w-3" />
                      <span>{errorMessage}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Found Cars List */}
              {foundCars.length > 0 && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-900">
                      Selected Vehicles ({foundCars.length})
                    </h4>
                    <button 
                      type="button"
                      onClick={() => {
                        setFoundCars([]);
                        setErrorMessage('');
                      }}
                      className="text-sm text-danger hover:underline"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {foundCars.map(car => (
                      <div key={car._id} className="relative bg-secondary-dark/10 p-3 rounded-xl border border-primary-light/20">
                        <div className="flex items-start gap-3">
                          {car.image && (
                            <Image
                              width={64}
                              height={64}
                              src={car.image} 
                              alt={car.model}
                              className="w-16 h-16 object-cover rounded-md"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h5 className="font-medium text-primary">{car.model}</h5>
                              <button
                                type="button"
                                onClick={() => handleRemoveCar(car._id)}
                                className="text-danger hover:text-danger-dark"
                                aria-label="Remove car"
                              >
                                <FiX className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="text-sm text-gray-700 mt-1">
                              <p>{car.regestrationNumber}</p>
                              <p>{car.type} • {car.year}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isSubmitting}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-secondary-dark/20 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reset Form
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || foundCars.length === 0}
                  className="bg-gradient-to-r from-primary to-primary-dark text-light px-6 py-3 rounded-xl flex items-center justify-center gap-2 hover:from-primary-dark hover:to-primary-glow transition-all duration-300 font-medium shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-light border-t-transparent"></div>
                      <span>Saving Owner...</span>
                    </>
                  ) : (
                    <>
                      <FiSave className="h-4 w-4" />
                      <span>Save Owner</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CarSearchPage;