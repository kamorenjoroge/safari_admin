"use client";
import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import axios from 'axios';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { 
  MdUpload, 
  MdClose, 
  MdAdd, 
  MdDirectionsCar, 
  MdLocationOn, 
  MdCalendarToday, 
  MdLocalGasStation, 
  MdSettings, 
  MdPeople 
} from 'react-icons/md';

interface Category {
  _id: string;
  title: string;
  description: string;
  image: string;
  priceFrom: string;
  features: string[];
  popular: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ApiResponse {
  success: boolean;
  data: Category[];
}

interface FormData {
  model: string;
  type: string;
  regestrationNumber: string;
  location: string;
  pricePerDay: string;
  year: string;
  transmission: string;
  fuel: string;
  seats: string;
  features: string[];
}

interface FormErrors {
  [key: string]: string;
}

const CarCategoryForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    model: '',
    type: '',
    regestrationNumber: '',
    location: '',
    pricePerDay: '',
    year: '',
    transmission: '',
    fuel: '',
    seats: '',
    features: []
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [existingImage, setExistingImage] = useState<string>('');
  const [newFeature, setNewFeature] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await axios.get<ApiResponse>('/api/category');
        
        if (response.data.success) {
          setCategories(response.data.data);
        } else {
          setErrors(prev => ({ ...prev, categories: 'Failed to load car categories' }));
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setErrors(prev => ({ ...prev, categories: 'Failed to load car categories' }));
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>): void => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setErrors(prev => ({ ...prev, image: 'Image size must be less than 5MB' }));
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, image: 'Please select a valid image file' }));
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setErrors(prev => ({ ...prev, image: '' }));
  };

  const removeImage = (): void => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setImage(null);
    setPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeExistingImage = (): void => {
    setExistingImage('');
  };

  const addFeature = (): void => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index: number): void => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.model.trim()) newErrors.model = 'Model is required';
    if (!formData.type.trim()) newErrors.type = 'Type is required';
    if (!formData.regestrationNumber.trim()) newErrors.regestrationNumber = 'Registration number is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.pricePerDay || Number(formData.pricePerDay) <= 0) newErrors.pricePerDay = 'Valid price per day is required';
    if (!formData.year || Number(formData.year) < 1900) newErrors.year = 'Valid year is required';
    if (!formData.transmission.trim()) newErrors.transmission = 'Transmission type is required';
    if (!formData.fuel.trim()) newErrors.fuel = 'Fuel type is required';
    if (!formData.seats || Number(formData.seats) < 1) newErrors.seats = 'Valid number of seats is required';
    if (!image && !existingImage) newErrors.image = 'Car image is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }
      
      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error('Failed to upload image. Please try again.');
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      
      // Add all form fields
      formDataToSend.append('model', formData.model);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('regestrationNumber', formData.regestrationNumber);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('pricePerDay', formData.pricePerDay);
      formDataToSend.append('year', formData.year);
      formDataToSend.append('transmission', formData.transmission);
      formDataToSend.append('fuel', formData.fuel);
      formDataToSend.append('seats', formData.seats);
      
      // Add features
      formData.features.forEach((feature) => {
        formDataToSend.append('features', feature);
      });

      // Handle image
      if (image) {
        formDataToSend.append('image', image);
      }
      if (existingImage) {
        formDataToSend.append('existingImage', existingImage);
      }
      
      // Send to your car registration API endpoint
      await axios.post('/api/cars', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      toast.success('Car registered successfully!');
      
      // Reset form after successful submission
      setFormData({
        model: '', type: '', regestrationNumber: '', location: '',
        pricePerDay: '', year: '', transmission: '', fuel: '', seats: '', features: []
      });
      setImage(null);
      setExistingImage('');
      setNewFeature('');
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      setPreview('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      console.error('Submission error:', error);
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.error || error.message 
        : 'Failed to register car. Please try again.';
      setErrors({ submit: errorMessage });
      toast.error('Failed to register car');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addFeature();
    }
  };

  return (
    <div className="min-h-screen bg-secondary py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-light rounded-lg shadow-lg p-8">
          <div className="flex items-center gap-3 mb-8">
            <MdDirectionsCar className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-dark">Register Your Car</h1>
          </div>

          <div className="space-y-6">
            {errors.submit && (
              <div className="bg-red-50 border border-danger rounded-md p-4">
                <p className="text-danger">{errors.submit}</p>
              </div>
            )}

            {errors.categories && (
              <div className="bg-orange-50 border border-warning rounded-md p-4">
                <p className="text-warning">{errors.categories}</p>
              </div>
            )}

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-earth mb-2">
                  Car Model *
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.model ? 'border-danger' : 'border-secondary-dark'
                  }`}
                  placeholder="e.g., Toyota Camry"
                />
                {errors.model && <p className="text-danger text-sm mt-1">{errors.model}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-earth mb-2">
                  Car Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  disabled={loadingCategories}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.type ? 'border-danger' : 'border-secondary-dark'
                  } ${loadingCategories ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <option value="">
                    {loadingCategories ? 'Loading categories...' : 'Select car type'}
                  </option>
                  {categories.map((category) => (
                    <option key={category._id} value={category.title}>
                      {category.title}
                    </option>
                  ))}
                </select>
                {errors.type && <p className="text-danger text-sm mt-1">{errors.type}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-earth mb-2">
                  Registration Number *
                </label>
                <input
                  type="text"
                  name="regestrationNumber"
                  value={formData.regestrationNumber}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.regestrationNumber ? 'border-danger' : 'border-secondary-dark'
                  }`}
                  placeholder="e.g., KCA 123A"
                />
                {errors.regestrationNumber && <p className="text-danger text-sm mt-1">{errors.regestrationNumber}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-earth mb-2">
                  <MdLocationOn className="w-4 h-4 inline mr-1 text-primary" />
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.location ? 'border-danger' : 'border-secondary-dark'
                  }`}
                  placeholder="e.g., Nairobi, Mombasa"
                />
                {errors.location && <p className="text-danger text-sm mt-1">{errors.location}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-earth mb-2">
                  Price Per Day (KSH) *
                </label>
                <input
                  type="number"
                  name="pricePerDay"
                  value={formData.pricePerDay}
                  onChange={handleInputChange}
                  min="0"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.pricePerDay ? 'border-danger' : 'border-secondary-dark'
                  }`}
                  placeholder="e.g., 5000"
                />
                {errors.pricePerDay && <p className="text-danger text-sm mt-1">{errors.pricePerDay}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-earth mb-2">
                  <MdCalendarToday className="w-4 h-4 inline mr-1 text-primary" />
                  Year *
                </label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.year ? 'border-danger' : 'border-secondary-dark'
                  }`}
                  placeholder="e.g., 2020"
                />
                {errors.year && <p className="text-danger text-sm mt-1">{errors.year}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-earth mb-2">
                  <MdSettings className="w-4 h-4 inline mr-1 text-primary" />
                  Transmission *
                </label>
                <select
                  name="transmission"
                  value={formData.transmission}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.transmission ? 'border-danger' : 'border-secondary-dark'
                  }`}
                >
                  <option value="">Select transmission</option>
                  <option value="Manual">Manual</option>
                  <option value="Automatic">Automatic</option>
                  <option value="CVT">CVT</option>
                </select>
                {errors.transmission && <p className="text-danger text-sm mt-1">{errors.transmission}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-earth mb-2">
                  <MdLocalGasStation className="w-4 h-4 inline mr-1 text-primary" />
                  Fuel Type *
                </label>
                <select
                  name="fuel"
                  value={formData.fuel}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.fuel ? 'border-danger' : 'border-secondary-dark'
                  }`}
                >
                  <option value="">Select fuel type</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Electric">Electric</option>
                </select>
                {errors.fuel && <p className="text-danger text-sm mt-1">{errors.fuel}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-earth mb-2">
                  <MdPeople className="w-4 h-4 inline mr-1 text-primary" />
                  Number of Seats *
                </label>
                <input
                  type="number"
                  name="seats"
                  value={formData.seats}
                  onChange={handleInputChange}
                  min="1"
                  max="50"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.seats ? 'border-danger' : 'border-secondary-dark'
                  }`}
                  placeholder="e.g., 5"
                />
                {errors.seats && <p className="text-danger text-sm mt-1">{errors.seats}</p>}
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-earth mb-2">
                Car Image *
              </label>
              
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
                disabled={isSubmitting}
              />
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-3 bg-primary text-light rounded-lg hover:bg-primary-dark transition-colors"
              >
                <MdUpload className="w-5 h-5" />
                Upload Car Image
              </button>

              <div className="mt-4">
                {existingImage && !preview && (
                  <div className="relative inline-block">
                    <Image
                      src={existingImage}
                      alt="Current car image"
                      width={200}
                      height={150}
                      className="rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeExistingImage}
                      className="absolute top-2 right-2 bg-danger text-light rounded-full p-1 hover:bg-red-700"
                    >
                      <MdClose className="w-4 h-4" />
                    </button>
                    <p className="text-xs text-earth mt-1">Current image</p>
                  </div>
                )}

                {preview && (
                  <div className="relative inline-block">
                    <Image
                      src={preview}
                      alt="Car preview"
                      width={200}
                      height={150}
                      className="rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-danger text-light rounded-full p-1 hover:bg-red-700"
                    >
                      <MdClose className="w-4 h-4" />
                    </button>
                    <p className="text-xs text-earth mt-1">New image preview</p>
                  </div>
                )}
              </div>
              
              {errors.image && <p className="text-danger text-sm mt-1">{errors.image}</p>}
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-earth mb-2">
                Car Features
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-4 py-3 border border-secondary-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Add a feature (e.g., Air Conditioning, GPS)"
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="px-4 py-3 bg-primary text-light rounded-lg hover:bg-primary-dark flex items-center gap-2"
                >
                  <MdAdd className="w-4 h-4" />
                  Add
                </button>
              </div>
              {formData.features.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.features.map((feature, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary-light text-light rounded-full text-sm"
                    >
                      {feature}
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="ml-1 hover:text-secondary"
                      >
                        <MdClose className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || loadingCategories}
                className="w-full bg-primary text-light py-3 px-6 rounded-lg font-medium hover:bg-primary-dark focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {isSubmitting ? 'Registering Car...' : 'Register Car'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarCategoryForm;