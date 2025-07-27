"use client";

import Image from "next/image";
import { useState, useRef, ChangeEvent, FormEvent, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { 
  MdUpload, 
  MdClose, 
  MdAdd, 
  MdDirectionsCar, 
  MdLocationOn, 
  MdCalendarToday, 
  MdLocalGasStation, 
  MdSettings, 
  MdPeople,
  MdSave,
  MdRefresh
} from 'react-icons/md';

interface CarFormProps {
  type: "create" | "update";
  carData?: {
    model: string;
    type: string;
    regestrationNumber: string;
    location: string;
    pricePerDay: number;
    image: string;
    year: number;
    transmission: string;
    fuel: string;
    seats: number;
    features: string[];
    schedule?: Array<{
      date: Date;
    }>;
  };
  carId?: string;
  onSuccess?: () => void;
}

interface CarCategory {
  _id: string;
  title: string;
  description?: string;
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

// Common car features for suggestions
const commonFeatures = [
  "Air Conditioning",
  "Bluetooth",
  "Navigation",
  "Sunroof",
  "Heated Seats",
  "Backup Camera",
  "Keyless Entry",
  "Leather Seats",
  "USB Port",
  "Android Auto",
  "Apple CarPlay",
  "Parking Sensors",
  "Cruise Control",
  "Power Windows",
  "ABS",
  "Airbags",
  "Power Steering",
  "Central Locking"
];

const CarForm: React.FC<CarFormProps> = ({
  type = "create",
  carData,
  carId,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<FormData>({
    model: "",
    type: "",
    regestrationNumber: "",
    location: "",
    pricePerDay: "",
    year: new Date().getFullYear().toString(),
    transmission: "automatic",
    fuel: "petrol",
    seats: "5",
    features: [],
  });

  const [categories, setCategories] = useState<CarCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [existingImage, setExistingImage] = useState<string>("");
  const [newFeature, setNewFeature] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const featureInputRef = useRef<HTMLInputElement>(null);

  // Transmission and fuel options
  const transmissionOptions = [
    { value: "automatic", label: "Automatic" },
    { value: "manual", label: "Manual" },
   
  ];

  const fuelOptions = [
    { value: "petrol", label: "Petrol" },
    { value: "diesel", label: "Diesel" },
    { value: "electric", label: "Electric" },
    { value: "hybrid", label: "Hybrid" }
  ];

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const res = await axios.get("/api/category");
        console.log("API Response:", res.data);
        
        let categoriesData = [];
        if (res.data.success && Array.isArray(res.data.data)) {
          categoriesData = res.data.data;
        } else if (Array.isArray(res.data)) {
          categoriesData = res.data;
        } else if (res.data.categories && Array.isArray(res.data.categories)) {
          categoriesData = res.data.categories;
        } else {
          console.error("Unexpected API response structure:", res.data);
          setErrors(prev => ({ ...prev, categories: "Invalid response format from car categories API" }));
        }
        
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching car categories:", error);
        setErrors(prev => ({ ...prev, categories: "Failed to load car categories" }));
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Initialize form data for update mode
  useEffect(() => {
    if (type === "update" && carData) {
      setFormData({
        model: carData.model,
        type: carData.type,
        regestrationNumber: carData.regestrationNumber,
        location: carData.location,
        pricePerDay: carData.pricePerDay.toString(),
        year: carData.year.toString(),
        transmission: carData.transmission,
        fuel: carData.fuel,
        seats: carData.seats.toString(),
        features: carData.features || [],
      });
      setExistingImage(carData.image || "");
    }
  }, [type, carData]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>): void => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, image: "Please select a valid image file" }));
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: "Image size should be less than 5MB" }));
      return;
    }
    
    setErrors(prev => ({ ...prev, image: "" }));
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeImage = (): void => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setImage(null);
    setPreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeExistingImage = (): void => {
    setExistingImage("");
  };

  const addFeature = (): void => {
    const trimmedFeature = newFeature.trim();
    if (trimmedFeature && !formData.features.includes(trimmedFeature)) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, trimmedFeature]
      }));
      setNewFeature("");
      if (featureInputRef.current) {
        featureInputRef.current.focus();
      }
    }
  };

  const removeFeature = (index: number): void => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleFeatureKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addFeature();
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.model.trim()) newErrors.model = "Model is required";
    if (!formData.type) newErrors.type = "Car type is required";
    if (!formData.regestrationNumber.trim()) newErrors.regestrationNumber = "Registration number is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.pricePerDay || Number(formData.pricePerDay) <= 0) {
      newErrors.pricePerDay = "Price per day must be greater than 0";
    }
    if (!image && !existingImage) newErrors.image = "Car image is required";
    if (!formData.year || Number(formData.year) < 1900 || Number(formData.year) > new Date().getFullYear() + 1) {
      newErrors.year = "Please enter a valid year";
    }
    if (!formData.seats || Number(formData.seats) < 1) {
      newErrors.seats = "Number of seats must be at least 1";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("model", formData.model.trim());
      formDataToSend.append("type", formData.type);
      formDataToSend.append("regestrationNumber", formData.regestrationNumber.trim().toUpperCase());
      formDataToSend.append("location", formData.location.trim());
      formDataToSend.append("pricePerDay", formData.pricePerDay);
      formDataToSend.append("year", formData.year);
      formDataToSend.append("transmission", formData.transmission);
      formDataToSend.append("fuel", formData.fuel);
      formDataToSend.append("seats", formData.seats);
      
      // Append each feature individually
      formData.features.forEach(feature => {
        formDataToSend.append("features", feature.trim());
      });

      if (image) {
        formDataToSend.append("image", image);
      }
      if (existingImage) {
        formDataToSend.append("existingImage", existingImage);
      }

      const url = type === "create" 
        ? "/api/cars" 
        : `/api/cars/${carId}`;
      const method = type === "create" ? "post" : "put";

      await axios[method](url, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(`Car ${type === "create" ? "added" : "updated"} successfully`);
      onSuccess?.();
      if (type === "create") resetForm();
    } catch (err) {
      console.error("Error saving car:", err);
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.error || err.response?.data?.message || err.message 
        : "An error occurred while saving the car";
      setErrors({ submit: errorMessage });
      toast.error("Failed to save car");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = (): void => {
    setFormData({
      model: "",
      type: "",
      regestrationNumber: "",
      location: "",
      pricePerDay: "",
      year: new Date().getFullYear().toString(),
      transmission: "automatic",
      fuel: "petrol",
      seats: "5",
      features: [],
    });
    setNewFeature("");
    setImage(null);
    setExistingImage("");
    setErrors({});
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-secondary py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-light rounded-lg shadow-lg p-8">
          <div className="flex items-center gap-3 mb-8">
            <MdDirectionsCar className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-dark">
              {type === "create" ? "Add New Car" : "Edit Car Details"}
            </h1>
          </div>

          {errors.submit && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700">{errors.submit}</p>
            </div>
          )}

          {errors.categories && (
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-md">
              <p className="text-orange-700">{errors.categories}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Model */}
              <div>
                <label className="block text-sm font-medium text-earth mb-2">
                  Car Model *
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Toyota Corolla, BMW X5"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent capitalize ${
                    errors.model ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
                />
                {errors.model && <p className="text-red-500 text-sm mt-1">{errors.model}</p>}
              </div>

              {/* Type - Dropdown from API */}
              <div>
                <label className="block text-sm font-medium text-earth mb-2">
                  Car Type *
                </label>
                {loadingCategories ? (
                  <div className="animate-pulse py-3 bg-gray-200 rounded-lg h-12"></div>
                ) : (
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent  ${
                      errors.type ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isSubmitting || !Array.isArray(categories) || categories.length === 0}
                  >
                    <option value="">Select a category</option>
                    {Array.isArray(categories) && categories.map((category) => (
                      <option key={category._id} value={category.title}>
                        {category.title}
                      </option>
                    ))}
                  </select>
                )}
                {!Array.isArray(categories) || (categories.length === 0 && !loadingCategories) && (
                  <p className="text-red-500 text-sm mt-1">No car categories available. Please add some first.</p>
                )}
                {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
              </div>

              {/* Registration Number */}
              <div>
                <label className="block text-sm font-medium text-earth mb-2">
                  Registration Number *
                </label>
                <input
                  type="text"
                  name="regestrationNumber"
                  value={formData.regestrationNumber}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., KAA 123A"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent uppercase ${
                    errors.regestrationNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
                />
                {errors.regestrationNumber && <p className="text-red-500 text-sm mt-1">{errors.regestrationNumber}</p>}
              </div>

              {/* Location */}
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
                  required
                  placeholder="e.g., Nairobi, Mombasa"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent capitalize ${
                    errors.location ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
                />
                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
              </div>

              {/* Price Per Day */}
              <div>
                <label className="block text-sm font-medium text-earth mb-2">
                  Price Per Day (KES) *
                </label>
                <input
                  type="number"
                  name="pricePerDay"
                  value={formData.pricePerDay}
                  onChange={handleInputChange}
                  required
                  min="100"
                  placeholder="e.g., 5000"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.pricePerDay ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
                />
                {errors.pricePerDay && <p className="text-red-500 text-sm mt-1">{errors.pricePerDay}</p>}
              </div>

              {/* Year */}
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
                  required
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.year ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
                />
                {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year}</p>}
              </div>

              {/* Transmission */}
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
                    errors.transmission ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
                >
                  {transmissionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.transmission && <p className="text-red-500 text-sm mt-1">{errors.transmission}</p>}
              </div>

              {/* Fuel Type */}
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
                    errors.fuel ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
                >
                  {fuelOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.fuel && <p className="text-red-500 text-sm mt-1">{errors.fuel}</p>}
              </div>

              {/* Seats */}
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
                  required
                  min="1"
                  max="20"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.seats ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
                />
                {errors.seats && <p className="text-red-500 text-sm mt-1">{errors.seats}</p>}
              </div>
            </div>

            {/* Features Section */}
            <div>
              <label className="block text-sm font-medium text-earth mb-2">
                Car Features
              </label>
              <p className="text-sm text-gray-600 mb-3">Add features one by one (optional)</p>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  ref={featureInputRef}
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyDown={handleFeatureKeyDown}
                  placeholder="Add feature (e.g., GPS, Air Conditioning)"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent capitalize"
                  disabled={isSubmitting}
                  list="featureSuggestions"
                />
                <button
                  type="button"
                  onClick={addFeature}
                  disabled={isSubmitting || !newFeature.trim()}
                  className="px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  title="Add feature"
                >
                  <MdAdd className="w-5 h-5" />
                  Add
                </button>
              </div>
              
              <datalist id="featureSuggestions">
                {commonFeatures.map(feature => (
                  <option key={feature} value={feature} />
                ))}
              </datalist>

              {/* Display selected features */}
              {formData.features.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {formData.features.map((feature, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-white rounded-full text-sm"
                    >
                      {feature}
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="ml-1 hover:text-gray-300"
                        title="Remove feature"
                      >
                        <MdClose className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
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
                className="flex items-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
              >
                <MdUpload className="w-5 h-5" />
                Upload Car Image
              </button>
              <p className="text-sm text-gray-600 mt-1">Accepted formats: JPG, PNG, GIF (Max: 5MB)</p>
              
              <div className="mt-4">
                {existingImage && !preview && (
                  <div className="relative inline-block">
                    <Image
                      src={existingImage}
                      alt="Current car image"
                      width={200}
                      height={150}
                      className="rounded-lg object-cover border"
                    />
                    <button
                      type="button"
                      onClick={removeExistingImage}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      title="Remove current image"
                    >
                      <MdClose className="w-4 h-4" />
                    </button>
                    <p className="text-sm text-gray-600 mt-1">Current image</p>
                  </div>
                )}

                {preview && (
                  <div className="relative inline-block">
                    <Image
                      src={preview}
                      alt="Car preview"
                      width={200}
                      height={150}
                      className="rounded-lg object-cover border"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      title="Remove new image"
                    >
                      <MdClose className="w-4 h-4" />
                    </button>
                    <p className="text-sm text-gray-600 mt-1">New image preview</p>
                  </div>
                )}
              </div>
              {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={resetForm}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <MdRefresh className="w-4 h-4" />
                Reset
              </button>
              <button
                type="submit"
                disabled={isSubmitting || (categories.length === 0 && !loadingCategories)}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MdSave className="w-5 h-5" />
                {isSubmitting ? "Processing..." : type === "create" ? "Add Car" : "Update Car"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CarForm;