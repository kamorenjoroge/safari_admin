"use client";
import { useState} from "react";
import {
  FaSearch,
  FaFilter,
  FaEdit,
  FaUser,
  FaSpinner,
  FaEnvelope,
  FaPhone,
  
  FaCar,
  FaMapMarkerAlt,
  FaSortUp,
  FaSortDown,
  FaSort,
} from "react-icons/fa";

// Mock data for customers
const mockCustomers: Customer[] = [
  {
    _id: "1",
    name: "John Kamau",
    email: "john.kamau@gmail.com",
    phone: "+254701234567",
    location: "Nairobi",
    totalBookings: 5,
    activeBookings: 1,
    lastBookingDate: "2024-07-25",
    status: "active",
    joinDate: "2024-01-15",
    totalSpent: 25000,
    recentBookings: [
      { carModel: "Toyota Corolla", date: "2024-07-25", status: "active" },
      { carModel: "Honda Civic", date: "2024-06-10", status: "completed" },
    ]
  },
  {
    _id: "2",
    name: "Sarah Wanjiku",
    email: "sarah.wanjiku@yahoo.com",
    phone: "+254712345678",
    location: "Mombasa",
    totalBookings: 12,
    activeBookings: 0,
    lastBookingDate: "2024-07-20",
    status: "active",
    joinDate: "2023-08-22",
    totalSpent: 85000,
    recentBookings: [
      { carModel: "Nissan X-Trail", date: "2024-07-20", status: "completed" },
      { carModel: "Toyota Prado", date: "2024-06-15", status: "completed" },
    ]
  },
  {
    _id: "3",
    name: "Peter Ochieng",
    email: "peter.ochieng@hotmail.com",
    phone: "+254723456789",
    location: "Kisumu",
    totalBookings: 3,
    activeBookings: 2,
    lastBookingDate: "2024-07-28",
    status: "active",
    joinDate: "2024-03-10",
    totalSpent: 18000,
    recentBookings: [
      { carModel: "Subaru Forester", date: "2024-07-28", status: "active" },
      { carModel: "Mazda CX-5", date: "2024-07-26", status: "active" },
    ]
  },
  {
    _id: "4",
    name: "Grace Akinyi",
    email: "grace.akinyi@gmail.com",
    phone: "+254734567890",
    location: "Nakuru",
    totalBookings: 8,
    activeBookings: 0,
    lastBookingDate: "2024-05-15",
    status: "inactive",
    joinDate: "2023-12-05",
    totalSpent: 42000,
    recentBookings: [
      { carModel: "Honda CR-V", date: "2024-05-15", status: "completed" },
      { carModel: "Toyota RAV4", date: "2024-04-20", status: "completed" },
    ]
  },
  {
    _id: "5",
    name: "Michael Kiprop",
    email: "m.kiprop@outlook.com",
    phone: "+254745678901",
    location: "Eldoret",
    totalBookings: 15,
    activeBookings: 1,
    lastBookingDate: "2024-07-27",
    status: "vip",
    joinDate: "2023-05-18",
    totalSpent: 125000,
    recentBookings: [
      { carModel: "BMW X3", date: "2024-07-27", status: "active" },
      { carModel: "Mercedes C-Class", date: "2024-07-10", status: "completed" },
    ]
  },
  {
    _id: "6",
    name: "Faith Njeri",
    email: "faith.njeri@gmail.com",
    phone: "+254756789012",
    location: "Thika",
    totalBookings: 1,
    activeBookings: 0,
    lastBookingDate: "2024-07-22",
    status: "new",
    joinDate: "2024-07-20",
    totalSpent: 3500,
    recentBookings: [
      { carModel: "Toyota Vitz", date: "2024-07-22", status: "completed" },
    ]
  }
];

export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  totalBookings: number;
  activeBookings: number;
  lastBookingDate: string;
  status: "active" | "inactive" | "vip" | "new";
  joinDate: string;
  totalSpent: number;
  recentBookings: Array<{
    carModel: string;
    date: string;
    status: "active" | "completed" | "cancelled";
  }>;
}

