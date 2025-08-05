// components/forms/OwnerForm.tsx
"use client";
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiCheck, FiSave, FiX, FiInfo, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';

type Car = {
  _id: string;
  model: string;
  regestrationNumber: string;
  type: string;
  year: number;
  location: string;
  pricePerDay: number;
  image?: string;
  features?: string[];
  transmission?: string;
  fuel?: string;
  seats?: number;
};

type OwnerFormData = {
  name: string;
  email: string;
  phone: string;
  location: string;
  joinedDate: string;
  status: 'active' | 'inactive' | 'suspended';
  cars: string[]; // Array of car IDs
};

type OwnerFormProps = {
  type: 'create' | 'update';
  ownerId?: string;
  ownerData?: {
    name: string;
    email: string;
    phone: string;
    location: string;
    joinedDate: string;
    status: 'active' | 'inactive' | 'suspended';
    cars: Array<{
      _id: string;
      model: string;
      regestrationNumber: string;
      type: string;
      year: number;
      image: string;
    }>;
  };
  onSuccess?: () => void;
};

const OwnerForm: React.FC<OwnerFormProps> = ({ type, ownerId, ownerData, onSuccess }) => {
  // Owner Form State
  const [formData, setFormData] = useState<Omit<OwnerFormData, 'cars'>>({
    name: ownerData?.name || '',
    email: ownerData?.email || '',
    phone: ownerData?.phone || '',
    location: ownerData?.location || '',
    joinedDate: ownerData?.joinedDate || new Date().toISOString().slice(0, 7),
    status: ownerData?.status || 'active',
  });
  const [errors, setErrors] = useState<Partial<OwnerFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Car Search State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<Car[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [allCars, setAllCars] = useState<Car[]>([]);
  const [availableCars, setAvailableCars] = useState<Car[]>([]);
  const [selectedCarIds, setSelectedCarIds] = useState<string[]>(
    ownerData?.cars ? ownerData.cars.map(car => car._id) : []
  );
  const [selectedCars, setSelectedCars] = useState<Car[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const searchRef = useRef<HTMLDivElement>(null);

  // Initialize form with owner data if updating
  useEffect(() => {
    if (type === 'update' && ownerData) {
      setFormData({
        name: ownerData.name,
        email: ownerData.email,
        phone: ownerData.phone,
        location: ownerData.location,
        joinedDate: ownerData.joinedDate,
        status: ownerData.status,
      });
      setSelectedCarIds(ownerData.cars.map(car => car._id));
      // Convert ownerData.cars to full Car objects
      const ownerCars = ownerData.cars.map(car => ({
        ...car,
        location: '',
        pricePerDay: 0,
        transmission: '',
        fuel: '',
        seats: 4
      }));
      setSelectedCars(ownerCars);
    }
  }, [type, ownerData]);

  // Fetch all cars and existing car owners
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch all cars
        const carsResponse = await axios.get('/api/cars');
        if (carsResponse.data.success) {
          setAllCars(carsResponse.data.data);
        }

        // Fetch existing car owners to determine which cars are available
        const ownersResponse = await axios.get('/api/carowners');
        if (ownersResponse.data.success) {
          const assignedCarIds = new Set<string>();
          
          // Get all car IDs that are already assigned to owners
          ownersResponse.data.data.forEach((owner: { cars?: Array<{ _id: string } | string> }) => {
            if (owner.cars && Array.isArray(owner.cars)) {
              owner.cars.forEach((car: { _id: string } | string) => {
                // Handle both populated and non-populated car references
                const carId = typeof car === 'string' ? car : car._id;
                if (carId) {
                  assignedCarIds.add(carId);
                }
              });
            }
          });

          // If updating, exclude current owner's cars from assigned cars
          if (type === 'update' && ownerData) {
            ownerData.cars.forEach(car => {
              assignedCarIds.delete(car._id);
            });
          }

          // Filter available cars
          if (carsResponse.data.success) {
            const available = carsResponse.data.data.filter((car: Car) => 
              !assignedCarIds.has(car._id)
            );
            setAvailableCars(available);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setErrorMessage('Error loading form data. Please refresh the page.');
        toast.error('Failed to load form data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [type, ownerData]);

  // Update selected cars when selectedCarIds changes
  useEffect(() => {
    if (allCars.length > 0 && selectedCarIds.length > 0) {
      const updatedSelectedCars = allCars.filter(car => 
        selectedCarIds.includes(car._id)
      );
      setSelectedCars(updatedSelectedCars);
    } else if (selectedCarIds.length === 0) {
      setSelectedCars([]);
    }
  }, [allCars, selectedCarIds]);

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
    if (searchTerm.trim() === '' || searchTerm.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const filtered = availableCars.filter(car =>
      car.regestrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.type.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 10);

    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  }, [searchTerm, availableCars]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  const handleAddCar = (car: Car) => {
    setErrorMessage('');
    if (!selectedCarIds.includes(car._id)) {
      setSelectedCarIds(prev => [...prev, car._id]);
      setSelectedCars(prev => [...prev, car]);
      toast.success(`${car.model} (${car.regestrationNumber}) added`);
    } else {
      toast('Car is already selected');
    }
    setSearchTerm('');
    setShowSuggestions(false);
  };

  const handleSearchByRegistration = () => {
    setIsSearching(true);
    setErrorMessage('');
    
    try {
      if (!searchTerm.trim()) {
        setErrorMessage('Please enter a registration number');
        return;
      }

      // Try exact match by registration number
      const exactMatch = availableCars.find(car => 
        car.regestrationNumber.toLowerCase() === searchTerm.toLowerCase().trim()
      );
      
      if (exactMatch) {
        handleAddCar(exactMatch);
      } else {
        // Check if car exists but is assigned to someone else
        const carExists = allCars.find(car => 
          car.regestrationNumber.toLowerCase() === searchTerm.toLowerCase().trim()
        );
        
        if (carExists) {
          setErrorMessage('This car is already assigned to another owner');
        } else {
          setErrorMessage('Car not found. Please check the registration number or register this car first');
        }
      }
    } catch (error) {
      console.error('Error searching cars:', error);
      setErrorMessage('Error searching for cars. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleRemoveCar = (carId: string) => {
    const car = selectedCars.find(c => c._id === carId);
    setSelectedCarIds(prev => prev.filter(id => id !== carId));
    setSelectedCars(prev => prev.filter(car => car._id !== carId));
    
    if (car) {
      toast.success(`${car.model} (${car.regestrationNumber}) removed`);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<OwnerFormData> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (formData.phone.trim().length < 10) {
      newErrors.phone = 'Phone number must be at least 10 digits';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (!formData.joinedDate) {
      newErrors.joinedDate = 'Joined date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }
    
    if (selectedCarIds.length === 0) {
      setErrorMessage('Please add at least one car for this owner');
      toast.error('At least one car must be assigned');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      const payload = {
        ...formData,
        cars: selectedCarIds
      };

      const url = type === 'create' ? '/api/carowners' : `/api/carowners/${ownerId}`;
      const method = type === 'create' ? 'post' : 'put';

      const response = await axios[method](url, payload);
      
      if (response.data.success) {
        toast.success(`Owner ${type === 'create' ? 'created' : 'updated'} successfully`);
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || 'Error saving owner';
        toast.error(errorMessage);
        setErrorMessage(errorMessage);
      } else {
        const errorMessage = 'Error saving owner. Please try again.';
        toast.error(errorMessage);
        setErrorMessage(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedCarIds([]);
    setSelectedCars([]);
    setFormData({
      name: '',
      email: '',
      phone: '',
      location: '',
      joinedDate: new Date().toISOString().slice(0, 7),
      status: 'active'
    });
    setErrors({});
    setErrorMessage('');
    setSearchTerm('');
    toast.success('Form reset');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-earth">Loading form data...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-800 text-sm flex items-center space-x-2">
            <FiX className="h-4 w-4" />
            <span>{errorMessage}</span>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name Field */}
        <div className="md:col-span-2">
          <label htmlFor="name" className="flex items-center space-x-2 text-sm font-medium text-dark mb-2">
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
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200 ${
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
          <label htmlFor="email" className="flex items-center space-x-2 text-sm font-medium text-dark mb-2">
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
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200 ${
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
          <label htmlFor="phone" className="flex items-center space-x-2 text-sm font-medium text-dark mb-2">
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
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200 ${
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
          <label htmlFor="location" className="flex items-center space-x-2 text-sm font-medium text-dark mb-2">
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
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200 ${
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
          <label htmlFor="joinedDate" className="flex items-center space-x-2 text-sm font-medium text-dark mb-2">
            <FiCalendar className="h-4 w-4 text-primary" />
            <span>Joined Date</span>
          </label>
          <input
            type="month"
            id="joinedDate"
            name="joinedDate"
            value={formData.joinedDate}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200 ${
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
        <div>
          <label htmlFor="status" className="flex items-center space-x-2 text-sm font-medium text-dark mb-2">
            <FiCheck className="h-4 w-4 text-primary" />
            <span>Status</span>
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200 ${
              errors.status ? 'border-danger' : 'border-primary-light/40'
            }`}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Car Search Section */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-dark">Owner&lsquo;s Vehicles</h3>
          <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
            <FiInfo className="h-4 w-4" />
            <span>{availableCars.length} cars available for assignment</span>
          </div>
        </div>
        
        <div className="bg-light/70 p-4 rounded-xl border border-primary-light/30 mb-6" ref={searchRef}>
          <div className="relative">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Search by registration number, model, or type (e.g. KDE 123A)"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (e.target.value.length >= 2) setShowSuggestions(true);
                  }}
                  onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearchByRegistration();
                    }
                  }}
                  className="w-full px-4 py-3 border border-primary-light/40 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <ul className="absolute z-10 w-full mt-1 bg-white border border-primary-light/40 rounded-xl shadow-lg max-h-60 overflow-auto">
                    {suggestions.map((car) => (
                      <li
                        key={car._id}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-default border-b border-gray-100 last:border-b-0"
                        onClick={() => handleAddCar(car)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium text-gray-900">{car.model}</div>
                            <div className="text-sm text-gray-600">{car.regestrationNumber} • {car.type} • {car.year}</div>
                            {car.location && (
                              <div className="text-xs text-gray-500">{car.location}</div>
                            )}
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              Available
                            </span>
                            {car.pricePerDay > 0 && (
                              <span className="text-xs text-gray-600 mt-1">
                                KES {car.pricePerDay.toLocaleString()}/day
                              </span>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button
                type="button"
                onClick={handleSearchByRegistration}
                disabled={isSearching || !searchTerm.trim()}
                className="px-6 py-3 bg-accent text-white rounded-xl hover:bg-accent-dark transition-default disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent flex items-center gap-2"
              >
                {isSearching ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <FiSearch className="h-4 w-4" />
                    <span>Add Car</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Selected Cars List */}
        {selectedCars.length > 0 && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-dark">
                Selected Vehicles ({selectedCars.length})
              </h4>
              <button 
                type="button"
                onClick={() => {
                  setSelectedCarIds([]);
                  setSelectedCars([]);
                  setErrorMessage('');
                  toast.success('All cars removed');
                }}
                className="text-sm text-danger hover:underline"
              >
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedCars.map(car => (
                <div key={car._id} className="relative bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    {car.image && (
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <Image
                          src={car.image} 
                          alt={car.model}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-semibold text-gray-900 truncate">{car.model}</h5>
                        <button
                          type="button"
                          onClick={() => handleRemoveCar(car._id)}
                          className="text-red-500 hover:text-red-700 p-1 -mt-1"
                          aria-label="Remove car"
                        >
                          <FiX className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p className="font-medium text-primary">{car.regestrationNumber}</p>
                        <p>{car.type} • {car.year}</p>
                        {car.location && <p className="text-xs">{car.location}</p>}
                        {car.pricePerDay > 0 && (
                          <p className="text-xs font-medium text-green-600">
                            KES {car.pricePerDay.toLocaleString()}/day
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No cars available message */}
        {availableCars.length === 0 && !isLoading && (
          <div className="p-6 bg-orange-50 border border-orange-200 rounded-xl text-center">
            <FiInfo className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <p className="text-orange-800 font-medium">No cars available for assignment</p>
            <p className="text-sm text-orange-600 mt-1">All cars are currently assigned to owners or you need to add cars first</p>
          </div>
        )}

        {/* No cars selected warning */}
        {selectedCars.length === 0 && availableCars.length > 0 && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="text-yellow-800 text-sm flex items-center space-x-2">
              <FiInfo className="h-4 w-4" />
              <span>Please select at least one car for this owner</span>
            </p>
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
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset Form
          </button>
          <button
            type="submit"
            disabled={isSubmitting || selectedCarIds.length === 0}
            className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 hover:from-primary-dark hover:to-primary-glow transition-all duration-300 font-medium shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>{type === 'create' ? 'Creating...' : 'Updating...'}</span>
              </>
            ) : (
              <>
                <FiSave className="h-4 w-4" />
                <span>{type === 'create' ? 'Create Owner' : 'Update Owner'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default OwnerForm;