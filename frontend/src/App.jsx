import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SearchResults from './pages/SearchResults';
import RideDetails from './pages/RideDetails';
import PostRide from './pages/PostRide';
import MyRides from './pages/MyRides';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';
import Chat from './pages/Chat';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#4f46e5',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          <Navbar />
          
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/ride/:id" element={<RideDetails />} />
            
            {/* Protected Routes (require authentication) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/post-ride" element={<PostRide />} />
              <Route path="/my-rides" element={<MyRides />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/chat/:rideId/:userId" element={<Chat />} />
            </Route>
            
            {/* 404 Page - Catch all unmatched routes */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

// 404 Not Found Component
function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-9xl font-bold text-primary-600 mb-4">404</div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Page Not Found</h1>
        <p className="text-gray-600 mb-6">The page you're looking for doesn't exist or has been moved.</p>
        <a href="/" className="btn-primary inline-block">
          Go Back Home
        </a>
      </div>
    </div>
  );
}

export default App;