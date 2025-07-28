"use client";

import { useState, useMemo } from "react";
import { 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiEye, 
  FiSearch, 
  FiChevronDown,
  FiChevronUp,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin
} from "react-icons/fi";
import { IoCarSportOutline } from "react-icons/io5";

const CarOwnerPage = () => {
  const [owners, setOwners] = useState([
    {
      id: 1,
      name: "Sarah Wanjiku",
      email: "sarah.wanjiku@email.com",
      phone: "+254 712 345 678",
      location: "Westlands, Nairobi",
      joinedDate: "March 2023",
      status: "active",
      cars: [
        { model: "Toyota Prado", regNo: "KDE 123A", type: "SUV", year: 2020 },
        { model: "Honda Fit", regNo: "KCA 456B", type: "Hatchback", year: 2019 },
        { model: "Nissan X-Trail", regNo: "KBZ 789C", type: "SUV", year: 2021 },
        { model: "Honda Fit", regNo: "KCA 456B", type: "Hatchback", year: 2019 },
        { model: "Nissan X-Trail", regNo: "KBZ 789C", type: "SUV", year: 2021 },
      ],
    },
    {
      id: 2,
      name: "Michael Ochieng",
      email: "michael.ochieng@email.com", 
      phone: "+254 722 987 654",
      location: "Karen, Nairobi",
      joinedDate: "January 2023",
      status: "active",
      cars: [
        { model: "Mazda CX-5", regNo: "KCC 789C", type: "SUV", year: 2022 },
        { model: "Subaru Forester", regNo: "KDD 321D", type: "SUV", year: 2020 }
      ],
    },
    {
      id: 3,
      name: "Grace Muthoni",
      email: "grace.muthoni@email.com",
      phone: "+254 733 555 444",
      location: "Kilimani, Nairobi", 
      joinedDate: "June 2023",
      status: "inactive",
      cars: [
        { model: "Toyota Vitz", regNo: "KEE 111E", type: "Hatchbook", year: 2018 }
      ],
    },
  ]);

  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const toggleExpand = (id: number) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  // Filter and search logic
  const filteredOwners = useMemo(() => {
    return owners.filter(owner => {
      const matchesSearch = 
        owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        owner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        owner.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        owner.cars.some(car => 
          car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
          car.regNo.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesStatus = statusFilter === "all" || owner.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [owners, searchTerm, statusFilter]);

  const getStatusBadge = (status: string) => {
    if (status === "active") {
      return "bg-green-50 text-green-700 border border-green-200";
    }
    return "bg-orange-50 text-orange-700 border border-orange-200";
  };

  const handleDeleteOwner = (id: number) => {
    if (window.confirm("Are you sure you want to delete this owner?")) {
      setOwners(owners.filter(owner => owner.id !== id));
      if (expandedRow === id) {
        setExpandedRow(null);
      }
    }
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
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-primary to-primary-dark p-2 rounded-xl shadow-lg">
                <FiUser className="h-5 w-5 sm:h-6 sm:w-6 text-light" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary-dark to-primary bg-clip-text text-transparent">
                  Car Owners
                </h1>
              </div>
            </div>
            <button className="bg-gradient-to-r from-primary to-primary-dark text-light px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl flex items-center gap-2 hover:from-primary-dark hover:to-primary-glow transition-all duration-300 font-medium shadow-lg shadow-primary/25 text-sm sm:text-base">
              <FiPlus className="h-4 w-4" /> Add New Owner
            </button>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Search and Filters */}
        <div className="bg-light/90 backdrop-blur-sm rounded-2xl shadow-xl border border-light/20 mb-4 sm:mb-6 p-3 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0 lg:space-x-4">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search owners, cars, registration..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-primary-light/40 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200 bg-light/70 backdrop-blur-sm text-sm sm:text-base placeholder:text-xs sm:placeholder:text-sm"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-light/70 backdrop-blur-sm border border-primary-light/40 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 pr-8 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200 text-sm sm:text-base"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <FiChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
              </div>
              
              <div className="text-xs sm:text-sm text-gray-600 bg-primary-light/10 backdrop-blur-sm px-3 py-2 sm:py-2.5 rounded-xl border border-primary-light/40">
                {filteredOwners.length} owner{filteredOwners.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-3">
          {filteredOwners.length === 0 ? (
            <div className="bg-light/90 backdrop-blur-sm rounded-2xl shadow-xl border border-light/20 text-center py-12 px-4">
              <div className="bg-gradient-to-br from-primary-light/20 to-accent/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUser className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No owners found</h3>
              <p className="text-gray-600 mb-6 text-sm">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filters" 
                  : "Get started by adding your first car owner"}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <button className="bg-gradient-to-r from-primary to-primary-dark text-light px-6 py-3 rounded-xl flex items-center gap-2 hover:from-primary-dark hover:to-primary-glow transition-all duration-300 font-medium mx-auto shadow-lg shadow-primary/25">
                  <FiPlus className="h-4 w-4" /> Add First Owner
                </button>
              )}
            </div>
          ) : (
            filteredOwners.map((owner) => (
              <div key={owner.id} className="bg-light/90 backdrop-blur-sm rounded-2xl shadow-xl border border-light/20 overflow-hidden">
                <div className="p-4">
                  {/* Owner Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-br from-primary to-primary-dark w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-light font-semibold text-sm">
                          {owner.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{owner.name}</h3>
                        <div className="flex items-center space-x-1 text-xs text-gray-600">
                          <FiMapPin className="h-3 w-3" />
                          <span>{owner.location}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(owner.status)}`}>
                      {owner.status.charAt(0).toUpperCase() + owner.status.slice(1)}
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <FiMail className="h-3 w-3" />
                      <span className="truncate">{owner.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <FiPhone className="h-3 w-3" />
                      <span>{owner.phone}</span>
                    </div>
                  </div>

                  {/* Cars Count */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <IoCarSportOutline className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-gray-900">
                        {owner.cars.length} car{owner.cars.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleExpand(owner.id)}
                        className="p-2 text-gray-400 hover:text-info hover:bg-info/10 rounded-lg transition-colors duration-200"
                        title="View Details"
                      >
                        {expandedRow === owner.id ? <FiChevronUp className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                      </button>
                      <button
                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors duration-200"
                        title="Edit Owner"
                      >
                        <FiEdit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteOwner(owner.id)}
                        className="p-2 text-gray-400 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors duration-200"
                        title="Delete Owner"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Car Details */}
                  {expandedRow === owner.id && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                        <IoCarSportOutline className="h-4 w-4 text-primary" />
                        <span>Vehicle Details</span>
                      </h4>
                      <div className="space-y-2">
                        {owner.cars.map((car, index) => (
                          <div key={index} className="bg-gradient-to-r from-primary/5 to-accent/5 p-3 rounded-xl border border-primary-light/30">
                            <div className="flex items-center justify-between mb-1">
                              <h5 className="font-medium text-gray-900 text-sm">{car.model}</h5>
                              <span className="bg-light/80 text-gray-700 px-2 py-1 rounded-lg text-xs font-medium">
                                {car.year}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mb-2">{car.type}</p>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">Registration:</span>
                              <span className="font-medium text-gray-900">{car.regNo}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-light/90 backdrop-blur-sm rounded-2xl shadow-xl border border-light/20 overflow-hidden">
          {filteredOwners.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gradient-to-br from-primary-light/20 to-accent/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUser className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No owners found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filters" 
                  : "Get started by adding your first car owner"}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <button className="bg-gradient-to-r from-primary to-primary-dark text-light px-6 py-3 rounded-xl flex items-center gap-2 hover:from-primary-dark hover:to-primary-glow transition-all duration-300 font-medium mx-auto shadow-lg shadow-primary/25">
                  <FiPlus className="h-4 w-4" /> Add First Owner
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-primary/5 to-accent/5 border-b border-primary-light/30">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-900">Owner Details</th>
                    <th className="text-left p-4 font-semibold text-gray-900">Contact</th>
                    <th className="text-left p-4 font-semibold text-gray-900">Cars</th>
                    <th className="text-left p-4 font-semibold text-gray-900">Status</th>
                    <th className="text-left p-4 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-light/20">
                  {filteredOwners.map((owner) => (
                    <>
                      <tr
                        key={owner.id}
                        className="hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 transition-all duration-200"
                      >
                        {/* Owner Details */}
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="bg-gradient-to-br from-primary to-primary-dark w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
                              <span className="text-light font-semibold text-sm">
                                {owner.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{owner.name}</div>
                              <div className="text-sm text-gray-600 flex items-center space-x-1">
                                <FiMapPin className="h-3 w-3" />
                                <span>{owner.location}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="text-sm text-gray-900 flex items-center space-x-1">
                              <FiMail className="h-3 w-3 text-gray-400" />
                              <span>{owner.email}</span>
                            </div>
                            <div className="text-sm text-gray-600 flex items-center space-x-1">
                              <FiPhone className="h-3 w-3 text-gray-400" />
                              <span>{owner.phone}</span>
                            </div>
                          </div>
                        </td>

                        {/* Cars Count */}
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <IoCarSportOutline className="h-4 w-4 text-primary" />
                            <span className="font-medium text-gray-900">
                              {owner.cars.length} car{owner.cars.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(owner.status)}`}>
                            {owner.status.charAt(0).toUpperCase() + owner.status.slice(1)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => toggleExpand(owner.id)}
                              className="p-2 text-gray-400 hover:text-info hover:bg-info/10 rounded-lg transition-colors duration-200"
                              title="View Details"
                            >
                              {expandedRow === owner.id ? <FiChevronUp className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                            </button>
                            <button
                              className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors duration-200"
                              title="Edit Owner"
                            >
                              <FiEdit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteOwner(owner.id)}
                              className="p-2 text-gray-400 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors duration-200"
                              title="Delete Owner"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Row - Car Details */}
                      {expandedRow === owner.id && (
                        <tr className="bg-gradient-to-r from-primary/5 to-accent/5">
                          <td colSpan={5} className="p-6">
                            <div className="max-w-4xl">
                              <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                                <IoCarSportOutline className="h-5 w-5 text-primary" />
                                <span>Vehicle Details</span>
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {owner.cars.map((car, index) => (
                                  <div key={index} className="bg-light/80 backdrop-blur-sm p-4 rounded-xl border border-primary-light/40 shadow-lg">
                                    <div className="flex items-start justify-between mb-3">
                                      <div>
                                        <h5 className="font-medium text-gray-900">{car.model}</h5>
                                        <p className="text-sm text-gray-600">{car.type}</p>
                                      </div>
                                      <span className="bg-gradient-to-r from-primary-light/20 to-accent/20 text-gray-700 px-2 py-1 rounded-lg text-xs font-medium">
                                        {car.year}
                                      </span>
                                    </div>
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Registration:</span>
                                        <span className="font-medium text-gray-900">{car.regNo}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default CarOwnerPage;