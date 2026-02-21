import React, { useState, useEffect } from 'react';
import { fuelService, vehicleService } from '../services/apiService';
import { FiPlus, FiDroplet, FiTrendingUp } from 'react-icons/fi';
import { Line } from 'react-chartjs-2';
import toast from 'react-hot-toast';

const Fuel = () => {
  const [fuelRecords, setFuelRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    vehicle_id: '',
    fuel_date: new Date().toISOString().split('T')[0],
    fuel_type: 'Diesel',
    quantity: '',
    cost_per_unit: '',
    total_cost: '',
    mileage: '',
    fuel_station: '',
  });

  useEffect(() => {
    fetchData();
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await vehicleService.getAll();
      setVehicles(response.data);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    }
  };

  const fetchData = async () => {
    try {
      const [recordsRes, statsRes] = await Promise.all([
        fuelService.getAll(),
        fuelService.getStats({ days: 30 })
      ]);
      setFuelRecords(recordsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      toast.error('Failed to fetch fuel data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRecord) {
        await fuelService.update(editingRecord.id, formData);
        toast.success('Fuel record updated successfully');
      } else {
        await fuelService.create(formData);
        toast.success('Fuel record created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      vehicle_id: record.vehicle_id,
      fuel_date: record.fuel_date?.split('T')[0] || new Date().toISOString().split('T')[0],
      fuel_type: record.fuel_type,
      quantity: record.quantity,
      cost_per_unit: record.cost_per_unit,
      total_cost: record.total_cost,
      mileage: record.mileage,
      fuel_station: record.fuel_station,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingRecord(null);
    setFormData({
      vehicle_id: '',
      fuel_date: new Date().toISOString().split('T')[0],
      fuel_type: 'Diesel',
      quantity: '',
      cost_per_unit: '',
      total_cost: '',
      mileage: '',
      fuel_station: '',
    });
  };

  const chartData = {
    labels: fuelRecords.slice(0, 10).reverse().map(r => 
      new Date(r.fuel_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ),
    datasets: [
      {
        label: 'Fuel Cost ($)',
        data: fuelRecords.slice(0, 10).reverse().map(r => parseFloat(r.total_cost)),
        borderColor: 'rgb(234, 88, 12)',
        backgroundColor: 'rgba(234, 88, 12, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Fuel Management</h2>
          <p className="text-gray-600 mt-1">Track fuel consumption and costs</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn btn-primary flex items-center space-x-2">
          <FiPlus />
          <span>Add Fuel Record</span>
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card bg-gradient-to-br from-orange-50 to-orange-100">
            <FiDroplet className="text-orange-600 text-3xl mb-2" />
            <p className="text-sm text-gray-600">Total Fuel (30 days)</p>
            <p className="text-2xl font-bold text-gray-800">
              {parseFloat(stats.total_quantity || 0).toFixed(2)} L
            </p>
          </div>
          <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
            <FiTrendingUp className="text-blue-600 text-3xl mb-2" />
            <p className="text-sm text-gray-600">Total Cost (30 days)</p>
            <p className="text-2xl font-bold text-gray-800">
              ${parseFloat(stats.total_cost || 0).toFixed(2)}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">Avg Price/Unit</p>
            <p className="text-2xl font-bold text-gray-800">
              ${parseFloat(stats.avg_price_per_unit || 0).toFixed(2)}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">Total Records</p>
            <p className="text-2xl font-bold text-gray-800">{stats.total_records || 0}</p>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Fuel Cost Trend</h3>
        <div className="h-64">
          <Line 
            data={chartData} 
            options={{ 
              responsive: true, 
              maintainAspectRatio: false,
              plugins: { legend: { position: 'bottom' } }
            }} 
          />
        </div>
      </div>

      {/* Records Table */}
      <div className="card overflow-x-auto">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Fuel Records</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Vehicle</th>
              <th>Fuel Type</th>
              <th>Quantity (L)</th>
              <th>Cost/Unit</th>
              <th>Total Cost</th>
              <th>Station</th>
              <th>Mileage</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center py-8">
                  <div className="spinner mx-auto"></div>
                </td>
              </tr>
            ) : fuelRecords.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-8 text-gray-500">
                  No fuel records found
                </td>
              </tr>
            ) : (
              fuelRecords.map((record) => (
                <tr key={record.id}>
                  <td>{new Date(record.fuel_date).toLocaleDateString()}</td>
                  <td className="font-semibold text-primary-600">{record.vehicle_number}</td>
                  <td>{record.fuel_type}</td>
                  <td>{parseFloat(record.quantity).toFixed(2)}</td>
                  <td>${parseFloat(record.cost_per_unit).toFixed(2)}</td>
                  <td className="font-semibold">${parseFloat(record.total_cost).toFixed(2)}</td>
                  <td className="text-sm text-gray-600">{record.fuel_station || 'N/A'}</td>
                  <td>{record.mileage?.toLocaleString()} km</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-2xl">
            <h3 className="font-bold text-lg">{editingRecord ? 'Edit Fuel Record' : 'Add Fuel Record'}</h3>
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
                    <span className="label-text">Fuel Date</span>
                  </label>
                  <input 
                    type="date"
                    className="input input-bordered w-full"
                    value={formData.fuel_date}
                    onChange={(e) => setFormData({...formData, fuel_date: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text">Fuel Type</span>
                  </label>
                  <select 
                    className="select select-bordered w-full"
                    value={formData.fuel_type}
                    onChange={(e) => setFormData({...formData, fuel_type: e.target.value})}
                  >
                    <option value="Diesel">Diesel</option>
                    <option value="Petrol">Petrol</option>
                    <option value="LPG">LPG</option>
                    <option value="CNG">CNG</option>
                  </select>
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Quantity (Liters)</span>
                  </label>
                  <input 
                    type="number"
                    step="0.01"
                    className="input input-bordered w-full"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text">Cost Per Unit ($)</span>
                  </label>
                  <input 
                    type="number"
                    step="0.01"
                    className="input input-bordered w-full"
                    value={formData.cost_per_unit}
                    onChange={(e) => setFormData({...formData, cost_per_unit: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Total Cost ($)</span>
                  </label>
                  <input 
                    type="number"
                    step="0.01"
                    className="input input-bordered w-full"
                    value={formData.total_cost}
                    onChange={(e) => setFormData({...formData, total_cost: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text">Mileage (km)</span>
                  </label>
                  <input 
                    type="number"
                    className="input input-bordered w-full"
                    value={formData.mileage}
                    onChange={(e) => setFormData({...formData, mileage: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Fuel Station</span>
                  </label>
                  <input 
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="e.g., Shell, BP, Chevron"
                    value={formData.fuel_station}
                    onChange={(e) => setFormData({...formData, fuel_station: e.target.value})}
                  />
                </div>
              </div>

              <div className="modal-action">
                <button type="button" onClick={() => setShowModal(false)} className="btn">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Fuel Record</button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={() => setShowModal(false)}></div>
        </div>
      )}
    </div>
  );
};

export default Fuel;