type SortField = "name" | "totalBookings" | "lastBookingDate" | "totalSpent" | "joinDate";
type SortOrder = "asc" | "desc";

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [customers] = useState<Customer[]>(mockCustomers);
  const [loading ] = useState(false);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Get unique locations and statuses for filters
  const uniqueLocations = [...new Set(customers.map(customer => customer.location))];
  const uniqueStatuses = [...new Set(customers.map(customer => customer.status))];

  // Sort customers
  const sortedCustomers = [...customers].sort((a, b) => {
    let aValue: string | number = a[sortField as keyof Customer] as string | number;
    let bValue: string | number = b[sortField as keyof Customer] as string | number;

    if (sortField === "lastBookingDate" || sortField === "joinDate") {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Filter customers
  const filteredCustomers = sortedCustomers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || customer.status === statusFilter;
    const matchesLocation = !locationFilter || customer.location === locationFilter;
    
    return matchesSearch && matchesStatus && matchesLocation;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <FaSort className="w-3 h-3 opacity-50" />;
    return sortOrder === "asc" ? 
      <FaSortUp className="w-3 h-3 text-primary" /> : 
      <FaSortDown className="w-3 h-3 text-primary" />;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: "bg-success text-white", label: "Active" },
      inactive: { color: "bg-earth text-white", label: "Inactive" },
      vip: { color: "bg-accent text-white", label: "VIP" },
      new: { color: "bg-info text-white", label: "New" }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">
            Customer Management
          </h1>
          <p className="text-earth-light">
            {loading ? "Loading..." : `${customers.length} customers registered`}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-success rounded-full"></div>
              <span className="text-earth">Active: {customers.filter(c => c.status === 'active').length}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-accent rounded-full"></div>
              <span className="text-earth">VIP: {customers.filter(c => c.status === 'vip').length}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-info rounded-full"></div>
              <span className="text-earth">New: {customers.filter(c => c.status === 'new').length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-light p-4 rounded-xl border border-secondary-dark">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-earth-light w-4 h-4" />
            <input
              placeholder="Search customers by name, email, phone, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={loading}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={loading}
          >
            <option value="">All Statuses</option>
            {uniqueStatuses.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
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
              setStatusFilter("");
              setLocationFilter("");
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
          <span className="ml-2 text-earth">Loading customers...</span>
        </div>
      )}

      {/* Customers table */}
      {!loading && (
        <div className="bg-light rounded-xl border border-secondary-dark overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary border-b border-secondary-dark">
                <tr>
                  <th className="text-left p-4 text-earth font-semibold">
                    <button 
                      onClick={() => handleSort("name")}
                      className="flex items-center gap-2 hover:text-primary transition-colors"
                    >
                      Customer {getSortIcon("name")}
                    </button>
                  </th>
                  <th className="text-left p-4 text-earth font-semibold">Contact</th>
                  <th className="text-left p-4 text-earth font-semibold">
                    <button 
                      onClick={() => handleSort("totalBookings")}
                      className="flex items-center gap-2 hover:text-primary transition-colors"
                    >
                      Bookings {getSortIcon("totalBookings")}
                    </button>
                  </th>
                  <th className="text-left p-4 text-earth font-semibold">
                    <button 
                      onClick={() => handleSort("lastBookingDate")}
                      className="flex items-center gap-2 hover:text-primary transition-colors"
                    >
                      Last Booking {getSortIcon("lastBookingDate")}
                    </button>
                  </th>
                  <th className="text-left p-4 text-earth font-semibold">
                    <button 
                      onClick={() => handleSort("totalSpent")}
                      className="flex items-center gap-2 hover:text-primary transition-colors"
                    >
                      Total Spent {getSortIcon("totalSpent")}
                    </button>
                  </th>
                  <th className="text-left p-4 text-earth font-semibold">Status</th>
                  <th className="text-left p-4 text-earth font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer, index) => (
                  <tr key={customer._id} className={`border-b border-secondary-dark hover:bg-secondary/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-secondary/20'}`}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center text-white font-semibold">
                          {customer.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-earth">{customer.name}</p>
                          <div className="flex items-center gap-1 text-xs text-earth-light">
                            <FaMapMarkerAlt className="w-3 h-3" />
                            {customer.location}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-earth">
                          <FaEnvelope className="w-3 h-3 text-primary" />
                          {customer.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-earth">
                          <FaPhone className="w-3 h-3 text-primary" />
                          {customer.phone}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="text-lg font-bold text-primary">{customer.totalBookings}</div>
                        <div className="text-xs text-earth-light">
                          {customer.activeBookings} active
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="text-sm text-earth font-medium">
                          {formatDate(customer.lastBookingDate)}
                        </div>
                        {customer.recentBookings[0] && (
                          <div className="text-xs text-earth-light">
                            {customer.recentBookings[0].carModel}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-lg font-bold text-accent">
                        {formatCurrency(customer.totalSpent)}
                      </div>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(customer.status)}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setShowEditModal(true);
                        }}
                        className="p-2 text-earth hover:text-primary hover:bg-secondary rounded-full transition-colors"
                        title="Edit customer"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredCustomers.length === 0 && (
        <div className="bg-light p-12 text-center rounded-xl border border-secondary-dark">
          <div className="w-12 h-12 mx-auto bg-primary-light rounded-full flex items-center justify-center text-primary mb-4">
            <FaUser className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-primary-dark mb-2">
            No customers found
          </h3>
          <p className="text-earth mb-4">
            {searchTerm || statusFilter || locationFilter
              ? "Try adjusting your search or filters"
              : "No customers have registered yet"}
          </p>
        </div>
      )}

      {/* Simple Edit Modal */}
      {showEditModal && selectedCustomer && (
        <div className="fixed inset-0 bg-dark/80 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-light rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-xl font-bold text-earth">
                Edit Customer Details
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-earth-light hover:text-earth"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-earth mb-1">Name</label>
                  <input
                    type="text"
                    defaultValue={selectedCustomer.name}
                    className="w-full px-3 py-2 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-earth mb-1">Email</label>
                  <input
                    type="email"
                    defaultValue={selectedCustomer.email}
                    className="w-full px-3 py-2 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-earth mb-1">Phone</label>
                  <input
                    type="tel"
                    defaultValue={selectedCustomer.phone}
                    className="w-full px-3 py-2 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-earth mb-1">Location</label>
                  <input
                    type="text"
                    defaultValue={selectedCustomer.location}
                    className="w-full px-3 py-2 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-earth mb-1">Status</label>
                  <select
                    defaultValue={selectedCustomer.status}
                    className="w-full px-3 py-2 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="vip">VIP</option>
                    <option value="new">New</option>
                  </select>
                </div>
              </div>
              
              {/* Recent Bookings */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-earth mb-3">Recent Bookings</h4>
                <div className="space-y-2">
                  {selectedCustomer.recentBookings.map((booking, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                      <div className="flex items-center gap-3">
                        <FaCar className="text-primary" />
                        <div>
                          <p className="font-medium text-earth">{booking.carModel}</p>
                          <p className="text-sm text-earth-light">{formatDate(booking.date)}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        booking.status === 'active' ? 'bg-success text-white' :
                        booking.status === 'completed' ? 'bg-primary text-white' :
                        'bg-danger text-white'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 mt-6 pt-4 border-t">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-2 border border-secondary-dark rounded-lg hover:bg-secondary text-earth"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Handle save logic here
                    setShowEditModal(false);
                  }}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}