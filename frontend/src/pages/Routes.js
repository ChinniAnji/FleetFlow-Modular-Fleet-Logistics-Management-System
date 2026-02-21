import React, { useState, useEffect } from 'react';
import { routeService } from '../services/apiService';
import { FiPlus, FiMapPin, FiNavigation } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Routes = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [formData, setFormData] = useState({
    route_name: '',
    origin: '',
    destination: '',
    distance: '',
    estimated_duration: '',
    status: 'planned',
    fuel_cost: '',
    toll_cost: '',
  });

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const response = await routeService.getAll();
      setRoutes(response.data);
    } catch (error) {
      toast.error('Failed to fetch routes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('=== ROUTE SUBMIT ===');
    console.log('Form data being sent:', formData);
    try {
      if (editingRoute) {
        await routeService.update(editingRoute.id, formData);
        toast.success('Route updated successfully');
      } else {
        console.log('Creating new route with data:', formData);
        await routeService.create(formData);
        toast.success('Route created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchRoutes();
    } catch (error) {
      console.error('Route submit error:', error);
      toast.error(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleEdit = (route) => {
    setEditingRoute(route);
    setFormData({
      route_name: route.route_name,
      origin: route.origin,
      destination: route.destination,
      distance: route.distance,
      estimated_duration: route.estimated_duration,
      status: route.status,
      fuel_cost: route.fuel_cost || '',
      toll_cost: route.toll_cost || '',
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingRoute(null);
    setFormData({
      route_name: '',
      origin: '',
      destination: '',
      distance: '',
      estimated_duration: '',
      status: 'planned',
      fuel_cost: '',
      toll_cost: '',
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      planned: 'badge badge-warning',
      in_progress: 'badge badge-info',
      completed: 'badge badge-success',
      cancelled: 'badge badge-danger',
    };
    return <span className={styles[status] || 'badge'}>{status?.replace('_', ' ')}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Routes</h2>
          <p className="text-gray-600 mt-1">Plan and optimize delivery routes</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn btn-primary flex items-center space-x-2">
          <FiPlus />
          <span>Plan Route</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="spinner"></div>
          </div>
        ) : routes.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No routes found</div>
        ) : (
          routes.map((route) => (
            <div key={route.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-xl font-semibold text-gray-800">{route.route_name}</h3>
                    {getStatusBadge(route.status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3">
                      <FiMapPin className="text-green-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Origin</p>
                        <p className="font-medium text-gray-800">{route.origin}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <FiNavigation className="text-red-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Destination</p>
                        <p className="font-medium text-gray-800">{route.destination}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4 pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-600">Distance</p>
                      <p className="font-medium text-gray-800">{route.distance} km</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Duration</p>
                      <p className="font-medium text-gray-800">
                        {Math.floor(route.estimated_duration / 60)}h {route.estimated_duration % 60}m
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Vehicle</p>
                      <p className="font-medium text-gray-800">{route.vehicle_number || 'Not assigned'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Fuel Cost</p>
                      <p className="font-medium text-gray-800">${route.fuel_cost || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Toll Cost</p>
                      <p className="font-medium text-gray-800">${route.toll_cost || 0}</p>
                    </div>
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
            <h3 className="font-bold text-lg">{editingRoute ? 'Edit Route' : 'Create New Route'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text">Route Name</span>
                  </label>
                  <input 
                    type="text"
                    className="input input-bordered w-full"
                    value={formData.route_name}
                    onChange={(e) => setFormData({...formData, route_name: e.target.value})}
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
                    <option value="planned">Planned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text">Origin</span>
                  </label>
                  <input 
                    type="text"
                    className="input input-bordered w-full"
                    value={formData.origin}
                    onChange={(e) => setFormData({...formData, origin: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Destination</span>
                  </label>
                  <input 
                    type="text"
                    className="input input-bordered w-full"
                    value={formData.destination}
                    onChange={(e) => setFormData({...formData, destination: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text">Distance (km)</span>
                  </label>
                  <input 
                    type="number"
                    className="input input-bordered w-full"
                    value={formData.distance}
                    onChange={(e) => setFormData({...formData, distance: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Duration (minutes)</span>
                  </label>
                  <input 
                    type="number"
                    className="input input-bordered w-full"
                    value={formData.estimated_duration}
                    onChange={(e) => setFormData({...formData, estimated_duration: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text">Fuel Cost ($)</span>
                  </label>
                  <input 
                    type="number"
                    step="0.01"
                    className="input input-bordered w-full"
                    value={formData.fuel_cost}
                    onChange={(e) => setFormData({...formData, fuel_cost: e.target.value})}
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Toll Cost ($)</span>
                  </label>
                  <input 
                    type="number"
                    step="0.01"
                    className="input input-bordered w-full"
                    value={formData.toll_cost}
                    onChange={(e) => setFormData({...formData, toll_cost: e.target.value})}
                  />
                </div>
              </div>

              <div className="modal-action">
                <button type="button" onClick={() => setShowModal(false)} className="btn">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Route</button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={() => setShowModal(false)}></div>
        </div>
      )}
    </div>
  );
};

export default Routes;
