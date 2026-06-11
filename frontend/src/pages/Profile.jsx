import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { CameraIcon } from '@heroicons/react/24/outline';
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
    
    const formData = new FormData();
    formData.append('photo', file);
    
    setUploading(true);
    try {
      const { data } = await axios.post('/auth/upload-photo', formData);
      await updateProfile({ profilePhoto: data.url });
      toast.success('Profile photo updated!');
    } catch (error) {
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-center mb-8">
            {/* Profile Photo */}
            <div className="relative inline-block">
              <img
                src={user?.profilePhoto || '/default-avatar.png'}
                alt={user?.name}
                className="w-24 h-24 rounded-full object-cover mx-auto"
              />
              <label className="absolute bottom-0 right-0 bg-primary-600 rounded-full p-2 cursor-pointer hover:bg-primary-700">
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
            
            <h2 className="text-2xl font-bold mt-4">{user?.name}</h2>
            <p className="text-gray-600">Member since {new Date(user?.createdAt).getFullYear()}</p>
            
            {/* Rating */}
            <div className="flex items-center justify-center gap-1 mt-2">
              <span className="text-yellow-500">★</span>
              <span className="font-medium">{user?.rating?.toFixed(1) || 'New'}</span>
              <span className="text-gray-500">({user?.totalRatings || 0} ratings)</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary-600">{user?.totalRidesAsDriver || 0}</div>
              <div className="text-sm text-gray-600">Rides as Driver</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary-600">{user?.totalRidesAsPassenger || 0}</div>
              <div className="text-sm text-gray-600">Rides as Passenger</div>
            </div>
          </div>

          {/* Profile Info */}
          {!isEditing ? (
            <div className="space-y-4">
              <div className="border-b pb-4">
                <div className="text-sm text-gray-500">Phone Number</div>
                <div className="font-medium">+91 {user?.phone}</div>
              </div>
              <div className="border-b pb-4">
                <div className="text-sm text-gray-500">Email</div>
                <div className="font-medium">{user?.email || 'Not provided'}</div>
              </div>
              <div className="border-b pb-4">
                <div className="text-sm text-gray-500">Preferences</div>
                <div className="font-medium">
                  {user?.preferences?.smoking ? 'Allow Smoking' : 'No Smoking'} • 
                  Music: {user?.preferences?.music} • 
                  Chatting: {user?.preferences?.chatting}
                </div>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="btn-primary w-full"
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="input-field"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferences
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.preferences.smoking}
                      onChange={(e) => setFormData({
                        ...formData,
                        preferences: {...formData.preferences, smoking: e.target.checked}
                      })}
                    />
                    <span>Allow Smoking in my car (as driver)</span>
                  </label>
                  <select
                    value={formData.preferences.music}
                    onChange={(e) => setFormData({
                      ...formData,
                      preferences: {...formData.preferences, music: e.target.value}
                    })}
                    className="input-field"
                  >
                    <option value="any">Music Preference: Any</option>
                    <option value="silence">Prefer Silence</option>
                    <option value="low">Low Volume</option>
                    <option value="medium">Medium Volume</option>
                  </select>
                  <select
                    value={formData.preferences.chatting}
                    onChange={(e) => setFormData({
                      ...formData,
                      preferences: {...formData.preferences, chatting: e.target.value}
                    })}
                    className="input-field"
                  >
                    <option value="any">Chatting: No Preference</option>
                    <option value="quiet">Prefer Quiet</option>
                    <option value="talkative">Talkative</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}