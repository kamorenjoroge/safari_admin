"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FiSearch, 
  FiFilter, 
  FiEye, 
  FiEdit, 
  FiTrash2, 
  FiChevronUp,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
} from 'react-icons/fi';
import OwnerModal from '@/app/components/modals/OwnerModal';
import Image from 'next/image';
import { MdCarRental } from 'react-icons/md';


interface ApiResponse {
  success: boolean;
  data: Owner[];
}
interface Owner {
  _id: string;
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
  id?: string;
}

const CarOwners = () => {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [filteredOwners, setFilteredOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch owners data
  const fetchOwners = async () => {
    try {
      setLoading(true);
      const response = await axios.get<ApiResponse>('/api/carowners');
      if (response.data.success) {
        setOwners(response.data.data);
        setFilteredOwners(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching owners:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = owners;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(owner =>
        owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        owner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        owner.phone.includes(searchTerm) ||
        owner.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(owner => owner.status === statusFilter);
    }

    setFilteredOwners(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [searchTerm, statusFilter, owners]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOwners.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOwners.length / itemsPerPage);

  // Toggle row expansion
  const toggleRowExpansion = (ownerId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(ownerId)) {
      newExpanded.delete(ownerId);
    } else {
      newExpanded.add(ownerId);
    }
    setExpandedRows(newExpanded);
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const statusStyles = {
      active: 'bg-success text-light',
      inactive: 'bg-warning text-dark',
      suspended: 'bg-danger text-light'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Car card component for expanded view
  const CarCard = ({ car }: { car: Owner['cars'][0] }) => (
    <div className="bg-light rounded-lg p-4 border border-secondary-dark">
      <div className="flex items-center gap-4">
        
        <div className="w-16 h-16 bg-secondary rounded-lg overflow-hidden flex-shrink-0">
          {car.image ? (
            <Image
            height={100}
            width={100}
              src={car.image} 
              alt={car.model}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <MdCarRental className="h-6 w-6 text-primary" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-dark">{car.model}</h4>
          <p className="text-sm text-gray-600">{car.regestrationNumber}</p>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-xs text-gray-500">{car.type}</span>
            <span className="text-xs text-gray-500">{car.year}</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-primary">Loading car owners...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark">Car Owners</h1>
        </div>
        <OwnerModal type="create" onSuccess={fetchOwners} />
      </div>

      {/* Search and Filters */}
      <div className="bg-light rounded-lg p-4 shadow-sm border border-secondary-dark">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, email, phone, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiFilter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-light"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Results info */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {currentItems.length} of {filteredOwners.length} car owners
        </div>
      </div>

      {/* Table */}
      <div className="bg-light rounded-lg shadow-sm border border-secondary-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-secondary-dark">
            <thead className="bg-secondary">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark uppercase tracking-wider">
                  Cars
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-light divide-y divide-secondary-dark">
              {currentItems.map((owner) => (
                <>
                  {/* Main row */}
                  <tr key={owner._id} className="hover:bg-secondary/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <FiUser className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-dark">{owner.name}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <FiCalendar className="h-3 w-3" />
                            Joined {owner.joinedDate}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-sm text-dark flex items-center gap-1">
                          <FiMail className="h-3 w-3" />
                          {owner.email}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <FiPhone className="h-3 w-3" />
                          {owner.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-dark flex items-center gap-1">
                        <FiMapPin className="h-3 w-3" />
                        {owner.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-dark">{owner.cars.length}</span>
                        <MdCarRental className="h-4 w-4 text-primary" />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={owner.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleRowExpansion(owner._id!)}
                          className="text-primary hover:text-primary-dark p-1 rounded transition-colors"
                          title="View cars"
                        >
                          {expandedRows.has(owner._id!) ? <FiChevronUp className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                        </button>
                        <OwnerModal 
                          type="update" 
                          data={owner} 
                          id={owner._id} 
                          onSuccess={fetchOwners}
                        >
                          <button className="text-accent hover:text-accent-light p-1 rounded transition-colors" title="Edit owner">
                            <FiEdit className="h-4 w-4" />
                          </button>
                        </OwnerModal>
                        <OwnerModal 
                          type="delete" 
                          data={owner} 
                          id={owner._id} 
                          onSuccess={fetchOwners}
                        >
                          <button className="text-danger hover:text-red-700 p-1 rounded transition-colors" title="Delete owner">
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </OwnerModal>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded row for cars */}
                  {expandedRows.has(owner._id!) && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 bg-secondary/30">
                        <div className="space-y-4">
                          <h4 className="font-medium text-dark flex items-center gap-2">
                            <MdCarRental className="h-4 w-4" />
                            Cars Owned ({owner.cars.length})
                          </h4>
                          {owner.cars.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {owner.cars.map((car) => (
                                <CarCard key={car._id} car={car} />
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm">No cars registered</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {currentItems.length === 0 && (
          <div className="text-center py-12">
            <FiUser className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-dark">No car owners found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Get started by adding a new car owner'
              }
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-sm text-gray-700">
            Showing {indexOfFirstItem + 1} to{' '}
            {Math.min(indexOfLastItem, filteredOwners.length)} of{' '}
            {filteredOwners.length} results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm border border-secondary-dark rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 text-sm rounded-lg ${
                      currentPage === pageNum
                        ? 'bg-primary text-light'
                        : 'border border-secondary-dark hover:bg-secondary'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm border border-secondary-dark rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarOwners;