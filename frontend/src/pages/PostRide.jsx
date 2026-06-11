import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { 
  MapPinIcon, 
  CalendarIcon, 
  ClockIcon, 
  CurrencyRupeeIcon, 
  UserGroupIcon,
  MusicalNoteIcon,
  ChatBubbleLeftRightIcon,
  WifiIcon,
  InformationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { FaCarSide, FaSmoking, FaDog, FaMusic, FaComments, FaSnowflake } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function PostRide() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
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

  const nextStep = () => {
    if (currentStep === 1 && (!formData.from.city || !formData.to.city)) {
      toast.error('Please enter source and destination');
      return;
    }
    if (currentStep === 2 && (!formData.date || !formData.departureTime)) {
      toast.error('Please select date and time');
      return;
    }
    if (currentStep === 3 && (formData.seatsAvailable < 1 || formData.seatsAvailable > 8 || formData.pricePerSeat < 0)) {
      toast.error('Please enter valid seats and price');
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const steps = [
    { number: 1, title: 'Route', icon: MapPinIcon },
    { number: 2, title: 'Schedule', icon: CalendarIcon },
    { number: 3, title: 'Pricing', icon: CurrencyRupeeIcon },
    { number: 4, title: 'Vehicle', icon: FaCarSide },
    { number: 5, title: 'Preferences', icon: MusicalNoteIcon }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Post a Ride</h1>
          <p className="text-gray-600">Share your journey and earn money</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div key={step.number} className="flex-1 relative">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      currentStep > step.number
                        ? 'bg-green-500 text-white'
                        : currentStep === step.number
                        ? 'bg-primary-600 text-white ring-4 ring-primary-200'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {currentStep > step.number ? (
                      <CheckCircleIcon className="w-6 h-6" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="text-xs mt-2 font-medium text-gray-600">{step.title}</div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`absolute top-5 left-1/2 w-full h-0.5 ${
                      currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                    style={{ transform: 'translateX(-50%)' }}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="p-8">
              {/* Step 1: Route Details */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Where are you going?</h2>
                    <p className="text-gray-600 mt-1">Enter your trip details</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="relative">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        From <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          placeholder="Departure city"
                          value={formData.from.city}
                          onChange={(e) => setFormData({...formData, from: {...formData.from, city: e.target.value}})}
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        From Landmark (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Specific pickup point"
                        value={formData.from.landmark}
                        onChange={(e) => setFormData({...formData, from: {...formData.from, landmark: e.target.value}})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                      />
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        To <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          placeholder="Destination city"
                          value={formData.to.city}
                          onChange={(e) => setFormData({...formData, to: {...formData.to, city: e.target.value}})}
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        To Landmark (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Specific drop-off point"
                        value={formData.to.landmark}
                        onChange={(e) => setFormData({...formData, to: {...formData.to, landmark: e.target.value}})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Date & Time */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">When are you traveling?</h2>
                    <p className="text-gray-600 mt-1">Set your departure schedule</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Date <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <DatePicker
                          selected={formData.date}
                          onChange={(date) => setFormData({...formData, date})}
                          minDate={new Date()}
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                          placeholderText="Select Date"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Time <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="time"
                          value={formData.departureTime}
                          onChange={(e) => setFormData({...formData, departureTime: e.target.value})}
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-4 mt-4">
                    <div className="flex items-start gap-3">
                      <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-semibold mb-1">Pro Tip</p>
                        <p>Choose a time that works best for most travelers. Peak hours (8-10 AM, 5-7 PM) usually get more bookings.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Seats & Price */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Set your pricing</h2>
                    <p className="text-gray-600 mt-1">Determine seats and fare</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Available Seats
                      </label>
                      <div className="relative">
                        <UserGroupIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="number"
                          min="1"
                          max="8"
                          value={formData.seatsAvailable}
                          onChange={(e) => setFormData({...formData, seatsAvailable: parseInt(e.target.value)})}
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Maximum 8 seats per vehicle</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Price per Seat (₹)
                      </label>
                      <div className="relative">
                        <CurrencyRupeeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="number"
                          min="0"
                          step="10"
                          value={formData.pricePerSeat}
                          onChange={(e) => setFormData({...formData, pricePerSeat: parseInt(e.target.value)})}
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Suggested: ₹2-3 per km</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-primary-50 to-indigo-50 rounded-xl p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Total potential earnings:</span>
                      <span className="text-2xl font-bold text-primary-600">
                        ₹{formData.pricePerSeat * formData.seatsAvailable}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">*Based on full occupancy</p>
                  </div>
                </div>
              )}

              {/* Step 4: Vehicle Details */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Your Vehicle</h2>
                    <p className="text-gray-600 mt-1">Tell passengers about your car</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Make (e.g., Maruti)"
                      value={formData.vehicleInfo.make}
                      onChange={(e) => setFormData({...formData, vehicleInfo: {...formData.vehicleInfo, make: e.target.value}})}
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Model (e.g., Swift)"
                      value={formData.vehicleInfo.model}
                      onChange={(e) => setFormData({...formData, vehicleInfo: {...formData.vehicleInfo, model: e.target.value}})}
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Color"
                      value={formData.vehicleInfo.color}
                      onChange={(e) => setFormData({...formData, vehicleInfo: {...formData.vehicleInfo, color: e.target.value}})}
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Number Plate (Optional)"
                      value={formData.vehicleInfo.numberPlate}
                      onChange={(e) => setFormData({...formData, vehicleInfo: {...formData.vehicleInfo, numberPlate: e.target.value}})}
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                    />
                  </div>

                  <div className="bg-yellow-50 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <InformationCircleIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-semibold mb-1">Optional but helpful</p>
                        <p>Adding vehicle details helps passengers identify your car easily and builds trust.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Preferences */}
              {currentStep === 5 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Ride Preferences</h2>
                    <p className="text-gray-600 mt-1">Set your travel style</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <FaSnowflake className="w-5 h-5 text-blue-500" />
                        <span className="font-medium text-gray-700">AC Available</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.preferences.acAvailable}
                          onChange={(e) => setFormData({...formData, preferences: {...formData.preferences, acAvailable: e.target.checked}})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <FaSmoking className="w-5 h-5 text-red-500" />
                        <span className="font-medium text-gray-700">Allow Smoking</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.preferences.smoking}
                          onChange={(e) => setFormData({...formData, preferences: {...formData.preferences, smoking: e.target.checked}})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <FaDog className="w-5 h-5 text-green-500" />
                        <span className="font-medium text-gray-700">Allow Pets</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.preferences.pets}
                          onChange={(e) => setFormData({...formData, preferences: {...formData.preferences, pets: e.target.checked}})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaMusic className="inline mr-2 w-4 h-4" />
                        Music Preference
                      </label>
                      <select
                        value={formData.preferences.music}
                        onChange={(e) => setFormData({...formData, preferences: {...formData.preferences, music: e.target.value}})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                      >
                        <option value="any">🎵 Any Music</option>
                        <option value="silence">🔇 Silence Preferred</option>
                        <option value="low">🔉 Low Volume</option>
                        <option value="medium">🔊 Medium Volume</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaComments className="inline mr-2 w-4 h-4" />
                        Chatting Preference
                      </label>
                      <select
                        value={formData.preferences.chatting}
                        onChange={(e) => setFormData({...formData, preferences: {...formData.preferences, chatting: e.target.value}})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                      >
                        <option value="any">💬 No Preference</option>
                        <option value="quiet">🤫 Prefer Quiet</option>
                        <option value="talkative">🗣️ Talkative</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Info - Always visible on step 5 */}
              {currentStep === 5 && (
                <div className="mt-6 pt-6 border-t">
                  <label className="block font-semibold text-gray-700 mb-3">
                    Additional Information
                  </label>
                  <textarea
                    value={formData.additionalInfo}
                    onChange={(e) => setFormData({...formData, additionalInfo: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none resize-none"
                    rows="3"
                    placeholder="Any additional details about your ride? (e.g., meeting point instructions, luggage space, etc.)"
                  ></textarea>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="border-t bg-gray-50 px-8 py-4 flex justify-between">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                >
                  Back
                </button>
              )}
              
              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="ml-auto px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="ml-auto px-8 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Posting...
                    </>
                  ) : (
                    'Post Ride'
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Tips Section */}
        <div className="mt-6 bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              <InformationCircleIcon className="w-4 h-4 text-primary-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Tips for a successful ride</p>
              <p className="text-xs text-gray-600 mt-1">
                • Add clear pickup/dropoff locations • Respond to booking requests quickly • 
                Share real-time location with passengers • Keep your vehicle clean and comfortable
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add this to your global CSS or component styles
const styles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
`;

// Add styles to document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}