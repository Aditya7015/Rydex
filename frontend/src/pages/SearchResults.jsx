import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { CalendarIcon, MapPinIcon, UsersIcon, CurrencyRupeeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function SearchResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    priceRange: [0, 5000],
    departureTime: 'any'
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

  const filteredRides = rides.filter(ride => {
    if (filters.departureTime !== 'any') {
      const slot = getTimeSlot(ride.departureTime);
      if (slot !== filters.departureTime) return false;
    }
    if (ride.pricePerSeat < filters.priceRange[0] || ride.pricePerSeat > filters.priceRange[1]) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Search Summary */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPinIcon className="w-5 h-5 text-primary-600" />
              <span className="font-medium">{from}</span>
              <span>→</span>
              <span className="font-medium">{to}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <CalendarIcon className="w-5 h-5 text-primary-600" />
              <span>{format(new Date(date), 'dd MMM yyyy')}</span>
            </div>
            <div className="flex items-center gap-2">
              <UsersIcon className="w-5 h-5 text-primary-600" />
              <span>{rides.length} rides found</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className="lg:w-80">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-20">
              <h3 className="font-semibold text-lg mb-4">Filters</h3>
              
              {/* Time Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Departure Time
                </label>
                <select
                  value={filters.departureTime}
                  onChange={(e) => setFilters({...filters, departureTime: e.target.value})}
                  className="input-field"
                >
                  <option value="any">Any time</option>
                  <option value="Morning">Morning (6 AM - 12 PM)</option>
                  <option value="Afternoon">Afternoon (12 PM - 5 PM)</option>
                  <option value="Evening">Evening (5 PM - 9 PM)</option>
                  <option value="Night">Night (9 PM - 6 AM)</option>
                </select>
              </div>

              {/* Price Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range (₹)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={filters.priceRange[0]}
                    onChange={(e) => setFilters({...filters, priceRange: [parseInt(e.target.value), filters.priceRange[1]]})}
                    className="input-field"
                    placeholder="Min"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    value={filters.priceRange[1]}
                    onChange={(e) => setFilters({...filters, priceRange: [filters.priceRange[0], parseInt(e.target.value)]})}
                    className="input-field"
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Finding rides for you...</p>
              </div>
            ) : filteredRides.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">🚗</div>
                <h3 className="text-xl font-semibold mb-2">No rides found</h3>
                <p className="text-gray-600 mb-6">
                  No rides available from {from} to {to} on {format(new Date(date), 'dd MMM yyyy')}
                </p>
                <button
                  onClick={() => navigate('/post-ride')}
                  className="btn-primary"
                >
                  Post a Ride
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRides.map((ride) => (
                  <div
                    key={ride._id}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer p-6"
                    onClick={() => navigate(`/ride/${ride._id}`)}
                  >
                    <div className="flex flex-wrap justify-between items-start gap-4">
                      {/* Route Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <span className="font-medium">{ride.from.city}</span>
                              <span className="text-gray-400">→</span>
                              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                              <span className="font-medium">{ride.to.city}</span>
                            </div>
                            <div className="text-sm text-gray-600">
                              {ride.departureTime} • {format(new Date(ride.date), 'dd MMM yyyy')}
                            </div>
                          </div>
                        </div>

                        {/* Driver Info */}
                        <div className="flex items-center gap-3">
                          <img
                            src={ride.driverId.profilePhoto || '/default-avatar.png'}
                            alt={ride.driverId.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <div className="font-medium">{ride.driverId.name}</div>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <span>⭐</span>
                              <span>{ride.driverId.rating?.toFixed(1) || 'New'}</span>
                              <span>• {ride.driverId.totalRidesAsDriver || 0} rides</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Price & Seats */}
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary-600">
                          ₹{ride.pricePerSeat}
                          <span className="text-sm font-normal text-gray-500">/seat</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                          <UsersIcon className="w-4 h-4" />
                          <span>{ride.availableSeatsCount} seats left</span>
                        </div>
                        {ride.preferences?.acAvailable && (
                          <div className="text-xs text-green-600 mt-1">AC Available</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}