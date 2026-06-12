import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { 
  CalendarIcon, 
  MapPinIcon, 
  UsersIcon, 
  CurrencyRupeeIcon,
  ClockIcon,
  StarIcon,
  ChevronRightIcon,
  FunnelIcon,
  XMarkIcon,
  WifiIcon,
  MusicalNoteIcon,
  FaceSmileIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { FaCarSide, FaLeaf } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function SearchResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: [0, 5000],
    departureTime: 'any',
    sortBy: 'departureTime',
    acOnly: false,
    minRating: 0
  });

  const queryParams = new URLSearchParams(location.search);
  const from = queryParams.get('from');
  const to = queryParams.get('to');
  const date = queryParams.get('date');

  useEffect(() => {
    fetchRides();
  }, [from, to, date]);

  const fetchRides = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/rides/search?from=${from}&to=${to}&date=${date}`);
      setRides(data.rides);
    } catch (error) {
      toast.error('Failed to load rides');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeSlot = (time) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    if (hour < 21) return 'Evening';
    return 'Night';
  };

  const getTimeIcon = (time) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour < 12) return '🌅';
    if (hour < 17) return '☀️';
    if (hour < 21) return '🌙';
    return '🌃';
  };

  const filteredAndSortedRides = rides
    .filter(ride => {
      if (filters.departureTime !== 'any') {
        const slot = getTimeSlot(ride.departureTime);
        if (slot !== filters.departureTime) return false;
      }
      if (ride.pricePerSeat < filters.priceRange[0] || ride.pricePerSeat > filters.priceRange[1]) {
        return false;
      }
      if (filters.acOnly && !ride.preferences?.acAvailable) return false;
      if (filters.minRating > 0 && (ride.driverId.rating || 0) < filters.minRating) return false;
      return true;
    })
    .sort((a, b) => {
      if (filters.sortBy === 'priceLow') return a.pricePerSeat - b.pricePerSeat;
      if (filters.sortBy === 'priceHigh') return b.pricePerSeat - a.pricePerSeat;
      if (filters.sortBy === 'departureTime') return a.departureTime.localeCompare(b.departureTime);
      if (filters.sortBy === 'rating') return (b.driverId.rating || 0) - (a.driverId.rating || 0);
      return 0;
    });

  const clearFilters = () => {
    setFilters({
      priceRange: [0, 5000],
      departureTime: 'any',
      sortBy: 'departureTime',
      acOnly: false,
      minRating: 0
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white sticky top-0 z-20 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Search Summary */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <MapPinIcon className="w-4 h-4" />
                <span className="text-sm font-medium">{from}</span>
                <ChevronRightIcon className="w-4 h-4" />
                <span className="text-sm font-medium">{to}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <CalendarIcon className="w-4 h-4" />
                <span className="text-sm">{format(new Date(date), 'dd MMM yyyy')}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <UsersIcon className="w-4 h-4" />
                <span className="text-sm">{filteredAndSortedRides.length} rides found</span>
              </div>
            </div>
            
            {/* Sort & Filter Buttons */}
            <div className="flex gap-2">
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                className="bg-white/20 backdrop-blur-sm text-white rounded-lg px-4 py-2 text-sm border-none focus:ring-2 focus:ring-white"
              >
                <option value="departureTime">Sort by: Time</option>
                <option value="priceLow">Sort by: Price: Low to High</option>
                <option value="priceHigh">Sort by: Price: High to Low</option>
                <option value="rating">Sort by: Rating</option>
              </select>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2 hover:bg-white/30 transition-all"
              >
                <FunnelIcon className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar - Desktop */}
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl text-gray-900">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                  Reset
                </button>
              </div>
              
              {/* Time Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Departure Time
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['any', 'Morning', 'Afternoon', 'Evening', 'Night'].map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setFilters({...filters, departureTime: slot === 'any' ? 'any' : slot})}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        filters.departureTime === (slot === 'any' ? 'any' : slot)
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {slot === 'any' ? 'Any Time' : slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Price Range (₹)
                </label>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    step="50"
                    value={filters.priceRange[1]}
                    onChange={(e) => setFilters({...filters, priceRange: [filters.priceRange[0], parseInt(e.target.value)]})}
                    className="w-full"
                  />
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-xs text-gray-500">Min</label>
                      <input
                        type="number"
                        value={filters.priceRange[0]}
                        onChange={(e) => setFilters({...filters, priceRange: [parseInt(e.target.value), filters.priceRange[1]]})}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-500">Max</label>
                      <input
                        type="number"
                        value={filters.priceRange[1]}
                        onChange={(e) => setFilters({...filters, priceRange: [filters.priceRange[0], parseInt(e.target.value)]})}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Filters */}
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer">
                  <span className="text-sm font-medium text-gray-700">AC Only</span>
                  <input
                    type="checkbox"
                    checked={filters.acOnly}
                    onChange={(e) => setFilters({...filters, acOnly: e.target.checked})}
                    className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                  />
                </label>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Minimum Rating
                  </label>
                  <div className="flex gap-1">
                    {[0, 3, 4, 4.5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setFilters({...filters, minRating: rating})}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          filters.minRating === rating
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {rating === 0 ? 'Any' : `${rating}+`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-b-3 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Finding the best rides for you...</p>
              </div>
            ) : filteredAndSortedRides.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
                <div className="text-8xl mb-4">🔍</div>
                <h3 className="text-2xl font-semibold mb-2 text-gray-900">No rides found</h3>
                <p className="text-gray-600 mb-4">
                  No rides available from {from} to {to} on {format(new Date(date), 'dd MMM yyyy')}
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Try adjusting your filters or travel date
                </p>
                <button
                  onClick={() => navigate('/post-ride')}
                  className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-all"
                >
                  Post a Ride
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Results Count */}
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-gray-600">
                    Showing <span className="font-semibold text-gray-900">{filteredAndSortedRides.length}</span> rides
                  </p>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden text-primary-600 text-sm flex items-center gap-1"
                  >
                    <FunnelIcon className="w-4 h-4" />
                    Filters
                  </button>
                </div>

                {filteredAndSortedRides.map((ride, index) => (
                  <div
                    key={ride._id}
                    className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1"
                    onClick={() => navigate(`/ride/${ride._id}`)}
                  >
                    <div className="p-6">
                      <div className="flex flex-wrap lg:flex-nowrap justify-between gap-6">
                        {/* Left: Route & Driver Info */}
                        <div className="flex-1">
                          {/* Time Badge */}
                          <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1 mb-3">
                            <span className="text-lg">{getTimeIcon(ride.departureTime)}</span>
                            <span className="text-sm font-medium text-gray-700">{ride.departureTime}</span>
                          </div>

                          {/* Route */}
                          <div className="mb-4">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span className="font-semibold text-gray-900">{ride.from.city}</span>
                                </div>
                                {ride.from.landmark && (
                                  <div className="text-xs text-gray-500 ml-4 mt-1">{ride.from.landmark}</div>
                                )}
                              </div>
                              <div className="text-gray-400">→</div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                  <span className="font-semibold text-gray-900">{ride.to.city}</span>
                                </div>
                                {ride.to.landmark && (
                                  <div className="text-xs text-gray-500 ml-4 mt-1">{ride.to.landmark}</div>
                                )}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 ml-4">
                              {format(new Date(ride.date), 'dd MMM yyyy')}
                            </div>
                          </div>

                          {/* Driver Info */}
                          <div className="flex items-center gap-3">
                            <img
                              src={ride.driverId.profilePhoto || '/default-avatar.png'}
                              alt={ride.driverId.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-primary-100"
                            />
                            <div>
                              <div className="font-semibold text-gray-900">{ride.driverId.name}</div>
                              <div className="flex items-center gap-2 text-sm">
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    i < Math.floor(ride.driverId.rating || 0) ? (
                                      <StarSolidIcon key={i} className="w-3 h-3 text-yellow-400" />
                                    ) : (
                                      <StarIcon key={i} className="w-3 h-3 text-gray-300" />
                                    )
                                  ))}
                                  <span className="text-gray-600 ml-1">
                                    {ride.driverId.rating?.toFixed(1) || 'New'}
                                  </span>
                                </div>
                                <span className="text-gray-400">•</span>
                                <span className="text-gray-600">{ride.driverId.totalRidesAsDriver || 0} trips</span>
                              </div>
                            </div>
                          </div>

                          {/* Vehicle & Preferences */}
                          <div className="flex flex-wrap gap-2 mt-3">
                            {ride.vehicleInfo?.make && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">
                                <FaCarSide className="w-3 h-3" />
                                {ride.vehicleInfo.make} {ride.vehicleInfo.model}
                              </span>
                            )}
                            {ride.preferences?.acAvailable && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-lg">
                                <WifiIcon className="w-3 h-3" /> AC
                              </span>
                            )}
                            {ride.preferences?.music !== 'any' && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-lg">
                                <MusicalNoteIcon className="w-3 h-3" /> {ride.preferences.music}
                              </span>
                            )}
                            {ride.preferences?.chatting !== 'any' && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs rounded-lg">
                                <FaceSmileIcon className="w-3 h-3" /> {ride.preferences.chatting}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Right: Price & Book Button */}
                        <div className="lg:text-right flex lg:block items-center justify-between gap-4">
                          <div>
                            <div className="text-3xl font-bold text-primary-600">
                              ₹{ride.pricePerSeat}
                              <span className="text-sm font-normal text-gray-500">/seat</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1 justify-end">
                              <UsersIcon className="w-4 h-4" />
                              <span>{ride.availableSeatsCount} seats left</span>
                            </div>
                            {ride.preferences?.acAvailable && (
                              <div className="text-xs text-green-600 mt-1">❄️ AC Available</div>
                            )}
                          </div>
                          <button className="lg:mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all group-hover:shadow-lg whitespace-nowrap">
                            View Details
                          </button>
                        </div>
                      </div>

                      {/* Eco Badge */}
                      <div className="mt-4 pt-4 border-t flex items-center gap-2">
                        <FaLeaf className="text-green-500 w-4 h-4" />
                        <span className="text-xs text-gray-500">
                          This ride saves approximately 15kg CO₂ compared to solo travel
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 lg:hidden">
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              {/* Same filter options as desktop */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Departure Time
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['any', 'Morning', 'Afternoon', 'Evening', 'Night'].map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setFilters({...filters, departureTime: slot === 'any' ? 'any' : slot})}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        filters.departureTime === (slot === 'any' ? 'any' : slot)
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {slot === 'any' ? 'Any Time' : slot}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Price Range (₹)
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={filters.priceRange[0]}
                    onChange={(e) => setFilters({...filters, priceRange: [parseInt(e.target.value), filters.priceRange[1]]})}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg"
                    placeholder="Min"
                  />
                  <input
                    type="number"
                    value={filters.priceRange[1]}
                    onChange={(e) => setFilters({...filters, priceRange: [filters.priceRange[0], parseInt(e.target.value)]})}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg"
                    placeholder="Max"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm font-medium">AC Only</span>
                  <input
                    type="checkbox"
                    checked={filters.acOnly}
                    onChange={(e) => setFilters({...filters, acOnly: e.target.checked})}
                    className="w-5 h-5 text-primary-600 rounded"
                  />
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={clearFilters}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


//hello