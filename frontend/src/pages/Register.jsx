// import { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { 
//   PhoneIcon, 
//   CheckCircleIcon, 
//   UserIcon, 
//   EnvelopeIcon, 
//   KeyIcon,
//   EyeIcon,
//   EyeSlashIcon,
//   ArrowRightIcon,
//   ShieldCheckIcon,
//   DevicePhoneMobileIcon,
//   UserGroupIcon,
//   LockClosedIcon
// } from '@heroicons/react/24/outline';
// import { FaCar, FaGoogle, FaFacebook, FaApple } from 'react-icons/fa';
// import toast from 'react-hot-toast';

// export default function Register() {
//   const navigate = useNavigate();
//   const { sendOTP, register } = useAuth();
//   const [step, setStep] = useState(1);
//   const [formData, setFormData] = useState({
//     phone: '',
//     otp: '',
//     name: '',
//     email: '',
//     password: '',
//     confirmPassword: ''
//   });
//   const [loading, setLoading] = useState(false);
//   const [sentOTP, setSentOTP] = useState(null);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [resendTimer, setResendTimer] = useState(0);

//   const handleSendOTP = async (e) => {
//     e.preventDefault();
//     if (formData.phone.length !== 10) {
//       toast.error('Please enter a valid 10-digit phone number');
//       return;
//     }
//     setLoading(true);
//     const otp = await sendOTP(formData.phone);
//     setLoading(false);
//     if (otp) {
//       setSentOTP(otp);
//       setStep(2);
//       toast.success('OTP sent successfully!');
      
//       // Start resend timer
//       setResendTimer(30);
//       const timer = setInterval(() => {
//         setResendTimer((prev) => {
//           if (prev <= 1) {
//             clearInterval(timer);
//             return 0;
//           }
//           return prev - 1;
//         });
//       }, 1000);
//     }
//   };

//   const handleVerifyOTP = async (e) => {
//     e.preventDefault();
//     if (formData.otp.length !== 6) {
//       toast.error('Please enter 6-digit OTP');
//       return;
//     }
//     setStep(3);
//   };

//   const handleRegister = async (e) => {
//     e.preventDefault();
//     if (formData.password !== formData.confirmPassword) {
//       toast.error('Passwords do not match');
//       return;
//     }
//     if (formData.password.length < 6) {
//       toast.error('Password must be at least 6 characters');
//       return;
//     }
    
//     setLoading(true);
//     const success = await register(
//       formData.phone,
//       formData.otp,
//       formData.name,
//       formData.email,
//       formData.password
//     );
//     setLoading(false);
    
//     if (success) navigate('/');
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 relative overflow-hidden">
//       {/* Background Decorations */}
//       <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
//       <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-1000"></div>
      
//       <div className="max-w-md w-full relative z-10">
//         {/* Logo Section */}
//         <div className="text-center mb-6">
//           <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-lg mb-4">
//             <FaCar className="w-10 h-10 text-white" />
//           </div>
//           <h2 className="text-3xl font-bold text-gray-900">Join Rydex</h2>
//           <p className="text-gray-600 mt-2">Start sharing rides today</p>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-3 gap-3 mb-6">
//           <div className="bg-white rounded-xl p-3 text-center shadow-sm">
//             <div className="text-2xl font-bold text-primary-600">50K+</div>
//             <div className="text-xs text-gray-500">Happy Riders</div>
//           </div>
//           <div className="bg-white rounded-xl p-3 text-center shadow-sm">
//             <div className="text-2xl font-bold text-primary-600">100+</div>
//             <div className="text-xs text-gray-500">Cities</div>
//           </div>
//           <div className="bg-white rounded-xl p-3 text-center shadow-sm">
//             <div className="text-2xl font-bold text-primary-600">4.8</div>
//             <div className="text-xs text-gray-500">App Rating</div>
//           </div>
//         </div>

//         {/* Registration Card */}
//         <div className="bg-white rounded-2xl shadow-xl p-8">
//           {/* Progress Steps */}
//           <div className="flex justify-between mb-8">
//             {[
//               { num: 1, title: 'Phone', icon: PhoneIcon },
//               { num: 2, title: 'Verify', icon: ShieldCheckIcon },
//               { num: 3, title: 'Profile', icon: UserIcon }
//             ].map((item) => (
//               <div key={item.num} className="flex-1 text-center">
//                 <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center transition-all ${
//                   step >= item.num 
//                     ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg' 
//                     : 'bg-gray-200 text-gray-600'
//                 }`}>
//                   {step > item.num ? (
//                     <CheckCircleIcon className="w-6 h-6" />
//                   ) : (
//                     <item.icon className="w-5 h-5" />
//                   )}
//                 </div>
//                 <div className={`text-xs mt-2 font-medium ${
//                   step >= item.num ? 'text-primary-600' : 'text-gray-500'
//                 }`}>
//                   {item.title}
//                 </div>
//                 {item.num < 3 && (
//                   <div className={`h-1 mt-4 ${
//                     step > item.num ? 'bg-primary-600' : 'bg-gray-200'
//                   }`} />
//                 )}
//               </div>
//             ))}
//           </div>

