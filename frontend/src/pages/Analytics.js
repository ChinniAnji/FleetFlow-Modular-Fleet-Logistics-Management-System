import React, { useState, useEffect } from 'react';
import { analyticsService } from '../services/apiService';
import { FiTrendingUp, FiDollarSign, FiTruck } from 'react-icons/fi';
import { Line, Bar } from 'react-chartjs-2';
import toast from 'react-hot-toast';

const Analytics = () => {
  const [revenueData, setRevenueData] = useState(null);
  const [fleetPerformance, setFleetPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      const [revenue, fleet] = await Promise.all([
        analyticsService.getRevenue({ period }),
        analyticsService.getFleetPerformance()
      ]);
      setRevenueData(revenue.data);
      setFleetPerformance(fleet.data);
    } catch (error) {
      toast.error('Failed to fetch analytics');
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

  const revenueChartData = {
    labels: revenueData?.timeline?.map(d => 
      new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ) || [],
    datasets: [
      {
        label: 'Revenue ($)',
        data: revenueData?.timeline?.map(d => parseFloat(d.revenue)) || [],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const deliveriesChartData = {
    labels: revenueData?.timeline?.map(d => 
      new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ) || [],
    datasets: [
      {
        label: 'Deliveries',
        data: revenueData?.timeline?.map(d => d.deliveries) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Analytics</h2>
          <p className="text-gray-600 mt-1">Advanced fleet performance insights</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="input max-w-xs"
        >
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center space-x-3">
            <FiDollarSign className="text-green-600 text-4xl" />
            <div>
              <p className="text-green-800 font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-green-900">
                ${parseFloat(revenueData?.summary?.total_revenue || 0).toLocaleString()}
              </p>
              <p className="text-sm text-green-700">
                Last {period} days
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center space-x-3">
            <FiTrendingUp className="text-blue-600 text-4xl" />
            <div>
              <p className="text-blue-800 font-medium">Total Deliveries</p>
              <p className="text-3xl font-bold text-blue-900">
                {revenueData?.summary?.total_deliveries || 0}
              </p>
              <p className="text-sm text-blue-700">
                Completed deliveries
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center space-x-3">
            <FiTruck className="text-purple-600 text-4xl" />
            <div>
              <p className="text-purple-800 font-medium">Avg Delivery Cost</p>
              <p className="text-3xl font-bold text-purple-900">
                ${parseFloat(revenueData?.summary?.avg_delivery_cost || 0).toFixed(2)}
              </p>
              <p className="text-sm text-purple-700">
                Per delivery
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Trend</h3>
          <div className="h-80">
            <Line data={revenueChartData} options={chartOptions} />
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Delivery Volume</h3>
          <div className="h-80">
            <Bar data={deliveriesChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Fleet Performance Table */}
      <div className="card overflow-x-auto">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Fleet Performance</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Type</th>
              <th>Total Trips</th>
              <th>Distance (km)</th>
              <th>Fuel Cost</th>
              <th>Maintenance Cost</th>
              <th>Total Cost</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {fleetPerformance.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-8 text-gray-500">
                  No data available
                </td>
              </tr>
            ) : (
              fleetPerformance.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td className="font-semibold text-primary-600">{vehicle.vehicle_number}</td>
                  <td>{vehicle.vehicle_type}</td>
                  <td>{vehicle.total_trips || 0}</td>
                  <td>{parseFloat(vehicle.total_distance || 0).toLocaleString()}</td>
                  <td>${parseFloat(vehicle.fuel_cost || 0).toFixed(2)}</td>
                  <td>${parseFloat(vehicle.maintenance_cost || 0).toFixed(2)}</td>
                  <td className="font-semibold">
                    ${(parseFloat(vehicle.fuel_cost || 0) + parseFloat(vehicle.maintenance_cost || 0)).toFixed(2)}
                  </td>
                  <td>
                    <span className={`badge ${
                      vehicle.status === 'available' ? 'badge-success' :
                      vehicle.status === 'on_trip' ? 'badge-info' : 'badge-warning'
                    }`}>
                      {vehicle.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Analytics;
