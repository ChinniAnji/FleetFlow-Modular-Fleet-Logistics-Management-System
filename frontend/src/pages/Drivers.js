import React, { useState, useEffect } from 'react';
import { driverService } from '../services/apiService';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const response = await driverService.getAll();
      setDrivers(response.data);
    } catch (error) {
      toast.error('Failed to fetch drivers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      try {
        await driverService.delete(id);
        toast.success('Driver deleted successfully');
        fetchDrivers();
      } catch (error) {
        toast.error('Failed to delete driver');
      }
    }
  };

  const filteredDrivers = drivers.filter(driver =>
    driver.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.license_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const styles = {
      available: 'badge badge-success',
      on_trip: 'badge badge-info',
      off_duty: 'badge badge-warning',
    };
    return <span className={styles[status] || 'badge'}>{status?.replace('_', ' ')}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Drivers</h2>
          <p className="text-gray-600 mt-1">Manage your fleet drivers</p>
        </div>
      </div>

      <div className="card">
        <div className="relative">
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search drivers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="spinner"></div>
          </div>
        ) : filteredDrivers.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No drivers found
          </div>
        ) : (
          filteredDrivers.map((driver) => (
            <div key={driver.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-bold text-lg">
                      {driver.name?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{driver.name}</h3>
                    <p className="text-sm text-gray-600">{driver.email}</p>
                  </div>
                </div>
                {getStatusBadge(driver.status)}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">License:</span>
                  <span className="font-medium text-gray-800">{driver.license_number}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium text-gray-800">{driver.phone}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Experience:</span>
                  <span className="font-medium text-gray-800">{driver.experience_years} years</span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-600">Rating:</span>
                  <div className="flex items-center space-x-1">
                    <FiStar className="text-yellow-500 fill-current" />
                    <span className="font-medium text-gray-800">{driver.rating || 0}</span>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Deliveries:</span>
                  <span className="font-medium text-gray-800">{driver.total_deliveries || 0}</span>
                </div>
              </div>

              <div className="flex space-x-2 pt-4 border-t border-gray-200">
                <button className="flex-1 btn btn-secondary text-sm">
                  <FiEdit2 className="mr-1" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(driver.id)}
                  className="flex-1 btn btn-danger text-sm"
                >
                  <FiTrash2 className="mr-1" /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Drivers;