//           {/* Step 1: Phone Number */}
//           {step === 1 && (
//             <form onSubmit={handleSendOTP} className="space-y-6">
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Phone Number
//                 </label>
//                 <div className="flex">
//                   <span className="inline-flex items-center px-4 rounded-l-xl border-2 border-r-0 border-gray-200 bg-gray-50 text-gray-600 font-medium">
//                     +91
//                   </span>
//                   <input
//                     type="tel"
//                     value={formData.phone}
//                     onChange={(e) => setFormData({...formData, phone: e.target.value})}
//                     className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-r-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
//                     placeholder="9876543210"
//                     maxLength="10"
//                     required
//                   />
//                 </div>
//                 <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
//                   <DevicePhoneMobileIcon className="w-3 h-3" />
//                   We'll send a verification code to this number
//                 </p>
//               </div>
              
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 group"
//               >
//                 {loading ? (
//                   <>
//                     <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                     Sending OTP...
//                   </>
//                 ) : (
//                   <>
//                     Send OTP
//                     <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
//                   </>
//                 )}
//               </button>
//             </form>
//           )}

//           {/* Step 2: Verify OTP */}
//           {step === 2 && (
//             <form onSubmit={handleVerifyOTP} className="space-y-6">
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Enter OTP
//                 </label>
//                 <div className="relative">
//                   <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                   <input
//                     type="text"
//                     value={formData.otp}
//                     onChange={(e) => setFormData({...formData, otp: e.target.value})}
//                     className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none text-center text-2xl tracking-widest"
//                     placeholder="123456"
//                     maxLength="6"
//                     required
//                   />
//                 </div>
//                 <p className="text-xs text-gray-500 mt-2">
//                   OTP sent to +91 {formData.phone}
//                 </p>
//               </div>
              
//               <button
//                 type="submit"
//                 className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105"
//               >
//                 Verify OTP
//               </button>
              
//               <button
//                 type="button"
//                 onClick={handleSendOTP}
//                 disabled={resendTimer > 0}
//                 className="w-full text-primary-600 hover:text-primary-700 text-sm font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
//               >
//                 {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
//               </button>
//             </form>
//           )}

//           {/* Step 3: Complete Profile */}
//           {step === 3 && (
//             <form onSubmit={handleRegister} className="space-y-4">
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Full Name <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                   <input
//                     type="text"
//                     value={formData.name}
//                     onChange={(e) => setFormData({...formData, name: e.target.value})}
//                     className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
//                     placeholder="John Doe"
//                     required
//                   />
//                 </div>
//               </div>
              
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Email <span className="text-gray-400">(Optional)</span>
//                 </label>
//                 <div className="relative">
//                   <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                   <input
//                     type="email"
//                     value={formData.email}
//                     onChange={(e) => setFormData({...formData, email: e.target.value})}
//                     className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
//                     placeholder="john@example.com"
//                   />
//                 </div>
//               </div>
              
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Password <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     value={formData.password}
//                     onChange={(e) => setFormData({...formData, password: e.target.value})}
//                     className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
//                     placeholder="At least 6 characters"
//                     required
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-1/2 transform -translate-y-1/2"
//                   >
//                     {showPassword ? (
//                       <EyeSlashIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
//                     ) : (
//                       <EyeIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
//                     )}
//                   </button>
//                 </div>
//               </div>
              
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Confirm Password <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                   <input
//                     type={showConfirmPassword ? "text" : "password"}
//                     value={formData.confirmPassword}
//                     onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
//                     className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
//                     placeholder="Confirm your password"
//                     required
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                     className="absolute right-3 top-1/2 transform -translate-y-1/2"
//                   >
//                     {showConfirmPassword ? (
//                       <EyeSlashIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
//                     ) : (
//                       <EyeIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
//                     )}
//                   </button>
//                 </div>
//               </div>
              
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 group"
//               >
//                 {loading ? (
//                   <>
//                     <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                     Creating Account...
//                   </>
//                 ) : (
//                   <>
//                     Create Account
//                     <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
//                   </>
//                 )}
//               </button>
//             </form>
//           )}
          
//           {/* Sign In Link */}
//           <div className="mt-6 text-center">
//             <p className="text-gray-600">
//               Already have an account?{' '}
//               <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
//                 Sign in
//               </Link>
//             </p>
//           </div>

//           {/* Divider for Social Signup */}
//           {(step === 1 || step === 3) && (
//             <>
//               <div className="relative my-6">
//                 <div className="absolute inset-0 flex items-center">
//                   <div className="w-full border-t border-gray-200"></div>
//                 </div>
//                 <div className="relative flex justify-center text-sm">
//                   <span className="px-4 bg-white text-gray-500">Or sign up with</span>
//                 </div>
//               </div>

//               {/* Social Signup Buttons */}
//               <div className="grid grid-cols-3 gap-3">
//                 <button
//                   type="button"
//                   onClick={() => toast.error('Google signup coming soon!')}
//                   className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all"
//                 >
//                   <FaGoogle className="w-5 h-5 text-red-500" />
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => toast.error('Facebook signup coming soon!')}
//                   className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all"
//                 >
//                   <FaFacebook className="w-5 h-5 text-blue-600" />
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => toast.error('Apple signup coming soon!')}
//                   className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all"
//                 >
//                   <FaApple className="w-5 h-5 text-gray-900" />
//                 </button>
//               </div>
//             </>
//           )}
//         </div>

