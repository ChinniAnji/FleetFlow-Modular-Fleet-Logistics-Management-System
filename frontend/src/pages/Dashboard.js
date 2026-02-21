import React, { useEffect, useState } from 'react';
import { analyticsService } from '../services/apiService';
import { 
  FiTruck, FiUsers, FiPackage, FiDollarSign, 
  FiTrendingUp, FiAlertCircle, FiCheckCircle, FiClock 
} from 'react-icons/fi';
import { 
  Chart as ChartJS, 
  CategoryScale, LinearScale, PointElement, LineElement, 
  BarElement, ArcElement, Title, Tooltip, Legend 
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import toast from 'react-hot-toast';

// Register ChartJS components
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, 
  BarElement, ArcElement, Title, Tooltip, Legend
);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await analyticsService.getDashboard();
      setDashboardData(response.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="spinner"></div>
      </div>
    );
  }

  const stats = dashboardData?.overview || {};

  const kpiCards = [
    {
      title: 'Total Vehicles',
      value: stats.vehicles?.total || 0,
      icon: FiTruck,
      color: 'bg-blue-500',
      subText: `${stats.vehicles?.available || 0} Available`,
    },
    {
      title: 'Active Drivers',
      value: stats.drivers?.total || 0,
      icon: FiUsers,
      color: 'bg-green-500',
      subText: `${stats.drivers?.on_trip || 0} On Trip`,
    },
    {
      title: 'Total Deliveries',
      value: stats.deliveries?.total || 0,
      icon: FiPackage,
      color: 'bg-purple-500',
      subText: `${stats.deliveries?.in_transit || 0} In Transit`,
    },
    {
      title: 'Total Revenue',
      value: `$${(parseFloat(stats.deliveries?.total_revenue) || 0).toLocaleString()}`,
      icon: FiDollarSign,
      color: 'bg-yellow-500',
      subText: 'This Month',
    },
  ];

  // Delivery Trend Chart
  const deliveryTrendData = {
    labels: dashboardData?.trends?.deliveries?.map(d => 
      new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ) || [],
    datasets: [
      {
        label: 'Deliveries',
        data: dashboardData?.trends?.deliveries?.map(d => d.count) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Fuel Consumption Chart
  const fuelTrendData = {
    labels: dashboardData?.trends?.fuel?.map(f => 
      new Date(f.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ) || [],
    datasets: [
      {
        label: 'Fuel Cost ($)',
        data: dashboardData?.trends?.fuel?.map(f => parseFloat(f.cost)) || [],
        backgroundColor: 'rgba(234, 88, 12, 0.8)',
        borderColor: 'rgb(234, 88, 12)',
        borderWidth: 1,
      },
    ],
  };

  // Vehicle Status Distribution
  const vehicleStatusData = {
    labels: ['Available', 'On Trip', 'Maintenance'],
    datasets: [
      {
        data: [
          stats.vehicles?.available || 0,
          stats.vehicles?.on_trip || 0,
          stats.vehicles?.maintenance || 0,
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
          <p className="text-gray-600 mt-1">Overview of your fleet operations</p>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="btn btn-primary flex items-center space-x-2"
        >
          <FiTrendingUp />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => (
          <div key={index} className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{kpi.title}</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{kpi.value}</p>
                <p className="text-gray-500 text-xs mt-1">{kpi.subText}</p>
              </div>
              <div className={`${kpi.color} p-3 rounded-lg`}>
                <kpi.icon className="text-white text-2xl" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delivery Trend */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Delivery Trend (Last 7 Days)
          </h3>
          <div className="h-64">
            <Line data={deliveryTrendData} options={chartOptions} />
          </div>
        </div>

        {/* Fuel Consumption */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Fuel Consumption (Last 7 Days)
          </h3>
          <div className="h-64">
            <Bar data={fuelTrendData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vehicle Status */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Vehicle Status
          </h3>
          <div className="h-64">
            <Doughnut data={vehicleStatusData} options={chartOptions} />
          </div>
        </div>

        {/* Top Drivers */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Top Performing Drivers
          </h3>
          <div className="space-y-3">
            {dashboardData?.topDrivers?.slice(0, 5).map((driver, index) => (
              <div key={driver.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{driver.name}</p>
                    <p className="text-xs text-gray-600">{driver.total_deliveries} deliveries</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-800">⭐ {driver.rating}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Maintenance */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Upcoming Maintenance
          </h3>
          <div className="space-y-3">
            {dashboardData?.upcomingMaintenance?.slice(0, 5).map((maintenance) => (
              <div key={maintenance.id} className="p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{maintenance.vehicle_number}</p>
                    <p className="text-xs text-gray-600 mt-1">{maintenance.maintenance_type}</p>
                  </div>
                  <span className="text-xs text-gray-600">
                    {new Date(maintenance.scheduled_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
          <div className="flex items-center space-x-3">
            <FiCheckCircle className="text-green-600 text-3xl" />
            <div>
              <p className="text-green-800 font-semibold">Delivered Today</p>
              <p className="text-2xl font-bold text-green-900">{stats.deliveries?.delivered || 0}</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
          <div className="flex items-center space-x-3">
            <FiClock className="text-blue-600 text-3xl" />
            <div>
              <p className="text-blue-800 font-semibold">Pending Deliveries</p>
              <p className="text-2xl font-bold text-blue-900">{stats.deliveries?.pending || 0}</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
          <div className="flex items-center space-x-3">
            <FiAlertCircle className="text-orange-600 text-3xl" />
            <div>
              <p className="text-orange-800 font-semibold">Vehicles in Maintenance</p>
              <p className="text-2xl font-bold text-orange-900">{stats.vehicles?.maintenance || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
