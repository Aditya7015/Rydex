import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { 
  UsersIcon, 
  CurrencyRupeeIcon, 
  CheckIcon, 
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  TrashIcon,
  ChevronRightIcon,
  WifiIcon,
  MusicalNoteIcon,
  FaceSmileIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { FaCarSide, FaGasPump, FaRoute, FaCar } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function MyRides() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedRide, setSelectedRide] = useState(null);
  const [showPassengersModal, setShowPassengersModal] = useState(false);

  const getRideDateTime = (ride) => {
    const rideDate = new Date(ride.date);

    if (Number.isNaN(rideDate.getTime())) {
      return null;
    }

    if (ride.departureTime) {
      const [hours, minutes] = ride.departureTime.split(':').map(Number);
      if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
        rideDate.setHours(hours, minutes, 0, 0);
      }
    }

    return rideDate;
  };

  const getAvailableSeats = (ride) => {
    if (typeof ride.availableSeatsCount === 'number') {
      return ride.availableSeatsCount;
    }

    const bookedSeats = ride.bookedPassengers
      ?.filter((passenger) => passenger.status === 'accepted')
      .reduce((total, passenger) => total + (passenger.seats || 0), 0) || 0;

    return ride.seatsAvailable - bookedSeats;
  };

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/rides/driver/me');
      setRides(data.rides || []);
    } catch (error) {
      toast.error('Failed to load rides');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRide = async (rideId) => {
    if (!confirm('Are you sure you want to cancel this ride? All bookings will be cancelled.')) return;
    
    try {
      await axios.delete(`/rides/${rideId}`);
      toast.success('Ride cancelled successfully');
      fetchRides();
    } catch (error) {
      toast.error('Failed to cancel ride');
    }
  };

  const handleRespondToBooking = async (rideId, passengerId, action) => {
    try {
      await axios.put(`/bookings/respond-by-passenger/${rideId}/${passengerId}`, { action });
      toast.success(`Booking ${action}ed successfully`);
      fetchRides();
    } catch (error) {
      toast.error('Failed to respond');
    }
  };

  const getStatusColor = (status, rideDateTime) => {
    const now = new Date();
    if (status === 'active' && rideDateTime > now) return 'bg-green-500';
    if (status === 'active' && rideDateTime < now) return 'bg-gray-400';
    if (status === 'full') return 'bg-yellow-500';
    if (status === 'cancelled') return 'bg-red-500';
    if (status === 'completed') return 'bg-blue-500';
    return 'bg-gray-500';
  };

  const getStatusText = (status, rideDateTime) => {
    const now = new Date();
    if (status === 'active' && rideDateTime > now) return 'Active';
    if (status === 'active' && rideDateTime < now) return 'Expired';
    if (status === 'full') return 'Fully Booked';
    if (status === 'cancelled') return 'Cancelled';
    if (status === 'completed') return 'Completed';
    return status;
  };

  const filteredRides = rides.filter(ride => {
    const rideDateTime = getRideDateTime(ride);
    const now = new Date();

    if (!rideDateTime) return false;
    if (activeTab === 'upcoming') return rideDateTime >= now && !['cancelled', 'completed'].includes(ride.status);
    if (activeTab === 'past') return rideDateTime < now || ride.status === 'completed';
    if (activeTab === 'cancelled') return ride.status === 'cancelled';
    return true;
  });

  // Stats calculations
  const totalRides = rides.length;
  const activeRides = rides.filter(r => r.status === 'active' && getRideDateTime(r) > new Date()).length;
  const totalPassengers = rides.reduce((total, ride) => {
    const acceptedPassengers = ride.bookedPassengers?.filter(p => p.status === 'accepted').length || 0;
    return total + acceptedPassengers;
  }, 0);
  const totalEarnings = rides.reduce((total, ride) => {
    const acceptedPassengers = ride.bookedPassengers?.filter(p => p.status === 'accepted') || [];
    const earnings = acceptedPassengers.reduce((sum, p) => sum + (p.seats * ride.pricePerSeat), 0);
    return total + earnings;
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-3 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your rides...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Rides</h1>
              <p className="text-primary-100">Manage and track all your offered rides</p>
            </div>
            <Link to="/post-ride" className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/30 transition-all flex items-center gap-2">
              <span>+</span>
              Post New Ride
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-primary-500">
            <div className="text-2xl font-bold text-gray-900">{totalRides}</div>
            <div className="text-sm text-gray-600">Total Rides</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
            <div className="text-2xl font-bold text-gray-900">{activeRides}</div>
            <div className="text-sm text-gray-600">Active Rides</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
            <div className="text-2xl font-bold text-gray-900">{totalPassengers}</div>
            <div className="text-sm text-gray-600">Total Passengers</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-yellow-500">
            <div className="text-2xl font-bold text-gray-900">₹{totalEarnings.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Earnings</div>
          </div>
        </div>

        {/* Modern Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6 p-1">
          <div className="flex gap-1">
            {['upcoming', 'past', 'cancelled'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-3 rounded-lg font-medium capitalize transition-all ${
                  activeTab === tab
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab}
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab ? 'bg-white/20' : 'bg-gray-200 text-gray-600'
                }`}>
                  {rides.filter(ride => {
                    const rideDateTime = getRideDateTime(ride);
                    const now = new Date();
                    if (!rideDateTime) return false;
                    if (tab === 'upcoming') return rideDateTime >= now && !['cancelled', 'completed'].includes(ride.status);
                    if (tab === 'past') return rideDateTime < now || ride.status === 'completed';
                    if (tab === 'cancelled') return ride.status === 'cancelled';
                    return false;
                  }).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {filteredRides.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
            <div className="text-8xl mb-4">🚗</div>
            <h3 className="text-2xl font-semibold mb-2 text-gray-900">No {activeTab} rides found</h3>
            <p className="text-gray-600 mb-6">You haven't posted any {activeTab} rides yet</p>
            <Link to="/post-ride" className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-all">
              Post Your First Ride
              <ChevronRightIcon className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRides.map((ride) => {
              const rideDateTime = getRideDateTime(ride);
              const availableSeats = getAvailableSeats(ride);
              const pendingRequests = ride.bookedPassengers?.filter(p => p.status === 'pending').length || 0;
              
              return (
                <div
                  key={ride._id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  {/* Status Bar */}
                  <div className={`h-1 ${getStatusColor(ride.status, rideDateTime)}`}></div>
                  
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex flex-wrap justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                          getStatusColor(ride.status, rideDateTime)
                        }`}>
                          {getStatusText(ride.status, rideDateTime)}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <CalendarIcon className="w-4 h-4" />
                          <span>{format(new Date(ride.date), 'dd MMM yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <ClockIcon className="w-4 h-4" />
                          <span>{ride.departureTime}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary-600">
                          ₹{ride.pricePerSeat}
                          <span className="text-sm font-normal text-gray-500">/seat</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {availableSeats} seats available
                        </div>
                      </div>
                    </div>

                    {/* Route */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <MapPinIcon className="w-4 h-4 text-green-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{ride.from.city}</div>
                          {ride.from.landmark && (
                            <div className="text-sm text-gray-500">{ride.from.landmark}</div>
                          )}
                        </div>
                        <div className="text-gray-400">→</div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{ride.to.city}</div>
                          {ride.to.landmark && (
                            <div className="text-sm text-gray-500">{ride.to.landmark}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Vehicle Info */}
                    {ride.vehicleInfo?.make && (
                      <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <FaCarSide className="w-4 h-4" />
                          <span>{ride.vehicleInfo.make} {ride.vehicleInfo.model}</span>
                        </div>
                        {ride.vehicleInfo.color && (
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ride.vehicleInfo.color.toLowerCase() }}></div>
                            <span>{ride.vehicleInfo.color}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Ride Preferences Tags */}
                    {ride.preferences && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {ride.preferences.acAvailable && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-lg">
                            <WifiIcon className="w-3 h-3" /> AC
                          </span>
                        )}
                        {ride.preferences.music && ride.preferences.music !== 'any' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-lg">
                            <MusicalNoteIcon className="w-3 h-3" /> {ride.preferences.music}
                          </span>
                        )}
                        {ride.preferences.chatting && ride.preferences.chatting !== 'any' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs rounded-lg">
                            <FaceSmileIcon className="w-3 h-3" /> {ride.preferences.chatting}
                          </span>
                        )}
                        {ride.preferences.pets && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded-lg">
                            🐾 Pets Allowed
                          </span>
                        )}
                        {ride.preferences.luggage && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-lg">
                            🧳 Luggage Space
                          </span>
                        )}
                      </div>
                    )}

                    {/* Pending Requests Badge */}
                    {pendingRequests > 0 && ride.status === 'active' && (
                      <div className="mb-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-lg text-sm">
                          <UserGroupIcon className="w-4 h-4" />
                          <span className="font-medium">{pendingRequests} pending request(s)</span>
                        </div>
                      </div>
                    )}

                    {/* Booking Requests Section */}
                    {ride.bookedPassengers && ride.bookedPassengers.length > 0 && (
                      <div className="border-t pt-4 mt-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-semibold text-gray-900">Passenger Requests</h4>
                          {ride.bookedPassengers.filter(p => p.status === 'pending').length > 0 && (
                            <button
                              onClick={() => {
                                setSelectedRide(ride);
                                setShowPassengersModal(true);
                              }}
                              className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1"
                            >
                              View All <ChevronRightIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <div className="space-y-3">
                          {ride.bookedPassengers
                            .filter(p => p.status === 'pending')
                            .slice(0, 2)
                            .map((passenger) => (
                              <div key={passenger._id} className="flex justify-between items-center bg-gradient-to-r from-gray-50 to-white p-3 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={passenger.passengerId?.profilePhoto || '/default-avatar.png'}
                                    alt={passenger.passengerId?.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                  <div>
                                    <div className="font-semibold text-gray-900">{passenger.passengerId?.name}</div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                      <span>{passenger.seats} seat(s)</span>
                                      <span>•</span>
                                      <span>Requested {format(new Date(passenger.requestedAt), 'hh:mm a')}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleRespondToBooking(ride._id, passenger.passengerId?._id, 'accept')}
                                    className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-1 text-sm"
                                  >
                                    <CheckIcon className="w-4 h-4" /> Accept
                                  </button>
                                  <button
                                    onClick={() => handleRespondToBooking(ride._id, passenger.passengerId?._id, 'reject')}
                                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center gap-1 text-sm"
                                  >
                                    <XMarkIcon className="w-4 h-4" /> Reject
                                  </button>
                                </div>
                              </div>
                            ))}
                          
                          {ride.bookedPassengers.filter(p => p.status === 'pending').length > 2 && (
                            <button
                              onClick={() => {
                                setSelectedRide(ride);
                                setShowPassengersModal(true);
                              }}
                              className="w-full text-center text-primary-600 hover:text-primary-700 text-sm py-2"
                            >
                              + {ride.bookedPassengers.filter(p => p.status === 'pending').length - 2} more requests
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Confirmed Passengers Section */}
                    {ride.bookedPassengers && ride.bookedPassengers.some(p => p.status === 'accepted') && (
                      <div className="border-t pt-4 mt-4">
                        <h4 className="font-semibold mb-3 text-gray-900">Confirmed Passengers</h4>
                        <div className="flex flex-wrap gap-3">
                          {ride.bookedPassengers
                            .filter(p => p.status === 'accepted')
                            .map((passenger) => (
                              <div key={passenger._id} className="flex items-center gap-2 bg-green-50 rounded-lg px-3 py-2">
                                <img
                                  src={passenger.passengerId?.profilePhoto || '/default-avatar.png'}
                                  alt={passenger.passengerId?.name}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                                <div>
                                  <div className="text-sm font-medium">{passenger.passengerId?.name}</div>
                                  <div className="text-xs text-gray-500">{passenger.seats} seat(s)</div>
                                </div>
                                <Link
                                  to={`/chat/${ride._id}/${passenger.passengerId._id}`}
                                  className="ml-2 text-primary-600 hover:text-primary-700"
                                >
                                  <ChatBubbleLeftRightIcon className="w-4 h-4" />
                                </Link>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t mt-4">
                      <Link
                        to={`/ride/${ride._id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-all"
                      >
                        <EyeIcon className="w-4 h-4" />
                        View Details
                      </Link>
                      
                      {ride.status === 'active' && rideDateTime > new Date() && (
                        <>
                          {ride.bookedPassengers?.filter(p => p.status === 'pending').length > 0 && (
                            <button
                              onClick={() => {
                                setSelectedRide(ride);
                                setShowPassengersModal(true);
                              }}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-all"
                            >
                              <UserGroupIcon className="w-4 h-4" />
                              View Requests ({ride.bookedPassengers.filter(p => p.status === 'pending').length})
                            </button>
                          )}
                          <button
                            onClick={() => handleCancelRide(ride._id)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                          >
                            <TrashIcon className="w-4 h-4" />
                            Cancel Ride
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Passengers Modal */}
      {showPassengersModal && selectedRide && (
        <PassengersModal
          ride={selectedRide}
          onClose={() => setShowPassengersModal(false)}
          onRespond={handleRespondToBooking}
          getAvailableSeats={getAvailableSeats}
          format={format}
        />
      )}
    </div>
  );
}

// Passengers Modal Component
function PassengersModal({ ride, onClose, onRespond, format }) {
  const pendingPassengers = ride.bookedPassengers?.filter(p => p.status === 'pending') || [];
  const acceptedPassengers = ride.bookedPassengers?.filter(p => p.status === 'accepted') || [];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Passenger Requests</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Ride Info */}
        <div className="bg-gradient-to-r from-primary-50 to-indigo-50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">{ride.from.city} → {ride.to.city}</div>
              <div className="text-sm text-gray-600 mt-1">
                {format(new Date(ride.date), 'dd MMM yyyy')} at {ride.departureTime}
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-primary-600">₹{ride.pricePerSeat}/seat</div>
              <div className="text-xs text-gray-500">{ride.seatsAvailable - acceptedPassengers.reduce((sum, p) => sum + p.seats, 0)} seats left</div>
            </div>
          </div>
        </div>

        {/* Pending Requests */}
        {pendingPassengers.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold mb-3 text-gray-900 flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              Pending Requests ({pendingPassengers.length})
            </h4>
            <div className="space-y-3">
              {pendingPassengers.map((passenger) => (
                <div key={passenger._id} className="bg-yellow-50 rounded-xl p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <img
                        src={passenger.passengerId?.profilePhoto || '/default-avatar.png'}
                        alt={passenger.passengerId?.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">{passenger.passengerId?.name}</div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <span>⭐ {passenger.passengerId?.rating?.toFixed(1) || 'New'}</span>
                          <span>•</span>
                          <span>{passenger.seats} seat(s)</span>
                        </div>
                        {passenger.specialRequests && (
                          <div className="text-sm text-gray-500 mt-1">
                            📝 {passenger.specialRequests}
                          </div>
                        )}
                        <div className="text-xs text-gray-400 mt-1">
                          Requested {format(new Date(passenger.requestedAt), 'dd MMM, hh:mm a')}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onRespond(ride._id, passenger.passengerId?._id, 'accept')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-1"
                      >
                        <CheckIcon className="w-4 h-4" /> Accept
                      </button>
                      <button
                        onClick={() => onRespond(ride._id, passenger.passengerId?._id, 'reject')}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center gap-1"
                      >
                        <XMarkIcon className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Accepted Passengers */}
        {acceptedPassengers.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3 text-gray-900 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Confirmed Passengers ({acceptedPassengers.length})
            </h4>
            <div className="space-y-3">
              {acceptedPassengers.map((passenger) => (
                <div key={passenger._id} className="bg-green-50 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <img
                        src={passenger.passengerId?.profilePhoto || '/default-avatar.png'}
                        alt={passenger.passengerId?.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">{passenger.passengerId?.name}</div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>⭐ {passenger.passengerId?.rating?.toFixed(1) || 'New'}</span>
                          <span>•</span>
                          <span>{passenger.seats} seat(s)</span>
                        </div>
                      </div>
                    </div>
                    <Link
                      to={`/chat/${ride._id}/${passenger.passengerId._id}`}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all flex items-center gap-1"
                    >
                      <ChatBubbleLeftRightIcon className="w-4 h-4" /> Message
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {pendingPassengers.length === 0 && acceptedPassengers.length === 0 && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">👥</div>
            <p className="text-gray-600">No passenger requests yet</p>
          </div>
        )}
      </div>
    </div>
  );
}