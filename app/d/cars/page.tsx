"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  FaPlus,
  FaSearch,
  FaFilter,
  FaEdit,
  FaTrashAlt,
  FaCheck,
  FaCar,
  FaSpinner,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaGasPump,
  FaCogs,
  FaUsers,
} from "react-icons/fa";
import Image from "next/image";
import CarModal from "@/app/components/modals/CarModal";

export interface Car {
  _id?: string;
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
  schedule?: Array<{ date: Date }>;
  createdAt?: string;
  updatedAt?: string;
}

export default function Cars() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API base URL
  const API_BASE_URL = "/api/cars";

  // Fetch cars from API
  const fetchCars = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(API_BASE_URL);

      if (response.data.success) {
        setCars(response.data.data);
      } else {
        setError("Failed to fetch cars");
      }
    } catch (err) {
      console.error("Error fetching cars:", err);
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.error || err.message
          : "An error occurred while fetching cars"
      );
    } finally {
      setLoading(false);
    }
  };

  // Load cars on component mount
  useEffect(() => {
    fetchCars();
  }, []);

  // Function to refresh cars after CRUD operations
  const handleSuccess = () => {
    fetchCars(); // Refetch from API
  };

  // Get unique car types and locations for filters
  const uniqueTypes = [...new Set(cars.map(car => car.type))];
  const uniqueLocations = [...new Set(cars.map(car => car.location))];

  const filteredCars = cars.filter((car) => {
    const matchesSearch =
      car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.regestrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !filterType || car.type === filterType;
    const matchesLocation = !filterLocation || car.location === filterLocation;
    
    return matchesSearch && matchesType && matchesLocation;
  });

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">
            Car Management
          </h1>
          <p className="text-earth-light">
            {loading ? "Loading..." : `${cars.length} cars registered`}
          </p>
        </div>
        <div>
          <CarModal type="create" onSuccess={handleSuccess} />
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-danger/10 border border-danger text-danger p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={fetchCars}
              className="px-3 py-1 bg-danger text-white rounded hover:bg-danger/80 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-light p-4 rounded-xl border border-secondary-dark">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-earth-light w-4 h-4" />
            <input
              placeholder="Search cars by model, type, registration, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={loading}
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={loading}
          >
            <option value="">All Types</option>
            {uniqueTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="px-4 py-2 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={loading}
          >
            <option value="">All Locations</option>
            {uniqueLocations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>

          <button
            onClick={() => {
              setSearchTerm("");
              setFilterType("");
              setFilterLocation("");
            }}
            className="flex items-center gap-2 px-4 py-2 border border-secondary-dark rounded-lg hover:bg-secondary transition-colors"
            disabled={loading}
          >
            <FaFilter />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <FaSpinner className="animate-spin text-primary w-8 h-8" />
          <span className="ml-2 text-earth">Loading cars...</span>
        </div>
      )}

      {/* Cars grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCars.map((car) => (
            <div
              key={car._id}
              className="bg-light rounded-xl border border-secondary-dark overflow-hidden hover:shadow-primary transition-all duration-200 group"
            >
              {/* Car image */}
              <div className="h-48 relative overflow-hidden">
                {car.image ? (
                  <Image
                    src={car.image}
                    alt={`${car.model} ${car.year}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-primary-light to-primary-dark flex items-center justify-center">
                    <FaCar className="text-6xl text-light opacity-50" />
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-dark/80 flex flex-col items-center justify-center p-4 text-center text-light opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="text-xl font-bold mb-2 "><span className=" capitalize ">{car.model}</span>  ({car.year})</h3>
                  <p className="text-sm mb-2">{car.type}</p>
                  <p className="text-xs">Reg: {car.regestrationNumber}</p>
                </div>
              </div>

              <div className="p-4">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-earth mb-1 capitalize">
                    {car.model} ({car.year})
                  </h3>
                  <p className="text-earth/70 text-sm mb-2">{car.type}</p>
                  <p className="text-xs text-earth/60">Reg: {car.regestrationNumber}</p>
                </div>

                {/* Car details */}
                <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                  <div className="flex items-center gap-1">
                    <FaMapMarkerAlt className="text-primary w-3 h-3" />
                    <span className="text-earth/70 truncate capitalize">{car.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaUsers className="text-primary w-3 h-3" />
                    <span className="text-earth/70">{car.seats} seats</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaCogs className="text-primary w-3 h-3" />
                    <span className="text-earth/70 truncate capitalize">{car.transmission}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaGasPump className="text-primary w-3 h-3" />
                    <span className="text-earth/70 truncate capitalize">{car.fuel}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-2xl font-bold text-primary">
                    KES {car.pricePerDay.toLocaleString()}
                    <span className="text-sm font-normal text-earth/70">
                      /day
                    </span>
                  </div>
                </div>

                {/* Features */}
                {car.features && car.features.length > 0 && (
                  <div className="space-y-1 mb-4">
                    <p className="text-sm font-semibold text-earth">Features:</p>
                    <div className="max-h-16 overflow-y-auto">
                      {car.features.slice(0, 3).map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <FaCheck className="h-3 w-3 text-primary flex-shrink-0" />
                          <span className="text-xs text-earth/70">{feature}</span>
                        </div>
                      ))}
                      {car.features.length > 3 && (
                        <p className="text-xs text-earth/60 pl-5">
                          +{car.features.length - 3} more features
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Schedule info */}
                {car.schedule && car.schedule.length > 0 && (
                  <div className="mb-4 p-2 bg-secondary/30 rounded">
                    <div className="flex items-center gap-1 text-xs text-earth/70">
                      <FaCalendarAlt className="w-3 h-3" />
                      <span>{car.schedule.length} scheduled booking(s)</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end border-t border-secondary pt-4">
                  <div className="flex gap-2">
                    <CarModal
                      type="update"
                      id={car._id}
                      data={car}
                      onSuccess={handleSuccess}
                    >
                      <button
                        className="p-2 text-earth hover:text-primary hover:bg-secondary rounded-full transition-colors"
                        title="Edit car"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                    </CarModal>

                    <CarModal
                      type="delete"
                      id={car._id}
                      data={car}
                      onSuccess={handleSuccess}
                    >
                      <button
                        className="p-2 text-earth hover:text-danger hover:bg-secondary rounded-full transition-colors"
                        title="Delete car"
                      >
                        <FaTrashAlt className="w-4 h-4" />
                      </button>
                    </CarModal>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredCars.length === 0 && (
        <div className="bg-light p-12 text-center rounded-xl border border-secondary-dark">
          <div className="w-12 h-12 mx-auto bg-primary-light rounded-full flex items-center justify-center text-primary mb-4">
            <FaCar className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-primary-dark mb-2">
            No cars found
          </h3>
          <p className="text-earth mb-4">
            {searchTerm || filterType || filterLocation
              ? "Try adjusting your search or filters"
              : "You haven't registered any cars yet"}
          </p>
          <CarModal type="create" onSuccess={handleSuccess}>
            <button className="flex items-center gap-2 bg-primary text-light px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors mx-auto">
              <FaPlus />
              Add New Car
            </button>
          </CarModal>
        </div>
      )}
    </div>
  );
}