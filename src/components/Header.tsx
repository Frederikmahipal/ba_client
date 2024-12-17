// src/components/Header.tsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import SearchBar from './SearchBar';
import ProfileView from './ProfileView';

interface HeaderProps {
  onArtistSelect: (artistId: string) => void;
  onAlbumSelect: (albumId: string) => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onArtistSelect, 
  onAlbumSelect 
}) => {
  const { logout, user } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  return (
    <>
      <div className="navbar bg-secondary shadow-lg rounded-lg my-2">
        <div className="flex-none">
          <a href="/" className="text-xl font-bold">
            MyLogo
          </a>
        </div>
        
        <div className="flex-1 flex justify-center h-16">
          <div className="w-full max-w-xl px-4">
            <SearchBar 
              onArtistSelect={onArtistSelect}
              onAlbumSelect={onAlbumSelect}
            />
          </div>
        </div>
        
        <div className="flex-none dropdown dropdown-end">
          <button onClick={toggleDropdown} className="btn btn-ghost btn-circle avatar">
            <div className="w-10 rounded-full">
            <img src={user?.profilePicture || "/default-avatar.png"} alt="Avatar" />
            </div>
          </button>
          {isDropdownOpen && (
            <ul className="menu dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52">
              <li><button onClick={() => {
                setIsProfileOpen(true);
                setIsDropdownOpen(false);
              }}>Profile</button></li>
              <li><button>Settings</button></li>
              <li><button onClick={handleLogout}>Logout</button></li>
            </ul>
          )}
        </div>
      </div>

      <ProfileView 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
      />
    </>
  );
};

export default Header;