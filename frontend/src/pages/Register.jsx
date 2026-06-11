import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PhoneIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function Register() {
  const navigate = useNavigate();
  const { sendOTP, register } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    phone: '',
    otp: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [sentOTP, setSentOTP] = useState(null);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (formData.phone.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }
    setLoading(true);
    const otp = await sendOTP(formData.phone);
    setLoading(false);
    if (otp) {
      setSentOTP(otp);
      setStep(2);
      toast.success('OTP sent successfully!');
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (formData.otp.length !== 6) {
      toast.error('Please enter 6-digit OTP');
      return;
    }
    setStep(3);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    const success = await register(
      formData.phone,
      formData.otp,
      formData.name,
      formData.email,
      formData.password
    );
    setLoading(false);
    
    if (success) navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Join Rydex</h2>
          <p className="text-gray-600 mt-2">Start sharing rides today</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex-1 text-center">
              <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center ${
                step >= num ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step > num ? <CheckCircleIcon className="w-5 h-5" /> : num}
              </div>
              <div className="text-xs mt-1 text-gray-600">
                {num === 1 ? 'Phone' : num === 2 ? 'Verify' : 'Profile'}
              </div>
            </div>
          ))}
        </div>

        {/* Step 1: Phone Number */}
        {step === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                  +91
                </span>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="input-field rounded-l-none"
                  placeholder="9876543210"
                  maxLength="10"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                We'll send a verification code to this number
              </p>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}

        {/* Step 2: Verify OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter OTP
              </label>
              <input
                type="text"
                value={formData.otp}
                onChange={(e) => setFormData({...formData, otp: e.target.value})}
                className="input-field text-center text-2xl tracking-widest"
                placeholder="123456"
                maxLength="6"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                OTP sent to +91 {formData.phone}
              </p>
            </div>
            
            <button
              type="submit"
              className="btn-primary w-full py-3"
            >
              Verify OTP
            </button>
            
            <button
              type="button"
              onClick={handleSendOTP}
              className="w-full text-primary-600 hover:text-primary-700 text-sm"
            >
              Resend OTP
            </button>
          </form>
        )}

        {/* Step 3: Complete Profile */}
        {step === 3 && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="input-field"
                placeholder="John Doe"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email (Optional)
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="input-field"
                placeholder="john@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="input-field"
                placeholder="At least 6 characters"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className="input-field"
                placeholder="Confirm your password"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}
        
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}