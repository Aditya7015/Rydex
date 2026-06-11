import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaCar, FaUsers, FaShieldAlt, FaStar, FaGooglePlay, 
  FaApple, FaArrowRight, FaMapMarkerAlt, FaCalendarAlt,
  FaClock, FaUserFriends, FaLeaf, FaRupeeSign, FaSearch,
  FaRocket, FaHandsHelping, FaGlobe, FaWhatsapp, FaTwitter,
  FaInstagram, FaLinkedin, FaChevronRight, FaPlay, FaGift
} from 'react-icons/fa';
import { HiLocationMarker, HiOutlineLocationMarker } from 'react-icons/hi';
import { MdLocationOn, MdSwapVert, MdVerified, MdEmojiTransportation } from 'react-icons/md';
import { TbArrowsExchange } from 'react-icons/tb';
import { BiTimeFive, BiSupport, BiMoney, BiHappy } from 'react-icons/bi';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

export default function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState({
    from: '',
    to: '',
    date: new Date()
  });
  const [isFromFocused, setIsFromFocused] = useState(false);
  const [isToFocused, setIsToFocused] = useState(false);
  const [statsCount, setStatsCount] = useState({
    riders: 0,
    rides: 0,
    cities: 0,
    savings: 0
  });

  const statsRef = useRef(null);

  const popularRoutes = [
    { from: "Delhi", to: "Jaipur", price: "₹400", time: "5h", rides: 24 },
    { from: "Mumbai", to: "Pune", price: "₹250", time: "3h", rides: 38 },
    { from: "Bangalore", to: "Chennai", price: "₹600", time: "7h", rides: 19 },
    { from: "Hyderabad", to: "Vijayawada", price: "₹500", time: "6h", rides: 15 },
    { from: "Kolkata", to: "Bhubaneswar", price: "₹550", time: "8h", rides: 12 },
    { from: "Ahmedabad", to: "Surat", price: "₹300", time: "4h", rides: 28 },
  ];

  const testimonials = [
    {
      name: "Rahul Sharma",
      location: "Delhi",
      image: "https://randomuser.me/api/portraits/men/1.jpg",
      rating: 5,
      text: "Rydex has completely changed how I travel! Saved over ₹15,000 last month alone. The platform is super easy to use.",
      role: "Frequent Traveler"
    },
    {
      name: "Priya Patel",
      location: "Mumbai",
      image: "https://randomuser.me/api/portraits/women/2.jpg",
      rating: 5,
      text: "As a solo female traveler, safety is my priority. Rydex's verification system gives me complete peace of mind.",
      role: "Business Professional"
    },
    {
      name: "Amit Kumar",
      location: "Bangalore",
      image: "https://randomuser.me/api/portraits/men/3.jpg",
      rating: 4,
      text: "I drive from Bangalore to Mysore weekly and this helps me cover my fuel costs. Win-win for everyone!",
      role: "Weekly Commuter"
    }
  ];

  const features = [
    {
      icon: <FaCar className="text-4xl" />,
      title: "Easy Carpooling",
      description: "Find or offer rides in seconds with our intuitive platform",
      color: "from-blue-500 to-blue-700"
    },
    {
      icon: <FaUserFriends className="text-4xl" />,
      title: "Trusted Community",
      description: "Verified profiles & rating system ensure safe travel",
      color: "from-green-500 to-green-700"
    },
    {
      icon: <FaRupeeSign className="text-4xl" />,
      title: "Save Money",
      description: "Share fuel costs and save up to 70% on travel",
      color: "from-purple-500 to-purple-700"
    },
    {
      icon: <FaLeaf className="text-4xl" />,
      title: "Eco-Friendly",
      description: "Reduce carbon footprint by sharing rides",
      color: "from-emerald-500 to-emerald-700"
    },
    {
      icon: <BiSupport className="text-4xl" />,
      title: "24/7 Support",
      description: "Round-the-clock customer support for all users",
      color: "from-red-500 to-red-700"
    },
    {
      icon: <MdVerified className="text-4xl" />,
      title: "Safe & Secure",
      description: "Phone verified users & secure communication",
      color: "from-indigo-500 to-indigo-700"
    }
  ];

  const cities = [
    { name: "Delhi", rides: 1234 },
    { name: "Mumbai", rides: 982 },
    { name: "Bangalore", rides: 876 },
    { name: "Chennai", rides: 654 },
    { name: "Kolkata", rides: 543 },
    { name: "Hyderabad", rides: 432 },
  ];

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
    if (!search.from || !search.to) return;
    navigate(`/search?from=${search.from}&to=${search.to}&date=${search.date.toISOString().split('T')[0]}`);
  };

  const swapLocations = () => {
    setSearch({
      ...search,
      from: search.to,
      to: search.from
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

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <div className="relative min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 overflow-hidden">
        <div className="relative container mx-auto px-4 pt-20 pb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-white">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <FaRocket className="text-yellow-400 animate-bounce" />
                <span className="text-sm font-medium">India's Fastest Growing Carpool Platform</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Share Rides,
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                  {" "}Save Money
                </span>
              </h1>
              
              <p className="text-xl mb-8 text-white/90 leading-relaxed">
                Join 50,000+ happy riders traveling across India. 
                Save up to 70% on travel costs while making new friends on the road.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <MdVerified className="text-green-400" />
                  <span>Verified Users</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <FaUserFriends className="text-blue-400" />
                  <span>50K+ Riders</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <FaLeaf className="text-green-400" />
                  <span>Eco-Friendly</span>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button className="bg-white text-primary-600 px-6 py-3 rounded-full font-semibold hover:shadow-xl transition-all flex items-center gap-2 group">
                  <FaGooglePlay />
                  <span>Google Play</span>
                </button>
                <button className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full font-semibold hover:bg-white/30 transition-all flex items-center gap-2">
                  <FaApple />
                  <span>App Store</span>
                </button>
              </div>
            </div>
            
            {/* Right Content - Search Card */}
            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl p-8 relative z-10">
                <div className="text-center mb-6">
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
                        onChange={(e) => setSearch({...search, from: e.target.value})}
                        onFocus={() => setIsFromFocused(true)}
                        onBlur={() => setTimeout(() => setIsFromFocused(false), 200)}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                        required
                      />
                    </div>
                    {isFromFocused && (
                      <div className="absolute z-20 w-full mt-2 bg-white rounded-xl shadow-lg border p-2">
                        <div className="p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                          <div className="flex items-center gap-2">
                            <MdLocationOn className="text-gray-400" />
                            <span>Current Location</span>
                          </div>
                        </div>
                        <div className="p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                          <div className="flex items-center gap-2">
                            <BiTimeFive className="text-gray-400" />
                            <span>Recent: Delhi</span>
                          </div>
                        </div>
                      </div>
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
                        onChange={(e) => setSearch({...search, to: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                        required
                      />
                    </div>
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
                    <FaSearch />
                    <span>Search Rides</span>
                    <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
                
                <div className="mt-6 pt-6 border-t">
                  <p className="text-xs text-gray-500 text-center">
                    🔒 Your privacy is important. We verify all users before ride sharing.
                  </p>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-5 -right-5 w-32 h-32 bg-yellow-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div ref={statsRef} className="bg-gradient-to-r from-primary-50 to-indigo-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-all">
              <div className="text-5xl font-bold text-primary-600 mb-2">
                {Math.floor(statsCount.riders)}+
              </div>
              <div className="text-gray-600 font-medium">Happy Riders</div>
              <div className="text-sm text-gray-400 mt-1">across India</div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-all">
              <div className="text-5xl font-bold text-primary-600 mb-2">
                {Math.floor(statsCount.rides)}+
              </div>
              <div className="text-gray-600 font-medium">Rides Shared</div>
              <div className="text-sm text-gray-400 mt-1">kilometers saved</div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-all">
              <div className="text-5xl font-bold text-primary-600 mb-2">
                {Math.floor(statsCount.cities)}+
              </div>
              <div className="text-gray-600 font-medium">Cities Covered</div>
              <div className="text-sm text-gray-400 mt-1">and growing</div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-all">
              <div className="text-5xl font-bold text-primary-600 mb-2">
                {Math.floor(statsCount.savings)}%
              </div>
              <div className="text-gray-600 font-medium">Average Savings</div>
              <div className="text-sm text-gray-400 mt-1">on travel costs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            Why India Chooses Rydex
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Experience the future of intercity travel with features designed for you
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 cursor-pointer"
            >
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Routes Section */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Popular Routes</h2>
            <p className="text-gray-600">Most traveled routes by our community</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularRoutes.map((route, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6 cursor-pointer"
                onClick={() => {
                  setSearch({ from: route.from, to: route.to, date: new Date() });
                  navigate(`/search?from=${route.from}&to=${route.to}&date=${new Date().toISOString().split('T')[0]}`);
                }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-lg font-bold text-gray-900">{route.from}</div>
                    <FaArrowRight className="text-gray-400 my-2" />
                    <div className="text-lg font-bold text-gray-900">{route.to}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary-600">{route.price}</div>
                    <div className="text-sm text-gray-500">per seat</div>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <FaClock />
                    <span>{route.time}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <FaCar />
                    <span>{route.rides} rides today</span>
                  </div>
                  <button className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1">
                    Book Now <FaChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">How Rydex Works</h2>
          <p className="text-gray-600">Get started in three simple steps</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Search",
              description: "Enter your journey details and find matching rides",
              icon: <FaSearch className="text-4xl" />
            },
            {
              step: "02",
              title: "Book",
              description: "Choose a ride and request to book your seat",
              icon: <FaCalendarAlt className="text-4xl" />
            },
            {
              step: "03",
              title: "Travel",
              description: "Meet your driver, travel together, and pay directly",
              icon: <FaCar className="text-4xl" />
            }
          ].map((step, index) => (
            <div
              key={index}
              className="text-center relative"
            >
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -mt-8 w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg z-10">
                {step.step}
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-8 pt-12 mt-8 hover:shadow-2xl transition-all">
                <div className="text-primary-600 mb-4">{step.icon}</div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 py-20 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Loved by Travelers</h2>
            <p className="text-white/90 text-lg">Join thousands of satisfied users</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-white/70">{testimonial.location}</div>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400 text-sm" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-3">"{testimonial.text}"</p>
                <div className="text-xs text-white/60">{testimonial.role}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Cities Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Top Cities</h2>
          <p className="text-gray-600">Rydex is growing across India</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {cities.map((city, index) => (
            <div
              key={index}
              className="relative group cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 p-6 text-center hover:scale-105 transition-all"
              onClick={() => {
                setSearch({ ...search, from: city.name });
              }}
            >
              <div className="text-white">
                <div className="font-semibold text-lg">{city.name}</div>
                <div className="text-sm text-white/80 mt-1">{city.rides}+ rides</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join India's largest carpooling community and transform the way you travel
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button className="bg-white text-primary-600 px-8 py-3 rounded-full font-semibold hover:shadow-xl transition-all flex items-center gap-2">
              <FaGooglePlay />
              Download App
            </button>
            <button 
              onClick={() => navigate('/post-ride')}
              className="bg-white/20 backdrop-blur-sm text-white px-8 py-3 rounded-full font-semibold hover:bg-white/30 transition-all"
            >
              Post a Ride
            </button>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-white/80 text-sm">
            <div className="flex items-center gap-1">
              <MdVerified className="text-green-400" />
              <span>Verified Users</span>
            </div>
            <div className="flex items-center gap-1">
              <BiHappy className="text-yellow-400" />
              <span>100% Satisfaction</span>
            </div>
            <div className="flex items-center gap-1">
              <FaShieldAlt className="text-blue-400" />
              <span>Secure Payments</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FaCar className="text-2xl text-primary-500" />
                <span className="text-xl font-bold">Rydex</span>
              </div>
              <p className="text-gray-400 text-sm">
                India's most trusted carpooling platform. Safe, affordable, and eco-friendly travel.
              </p>
              <div className="flex gap-4 mt-4">
                <FaWhatsapp className="text-xl hover:text-green-400 cursor-pointer transition" />
                <FaTwitter className="text-xl hover:text-blue-400 cursor-pointer transition" />
                <FaInstagram className="text-xl hover:text-pink-400 cursor-pointer transition" />
                <FaLinkedin className="text-xl hover:text-blue-500 cursor-pointer transition" />
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Press</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition">Safety Tips</a></li>
                <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition">FAQs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition">Refund Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2024 Rydex. All rights reserved. Made with ❤️ for India.
          </div>
        </div>
      </footer>
    </div>
  );
}