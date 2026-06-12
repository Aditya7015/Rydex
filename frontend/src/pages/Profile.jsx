import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  CameraIcon, 
  PencilIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  UserIcon,
  StarIcon,
  ShieldCheckIcon,
  MusicalNoteIcon,
  ChatBubbleLeftRightIcon,
  NoSymbolIcon,
  CheckBadgeIcon,
  CalendarIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { FaCar, FaUserFriends, FaSmoking, FaMusic, FaComments } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    preferences: user?.preferences || {
      smoking: false,
      music: 'any',
      chatting: 'any'
    }
  });
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await updateProfile(formData);
    if (success) setIsEditing(false);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Photo must be 10MB or smaller');
      return;
    }
    
    const formData = new FormData();
    formData.append('photo', file);
    
    setUploading(true);
    try {
      const { data } = await axios.post('/auth/upload-photo', formData);
      await updateProfile({ profilePhoto: data.url });
      toast.success('Profile photo updated!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const getMemberSince = () => {
    if (user?.createdAt) {
      return new Date(user.createdAt).getFullYear();
    }
    return 2024;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account and preferences</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Cover Photo */}
          <div className="h-32 bg-gradient-to-r from-primary-500 to-primary-700 relative"></div>
          
          {/* Profile Photo Section */}
          <div className="relative px-6 pb-6">
            <div className="flex justify-between items-start -mt-12 mb-6">
              <div className="relative inline-block">
                <img
                  src={user?.profilePhoto || '/default-avatar.png'}
                  alt={user?.name}
                  className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <label className="absolute bottom-0 right-0 bg-primary-600 rounded-full p-2 cursor-pointer hover:bg-primary-700 transition-all transform hover:scale-110">
                  <CameraIcon className="w-4 h-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                {uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
              
              {/* Verification Badge */}
              <div className="flex items-center gap-2 bg-green-50 rounded-full px-3 py-1">
                <CheckBadgeIcon className="w-5 h-5 text-green-600" />
                <span className="text-sm font-semibold text-green-600">Verified</span>
              </div>
            </div>

            {/* User Info */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
              <p className="text-gray-500 flex items-center justify-center gap-1 mt-1">
                <CalendarIcon className="w-4 h-4" />
                Member since {getMemberSince()}
              </p>
              
              {/* Rating */}
              <div className="flex items-center justify-center gap-2 mt-3">
                <div className="flex items-center gap-1 bg-yellow-50 rounded-full px-3 py-1">
                  <StarSolidIcon className="w-4 h-4 text-yellow-500" />
                  <span className="font-semibold text-gray-900">{user?.rating?.toFixed(1) || 'New'}</span>
                  <span className="text-xs text-gray-500">({user?.totalRatings || 0} ratings)</span>
                </div>
                <div className="flex items-center gap-1 bg-blue-50 rounded-full px-3 py-1">
                  <ShieldCheckIcon className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">Trusted</span>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center transform hover:scale-105 transition-all">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500 rounded-full mb-2">
                  <FaCar className="text-white text-xl" />
                </div>
                <div className="text-2xl font-bold text-blue-700">{user?.totalRidesAsDriver || 0}</div>
                <div className="text-sm text-blue-600 font-medium">Rides as Driver</div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center transform hover:scale-105 transition-all">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500 rounded-full mb-2">
                  <FaUserFriends className="text-white text-xl" />
                </div>
                <div className="text-2xl font-bold text-green-700">{user?.totalRidesAsPassenger || 0}</div>
                <div className="text-sm text-green-600 font-medium">Rides as Passenger</div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center transform hover:scale-105 transition-all">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-500 rounded-full mb-2">
                  <TrophyIcon className="text-white text-xl" />
                </div>
                <div className="text-2xl font-bold text-purple-700">
                  {(user?.totalRidesAsDriver || 0) + (user?.totalRidesAsPassenger || 0)}
                </div>
                <div className="text-sm text-purple-600 font-medium">Total Trips</div>
              </div>
            </div>

            {/* Profile Information */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-primary-600" />
                Personal Information
              </h3>
              
              {!isEditing ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-sm text-gray-500 flex items-center gap-1 mb-1">
                      <PhoneIcon className="w-4 h-4" />
                      Phone Number
                    </div>
                    <div className="font-medium text-gray-900">+91 {user?.phone}</div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-sm text-gray-500 flex items-center gap-1 mb-1">
                      <EnvelopeIcon className="w-4 h-4" />
                      Email Address
                    </div>
                    <div className="font-medium text-gray-900">{user?.email || 'Not provided'}</div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-sm text-gray-500 flex items-center gap-1 mb-2">
                      <FaMusic className="w-4 h-4" />
                      Ride Preferences
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 text-sm rounded-full">
                        {user?.preferences?.smoking ? '🚬 Smoking Allowed' : '🚭 No Smoking'}
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 text-sm rounded-full">
                        <FaMusic className="w-3 h-3" />
                        Music: {user?.preferences?.music || 'Any'}
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full">
                        <FaComments className="w-3 h-3" />
                        Chatting: {user?.preferences?.chatting || 'Any'}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <PencilIcon className="w-5 h-5" />
                    Edit Profile
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Ride Preferences
                    </label>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-2">
                          <FaSmoking className="w-5 h-5 text-gray-600" />
                          <span className="font-medium text-gray-700">Allow Smoking in my car</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.preferences.smoking}
                            onChange={(e) => setFormData({
                              ...formData,
                              preferences: {...formData.preferences, smoking: e.target.checked}
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FaMusic className="inline mr-2" />
                          Music Preference
                        </label>
                        <select
                          value={formData.preferences.music}
                          onChange={(e) => setFormData({
                            ...formData,
                            preferences: {...formData.preferences, music: e.target.value}
                          })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                        >
                          <option value="any">🎵 Any Music</option>
                          <option value="silence">🔇 Silence Preferred</option>
                          <option value="low">🔉 Low Volume</option>
                          <option value="medium">🔊 Medium Volume</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FaComments className="inline mr-2" />
                          Chatting Preference
                        </label>
                        <select
                          value={formData.preferences.chatting}
                          onChange={(e) => setFormData({
                            ...formData,
                            preferences: {...formData.preferences, chatting: e.target.value}
                          })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                        >
                          <option value="any">💬 No Preference</option>
                          <option value="quiet">🤫 Prefer Quiet</option>
                          <option value="talkative">🗣️ Talkative</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Account Stats */}
            <div className="border-t mt-6 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ShieldCheckIcon className="w-5 h-5 text-primary-600" />
                Account Status
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                  <span className="text-sm text-gray-600">Verification Status</span>
                  <span className="text-sm font-semibold text-green-700 flex items-center gap-1">
                    <CheckBadgeIcon className="w-4 h-4" />
                    Verified
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                  <span className="text-sm text-gray-600">Response Rate</span>
                  <span className="text-sm font-semibold text-blue-700">98%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}