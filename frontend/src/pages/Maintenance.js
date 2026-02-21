import React, { useState, useEffect } from 'react';
import { maintenanceService, vehicleService } from '../services/apiService';
import { FiPlus, FiTool, FiCalendar } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Maintenance = () => {
  const [maintenance, setMaintenance] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    vehicle_id: '',
    maintenance_type: '',
    description: '',
    scheduled_date: '',
    status: 'scheduled',
    cost: '',
    service_provider: '',
  });

  useEffect(() => {
    fetchMaintenance();
    fetchVehicles();
  }, [statusFilter]);

  const fetchMaintenance = async () => {
    try {
      const response = await maintenanceService.getAll({ status: statusFilter });
      setMaintenance(response.data);
    } catch (error) {
      toast.error('Failed to fetch maintenance records');
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await vehicleService.getAll();
      setVehicles(response.data);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRecord) {
        await maintenanceService.update(editingRecord.id, formData);
        toast.success('Maintenance record updated successfully');
      } else {
        await maintenanceService.create(formData);
        toast.success('Maintenance record created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchMaintenance();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      vehicle_id: record.vehicle_id,
      maintenance_type: record.maintenance_type,
      description: record.description,
      scheduled_date: record.scheduled_date?.split('T')[0] || '',
      status: record.status,
      cost: record.cost || '',
      service_provider: record.service_provider || '',
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingRecord(null);
    setFormData({
      vehicle_id: '',
      maintenance_type: '',
      description: '',
      scheduled_date: '',
      status: 'scheduled',
      cost: '',
      service_provider: '',
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      scheduled: 'badge badge-warning',
      in_progress: 'badge badge-info',
      completed: 'badge badge-success',
      cancelled: 'badge badge-danger',
    };
    return <span className={styles[status] || 'badge'}>{status?.replace('_', ' ')}</span>;
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      urgent: 'badge bg-red-100 text-red-700',
      high: 'badge bg-orange-100 text-orange-700',
      normal: 'badge bg-blue-100 text-blue-700',
      low: 'badge bg-gray-100 text-gray-700',
    };
    return <span className={styles[priority] || 'badge'}>{priority}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Maintenance</h2>
          <p className="text-gray-600 mt-1">Schedule and track vehicle maintenance</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn btn-primary flex items-center space-x-2">
          <FiPlus />
          <span>Schedule Maintenance</span>
        </button>
      </div>

      <div className="card">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input max-w-xs"
        >
          <option value="">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="spinner"></div>
          </div>
        ) : maintenance.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No maintenance records found
          </div>
        ) : (
          maintenance.map((record) => (
            <div key={record.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <FiTool className="text-orange-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{record.vehicle_number}</h3>
                    <p className="text-sm text-gray-600">{record.vehicle_type}</p>
                  </div>
                </div>
                {getStatusBadge(record.status)}
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Maintenance Type</p>
                  <p className="font-medium text-gray-800">{record.maintenance_type}</p>
                </div>
                
                {record.description && (
                  <div>
                    <p className="text-sm text-gray-600">Description</p>
                    <p className="text-sm text-gray-800">{record.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-600 flex items-center">
                      <FiCalendar className="mr-1" /> Scheduled Date
                    </p>
                    <p className="font-medium text-gray-800">
                      {new Date(record.scheduled_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Cost</p>
                    <p className="font-medium text-gray-800">${record.cost || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Priority</p>
                    {getPriorityBadge(record.priority)}
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Service Provider</p>
                    <p className="text-sm text-gray-800">{record.service_provider || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-2xl">
            <h3 className="font-bold text-lg">{editingRecord ? 'Edit Maintenance Record' : 'Schedule New Maintenance'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text">Vehicle</span>
                  </label>
                  <select 
                    className="select select-bordered w-full"
                    value={formData.vehicle_id}
                    onChange={(e) => setFormData({...formData, vehicle_id: e.target.value})}
                    required
                  >
                    <option value="">Select a vehicle</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.vehicle_number} - {vehicle.make} {vehicle.model}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Maintenance Type</span>
                  </label>
                  <input 
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="e.g., Oil Change, Tire Replacement"
                    value={formData.maintenance_type}
                    onChange={(e) => setFormData({...formData, maintenance_type: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea 
                  className="textarea textarea-bordered w-full"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text">Scheduled Date</span>
                  </label>
                  <input 
                    type="date"
                    className="input input-bordered w-full"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({...formData, scheduled_date: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Status</span>
                  </label>
                  <select 
                    className="select select-bordered w-full"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Cost ($)</span>
                  </label>
                  <input 
                    type="number"
                    step="0.01"
                    className="input input-bordered w-full"
                    value={formData.cost}
                    onChange={(e) => setFormData({...formData, cost: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Service Provider</span>
                </label>
                <input 
                  type="text"
                  className="input input-bordered w-full"
                  value={formData.service_provider}
                  onChange={(e) => setFormData({...formData, service_provider: e.target.value})}
                />
              </div>

              <div className="modal-action">
                <button type="button" onClick={() => setShowModal(false)} className="btn">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Maintenance</button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={() => setShowModal(false)}></div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;
