import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaCar, FaUsers, FaShieldAlt, FaStar, FaGooglePlay, 
  FaApple, FaArrowRight, FaMapMarkerAlt, FaCalendarAlt,
  FaClock, FaUserFriends, FaLeaf, FaRupeeSign, FaSearch,
  FaRocket, FaHandsHelping, FaGlobe, FaChevronRight, FaPlay,
  FaRegClock, FaMoneyBillWave, FaRoad, FaUserCheck, FaChartLine,
  FaQuoteLeft, FaQuoteRight
} from 'react-icons/fa';
import { HiLocationMarker, HiOutlineLocationMarker } from 'react-icons/hi';
import { MdLocationOn, MdSwapVert, MdVerified, MdEmojiTransportation, MdSecurity, MdSupportAgent } from 'react-icons/md';
import { TbArrowsExchange } from 'react-icons/tb';
import { BiTimeFive, BiSupport, BiMoney, BiHappy, BiTrendingUp, BiAward } from 'react-icons/bi';
import { SiGooglemaps } from 'react-icons/si';
import { ImSpinner8 } from 'react-icons/im';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { motion, useAnimation, useInView } from 'framer-motion';
import Footer from '../components/Footer';

// MapTiler API Key
const MAPTILER_API_KEY = import.meta.env.VITE_MAPTILER_API_KEY;

