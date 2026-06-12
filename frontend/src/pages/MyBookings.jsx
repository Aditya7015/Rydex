import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { 
  StarIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  ClockIcon,
  CalendarIcon,
  MapPinIcon,
  CurrencyRupeeIcon,
  UserCircleIcon,
  PhoneIcon,
  ShieldCheckIcon,
  FaceSmileIcon,
  MusicalNoteIcon,
  WifiIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { FaRegClock, FaCarSide, FaGasPump, FaCar, FaLocationArrow } from 'react-icons/fa';
import PassengerLiveTracking from '../components/PassengerLiveTracking';
import toast from 'react-hot-toast';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [ratingModal, setRatingModal] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeTrackingBooking, setActiveTrackingBooking] = useState(null);
  const [driverSharingStatus, setDriverSharingStatus] = useState({});

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/bookings/my-bookings');
      setBookings(data.bookings);
      
      // Check tracking status for each confirmed upcoming booking
      for (const booking of data.bookings) {
        if (booking.status === 'confirmed' && getBookingRideDateTime(booking) > new Date()) {
          checkTrackingStatus(booking);
        }
      }
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const checkTrackingStatus = async (booking) => {
    try {
      const { data } = await axios.get(`/rides/${booking.rideId?._id}/tracking-status`);
      setDriverSharingStatus(prev => ({
        ...prev,
        [booking.rideId?._id]: data.isSharing
      }));
    } catch (error) {
      console.error('Error checking tracking status');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      await axios.delete(`/bookings/${bookingId}`);
      toast.success('Booking cancelled successfully');
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to cancel booking');
    }
  };

  const handleRateRide = async (bookingId, rating, review) => {
    try {
      await axios.post(`/bookings/rate/${bookingId}`, {
        rating,
        review,
        role: 'passenger'
      });
      toast.success('Thank you for your rating!');
      setRatingModal(null);
      fetchBookings();
    } catch (error) {
      toast.error('Failed to submit rating');
    }
  };

  const getStatusColor = (status, booking) => {
    const rideDateTime = getBookingRideDateTime(booking);
    const isPast = rideDateTime ? rideDateTime < new Date() : false;
    if (status === 'confirmed' && !isPast) return 'bg-green-500';
    if (status === 'confirmed' && isPast) return 'bg-gray-400';
    if (status === 'pending') return 'bg-yellow-500';
    if (status === 'cancelled') return 'bg-red-500';
    return 'bg-gray-500';
  };

  const getBookingRideDateTime = (booking) => {
    if (!booking?.rideId?.date) return null;
    const rideDateTime = new Date(booking.rideId.date);
    if (booking.rideId.departureTime) {
      const [hours, minutes] = booking.rideId.departureTime.split(':').map(Number);
      if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
        rideDateTime.setHours(hours, minutes, 0, 0);
      }
    }
    return rideDateTime;
  };

  const getStatusText = (status, booking) => {
    const rideDateTime = getBookingRideDateTime(booking);
    const isPast = rideDateTime ? rideDateTime < new Date() : false;
    if (status === 'confirmed' && !isPast) return 'Upcoming';
    if (status === 'confirmed' && isPast) return 'Completed';
    if (status === 'pending') return 'Pending Approval';
    if (status === 'cancelled') return 'Cancelled';
    return status;
  };

  const filteredBookings = bookings.filter((booking) => {
    const rideDateTime = getBookingRideDateTime(booking);
    if (!rideDateTime) return false;
    if (activeTab === 'upcoming') return rideDateTime >= new Date() && booking.status === 'confirmed';
    if (activeTab === 'past') return rideDateTime < new Date() || booking.status === 'completed';
    if (activeTab === 'cancelled') return booking.status === 'cancelled';
    if (activeTab === 'pending') return booking.status === 'pending';
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-3 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your bookings...</p>
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
              <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
              <p className="text-primary-100">Track and manage all your rides in one place</p>
            </div>
            <Link to="/" className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/30 transition-all">
              Find New Ride
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
            <div className="text-2xl font-bold text-gray-900">
              {bookings.filter(b => {
                const rideDateTime = getBookingRideDateTime(b);
                return rideDateTime && rideDateTime >= new Date() && b.status === 'confirmed';
              }).length}
            </div>
            <div className="text-sm text-gray-600">Upcoming Rides</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
            <div className="text-2xl font-bold text-gray-900">
              {bookings.filter(b => {
                const rideDateTime = getBookingRideDateTime(b);
                return rideDateTime && rideDateTime < new Date() && b.status === 'confirmed';
              }).length}
            </div>
            <div className="text-sm text-gray-600">Completed Rides</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-yellow-500">
            <div className="text-2xl font-bold text-gray-900">
              {bookings.filter(b => b.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">Pending Requests</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-red-500">
            <div className="text-2xl font-bold text-gray-900">
              {bookings.filter(b => b.status === 'cancelled').length}
            </div>
            <div className="text-sm text-gray-600">Cancelled</div>
          </div>
        </div>

        {/* Modern Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6 p-1">
          <div className="flex gap-1">
            {['upcoming', 'past', 'pending', 'cancelled'].map((tab) => (
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
                  {bookings.filter(b => {
                    const rideDateTime = getBookingRideDateTime(b);
                    if (!rideDateTime) return false;
                    if (tab === 'upcoming') return rideDateTime >= new Date() && b.status === 'confirmed';
                    if (tab === 'past') return rideDateTime < new Date() || b.status === 'completed';
                    if (tab === 'cancelled') return b.status === 'cancelled';
                    if (tab === 'pending') return b.status === 'pending';
                    return false;
                  }).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
            <div className="text-8xl mb-4">🚗</div>
            <h3 className="text-2xl font-semibold mb-2 text-gray-900">No {activeTab} bookings</h3>
            <p className="text-gray-600 mb-6">You haven't made any {activeTab} bookings yet</p>
            <Link to="/" className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-all">
              Find a Ride
              <ChevronRightIcon className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              const rideDateTime = getBookingRideDateTime(booking);
              const isUpcoming = rideDateTime && rideDateTime > new Date();
              const isDriverSharing = driverSharingStatus[booking.rideId?._id];
              const isTrackingActive = activeTrackingBooking === booking._id;
              
              return (
                <div
                  key={booking._id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  {/* Status Bar */}
                  <div className={`h-1 ${getStatusColor(booking.status, booking)}`}></div>
                  
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex flex-wrap justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                          getStatusColor(booking.status, booking)
                        }`}>
                          {getStatusText(booking.status, booking)}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <CalendarIcon className="w-4 h-4" />
                          <span>{format(new Date(booking.rideId?.date), 'dd MMM yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <ClockIcon className="w-4 h-4" />
                          <span>{booking.rideId?.departureTime}</span>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-primary-600">
                        ₹{booking.totalPrice}
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
                          <div className="font-semibold text-gray-900">{booking.rideId?.from?.city}</div>
                          {booking.rideId?.from?.landmark && (
                            <div className="text-sm text-gray-500">{booking.rideId?.from?.landmark}</div>
                          )}
                        </div>
                        <div className="text-gray-400">→</div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{booking.rideId?.to?.city}</div>
                          {booking.rideId?.to?.landmark && (
                            <div className="text-sm text-gray-500">{booking.rideId?.to?.landmark}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Driver & Vehicle Info */}
                    <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={booking.driverId?.profilePhoto || '/default-avatar.png'}
                          alt={booking.driverId?.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-primary-100"
                        />
                        <div>
                          <div className="font-semibold text-gray-900">{booking.driverId?.name}</div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <StarIcon className="w-3 h-3 text-yellow-400" />
                              <span>{booking.driverId?.rating?.toFixed(1) || 'New'}</span>
                            </div>
                            <span>•</span>
                            <span>{booking.driverId?.totalRidesAsDriver || 0} trips</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {booking.rideId?.vehicleInfo?.make && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FaCar className="w-4 h-4" />
                            <span>{booking.rideId?.vehicleInfo?.make} {booking.rideId?.vehicleInfo?.model}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <UserCircleIcon className="w-4 h-4" />
                          <span>{booking.seats} seat(s)</span>
                        </div>
                      </div>
                    </div>

                    {/* Ride Preferences Tags */}
                    {booking.rideId?.preferences && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {booking.rideId?.preferences?.acAvailable && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-lg">
                            <WifiIcon className="w-3 h-3" /> AC
                          </span>
                        )}
                        {booking.rideId?.preferences?.music && booking.rideId?.preferences?.music !== 'any' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-lg">
                            <MusicalNoteIcon className="w-3 h-3" /> {booking.rideId?.preferences?.music}
                          </span>
                        )}
                        {booking.rideId?.preferences?.chatting && booking.rideId?.preferences?.chatting !== 'any' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs rounded-lg">
                            <FaceSmileIcon className="w-3 h-3" /> {booking.rideId?.preferences?.chatting}
                          </span>
                        )}
                      </div>
                    )}

                    {/* LIVE TRACKING SECTION - For Passengers */}
                    {booking.status === 'confirmed' && isUpcoming && (
                      <div className="mb-4">
                        {isTrackingActive ? (
                          <PassengerLiveTracking 
                            rideId={booking.rideId?._id}
                            driverName={booking.driverId?.name}
                            onTrackingEnd={() => setActiveTrackingBooking(null)}
                          />
                        ) : (
                          isDriverSharing && (
                            <button
                              onClick={() => setActiveTrackingBooking(booking._id)}
                              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                            >
                              <FaLocationArrow className="w-5 h-5 animate-pulse" />
                              View Driver Live Location
                            </button>
                          )
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t">
                      {booking.status === 'confirmed' && isUpcoming && (
                        <>
                          <Link
                            to={`/chat/${booking.rideId?._id}/${booking.driverId?._id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-all"
                          >
                            <ChatBubbleLeftRightIcon className="w-4 h-4" />
                            Message Driver
                          </Link>
                          <button
                            onClick={() => handleCancelBooking(booking._id)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                          >
                            <XMarkIcon className="w-4 h-4" />
                            Cancel Booking
                          </button>
                          <button
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowDetailsModal(true);
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-all"
                          >
                            View Details
                          </button>
                        </>
                      )}
                      
                      {booking.status === 'confirmed' && !isUpcoming && !booking.driverRating && (
                        <button
                          onClick={() => setRatingModal(booking)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-all"
                        >
                          <StarIcon className="w-4 h-4" />
                          Rate this ride
                        </button>
                      )}
                      
                      {booking.driverRating && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg">
                          <StarSolidIcon className="w-4 h-4" />
                          Rated {booking.driverRating}.0
                        </div>
                      )}

                      {booking.status === 'pending' && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg">
                          <ClockIcon className="w-4 h-4" />
                          Awaiting driver confirmation
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rating Modal */}
      {ratingModal && (
        <RatingModal
          booking={ratingModal}
          onClose={() => setRatingModal(null)}
          onSubmit={handleRateRide}
        />
      )}

      {/* Booking Details Modal */}
      {showDetailsModal && selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </div>
  );
}

// Premium Rating Modal Component
function RatingModal({ booking, onClose, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [hover, setHover] = useState(0);

  const ratingLabels = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent'
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 transform transition-all">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <StarSolidIcon className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Rate Your Ride</h3>
          <p className="text-gray-600">
            How was your experience with <span className="font-semibold">{booking.driverId?.name}</span>?
          </p>
        </div>
        
        <div className="flex justify-center gap-3 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(rating)}
              className="focus:outline-none transform hover:scale-110 transition-all"
            >
              {(hover || rating) >= star ? (
                <StarSolidIcon className="w-10 h-10 text-yellow-400" />
              ) : (
                <StarIcon className="w-10 h-10 text-gray-300" />
              )}
            </button>
          ))}
        </div>
        
        {rating > 0 && (
          <div className="text-center mb-4">
            <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
              {ratingLabels[rating]}
            </span>
          </div>
        )}
        
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none resize-none mb-4"
          rows="4"
          placeholder="Share your experience with others (optional)"
        ></textarea>
        
        <div className="flex gap-3">
          <button
            onClick={() => onSubmit(booking._id, rating, review)}
            disabled={rating === 0}
            className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Rating
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// Booking Details Modal Component
function BookingDetailsModal({ booking, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Booking Details</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Ride Info */}
        <div className="bg-gradient-to-r from-primary-50 to-indigo-50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-primary-600">RIDE DETAILS</span>
            <span className={`px-2 py-1 rounded text-xs font-semibold ${
              booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {booking.status.toUpperCase()}
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <MapPinIcon className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">FROM</div>
                <div className="font-semibold">{booking.rideId?.from?.city}</div>
                {booking.rideId?.from?.landmark && (
                  <div className="text-sm text-gray-500">{booking.rideId?.from?.landmark}</div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <MapPinIcon className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">TO</div>
                <div className="font-semibold">{booking.rideId?.to?.city}</div>
                {booking.rideId?.to?.landmark && (
                  <div className="text-sm text-gray-500">{booking.rideId?.to?.landmark}</div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-xs text-gray-500">DATE & TIME</div>
                <div>{format(new Date(booking.rideId?.date), 'dd MMM yyyy')} at {booking.rideId?.departureTime}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Driver Info */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h4 className="font-semibold mb-3">Driver Information</h4>
          <div className="flex items-center gap-3">
            <img
              src={booking.driverId?.profilePhoto || '/default-avatar.png'}
              alt={booking.driverId?.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <div className="font-semibold text-lg">{booking.driverId?.name}</div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <StarIcon className="w-4 h-4 text-yellow-400" />
                  <span>{booking.driverId?.rating?.toFixed(1) || 'New'}</span>
                </div>
                <span>•</span>
                <span>{booking.driverId?.totalRidesAsDriver || 0} trips</span>
              </div>
              <Link
                to={`/chat/${booking.rideId?._id}/${booking.driverId?._id}`}
                className="inline-flex items-center gap-1 text-primary-600 text-sm mt-2"
              >
                <ChatBubbleLeftRightIcon className="w-4 h-4" />
                Message Driver
              </Link>
            </div>
          </div>
        </div>

        {/* Vehicle Info */}
        {booking.rideId?.vehicleInfo?.make && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h4 className="font-semibold mb-3">Vehicle Details</h4>
            <div className="flex items-center gap-3">
              <FaCar className="w-8 h-8 text-gray-400" />
              <div>
                <div>{booking.rideId?.vehicleInfo?.make} {booking.rideId?.vehicleInfo?.model}</div>
                {booking.rideId?.vehicleInfo?.color && (
                  <div className="text-sm text-gray-500">Color: {booking.rideId?.vehicleInfo?.color}</div>
                )}
                {booking.rideId?.vehicleInfo?.numberPlate && (
                  <div className="text-sm text-gray-500">Number: {booking.rideId?.vehicleInfo?.numberPlate}</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Booking Summary */}
        <div className="border-t pt-4">
          <h4 className="font-semibold mb-3">Booking Summary</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Seats Booked</span>
              <span className="font-semibold">{booking.seats}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Price per Seat</span>
              <span className="font-semibold">₹{booking.rideId?.pricePerSeat}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total Amount</span>
              <span className="text-primary-600">₹{booking.totalPrice}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}