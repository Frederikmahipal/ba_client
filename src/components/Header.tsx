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
          <a href="/" className="btn btn-ghost btn-circle">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              className="w-6 h-6"
            >
              <path d="M19.952 1.651a.75.75 0 01.298.599V16.303a3 3 0 01-2.176 2.884l-1.32.377a2.553 2.553 0 11-1.403-4.909l2.311-.66a1.5 1.5 0 001.088-1.442V6.994l-9 2.572v9.737a3 3 0 01-2.176 2.884l-1.32.377a2.553 2.553 0 11-1.402-4.909l2.31-.66a1.5 1.5 0 001.088-1.442V9.017 5.25a.75.75 0 01.544-.721l10.5-3a.75.75 0 01.658.122z" />
            </svg>
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