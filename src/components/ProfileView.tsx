import React from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { useQuery } from '@tanstack/react-query';

interface ProfileViewProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const { data: userData, isLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await api.get('/api/users/profile');
      return response.data;
    },
    enabled: isOpen && !!user?.accessToken
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Profile</h2>
          <button 
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
          >
            ✕
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : error ? (
          <p className="text-center text-error">Failed to load user data</p>
        ) : userData ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center mb-6">
              <div className="avatar">
                <div className="w-24 rounded-full">
                <img src={user?.profilePicture || "/default-avatar.png"} alt="Avatar" />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div>
                <label className="text-sm font-semibold">Name</label>
                <p className="text-lg">{userData.name}</p>
              </div>
              
              <div>
                <label className="text-sm font-semibold">Email</label>
                <p className="text-lg">{userData.email}</p>
              </div>

              {userData.spotifyId && (
                <div>
                  <label className="text-sm font-semibold">Spotify Connected</label>
                  <p className="text-lg">✓</p>
                </div>
              )}

              {userData.createdAt && (
                <div>
                  <label className="text-sm font-semibold">Member Since</label>
                  <p className="text-lg">
                    {new Date(userData.createdAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-center">Failed to load user data</p>
        )}
      </div>
    </div>
  );
};

export default ProfileView; 