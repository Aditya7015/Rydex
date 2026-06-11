import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { UsersIcon, CurrencyRupeeIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function MyRides() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/rides/driver/me');
      setRides(data.rides);
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
      toast.success('Ride cancelled');
      fetchRides();
    } catch (error) {
      toast.error('Failed to cancel ride');
    }
  };

  const handleRespondToBooking = async (bookingId, action, rideId) => {
    try {
      await axios.put(`/bookings/respond/${bookingId}`, { action });
      toast.success(`Booking ${action}ed`);
      fetchRides();
    } catch (error) {
      toast.error('Failed to respond');
    }
  };

  const filteredRides = rides.filter(ride => {
    if (activeTab === 'upcoming') return ride.date >= new Date() && ride.status !== 'cancelled';
    if (activeTab === 'past') return ride.date < new Date() || ride.status === 'completed';
    if (activeTab === 'cancelled') return ride.status === 'cancelled';
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Rides</h1>
          <Link to="/post-ride" className="btn-primary">
            + Post New Ride
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          {['upcoming', 'past', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium capitalize ${
                activeTab === tab
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {filteredRides.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🚗</div>
            <h3 className="text-xl font-semibold mb-2">No rides found</h3>
            <p className="text-gray-600 mb-6">You haven't posted any {activeTab} rides yet</p>
            <Link to="/post-ride" className="btn-primary">
              Post Your First Ride
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredRides.map((ride) => (
              <div key={ride._id} className="bg-white rounded-lg shadow-sm p-6">
                {/* Ride Header */}
                <div className="flex flex-wrap justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        ride.status === 'active' ? 'bg-green-100 text-green-700' :
                        ride.status === 'full' ? 'bg-yellow-100 text-yellow-700' :
                        ride.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {ride.status.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-500">
                        {format(new Date(ride.date), 'dd MMM yyyy')} at {ride.departureTime}
                      </span>
                    </div>
                    <div className="font-medium">
                      {ride.from.city} → {ride.to.city}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-primary-600">
                      ₹{ride.pricePerSeat}/seat
                    </div>
                    <div className="text-sm text-gray-600">
                      {ride.availableSeatsCount} seats left
                    </div>
                  </div>
                </div>

                {/* Booking Requests */}
                {ride.bookedPassengers && ride.bookedPassengers.length > 0 && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-medium mb-3">Booking Requests</h4>
                    <div className="space-y-3">
                      {ride.bookedPassengers
                        .filter(p => p.status !== 'accepted')
                        .map((passenger) => (
                          <div key={passenger._id} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                            <div>
                              <div className="font-medium">{passenger.passengerId?.name}</div>
                              <div className="text-sm text-gray-600">
                                {passenger.seats} seat(s) • Requested {format(new Date(passenger.requestedAt), 'hh:mm a')}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleRespondToBooking(ride.bookedPassengers.find(b => b._id === passenger._id)?._id, 'accept', ride._id)}
                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
                              >
                                <CheckIcon className="w-4 h-4" /> Accept
                              </button>
                              <button
                                onClick={() => handleRespondToBooking(ride.bookedPassengers.find(b => b._id === passenger._id)?._id, 'reject', ride._id)}
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1"
                              >
                                <XMarkIcon className="w-4 h-4" /> Reject
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Confirmed Passengers */}
                {ride.bookedPassengers && ride.bookedPassengers.some(p => p.status === 'accepted') && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-medium mb-3">Confirmed Passengers</h4>
                    <div className="space-y-2">
                      {ride.bookedPassengers
                        .filter(p => p.status === 'accepted')
                        .map((passenger) => (
                          <div key={passenger._id} className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <img
                                src={passenger.passengerId?.profilePhoto || '/default-avatar.png'}
                                alt={passenger.passengerId?.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              <div>
                                <div className="font-medium">{passenger.passengerId?.name}</div>
                                <div className="text-xs text-gray-500">
                                  {passenger.seats} seat(s)
                                </div>
                              </div>
                            </div>
                            <Link
                              to={`/chat/${ride._id}/${passenger.passengerId._id}`}
                              className="text-primary-600 hover:text-primary-700 text-sm"
                            >
                              Message
                            </Link>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {ride.status === 'active' && (
                  <div className="flex gap-3 mt-4 pt-4 border-t">
                    <Link to={`/ride/${ride._id}`} className="text-primary-600 hover:text-primary-700">
                      View Details
                    </Link>
                    <button
                      onClick={() => handleCancelRide(ride._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Cancel Ride
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}