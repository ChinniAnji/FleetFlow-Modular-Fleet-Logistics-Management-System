import React, { useState, useEffect } from 'react';
import { vehicleService } from '../services/apiService';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  const [formData, setFormData] = useState({
    vehicle_number: '',
    vehicle_type: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    capacity: '',
    fuel_type: 'Diesel',
    status: 'available',
  });

  useEffect(() => {
    fetchVehicles();
  }, [statusFilter]);

  const fetchVehicles = async () => {
    try {
      const response = await vehicleService.getAll({ status: statusFilter });
      setVehicles(response.data);
    } catch (error) {
      toast.error('Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVehicle) {
        await vehicleService.update(editingVehicle.id, formData);
        toast.success('Vehicle updated successfully');
      } else {
        await vehicleService.create(formData);
        toast.success('Vehicle created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchVehicles();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await vehicleService.delete(id);
        toast.success('Vehicle deleted successfully');
        fetchVehicles();
      } catch (error) {
        toast.error('Failed to delete vehicle');
      }
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      vehicle_number: vehicle.vehicle_number,
      vehicle_type: vehicle.vehicle_type,
      make: vehicle.make || '',
      model: vehicle.model || '',
      year: vehicle.year || new Date().getFullYear(),
      capacity: vehicle.capacity || '',
      fuel_type: vehicle.fuel_type || 'Diesel',
      status: vehicle.status,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingVehicle(null);
    setFormData({
      vehicle_number: '',
      vehicle_type: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      capacity: '',
      fuel_type: 'Diesel',
      status: 'available',
    });
  };

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.vehicle_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.vehicle_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const styles = {
      available: 'badge badge-success',
      on_trip: 'badge badge-info',
      maintenance: 'badge badge-warning',
      out_of_service: 'badge badge-danger',
    };
    return <span className={styles[status] || 'badge'}>{status?.replace('_', ' ')}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Vehicles</h2>
          <p className="text-gray-600 mt-1">Manage your fleet vehicles</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="btn btn-primary flex items-center space-x-2"
        >
          <FiPlus />
          <span>Add Vehicle</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search vehicles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="relative">
            <FiFilter className="absolute left-3 top-3 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input pl-10"
            >
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="on_trip">On Trip</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Vehicle Number</th>
              <th>Type</th>
              <th>Make & Model</th>
              <th>Year</th>
              <th>Capacity</th>
              <th>Fuel Type</th>
              <th>Status</th>
              <th>Mileage</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="text-center py-8">
                  <div className="spinner mx-auto"></div>
                </td>
              </tr>
            ) : filteredVehicles.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-8 text-gray-500">
                  No vehicles found
                </td>
              </tr>
            ) : (
              filteredVehicles.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td className="font-semibold text-primary-600">{vehicle.vehicle_number}</td>
                  <td>{vehicle.vehicle_type}</td>
                  <td>{vehicle.make} {vehicle.model}</td>
                  <td>{vehicle.year}</td>
                  <td>{vehicle.capacity} kg</td>
                  <td>{vehicle.fuel_type}</td>
                  <td>{getStatusBadge(vehicle.status)}</td>
                  <td>{vehicle.mileage?.toLocaleString()} km</td>
                  <td>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(vehicle)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDelete(vehicle.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Number *
                  </label>
                  <input
                    type="text"
                    value={formData.vehicle_number}
                    onChange={(e) => setFormData({...formData, vehicle_number: e.target.value})}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Type *
                  </label>
                  <select
                    value={formData.vehicle_type}
                    onChange={(e) => setFormData({...formData, vehicle_type: e.target.value})}
                    className="input"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Truck">Truck</option>
                    <option value="Van">Van</option>
                    <option value="Car">Car</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Make</label>
                  <input
                    type="text"
                    value={formData.make}
                    onChange={(e) => setFormData({...formData, make: e.target.value})}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Capacity (kg)</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Type</label>
                  <select
                    value={formData.fuel_type}
                    onChange={(e) => setFormData({...formData, fuel_type: e.target.value})}
                    className="input"
                  >
                    <option value="Diesel">Diesel</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="input"
                  >
                    <option value="available">Available</option>
                    <option value="on_trip">On Trip</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="out_of_service">Out of Service</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingVehicle ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vehicles;
