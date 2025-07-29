"use client";
import { 
  FaCar, 
  FaUsers, 
  FaCalendarAlt, 
  FaDollarSign,  
  FaMapMarkerAlt,
  FaPlus,
  FaChartBar,
  FaUsps
} from 'react-icons/fa';

interface StatCardProps {
  icon: React.ComponentType<{ size: number; className?: string }>;
  title: string;
  value: string | number;
  change?: number;
  color?: string;
}

interface Booking {
  id: string;
  customer: string;
  car: string;
  startDate: string;
  endDate: string;
  status: string;
  amount: number;
}

interface Car {
  id: string;
  model: string;
  plate: string;
  status: string;
  location: string;
  lastService: string;
}

const Dashboard: React.FC = () => {
  

  // Sample data
  const stats = {
    totalCars: 45,
    availableCars: 23,
    bookedCars: 18,
    maintenanceCars: 4,
    totalRevenue: 125000,
    monthlyRevenue: 15000,
    totalBookings: 234,
    activeCustomers: 89
  };

  const recentBookings: Booking[] = [
    { id: '001', customer: 'John Kamau', car: 'Toyota Corolla', startDate: '2025-07-30', endDate: '2025-08-02', status: 'confirmed', amount: 12000 },
    { id: '002', customer: 'Mary Wanjiku', car: 'Honda Civic', startDate: '2025-07-29', endDate: '2025-07-31', status: 'active', amount: 8500 },
    { id: '003', customer: 'Peter Mwangi', car: 'Nissan X-Trail', startDate: '2025-08-01', endDate: '2025-08-05', status: 'pending', amount: 18000 },
    { id: '004', customer: 'Grace Akinyi', car: 'Mazda Demio', startDate: '2025-07-28', endDate: '2025-07-30', status: 'completed', amount: 6000 }
  ];

  const cars: Car[] = [
    { id: 'C001', model: 'Toyota Corolla', plate: 'KCB 123A', status: 'available', location: 'Nairobi CBD', lastService: '2025-07-15' },
    { id: 'C002', model: 'Honda Civic', plate: 'KCA 456B', status: 'booked', location: 'Westlands', lastService: '2025-07-10' },
    { id: 'C003', model: 'Nissan X-Trail', plate: 'KCC 789C', status: 'maintenance', location: 'Service Center', lastService: '2025-07-20' },
    { id: 'C004', model: 'Mazda Demio', plate: 'KCD 012D', status: 'available', location: 'Kilimani', lastService: '2025-07-18' }
  ];

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'available': return 'bg-available text-white';
      case 'booked': 
      case 'active': return 'bg-booked text-white';
      case 'maintenance': return 'bg-maintenance text-white';
      case 'unavailable': return 'bg-unavailable text-white';
      case 'confirmed': return 'bg-success text-white';
      case 'pending': return 'bg-warning text-black';
      case 'completed': return 'bg-gray-500 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, change,  }) => (
    <div className="bg-white rounded-lg p-6 shadow-default border border-gray-100 hover:shadow-primary transition-default">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-dark mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-1 flex items-center ${change > 0 ? 'text-success' : 'text-danger'}`}>
              <FaUsps size={14} className="mr-1" />
              {change > 0 ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
        <div className="p-3 rounded-full bg-secondary bg-opacity-10">
          <Icon size={24} className="text-primary" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-secondary">
     

      <div className="p-6">
      
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={FaCar}
                title="Total Fleet"
                value={stats.totalCars}
                change={5}
                color="primary"
              />
              <StatCard
                icon={FaCalendarAlt}
                title="Active Bookings"
                value={stats.bookedCars}
                change={12}
                color="accent"
              />
              <StatCard
                icon={FaDollarSign}
                title="Monthly Revenue"
                value={`KSh ${stats.monthlyRevenue.toLocaleString()}`}
                change={8}
                color="success"
              />
              <StatCard
                icon={FaUsers}
                title="Active Customers"
                value={stats.activeCustomers}
                change={-2}
                color="earth"
              />
            </div>

            {/* Fleet Status Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-default">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-dark">Fleet Status</h3>
                  <button className="text-primary hover:text-primary-dark text-sm font-medium">
                    View All
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-lg bg-available bg-opacity-10">
                    <div className="text-2xl font-bold text-available">{stats.availableCars}</div>
                    <div className="text-sm text-gray-600">Available</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-booked bg-opacity-10">
                    <div className="text-2xl font-bold text-booked">{stats.bookedCars}</div>
                    <div className="text-sm text-gray-600">Booked</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-maintenance bg-opacity-10">
                    <div className="text-2xl font-bold text-maintenance">{stats.maintenanceCars}</div>
                    <div className="text-sm text-gray-600">Maintenance</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-unavailable bg-opacity-10">
                    <div className="text-2xl font-bold text-unavailable">0</div>
                    <div className="text-sm text-gray-600">Unavailable</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-default">
                <h3 className="text-lg font-semibold text-dark mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-default">
                    <FaPlus size={20} />
                    <span>New Booking</span>
                  </button>
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-accent text-white rounded-lg hover:bg-accent-light transition-default">
                    <FaCar size={20} />
                    <span>Add Vehicle</span>
                  </button>
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-earth text-white rounded-lg hover:bg-earth-light transition-default">
                    <FaChartBar size={20} />
                    <span>View Reports</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Bookings */}
              <div className="bg-white rounded-lg p-6 shadow-default">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-dark">Recent Bookings</h3>
                  <button className="text-primary hover:text-primary-dark text-sm font-medium">
                    View All
                  </button>
                </div>
                <div className="space-y-3">
                  {recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-secondary transition-default">
                      <div className="flex-1">
                        <div className="font-medium text-dark">{booking.customer}</div>
                        <div className="text-sm text-gray-600">{booking.car}</div>
                        <div className="text-xs text-gray-500">{booking.startDate} - {booking.endDate}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-dark">KSh {booking.amount.toLocaleString()}</div>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fleet Overview */}
              <div className="bg-white rounded-lg p-6 shadow-default">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-dark">Fleet Overview</h3>
                  <button className="text-primary hover:text-primary-dark text-sm font-medium">
                    Manage Fleet
                  </button>
                </div>
                <div className="space-y-3">
                  {cars.map((car) => (
                    <div key={car.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-secondary transition-default">
                      <div className="flex-1">
                        <div className="font-medium text-dark">{car.model}</div>
                        <div className="text-sm text-gray-600 flex items-center">
                          <span className="mr-3">{car.plate}</span>
                          <FaMapMarkerAlt size={12} className="mr-1" />
                          {car.location}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(car.status)}`}>
                          {car.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
       

       
      </div>
    </div>
  );
};

export default Dashboard;