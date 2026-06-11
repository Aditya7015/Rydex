import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { StarIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [ratingModal, setRatingModal] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/bookings/my-bookings');
      setBookings(data.bookings);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      await axios.delete(`/bookings/${bookingId}`);
      toast.success('Booking cancelled');
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

  const filteredBookings = bookings.filter(booking => {
    const rideDate = new Date(booking.rideId?.date);
    if (activeTab === 'upcoming') return rideDate >= new Date() && booking.status === 'confirmed';
    if (activeTab === 'past') return rideDate < new Date() || booking.status === 'completed';
    if (activeTab === 'cancelled') return booking.status === 'cancelled';
    if (activeTab === 'pending') return booking.status === 'pending';
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
        <h1 className="text-2xl font-bold mb-6">My Bookings</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b overflow-x-auto">
          {['upcoming', 'past', 'pending', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium capitalize whitespace-nowrap ${
                activeTab === tab
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab} ({bookings.filter(b => {
                if (tab === 'upcoming') return new Date(b.rideId?.date) >= new Date() && b.status === 'confirmed';
                if (tab === 'past') return new Date(b.rideId?.date) < new Date() || b.status === 'completed';
                if (tab === 'cancelled') return b.status === 'cancelled';
                if (tab === 'pending') return b.status === 'pending';
                return false;
              }).length})
            </button>
          ))}
        </div>

        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold mb-2">No bookings found</h3>
            <p className="text-gray-600 mb-6">You haven't made any {activeTab} bookings yet</p>
            <Link to="/" className="btn-primary">
              Find a Ride
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex flex-wrap justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {booking.status.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-500">
                        {format(new Date(booking.rideId?.date), 'dd MMM yyyy')}
                      </span>
                    </div>
                    <div className="font-medium">
                      {booking.rideId?.from?.city} → {booking.rideId?.to?.city}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {booking.rideId?.departureTime} • {booking.seats} seat(s) • ₹{booking.totalPrice}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <img
                        src={booking.driverId?.profilePhoto || '/default-avatar.png'}
                        alt={booking.driverId?.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-medium">{booking.driverId?.name}</div>
                        <div className="text-xs text-gray-500">Driver</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  {booking.status === 'confirmed' && new Date(booking.rideId?.date) > new Date() && (
                    <>
                      <Link
                        to={`/chat/${booking.rideId?._id}/${booking.driverId?._id}`}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        Message Driver
                      </Link>
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Cancel Booking
                      </button>
                    </>
                  )}
                  
                  {booking.status === 'confirmed' && new Date(booking.rideId?.date) < new Date() && !booking.driverRating && (
                    <button
                      onClick={() => setRatingModal(booking)}
                      className="text-yellow-600 hover:text-yellow-700 flex items-center gap-1"
                    >
                      <StarIcon className="w-4 h-4" /> Rate this ride
                    </button>
                  )}
                  
                  {booking.driverRating && (
                    <span className="text-green-600 flex items-center gap-1">
                      <StarIcon className="w-4 h-4 fill-current" /> Rated
                    </span>
                  )}
                </div>
              </div>
            ))}
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
    </div>
  );
}

// Rating Modal Component
function RatingModal({ booking, onClose, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [hover, setHover] = useState(0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-xl font-bold mb-4">Rate Your Ride</h3>
        <p className="text-gray-600 mb-4">
          How was your ride with {booking.driverId?.name}?
        </p>
        
        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(rating)}
              className="text-4xl focus:outline-none"
            >
              <StarIcon
                className={`w-8 h-8 ${
                  (hover || rating) >= star
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
        
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          className="input-field mb-4"
          rows="3"
          placeholder="Share your experience (optional)"
        ></textarea>
        
        <div className="flex gap-3">
          <button
            onClick={() => onSubmit(booking._id, rating, review)}
            disabled={rating === 0}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            Submit Rating
          </button>
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}