//         {/* Trust Badges */}
//         <div className="mt-6 flex justify-center items-center gap-4">
//           <div className="flex items-center gap-2 text-xs text-gray-500">
//             <ShieldCheckIcon className="w-4 h-4 text-green-500" />
//             <span>Secure Registration</span>
//           </div>
//           <div className="flex items-center gap-2 text-xs text-gray-500">
//             <DevicePhoneMobileIcon className="w-4 h-4 text-blue-500" />
//             <span>Phone Verified</span>
//           </div>
//           <div className="flex items-center gap-2 text-xs text-gray-500">
//             <UserGroupIcon className="w-4 h-4 text-purple-500" />
//             <span>Trusted Community</span>
//           </div>
//         </div>

//         {/* Terms Note */}
//         <div className="mt-6 text-center">
//           <p className="text-xs text-gray-400">
//             By joining, you agree to our Terms of Service and Privacy Policy
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }


import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  EnvelopeIcon, 
  CheckCircleIcon, 
  UserIcon, 
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  UserGroupIcon,
  LockClosedIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import { FaCar, FaGoogle, FaFacebook, FaApple } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function Register() {
  const navigate = useNavigate();
  const { register, sendOTP } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    name: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!formData.email) {
      toast.error('Please enter your email address');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    const success = await sendOTP(formData.email);
    setLoading(false);
    
    if (success) {
      setStep(2);
      
      // Start resend timer
      setResendTimer(30);
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
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
    
    if (!formData.name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    
    if (!formData.phone || formData.phone.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }
    
    setLoading(true);
    const success = await register(
      formData.email,
      formData.otp,
      formData.name,
      formData.phone,
      formData.password
    );
    setLoading(false);
    
    if (success) navigate('/');
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    
    setLoading(true);
    const success = await sendOTP(formData.email);
    setLoading(false);
    
    if (success) {
      toast.success('OTP resent successfully!');
      setResendTimer(30);
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-1000"></div>
      
      <div className="max-w-md w-full relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-lg mb-4">
            <FaCar className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Join Rydex</h2>
          <p className="text-gray-600 mt-2">Start sharing rides today</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <div className="text-2xl font-bold text-primary-600">50K+</div>
            <div className="text-xs text-gray-500">Happy Riders</div>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <div className="text-2xl font-bold text-primary-600">100+</div>
            <div className="text-xs text-gray-500">Cities</div>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <div className="text-2xl font-bold text-primary-600">4.8</div>
            <div className="text-xs text-gray-500">App Rating</div>
          </div>
        </div>

        {/* Registration Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Progress Steps */}
          <div className="flex justify-between mb-8">
            {[
              { num: 1, title: 'Email', icon: EnvelopeIcon },
              { num: 2, title: 'Verify', icon: ShieldCheckIcon },
              { num: 3, title: 'Profile', icon: UserIcon }
            ].map((item) => (
              <div key={item.num} className="flex-1 text-center">
                <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center transition-all ${
                  step >= item.num 
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step > item.num ? (
                    <CheckCircleIcon className="w-6 h-6" />
                  ) : (
                    <item.icon className="w-5 h-5" />
                  )}
                </div>
                <div className={`text-xs mt-2 font-medium ${
                  step >= item.num ? 'text-primary-600' : 'text-gray-500'
                }`}>
                  {item.title}
                </div>
                {item.num < 3 && (
                  <div className={`h-1 mt-4 ${
                    step > item.num ? 'bg-primary-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Email */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <DevicePhoneMobileIcon className="w-3 h-3" />
                  We'll send a verification code to your email
                </p>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Sending OTP...
                  </>
                ) : (
                  <>
                    Send OTP
                    <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 2: Verify OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={formData.otp}
                  onChange={(e) => setFormData({...formData, otp: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none text-center text-2xl tracking-widest"
                  placeholder="123456"
                  maxLength="6"
                  required
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  OTP sent to {formData.email}
                </p>
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105"
              >
                Verify OTP
              </button>
              
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendTimer > 0}
                className="w-full text-primary-600 hover:text-primary-700 text-sm font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
              </button>
            </form>
          )}

          {/* Step 3: Complete Profile */}
          {step === 3 && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                    placeholder="9876543210"
                    maxLength="10"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  We'll use this for ride coordination and emergency contact
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                    placeholder="At least 6 characters"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <EyeIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <EyeIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}
          
          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-6 flex justify-center items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <ShieldCheckIcon className="w-4 h-4 text-green-500" />
            <span>Secure Registration</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <EnvelopeIcon className="w-4 h-4 text-blue-500" />
            <span>Email Verified</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <DevicePhoneMobileIcon className="w-4 h-4 text-purple-500" />
            <span>Phone Verified</span>
          </div>
        </div>

        {/* Terms Note */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            By joining, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}