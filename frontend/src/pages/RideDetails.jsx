import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { 
  CalendarIcon, MapPinIcon, UsersIcon, CurrencyRupeeIcon, 
  TruckIcon, StarIcon, ChatBubbleLeftIcon, ShieldCheckIcon,
  MusicalNoteIcon, NoSymbolIcon, HeartIcon, BriefcaseIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RideDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingSeats, setBookingSeats] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchRideDetails();
  }, [id]);

  const fetchRideDetails = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/rides/${id}`);
      setRide(data.ride);
    } catch (error) {
      toast.error('Failed to load ride details');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleBookRide = async () => {
    if (!user) {
      toast.error('Please login to book a ride');
      navigate('/login');
      return;
    }

    if (bookingSeats > ride.availableSeatsCount) {
      toast.error(`Only ${ride.availableSeatsCount} seats available`);
      return;
    }

    try {
      setBookingLoading(true);
      await axios.post(`/bookings/request/${ride._id}`, { seats: bookingSeats });
      toast.success('Booking request sent to driver!');
      navigate('/my-bookings');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to book ride');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!ride) return null;

  const isDriver = user && ride.driverId._id === user.id;
  const canBook = !isDriver && ride.status === 'active' && ride.availableSeatsCount > 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Ride Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  ride.status === 'active' ? 'bg-green-100 text-green-700' :
                  ride.status === 'full' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {ride.status === 'active' ? 'Available' : ride.status === 'full' ? 'Full' : ride.status}
                </span>
                <span className="text-sm text-gray-500">
                  Posted {format(new Date(ride.createdAt), 'dd MMM')}
                </span>
              </div>
              <h1 className="text-2xl font-bold mb-2">
                {ride.from.city} → {ride.to.city}
              </h1>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <CalendarIcon className="w-5 h-5" />
                  <span>{format(new Date(ride.date), 'dd MMM yyyy')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>⏰</span>
                  <span>{ride.departureTime}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary-600">
                ₹{ride.pricePerSeat}
                <span className="text-base font-normal text-gray-500">/seat</span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Total: ₹{ride.pricePerSeat * bookingSeats}
              </div>
            </div>
          </div>
        </div>

        {/* Driver Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-lg mb-4">Driver Details</h3>
          <div className="flex items-center gap-4">
            <img
              src={ride.driverId.profilePhoto || '/default-avatar.png'}
              alt={ride.driverId.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="font-medium text-lg">{ride.driverId.name}</div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <StarIcon className="w-4 h-4 text-yellow-500" />
                  <span>{ride.driverId.rating?.toFixed(1) || 'New'}</span>
                </div>
                <span>•</span>
                <span>{ride.driverId.totalRidesAsDriver || 0} trips as driver</span>
              </div>
              {user && !isDriver && (
                <button
                  onClick={() => navigate(`/chat/${ride._id}/${ride.driverId._id}`)}
                  className="mt-2 text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1"
                >
                  <ChatBubbleLeftIcon className="w-4 h-4" />
                  Message Driver
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Vehicle & Preferences */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-lg mb-4">Vehicle & Preferences</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <TruckIcon className="w-5 h-5 text-gray-500" />
              <span>
                {ride.vehicleInfo?.make} {ride.vehicleInfo?.model}
                {ride.vehicleInfo?.color && ` (${ride.vehicleInfo.color})`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <UsersIcon className="w-5 h-5 text-gray-500" />
              <span>{ride.seatsAvailable} seats total</span>
            </div>
            <div className="flex items-center gap-2">
              {ride.preferences?.acAvailable ? (
                <><span>❄️</span><span>AC Available</span></>
              ) : (
                <><NoSymbolIcon className="w-5 h-5" /><span>No AC</span></>
              )}
            </div>
            <div className="flex items-center gap-2">
              {ride.preferences?.smoking ? (
                <><NoSymbolIcon className="w-5 h-5" /><span>No Smoking</span></>
              ) : (
                <><span>🚬</span><span>Smoking Allowed</span></>
              )}
            </div>
            <div className="flex items-center gap-2">
              {ride.preferences?.pets ? (
                <><HeartIcon className="w-5 h-5" /><span>Pets Allowed</span></>
              ) : (
                <><NoSymbolIcon className="w-5 h-5" /><span>No Pets</span></>
              )}
            </div>
            <div className="flex items-center gap-2">
              <BriefcaseIcon className="w-5 h-5" />
              <span>{ride.preferences?.luggage ? 'Luggage Space Available' : 'Limited Luggage'}</span>
            </div>
            <div className="flex items-center gap-2">
              <MusicalNoteIcon className="w-5 h-5" />
              <span>Music: {ride.preferences?.music || 'Any'}</span>
            </div>
            <div className="flex items-center gap-2">
              <ChatBubbleLeftIcon className="w-5 h-5" />
              <span>Chatting: {ride.preferences?.chatting || 'Any'}</span>
            </div>
          </div>
          {ride.additionalInfo && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">{ride.additionalInfo}</p>
            </div>
          )}
        </div>

        {/* Safety Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <ShieldCheckIcon className="w-5 h-5 text-green-600" />
            Safety Tips
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>✓ Verify driver details before the ride</li>
            <li>✓ Share your trip details with family/friends</li>
            <li>✓ Pay directly to driver after ride completion</li>
            <li>✓ Rate your experience after the ride</li>
            <li>✓ Contact support for any issues</li>
          </ul>
        </div>

        {/* Booking Section */}
        {canBook && (
          <div className="bg-white rounded-lg shadow-sm p-6 sticky bottom-0">
            <div className="flex flex-wrap gap-4 items-end justify-between">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Seats
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setBookingSeats(Math.max(1, bookingSeats - 1))}
                    className="w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="text-xl font-semibold w-12 text-center">{bookingSeats}</span>
                  <button
                    onClick={() => setBookingSeats(Math.min(ride.availableSeatsCount, bookingSeats + 1))}
                    className="w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50"
                  >
                    +
                  </button>
                  <span className="text-sm text-gray-500">
                    {ride.availableSeatsCount} seats available
                  </span>
                </div>
              </div>
              <button
                onClick={handleBookRide}
                disabled={bookingLoading}
                className="btn-primary px-8 py-3 disabled:opacity-50"
              >
                {bookingLoading ? 'Requesting...' : `Request to Book • ₹${ride.pricePerSeat * bookingSeats}`}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              You'll pay the driver directly after the ride. No platform fees!
            </p>
          </div>
        )}

        {isDriver && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <button
              onClick={() => navigate(`/my-rides`)}
              className="btn-secondary w-full"
            >
              View My Rides
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
