import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { 
  CalendarIcon, 
  MapPinIcon, 
  UsersIcon, 
  CurrencyRupeeIcon, 
  StarIcon, 
  ChatBubbleLeftRightIcon, 
  ShieldCheckIcon,
  MusicalNoteIcon,
  HeartIcon, 
  BriefcaseIcon,
  ClockIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  PhoneIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { FaCarSide, FaSnowflake, FaSmoking, FaDog, FaMusic, FaComments, FaLeaf } from 'react-icons/fa';
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
  const [showContact, setShowContact] = useState(false);

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-3 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading ride details...</p>
        </div>
      </div>
    );
  }

  if (!ride) return null;

  const isDriver = user && ride.driverId._id === user.id;
  const canBook = !isDriver && ride.status === 'active' && ride.availableSeatsCount > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 py-8 relative">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  ride.status === 'active' ? 'bg-green-500' :
                  ride.status === 'full' ? 'bg-yellow-500' :
                  'bg-gray-500'
                }`}>
                  {ride.status === 'active' ? 'Available' : ride.status === 'full' ? 'Fully Booked' : ride.status}
                </span>
                <span className="text-white/80 text-sm">
                  Posted {format(new Date(ride.createdAt), 'dd MMM yyyy')}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {ride.from.city} → {ride.to.city}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-white/90">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  <span>{format(new Date(ride.date), 'dd MMM yyyy')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-5 h-5" />
                  <span>{ride.departureTime}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">
                ₹{ride.pricePerSeat}
                <span className="text-base font-normal">/seat</span>
              </div>
              <div className="text-white/80 text-sm mt-1">
                Total: ₹{ride.pricePerSeat * bookingSeats}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Route Details Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <MapPinIcon className="w-5 h-5 text-primary-600" />
                Journey Details
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <MapPinIcon className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">FROM</div>
                    <div className="font-semibold text-gray-900 text-lg">{ride.from.city}</div>
                    {ride.from.landmark && (
                      <div className="text-sm text-gray-500 mt-1">{ride.from.landmark}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <MapPinIcon className="w-4 h-4 text-red-600" />
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">TO</div>
                    <div className="font-semibold text-gray-900 text-lg">{ride.to.city}</div>
                    {ride.to.landmark && (
                      <div className="text-sm text-gray-500 mt-1">{ride.to.landmark}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle & Preferences Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <FaCarSide className="w-5 h-5 text-primary-600" />
                Vehicle & Preferences
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {ride.vehicleInfo?.make && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <FaCarSide className="w-5 h-5 text-gray-600" />
                    <div>
                      <div className="text-sm font-medium">{ride.vehicleInfo.make} {ride.vehicleInfo.model}</div>
                      {ride.vehicleInfo.color && (
                        <div className="text-xs text-gray-500">Color: {ride.vehicleInfo.color}</div>
                      )}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <UsersIcon className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="text-sm font-medium">{ride.seatsAvailable} seats total</div>
                    <div className="text-xs text-gray-500">{ride.availableSeatsCount} seats available</div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3 mt-4">
                {ride.preferences?.acAvailable && (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-xl">
                    <FaSnowflake className="w-4 h-4" /> AC Available
                  </span>
                )}
                {ride.preferences?.smoking ? (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 text-sm rounded-xl">
                    <FaSmoking className="w-4 h-4" /> Smoking Allowed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 text-sm rounded-xl">
                    🚭 No Smoking
                  </span>
                )}
                {ride.preferences?.pets ? (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-50 text-orange-700 text-sm rounded-xl">
                    <FaDog className="w-4 h-4" /> Pets Allowed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-600 text-sm rounded-xl">
                    🚫 No Pets
                  </span>
                )}
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 text-sm rounded-xl">
                  <FaMusic className="w-4 h-4" /> Music: {ride.preferences?.music || 'Any'}
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 text-sm rounded-xl">
                  <FaComments className="w-4 h-4" /> Chatting: {ride.preferences?.chatting || 'Any'}
                </span>
              </div>

              {ride.additionalInfo && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-xl">
                  <div className="flex items-start gap-2">
                    <InformationCircleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-yellow-800 mb-1">Additional Information</div>
                      <p className="text-sm text-yellow-700">{ride.additionalInfo}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Safety Tips Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <ShieldCheckIcon className="w-5 h-5 text-green-600" />
                Safety Tips
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  "Verify driver details before the ride",
                  "Share trip details with family/friends",
                  "Pay directly after ride completion",
                  "Rate your experience after the ride",
                  "Contact support for any issues",
                  "Trust your instincts"
                ].map((tip, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Right Side */}
          <div className="space-y-6">
            {/* Driver Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <UserCircleIcon className="w-5 h-5 text-primary-600" />
                Driver Details
              </h3>
              
              <div className="text-center mb-4">
                <img
                  src={ride.driverId.profilePhoto || '/default-avatar.png'}
                  alt={ride.driverId.name}
                  className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-primary-100"
                />
                <div className="font-bold text-xl mt-3">{ride.driverId.name}</div>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      i < Math.floor(ride.driverId.rating || 0) ? (
                        <StarSolidIcon key={i} className="w-4 h-4 text-yellow-400" />
                      ) : (
                        <StarIcon key={i} className="w-4 h-4 text-gray-300" />
                      )
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {ride.driverId.rating?.toFixed(1) || 'New'}
                  </span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {ride.driverId.totalRidesAsDriver || 0} trips as driver
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Member since</span>
                  <span className="font-medium">{new Date(ride.driverId.createdAt).getFullYear()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Response rate</span>
                  <span className="font-medium text-green-600">~95%</span>
                </div>
              </div>

              {user && !isDriver && (
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => navigate(`/chat/${ride._id}/${ride.driverId._id}`)}
                    className="w-full bg-primary-50 text-primary-700 py-2 rounded-xl font-medium hover:bg-primary-100 transition-all flex items-center justify-center gap-2"
                  >
                    <ChatBubbleLeftRightIcon className="w-5 h-5" />
                    Message Driver
                  </button>
                  <button
                    onClick={() => setShowContact(!showContact)}
                    className="w-full bg-gray-50 text-gray-700 py-2 rounded-xl font-medium hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                  >
                    <PhoneIcon className="w-5 h-5" />
                    {showContact ? 'Hide Contact' : 'Show Contact'}
                  </button>
                  {showContact && (
                    <div className="bg-gray-100 rounded-xl p-3 text-center">
                      <p className="text-sm text-gray-600">Contact will be shared after booking confirmation</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Eco Impact Card */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <FaLeaf className="w-8 h-8 text-green-600" />
                <div>
                  <div className="font-semibold text-gray-900">Eco-Friendly Choice</div>
                  <div className="text-sm text-gray-600">Good for the planet</div>
                </div>
              </div>
              <p className="text-sm text-gray-700">
                By choosing this ride share, you're saving approximately 15kg of CO₂ emissions compared to solo travel.
              </p>
            </div>
          </div>
        </div>

        {/* Booking Section - Sticky Bottom */}
        {canBook && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50 transform translate-y-0 transition-transform">
            <div className="container mx-auto px-4 py-4 max-w-5xl">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Seats
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setBookingSeats(Math.max(1, bookingSeats - 1))}
                      className="w-10 h-10 rounded-lg border-2 border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-all"
                    >
                      -
                    </button>
                    <span className="text-xl font-semibold w-12 text-center">{bookingSeats}</span>
                    <button
                      onClick={() => setBookingSeats(Math.min(ride.availableSeatsCount, bookingSeats + 1))}
                      className="w-10 h-10 rounded-lg border-2 border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-all"
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
                  className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {bookingLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Requesting...
                    </>
                  ) : (
                    <>
                      Request to Book
                      <span className="text-lg font-bold">₹{ride.pricePerSeat * bookingSeats}</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center">
                🔒 You'll pay the driver directly after the ride. No platform fees!
              </p>
            </div>
          </div>
        )}

        {isDriver && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
            <div className="container mx-auto px-4 py-4 max-w-5xl">
              <button
                onClick={() => navigate(`/my-rides`)}
                className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition-all"
              >
                View My Rides
              </button>
            </div>
          </div>
        )}

        {/* Add padding bottom when booking section is visible */}
        {(canBook || isDriver) && <div className="h-32"></div>}
      </div>
    </div>
  );
}