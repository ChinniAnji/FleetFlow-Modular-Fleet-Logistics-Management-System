import React, { useState, useEffect } from 'react';
import { deliveryService } from '../services/apiService';
import { FiPlus, FiSearch, FiPackage, FiMapPin, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Deliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState(null);
  const [formData, setFormData] = useState({
    delivery_number: '',
    customer_id: '',
    pickup_address: '',
    delivery_address: '',
    status: 'pending',
    priority: 'normal',
    package_type: '',
    weight: '',
    delivery_cost: '',
    payment_status: 'pending',
  });

  useEffect(() => {
    fetchDeliveries();
  }, [statusFilter]);

  const fetchDeliveries = async () => {
    try {
      const response = await deliveryService.getAll({ status: statusFilter });
      setDeliveries(response.data);
    } catch (error) {
      toast.error('Failed to fetch deliveries');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDelivery) {
        await deliveryService.update(editingDelivery.id, formData);
        toast.success('Delivery updated successfully');
      } else {
        await deliveryService.create(formData);
        toast.success('Delivery created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchDeliveries();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleEdit = (delivery) => {
    setEditingDelivery(delivery);
    setFormData({
      delivery_number: delivery.delivery_number,
      customer_id: delivery.customer_id,
      pickup_address: delivery.pickup_address,
      delivery_address: delivery.delivery_address,
      status: delivery.status,
      priority: delivery.priority,
      package_type: delivery.package_type,
      weight: delivery.weight,
      delivery_cost: delivery.delivery_cost,
      payment_status: delivery.payment_status,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingDelivery(null);
    setFormData({
      delivery_number: '',
      customer_id: '',
      pickup_address: '',
      delivery_address: '',
      status: 'pending',
      priority: 'normal',
      package_type: '',
      weight: '',
      delivery_cost: '',
      payment_status: 'pending',
    });
  };

  const filteredDeliveries = deliveries.filter(delivery =>
    delivery.delivery_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    delivery.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'badge badge-warning',
      picked_up: 'badge badge-info',
      in_transit: 'badge bg-blue-100 text-blue-700',
      delivered: 'badge badge-success',
      cancelled: 'badge badge-danger',
    };
    return <span className={styles[status] || 'badge'}>{status?.replace('_', ' ')}</span>;
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      urgent: 'badge bg-red-100 text-red-700',
      high: 'badge bg-orange-100 text-orange-700',
      normal: 'badge bg-gray-100 text-gray-700',
      low: 'badge bg-green-100 text-green-700',
    };
    return <span className={styles[priority] || 'badge'}>{priority}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Deliveries</h2>
          <p className="text-gray-600 mt-1">Track and manage deliveries</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn btn-primary flex items-center space-x-2">
          <FiPlus />
          <span>New Delivery</span>
        </button>
      </div>

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search deliveries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="picked_up">Picked Up</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="spinner"></div>
          </div>
        ) : filteredDeliveries.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No deliveries found</div>
        ) : (
          filteredDeliveries.map((delivery) => (
            <div key={delivery.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="bg-primary-100 p-3 rounded-lg">
                    <FiPackage className="text-primary-600 text-2xl" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {delivery.delivery_number}
                      </h3>
                      {getStatusBadge(delivery.status)}
                      {getPriorityBadge(delivery.priority)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Customer</p>
                        <p className="font-medium text-gray-800">{delivery.customer_name}</p>
                        <p className="text-sm text-gray-600">{delivery.company}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600 mb-1 flex items-center">
                          <FiMapPin className="mr-1" /> Pickup
                        </p>
                        <p className="text-sm text-gray-800">{delivery.pickup_address}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600 mb-1 flex items-center">
                          <FiMapPin className="mr-1" /> Delivery
                        </p>
                        <p className="text-sm text-gray-800">{delivery.delivery_address}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
                      <div>
                        <p className="text-xs text-gray-600">Vehicle</p>
                        <p className="font-medium text-gray-800">{delivery.vehicle_number || 'Not assigned'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Driver</p>
                        <p className="font-medium text-gray-800">{delivery.driver_name || 'Not assigned'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Weight</p>
                        <p className="font-medium text-gray-800">{delivery.weight} kg</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Cost</p>
                        <p className="font-medium text-gray-800">${delivery.delivery_cost}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-right ml-4">
                  <FiClock className="text-gray-400 inline mr-1" />
                  <span className="text-sm text-gray-600">
                    {new Date(delivery.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-2xl">
            <h3 className="font-bold text-lg">{editingDelivery ? 'Edit Delivery' : 'Create New Delivery'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text">Delivery Number</span>
                  </label>
                  <input 
                    type="text"
                    className="input input-bordered w-full"
                    value={formData.delivery_number}
                    onChange={(e) => setFormData({...formData, delivery_number: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Customer ID (Optional)</span>
                  </label>
                  <input 
                    type="number"
                    className="input input-bordered w-full"
                    value={formData.customer_id}
                    onChange={(e) => setFormData({...formData, customer_id: e.target.value})}
                    placeholder="Leave blank if not assigned"
                  />
                </div>
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Pickup Address</span>
                </label>
                <textarea 
                  className="textarea textarea-bordered w-full"
                  value={formData.pickup_address}
                  onChange={(e) => setFormData({...formData, pickup_address: e.target.value})}
                  required
                ></textarea>
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Delivery Address</span>
                </label>
                <textarea 
                  className="textarea textarea-bordered w-full"
                  value={formData.delivery_address}
                  onChange={(e) => setFormData({...formData, delivery_address: e.target.value})}
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text">Status</span>
                  </label>
                  <select 
                    className="select select-bordered w-full"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="pending">Pending</option>
                    <option value="picked_up">Picked Up</option>
                    <option value="in_transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Priority</span>
                  </label>
                  <select 
                    className="select select-bordered w-full"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Payment Status</span>
                  </label>
                  <select 
                    className="select select-bordered w-full"
                    value={formData.payment_status}
                    onChange={(e) => setFormData({...formData, payment_status: e.target.value})}
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text">Package Type</span>
                  </label>
                  <input 
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="e.g., Electronics, Fragile"
                    value={formData.package_type}
                    onChange={(e) => setFormData({...formData, package_type: e.target.value})}
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Weight (kg)</span>
                  </label>
                  <input 
                    type="number"
                    step="0.01"
                    className="input input-bordered w-full"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Delivery Cost ($)</span>
                </label>
                <input 
                  type="number"
                  step="0.01"
                  className="input input-bordered w-full"
                  value={formData.delivery_cost}
                  onChange={(e) => setFormData({...formData, delivery_cost: e.target.value})}
                  required
                />
              </div>

              <div className="modal-action">
                <button type="button" onClick={() => setShowModal(false)} className="btn">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Delivery</button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={() => setShowModal(false)}></div>
        </div>
      )}
    </div>
  );
};

export default Deliveries;