export default function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState({
    from: '',
    to: '',
    fromCoords: null,
    toCoords: null,
    date: new Date()
  });
  const [isFromFocused, setIsFromFocused] = useState(false);
  const [isToFocused, setIsToFocused] = useState(false);
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [loadingFrom, setLoadingFrom] = useState(false);
  const [loadingTo, setLoadingTo] = useState(false);
  const [statsCount, setStatsCount] = useState({
    riders: 0,
    rides: 0,
    cities: 0,
    savings: 0
  });
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const statsRef = useRef(null);
  const isStatsInView = useInView(statsRef, { once: true, threshold: 0.3 });
  const fromDebounceTimer = useRef(null);
  const toDebounceTimer = useRef(null);

  const popularRoutes = [
    { from: "Delhi", to: "Jaipur", price: "₹400", time: "5h", rides: 24, distance: "280 km", savings: "60%" },
    { from: "Mumbai", to: "Pune", price: "₹250", time: "3h", rides: 38, distance: "150 km", savings: "65%" },
    { from: "Bangalore", to: "Chennai", price: "₹600", time: "7h", rides: 19, distance: "350 km", savings: "55%" },
    { from: "Hyderabad", to: "Vijayawada", price: "₹500", time: "6h", rides: 15, distance: "270 km", savings: "58%" },
    { from: "Kolkata", to: "Bhubaneswar", price: "₹550", time: "8h", rides: 12, distance: "440 km", savings: "52%" },
    { from: "Ahmedabad", to: "Surat", price: "₹300", time: "4h", rides: 28, distance: "230 km", savings: "62%" },
  ];

  const testimonials = [
    {
      name: "Rahul Sharma",
      location: "Delhi",
      image: "https://randomuser.me/api/portraits/men/1.jpg",
      rating: 5,
      text: "Rydex has completely changed how I travel! Saved over ₹15,000 last month alone. The platform is super easy to use.",
      role: "Frequent Traveler",
      trips: 45
    },
    {
      name: "Priya Patel",
      location: "Mumbai",
      image: "https://randomuser.me/api/portraits/women/2.jpg",
      rating: 5,
      text: "As a solo female traveler, safety is my priority. Rydex's verification system gives me complete peace of mind.",
      role: "Business Professional",
      trips: 32
    },
    {
      name: "Amit Kumar",
      location: "Bangalore",
      image: "https://randomuser.me/api/portraits/men/3.jpg",
      rating: 4,
      text: "I drive from Bangalore to Mysore weekly and this helps me cover my fuel costs. Win-win for everyone!",
      role: "Weekly Commuter",
      trips: 78
    },
    {
      name: "Neha Singh",
      location: "Pune",
      image: "https://randomuser.me/api/portraits/women/4.jpg",
      rating: 5,
      text: "The chat feature is fantastic! I always coordinate with my co-passengers before the trip.",
      role: "College Student",
      trips: 23
    }
  ];

  const features = [
    {
      icon: <FaCar className="text-4xl" />,
      title: "Easy Carpooling",
      description: "Find or offer rides in seconds with our intuitive platform",
      color: "from-blue-500 to-blue-700",
      stat: "10M+ Rides"
    },
    {
      icon: <FaUserFriends className="text-4xl" />,
      title: "Trusted Community",
      description: "Verified profiles & rating system ensure safe travel",
      color: "from-green-500 to-green-700",
      stat: "4.9 Rating"
    },
    {
      icon: <FaRupeeSign className="text-4xl" />,
      title: "Save Money",
      description: "Share fuel costs and save up to 70% on travel",
      color: "from-purple-500 to-purple-700",
      stat: "70% Savings"
    },
    {
      icon: <FaLeaf className="text-4xl" />,
      title: "Eco-Friendly",
      description: "Reduce carbon footprint by sharing rides",
      color: "from-emerald-500 to-emerald-700",
      stat: "50K+ Tons CO₂"
    },
    {
      icon: <MdSupportAgent className="text-4xl" />,
      title: "24/7 Support",
      description: "Round-the-clock customer support for all users",
      color: "from-red-500 to-red-700",
      stat: "Instant Help"
    },
    {
      icon: <MdSecurity className="text-4xl" />,
      title: "Safe & Secure",
      description: "Phone verified users & secure communication",
      color: "from-indigo-500 to-indigo-700",
      stat: "100% Verified"
    }
  ];

  const cities = [
    { name: "Delhi", rides: 1234, growth: "+45%", lat: 28.6139, lng: 77.2090 },
    { name: "Mumbai", rides: 982, growth: "+38%", lat: 19.0760, lng: 72.8777 },
    { name: "Bangalore", rides: 876, growth: "+52%", lat: 12.9716, lng: 77.5946 },
    { name: "Chennai", rides: 654, growth: "+31%", lat: 13.0827, lng: 80.2707 },
    { name: "Kolkata", rides: 543, growth: "+28%", lat: 22.5726, lng: 88.3639 },
    { name: "Hyderabad", rides: 432, growth: "+41%", lat: 17.3850, lng: 78.4867 },
  ];

  // Search locations using MapTiler Geocoding API
  const searchLocations = async (query, type) => {
    if (!query || query.length < 2) {
      if (type === 'from') setFromSuggestions([]);
      else setToSuggestions([]);
      return;
    }

    if (type === 'from') setLoadingFrom(true);
    else setLoadingTo(true);

    try {
      const response = await fetch(
        `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${MAPTILER_API_KEY}&limit=5&language=en&country=IN`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const results = data.features.map(feature => ({
          name: feature.place_name,
          city: feature.text,
          lat: feature.geometry.coordinates[1],
          lng: feature.geometry.coordinates[0],
          fullAddress: feature.place_name
        }));
        
        if (type === 'from') setFromSuggestions(results);
        else setToSuggestions(results);
      } else {
        if (type === 'from') setFromSuggestions([]);
        else setToSuggestions([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      if (type === 'from') setFromSuggestions([]);
      else setToSuggestions([]);
    } finally {
      if (type === 'from') setLoadingFrom(false);
      else setLoadingTo(false);
    }
  };

  const handleFromChange = (e) => {
    const value = e.target.value;
    setSearch(prev => ({ ...prev, from: value, fromCoords: null }));
    
    if (fromDebounceTimer.current) clearTimeout(fromDebounceTimer.current);
    fromDebounceTimer.current = setTimeout(() => {
      searchLocations(value, 'from');
    }, 300);
  };

  const handleToChange = (e) => {
    const value = e.target.value;
    setSearch(prev => ({ ...prev, to: value, toCoords: null }));
    
    if (toDebounceTimer.current) clearTimeout(toDebounceTimer.current);
    toDebounceTimer.current = setTimeout(() => {
      searchLocations(value, 'to');
    }, 300);
  };

  const selectFromSuggestion = (suggestion) => {
    setSearch(prev => ({
      ...prev,
      from: suggestion.name,
      fromCoords: { lat: suggestion.lat, lng: suggestion.lng }
    }));
    setFromSuggestions([]);
    setIsFromFocused(false);
  };

  const selectToSuggestion = (suggestion) => {
    setSearch(prev => ({
      ...prev,
      to: suggestion.name,
      toCoords: { lat: suggestion.lat, lng: suggestion.lng }
    }));
    setToSuggestions([]);
    setIsToFocused(false);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          startCounter();
        }
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const startCounter = () => {
    const duration = 2000;
    const step = 10;
    const targets = {
      riders: 50000,
      rides: 250000,
      cities: 150,
      savings: 70
    };

    const increments = {
      riders: targets.riders / (duration / step),
      rides: targets.rides / (duration / step),
      cities: targets.cities / (duration / step),
      savings: targets.savings / (duration / step)
    };

    let current = {
      riders: 0,
      rides: 0,
      cities: 0,
      savings: 0
    };

    const timer = setInterval(() => {
      let allComplete = true;
      
      Object.keys(current).forEach(key => {
        if (current[key] < targets[key]) {
          allComplete = false;
          current[key] = Math.min(current[key] + increments[key], targets[key]);
        }
      });
      
      setStatsCount({ ...current });
      
      if (allComplete) {
        clearInterval(timer);
      }
    }, step);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!search.from || !search.to) {
      if (search.from && search.to) {
        navigate(`/search?from=${encodeURIComponent(search.from)}&to=${encodeURIComponent(search.to)}&date=${search.date.toISOString().split('T')[0]}`);
      }
      return;
    }
    navigate(`/search?from=${encodeURIComponent(search.from)}&to=${encodeURIComponent(search.to)}&date=${search.date.toISOString().split('T')[0]}`);
  };

  const swapLocations = () => {
    setSearch({
      ...search,
      from: search.to,
      to: search.from,
      fromCoords: search.toCoords,
      toCoords: search.fromCoords
    });
  };

  const QuickSwapButton = () => (
    <button
      type="button"
      onClick={swapLocations}
      className="absolute left-1/2 transform -translate-x-1/2 -mt-5 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
    >
      <TbArrowsExchange className="w-5 h-5 text-primary-600" />
    </button>
  );

  // Location Suggestion Dropdown Component
  const LocationSuggestions = ({ suggestions, loading, onSelect }) => {
    if (!suggestions.length && !loading) return null;
    
    return (
      <div className="absolute z-20 w-full mt-1 bg-white rounded-xl shadow-lg border border-gray-200 max-h-60 overflow-y-auto animate-fadeIn">
        {loading ? (
          <div className="p-4 text-center text-gray-500">
            <ImSpinner8 className="animate-spin w-5 h-5 mx-auto mb-2" />
            <p className="text-sm">Searching locations...</p>
          </div>
        ) : (
          suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSelect(suggestion)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 flex items-start gap-3 group"
            >
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                <HiLocationMarker className="w-4 h-4 text-primary-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{suggestion.city}</div>
                <div className="text-sm text-gray-500 truncate">{suggestion.fullAddress}</div>
              </div>
              <div className="text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">
                <FaArrowRight className="w-4 h-4" />
              </div>
            </button>
          ))
        )}
      </div>
    );
  };

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <div className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 animate-gradient"></div>
        
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 animate-float">
            <FaCar className="text-6xl text-white" />
          </div>
          <div className="absolute bottom-32 right-10 animate-float-delayed">
            <FaCar className="text-8xl text-white" />
          </div>
        </div>

        <div className="relative container mx-auto px-4 pt-20 pb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-white"
            >
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 animate-pulse-slow">
                <FaRocket className="text-yellow-400 animate-bounce" />
                <span className="text-sm font-medium">India's Fastest Growing Carpool Platform</span>
                <BiTrendingUp className="text-green-400" />
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Share Rides,
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 animate-gradient-text">
                  {" "}Save Money
                </span>
              </h1>
              
              <p className="text-xl mb-8 text-white/90 leading-relaxed">
                Join 50,000+ happy riders traveling across India. 
                Save up to 70% on travel costs while making new friends on the road.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 hover:bg-white/20 transition-all">
                  <MdVerified className="text-green-400" />
                  <span>Verified Users</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 hover:bg-white/20 transition-all">
                  <FaUserFriends className="text-blue-400" />
                  <span>50K+ Riders</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 hover:bg-white/20 transition-all">
                  <FaLeaf className="text-green-400" />
                  <span>Eco-Friendly</span>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button className="bg-white text-primary-600 px-8 py-3 rounded-full font-semibold hover:shadow-2xl transition-all transform hover:scale-105 flex items-center gap-2 group">
                  <FaGooglePlay className="group-hover:animate-bounce" />
                  <span>Google Play</span>
                </button>
                <button className="bg-white/20 backdrop-blur-sm text-white px-8 py-3 rounded-full font-semibold hover:bg-white/30 transition-all transform hover:scale-105 flex items-center gap-2">
                  <FaApple />
                  <span>App Store</span>
                </button>
              </div>

              <div className="flex gap-6 mt-8 pt-6 border-t border-white/20">
                <div className="flex items-center gap-2">
                  <BiAward className="text-yellow-400 text-2xl" />
                  <div>
                    <div className="font-bold">4.8</div>
                    <div className="text-xs text-white/70">App Rating</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FaUserCheck className="text-green-400 text-2xl" />
                  <div>
                    <div className="font-bold">10M+</div>
                    <div className="text-xs text-white/70">Happy Users</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FaChartLine className="text-blue-400 text-2xl" />
                  <div>
                    <div className="font-bold">200+</div>
                    <div className="text-xs text-white/70">Cities</div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Right Content - Search Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white rounded-3xl shadow-2xl p-8 relative z-10 transform hover:scale-105 transition-all duration-300">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 bg-primary-50 rounded-full px-4 py-1 mb-3">
                    <FaSearch className="text-primary-600 w-4 h-4" />
                    <span className="text-xs font-semibold text-primary-600">INSTANT BOOKING</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Find Your Ride</h3>
                  <p className="text-gray-600">Search and book in seconds</p>
                </div>
                
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      From
                    </label>
                    <div className="relative">
                      <HiLocationMarker className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                      <input
                        type="text"
                        placeholder="Current city or location"
                        value={search.from}
                        onChange={handleFromChange}
                        onFocus={() => setIsFromFocused(true)}
                        onBlur={() => setTimeout(() => setIsFromFocused(false), 200)}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                        required
                      />
                    </div>
                    {isFromFocused && (
                      <LocationSuggestions
                        suggestions={fromSuggestions}
                        loading={loadingFrom}
                        onSelect={selectFromSuggestion}
                      />
                    )}
                  </div>
                  
                  <div className="relative">
                    <QuickSwapButton />
                  </div>
                  
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      To
                    </label>
                    <div className="relative">
                      <HiOutlineLocationMarker className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                      <input
                        type="text"
                        placeholder="Destination city"
                        value={search.to}
                        onChange={handleToChange}
                        onFocus={() => setIsToFocused(true)}
                        onBlur={() => setTimeout(() => setIsToFocused(false), 200)}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                        required
                      />
                    </div>
                    {isToFocused && (
                      <LocationSuggestions
                        suggestions={toSuggestions}
                        loading={loadingTo}
                        onSelect={selectToSuggestion}
                      />
                    )}
                  </div>
                  
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Travel Date
                    </label>
                    <div className="relative">
                      <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                      <DatePicker
                        selected={search.date}
                        onChange={(date) => setSearch({...search, date})}
                        minDate={new Date()}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                        placeholderText="Select travel date"
                        required
                      />
                    </div>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 group"
                  >
                    <FaSearch className="group-hover:animate-pulse" />
                    <span>Search Rides</span>
                    <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
                
                <div className="mt-6 pt-6 border-t">
                  <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
                    <MdVerified className="text-green-500 w-3 h-3" />
                    Your privacy is important. We verify all users before ride sharing.
                  </p>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-5 -right-5 w-32 h-32 bg-yellow-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-400 rounded-full blur-2xl opacity-20 animate-pulse delay-1000"></div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-2 bg-white rounded-full mt-2 animate-scroll"></div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div ref={statsRef} className="bg-gradient-to-r from-primary-50 via-white to-primary-50 py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isStatsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="grid md:grid-cols-4 gap-8 text-center"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
              <div className="text-5xl font-bold text-primary-600 mb-2">
                {Math.floor(statsCount.riders)}+
              </div>
              <div className="text-gray-600 font-medium">Happy Riders</div>
              <div className="text-sm text-gray-400 mt-1">across India</div>
              <div className="mt-3 text-green-600 text-xs font-semibold">↑ 156% growth</div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
              <div className="text-5xl font-bold text-primary-600 mb-2">
                {Math.floor(statsCount.rides)}+
              </div>
              <div className="text-gray-600 font-medium">Rides Shared</div>
              <div className="text-sm text-gray-400 mt-1">kilometers saved</div>
              <div className="mt-3 text-green-600 text-xs font-semibold">↑ 203% growth</div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
              <div className="text-5xl font-bold text-primary-600 mb-2">
                {Math.floor(statsCount.cities)}+
              </div>
              <div className="text-gray-600 font-medium">Cities Covered</div>
              <div className="text-sm text-gray-400 mt-1">and growing</div>
              <div className="mt-3 text-green-600 text-xs font-semibold">↑ 12 new cities</div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
              <div className="text-5xl font-bold text-primary-600 mb-2">
                {Math.floor(statsCount.savings)}%
              </div>
              <div className="text-gray-600 font-medium">Average Savings</div>
              <div className="text-sm text-gray-400 mt-1">on travel costs</div>
              <div className="mt-3 text-green-600 text-xs font-semibold">↑ Save more today</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-primary-50 rounded-full px-4 py-1 mb-4">
            <FaStar className="text-primary-600 w-4 h-4" />
            <span className="text-xs font-semibold text-primary-600">WHY CHOOSE US</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            Why India Chooses Rydex
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Experience the future of intercity travel with features designed for you
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 cursor-pointer"
            >
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed mb-3">{feature.description}</p>
              <div className="inline-flex items-center gap-1 text-primary-600 font-semibold text-sm">
                <span>{feature.stat}</span>
                <FaArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Popular Routes Section */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-primary-50 rounded-full px-4 py-1 mb-4">
              <FaRoad className="text-primary-600 w-4 h-4" />
              <span className="text-xs font-semibold text-primary-600">POPULAR ROUTES</span>
            </div>
            <h2 className="text-4xl font-bold mb-4">Trending Routes</h2>
            <p className="text-gray-600">Most traveled routes by our community</p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularRoutes.map((route, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6 cursor-pointer group"
                onClick={() => {
                  setSearch({ from: route.from, to: route.to, fromCoords: null, toCoords: null, date: new Date() });
                  navigate(`/search?from=${route.from}&to=${route.to}&date=${new Date().toISOString().split('T')[0]}`);
                }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-lg font-bold text-gray-900">{route.from}</div>
                    <FaArrowRight className="text-gray-400 my-2 group-hover:translate-x-1 transition-transform" />
                    <div className="text-lg font-bold text-gray-900">{route.to}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary-600">{route.price}</div>
                    <div className="text-sm text-gray-500">per seat</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Distance</div>
                    <div className="text-sm font-semibold">{route.distance}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Duration</div>
                    <div className="text-sm font-semibold">{route.time}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Savings</div>
                    <div className="text-sm font-semibold text-green-600">{route.savings}</div>
                  </div>
                </div>
                <div className="mt-3 flex justify-between items-center">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <FaCar className="w-3 h-3" />
                    <span>{route.rides} rides today</span>
                  </div>
                  <button className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1">
                    Book Now <FaChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-primary-50 rounded-full px-4 py-1 mb-4">
            <FaPlay className="text-primary-600 w-4 h-4" />
            <span className="text-xs font-semibold text-primary-600">HOW IT WORKS</span>
          </div>
          <h2 className="text-4xl font-bold mb-4">Get Started in 3 Easy Steps</h2>
          <p className="text-gray-600">Join thousands of happy riders today</p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Search",
              description: "Enter your journey details and find matching rides",
              icon: <FaSearch className="text-4xl" />,
              color: "from-blue-500 to-blue-700"
            },
            {
              step: "02",
              title: "Book",
              description: "Choose a ride and request to book your seat",
              icon: <FaCalendarAlt className="text-4xl" />,
              color: "from-purple-500 to-purple-700"
            },
            {
              step: "03",
              title: "Travel",
              description: "Meet your driver, travel together, and pay directly",
              icon: <FaCar className="text-4xl" />,
              color: "from-green-500 to-green-700"
            }
          ].map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              whileHover={{ y: -10 }}
              className="text-center relative group"
            >
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -mt-8 w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg z-10 group-hover:scale-110 transition-transform">
                {step.step}
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-8 pt-12 mt-8 hover:shadow-2xl transition-all">
                <div className={`w-20 h-20 rounded-xl bg-gradient-to-r ${step.color} flex items-center justify-center text-white mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
              {index < 2 && (
                <div className="hidden lg:block absolute top-1/3 right-0 transform translate-x-1/2">
                  <FaArrowRight className="text-3xl text-gray-300" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 py-20 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 animate-float">
            <FaQuoteLeft className="text-8xl" />
          </div>
          <div className="absolute bottom-10 right-10 animate-float-delayed">
            <FaQuoteRight className="text-8xl" />
          </div>
        </div>
        
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1 mb-4">
              <FaStar className="text-yellow-400 w-4 h-4" />
              <span className="text-xs font-semibold">TESTIMONIALS</span>
            </div>
            <h2 className="text-4xl font-bold mb-4">Loved by Travelers</h2>
            <p className="text-white/90 text-lg">Join thousands of satisfied users</p>
          </motion.div>
          
          <div className="relative">
            <div className="overflow-hidden">
              <motion.div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${activeTestimonial * 100}%)` }}
              >
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="w-full flex-shrink-0 px-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto hover:bg-white/20 transition-all">
                      <div className="flex items-center gap-4 mb-6">
                        <img src={testimonial.image} alt={testimonial.name} className="w-16 h-16 rounded-full object-cover border-2 border-white" />
                        <div>
                          <div className="font-semibold text-xl">{testimonial.name}</div>
                          <div className="text-sm text-white/70">{testimonial.location}</div>
                          <div className="flex items-center gap-2 mt-1">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <FaStar key={i} className="text-yellow-400 text-sm" />
                            ))}
                            <span className="text-xs text-white/60">{testimonial.trips} trips</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-lg leading-relaxed mb-4">"{testimonial.text}"</p>
                      <div className="text-sm text-white/60">{testimonial.role}</div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
            
            {/* Dots Indicator */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    activeTestimonial === index ? 'w-8 bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Cities Section */}
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-primary-50 rounded-full px-4 py-1 mb-4">
            <FaGlobe className="text-primary-600 w-4 h-4" />
            <span className="text-xs font-semibold text-primary-600">TOP CITIES</span>
          </div>
          <h2 className="text-4xl font-bold mb-4">Rydex is Growing Across India</h2>
          <p className="text-gray-600">Join the movement in your city</p>
        </motion.div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {cities.map((city, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              className="relative group cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 p-6 text-center hover:shadow-2xl transition-all"
              onClick={() => {
                setSearch({ ...search, from: city.name });
              }}
            >
              <div className="text-white">
                <div className="font-bold text-xl mb-1">{city.name}</div>
                <div className="text-2xl font-bold">{city.rides}+</div>
                <div className="text-xs text-white/80 mt-1">rides</div>
                <div className="mt-2 inline-flex items-center gap-1 bg-green-500/30 rounded-full px-2 py-0.5 text-xs">
                  <BiTrendingUp className="w-3 h-3" />
                  {city.growth}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 2000 2000%22%3E%3Cpath fill=%22%23ffffff%22 fill-opacity=%220.05%22 d=%22...%22/%3E%3C/svg%3E')]"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400 rounded-full blur-3xl opacity-20 animate-pulse delay-1000"></div>
        
        <div className="container mx-auto px-4 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1 mb-6">
              <FaRocket className="text-yellow-400 animate-bounce" />
              <span className="text-sm font-medium">READY TO START?</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Join India's largest carpooling community and transform the way you travel
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button className="bg-white text-primary-600 px-10 py-4 rounded-full font-bold hover:shadow-2xl transition-all transform hover:scale-105 flex items-center gap-2 group">
                <FaGooglePlay className="group-hover:animate-bounce" />
                Download App
              </button>
              <button 
                onClick={() => navigate('/post-ride')}
                className="bg-white/20 backdrop-blur-sm text-white px-10 py-4 rounded-full font-bold hover:bg-white/30 transition-all transform hover:scale-105 flex items-center gap-2"
              >
                Post a Ride
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-white/80 text-sm">
              <div className="flex items-center gap-2">
                <MdVerified className="text-green-400 text-xl" />
                <span>Verified Users</span>
              </div>
              <div className="flex items-center gap-2">
                <BiHappy className="text-yellow-400 text-xl" />
                <span>100% Satisfaction</span>
              </div>
              <div className="flex items-center gap-2">
                <FaShieldAlt className="text-blue-400 text-xl" />
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <BiSupport className="text-purple-400 text-xl" />
                <span>24/7 Support</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Add these animations to your global CSS
const styles = `
  @keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }
  
  @keyframes scroll {
    0% { transform: translateY(0); opacity: 1; }
    100% { transform: translateY(10px); opacity: 0; }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .animate-gradient {
    background-size: 200% 200%;
    animation: gradient 15s ease infinite;
  }
  
  .animate-gradient-text {
    background-size: 200% 200%;
    animation: gradient 3s ease infinite;
  }
  
  .animate-float {
    animation: float 6s ease-in-out infinite;
  }
  
  .animate-float-delayed {
    animation: float 6s ease-in-out infinite 3s;
  }
  
  .animate-scroll {
    animation: scroll 1.5s ease-in-out infinite;
  }
  
  .animate-pulse-slow {
    animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.2s ease-out;
  }
`;

// Add styles to document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}