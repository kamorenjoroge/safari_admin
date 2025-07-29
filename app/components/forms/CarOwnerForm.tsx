// components/forms/OwnerForm.tsx
"use client";
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiCheck, FiSave, FiX, FiInfo } from 'react-icons/fi';
import toast from 'react-hot-toast';

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

type CarOwner = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  joinedDate: string;
  status: string;
  cars: Car[];
  createdAt: string;
  updatedAt: string;
  __v: number;
};

type OwnerFormData = {
  name: string;
  email: string;
  phone: string;
  location: string;
  joinedDate: string;
  status: 'active' | 'inactive' | 'suspended';
  cars: {
    _id: string;
    model: string;
    regestrationNumber: string;
    type: string;
    year: number;
    image: string;
  }[];
};

type OwnerFormProps = {
  type: 'create' | 'update';
  ownerId?: string;
  ownerData?: OwnerFormData;
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
  const [carOwners, setCarOwners] = useState<CarOwner[]>([]);
  const [availableCars, setAvailableCars] = useState<Car[]>([]);
  const [foundCars, setFoundCars] = useState<Car[]>(
    ownerData?.cars
      ? ownerData.cars.map(car => ({
          ...car,
          location: '', // Provide a sensible default or fetch if available
          pricePerDay: 0,
          status: 'available',
        }))
      : []
  );
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
      setFoundCars(
        ownerData.cars.map(car => ({
          ...car,
          location: '', // Provide a sensible default or fetch if available
          pricePerDay: 0,
          status: 'available',
        }))
      );
    }
  }, [type, ownerData]);

  // Fetch all cars and car owners from API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [carsResponse, ownersResponse] = await Promise.all([
          axios.get('/api/cars'),
          axios.get('/api/carowners')
        ]);

        if (carsResponse.data.success) {
          setAllCars(carsResponse.data.data);
        }

        if (ownersResponse.data.success) {
          setCarOwners(ownersResponse.data.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setErrorMessage('Error loading data. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter cars that are not assigned to any owner (excluding current owner when updating)
  useEffect(() => {
    if (allCars.length > 0 && carOwners.length >= 0) {
      // Get all registration numbers that are already assigned to OTHER owners
      const assignedRegNumbers = new Set<string>();
      
      carOwners.forEach(owner => {
        // Skip current owner when updating to allow keeping their existing cars
        if (type === 'update' && owner._id === ownerId) {
          return;
        }
        
        if (owner.cars && owner.cars.length > 0) {
          owner.cars.forEach(car => {
            assignedRegNumbers.add(car.regestrationNumber.toLowerCase());
          });
        }
      });

      // Filter cars that are not in the assigned list
      const unassignedCars = allCars.filter(car => 
        !assignedRegNumbers.has(car.regestrationNumber.toLowerCase())
      );
      
      setAvailableCars(unassignedCars);
    }
  }, [allCars, carOwners, type, ownerId]);

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

  // Update suggestions when search term changes - now uses availableCars instead of allCars
  useEffect(() => {
    if (searchTerm.trim() === '' || searchTerm.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const filtered = availableCars.filter(car =>
      car.regestrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.model.toLowerCase().includes(searchTerm.toLowerCase())
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
        // First try exact match by registration number in available cars only
        const exactMatch = availableCars.find(c => 
          c.regestrationNumber.toLowerCase() === searchTerm.toLowerCase()
        );
        
        if (exactMatch) {
          setFoundCars(prev => 
            prev.some(c => c._id === exactMatch._id) ? prev : [...prev, exactMatch]
          );
          setSearchTerm('');
        } else {
          // Check if the car exists in all cars but is assigned to another owner
          const carExistsButAssigned = allCars.find(c => 
            c.regestrationNumber.toLowerCase() === searchTerm.toLowerCase()
          );
          
          if (carExistsButAssigned) {
            // Find which owner has this car
            const ownerWithCar = carOwners.find(owner => 
              owner.cars.some(car => 
                car.regestrationNumber.toLowerCase() === searchTerm.toLowerCase()
              )
            );
            
            if (ownerWithCar) {
              setErrorMessage(`This car is already assigned to ${ownerWithCar.name}`);
            } else {
              setErrorMessage('This car is already assigned to another owner');
            }
          } else {
            setErrorMessage('Car not found. Please register this car first');
          }
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
      const payload = {
        ...formData,
        cars: foundCars.map(car => ({
          _id: car._id,
          model: car.model,
          regestrationNumber: car.regestrationNumber,
          type: car.type,
          year: car.year,
          image: car.image || ''
        }))
      };

      const url = type === 'create' ? '/api/carowners' : `/api/carowners/${ownerId}`;
      const method = type === 'create' ? 'post' : 'put';

      const response = await axios[method](url, payload);
      
      if (response.data.success) {
        toast.success(`Owner ${type === 'create' ? 'created' : 'updated'} successfully`);
        onSuccess?.();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Error saving owner. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
          <div className="flex items-center space-x-2 text-sm text-gray-600">
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
                  placeholder="Search available cars by registration number (e.g. KDE 123A)"
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
                        <span className="text-xs bg-green-500 text-light px-2 py-1 rounded-full">
                          Available
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
              <h4 className="font-medium text-dark">
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

        {/* No cars available message */}
        {availableCars.length === 0 && !isLoading && (
          <div className="p-6 bg-orange-50 border border-orange-200 rounded-xl text-center">
            <p className="text-orange-800 font-medium">No cars available for assignment</p>
            <p className="text-sm text-orange-600 mt-1">All cars are currently assigned to owners</p>
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            type="button"
            onClick={() => {
              setFoundCars([]);
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
            }}
            disabled={isSubmitting}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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