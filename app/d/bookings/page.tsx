"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  FiSearch,
  FiFilter,
  FiEye,
  FiChevronUp,
  FiUser,
  FiMail,
  FiCalendar,
  FiDollarSign,
  FiCreditCard,
  FiCheckCircle,
  FiX,
  FiCheck,
} from "react-icons/fi";
import BookingModal from "@/app/components/modals/BookingModal";
interface ApiResponse {
  success: boolean;
  data: Booking[];
}

interface Booking {
  _id: string;
  carId: string;
  registrationNumber: string;
  model: string;
  pickupDate: string;
  returnDate: string;
  totalAmount: number;
  customerInfo: {
    fullName: string;
    email: string;
    phone: string;
    idNumber: string;
  };
  specialRequests: string;
  bookingId: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const Bookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch bookings data
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get<ApiResponse>("/api/booking");
      if (response.data.success) {
        setBookings(response.data.data);
        setFilteredBookings(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = bookings;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (booking) =>
          booking.customerInfo.fullName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          booking.customerInfo.email
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          booking.customerInfo.phone.includes(searchTerm) ||
          booking.registrationNumber
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          booking.model.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }

    setFilteredBookings(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [searchTerm, statusFilter, bookings]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBookings.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  // Toggle row expansion
  const toggleRowExpansion = (bookingId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(bookingId)) {
      newExpanded.delete(bookingId);
    } else {
      newExpanded.add(bookingId);
    }
    setExpandedRows(newExpanded);
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const statusStyles = {
      pending: "bg-warning text-dark",
      confirmed: "bg-success text-light",
      completed: "bg-primary text-light",
      cancelled: "bg-danger text-light",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          statusStyles[status as keyof typeof statusStyles]
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-primary">Loading bookings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark">Bookings</h1>
        </div>
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
              placeholder="Search by customer, car, or booking ID..."
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
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Results info */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {currentItems.length} of {filteredBookings.length} bookings
        </div>
      </div>

      {/* Table */}
      <div className="bg-light rounded-lg shadow-sm border border-secondary-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-secondary-dark">
            <thead className="bg-secondary">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark uppercase tracking-wider">
                  Booking ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark uppercase tracking-wider">
                  Car Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark uppercase tracking-wider">
                  Amount
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
              {currentItems.map((booking) => (
                <>
                  {/* Main row */}
                  <tr
                    key={booking._id}
                    className="hover:bg-secondary/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-dark">
                        {booking.bookingId}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(booking.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <FiUser className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-dark">
                            {booking.customerInfo.fullName}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <FiMail className="h-3 w-3" />
                            {booking.customerInfo.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-dark">
                        {booking.model}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.registrationNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-sm text-dark flex items-center gap-1">
                          <FiCalendar className="h-3 w-3" />
                          {formatDate(booking.pickupDate)}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <FiCalendar className="h-3 w-3" />
                          {formatDate(booking.returnDate)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-dark flex items-center gap-1">
                        <FiDollarSign className="h-3 w-3" />
                        {formatCurrency(booking.totalAmount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
  <div className="flex items-center gap-2">
    {/* View Button — Always Show */}
    <button
      onClick={() => toggleRowExpansion(booking._id)}
      className="text-primary hover:text-primary-dark p-1 rounded transition-colors"
      title="View details"
    >
      {expandedRows.has(booking._id) ? (
        <FiChevronUp className="h-4 w-4" />
      ) : (
        <FiEye className="h-4 w-4" />
      )}
    </button>

    {/* Show Confirm + Cancel only if status is 'pending' */}
    {booking.status === "pending" && (
      <>
        <BookingModal 
          type="confirmed" 
          id={booking._id} 
          data={booking} 
          onSuccess={fetchBookings}
        >
          <button
            className="text-green-500 hover:text-green-600 p-1 rounded transition-colors flex items-center text-sm"
            title="Confirm Booking"
          >
            <FiCheck className="h-4 w-4" />
          </button>
        </BookingModal>

        <BookingModal 
          type="cancelled" 
          id={booking._id} 
          data={booking} 
          onSuccess={fetchBookings}
        >
          <button
            className="text-red-500 hover:text-red-600 p-1 rounded transition-colors flex items-center text-sm"
            title="Cancel Booking"
          >
            <FiX className="h-4 w-4" />
          </button>
        </BookingModal>
      </>
    )}

    {/* Show Complete button if status is 'confirmed' */}
    {booking.status === "confirmed" && (
      <BookingModal
        type="completed" 
        id={booking._id} 
        data={booking} 
        onSuccess={fetchBookings}
      >
        <button
          className="text-blue-500 hover:text-blue-600 p-1 rounded transition-colors flex items-center text-sm"
          title="Complete Booking"
        >
          <FiCheckCircle className="h-4 w-4" />
        </button>
      </BookingModal>
    )}
  </div>
</td>
                  </tr>

                  {/* Expanded row for details */}
                  {expandedRows.has(booking._id) && (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 bg-secondary/30">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <h4 className="font-medium text-dark flex items-center gap-2">
                              <FiUser className="h-4 w-4" />
                              Customer Details
                            </h4>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-600 w-24">
                                  Full Name:
                                </span>
                                <span className="text-sm text-dark">
                                  {booking.customerInfo.fullName}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-600 w-24">
                                  Email:
                                </span>
                                <span className="text-sm text-dark">
                                  {booking.customerInfo.email}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-600 w-24">
                                  Phone:
                                </span>
                                <span className="text-sm text-dark">
                                  {booking.customerInfo.phone}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-600 w-24">
                                  ID Number:
                                </span>
                                <span className="text-sm text-dark">
                                  {booking.customerInfo.idNumber}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h4 className="font-medium text-dark flex items-center gap-2">
                              <FiCreditCard className="h-4 w-4" />
                              Booking Details
                            </h4>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-600 w-24">
                                  Special Requests:
                                </span>
                                <span className="text-sm text-dark">
                                  {booking.specialRequests || "None"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-600 w-24">
                                  Created:
                                </span>
                                <span className="text-sm text-dark">
                                  {formatDate(booking.createdAt)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-600 w-24">
                                  Last Updated:
                                </span>
                                <span className="text-sm text-dark">
                                  {formatDate(booking.updatedAt)}
                                </span>
                              </div>
                            </div>
                          </div>
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
            <FiCalendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-dark">
              No bookings found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Get started by creating a new booking"}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-sm text-gray-700">
            Showing {indexOfFirstItem + 1} to{" "}
            {Math.min(indexOfLastItem, filteredBookings.length)} of{" "}
            {filteredBookings.length} results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
                        ? "bg-primary text-light"
                        : "border border-secondary-dark hover:bg-secondary"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
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

export default Bookings;
