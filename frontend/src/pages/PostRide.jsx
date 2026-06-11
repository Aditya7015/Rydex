import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import toast from 'react-hot-toast';

export default function PostRide() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    from: { city: '', landmark: '' },
    to: { city: '', landmark: '' },
    date: new Date(),
    departureTime: '09:00',
    seatsAvailable: 2,
    pricePerSeat: 200,
    vehicleInfo: {
      make: '',
      model: '',
      color: '',
      numberPlate: ''
    },
    preferences: {
      smoking: false,
      pets: false,
      luggage: true,
      music: 'any',
      chatting: 'any',
      acAvailable: true
    },
    additionalInfo: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.from.city || !formData.to.city) {
      toast.error('Please enter source and destination');
      return;
    }
    
    if (formData.seatsAvailable < 1 || formData.seatsAvailable > 8) {
      toast.error('Seats must be between 1 and 8');
      return;
    }
    
    setLoading(true);
    try {
      const { data } = await axios.post('/rides', formData);
      toast.success('Ride posted successfully!');
      navigate(`/ride/${data.ride._id}`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to post ride');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold mb-6">Post a Ride</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Route Details */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Route Details</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="From (City) *"
                  value={formData.from.city}
                  onChange={(e) => setFormData({...formData, from: {...formData.from, city: e.target.value}})}
                  className="input-field"
                  required
                />
                <input
                  type="text"
                  placeholder="From (Landmark) - Optional"
                  value={formData.from.landmark}
                  onChange={(e) => setFormData({...formData, from: {...formData.from, landmark: e.target.value}})}
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="To (City) *"
                  value={formData.to.city}
                  onChange={(e) => setFormData({...formData, to: {...formData.to, city: e.target.value}})}
                  className="input-field"
                  required
                />
                <input
                  type="text"
                  placeholder="To (Landmark) - Optional"
                  value={formData.to.landmark}
                  onChange={(e) => setFormData({...formData, to: {...formData.to, landmark: e.target.value}})}
                  className="input-field"
                />
              </div>
            </div>

            {/* Date & Time */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Date & Time</h3>
              <div className="grid grid-cols-2 gap-3">
                <DatePicker
                  selected={formData.date}
                  onChange={(date) => setFormData({...formData, date})}
                  minDate={new Date()}
                  className="input-field"
                  placeholderText="Select Date"
                  required
                />
                <input
                  type="time"
                  value={formData.departureTime}
                  onChange={(e) => setFormData({...formData, departureTime: e.target.value})}
                  className="input-field"
                  required
                />
              </div>
            </div>

            {/* Seats & Price */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Seats & Price</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Available Seats</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={formData.seatsAvailable}
                    onChange={(e) => setFormData({...formData, seatsAvailable: parseInt(e.target.value)})}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Price per Seat (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={formData.pricePerSeat}
                    onChange={(e) => setFormData({...formData, pricePerSeat: parseInt(e.target.value)})}
                    className="input-field"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Vehicle Details */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Vehicle Details</h3>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Make (e.g., Maruti)"
                  value={formData.vehicleInfo.make}
                  onChange={(e) => setFormData({...formData, vehicleInfo: {...formData.vehicleInfo, make: e.target.value}})}
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="Model (e.g., Swift)"
                  value={formData.vehicleInfo.model}
                  onChange={(e) => setFormData({...formData, vehicleInfo: {...formData.vehicleInfo, model: e.target.value}})}
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="Color"
                  value={formData.vehicleInfo.color}
                  onChange={(e) => setFormData({...formData, vehicleInfo: {...formData.vehicleInfo, color: e.target.value}})}
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="Number Plate (Optional)"
                  value={formData.vehicleInfo.numberPlate}
                  onChange={(e) => setFormData({...formData, vehicleInfo: {...formData.vehicleInfo, numberPlate: e.target.value}})}
                  className="input-field"
                />
              </div>
            </div>

            {/* Preferences */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Ride Preferences</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.preferences.acAvailable}
                    onChange={(e) => setFormData({...formData, preferences: {...formData.preferences, acAvailable: e.target.checked}})}
                  />
                  <span>AC Available</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.preferences.smoking}
                    onChange={(e) => setFormData({...formData, preferences: {...formData.preferences, smoking: e.target.checked}})}
                  />
                  <span>Allow Smoking</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.preferences.pets}
                    onChange={(e) => setFormData({...formData, preferences: {...formData.preferences, pets: e.target.checked}})}
                  />
                  <span>Allow Pets</span>
                </label>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Music Preference</label>
                  <select
                    value={formData.preferences.music}
                    onChange={(e) => setFormData({...formData, preferences: {...formData.preferences, music: e.target.value}})}
                    className="input-field"
                  >
                    <option value="any">Any Music</option>
                    <option value="silence">Silence Preferred</option>
                    <option value="low">Low Volume</option>
                    <option value="medium">Medium Volume</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Chatting Preference</label>
                  <select
                    value={formData.preferences.chatting}
                    onChange={(e) => setFormData({...formData, preferences: {...formData.preferences, chatting: e.target.value}})}
                    className="input-field"
                  >
                    <option value="any">No Preference</option>
                    <option value="quiet">Prefer Quiet</option>
                    <option value="talkative">Talkative</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div>
              <label className="block font-semibold text-lg mb-3">Additional Information</label>
              <textarea
                value={formData.additionalInfo}
                onChange={(e) => setFormData({...formData, additionalInfo: e.target.value})}
                className="input-field"
                rows="3"
                placeholder="Any additional details about your ride..."
              ></textarea>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 disabled:opacity-50"
            >
              {loading ? 'Posting Ride...' : 'Post Ride'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}