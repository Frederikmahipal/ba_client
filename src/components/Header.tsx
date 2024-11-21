// src/components/Header.tsx
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import SearchBar from './SearchBar';
import ProfileView from './ProfileView';

interface HeaderProps {
  onArtistSelect: (artistId: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onArtistSelect }) => {
  const { logout, user } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  return (
    <>
      <div className="navbar bg-secondary shadow-lg rounded-lg my-2 flex flex-col sm:flex-row items-center justify-between">
        <div className="flex-none mb-2 sm:mb-0">
          <a href="/" className="text-xl font-bold">
            MyLogo
          </a>
        </div>
        
        <div className="flex-1 w-full max-w-lg mx-4">
          <SearchBar onArtistSelect={onArtistSelect} />
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