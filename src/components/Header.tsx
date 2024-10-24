// src/components/Header.tsx
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext'; // Corrected import name
import SearchBar from './SearchBar';

interface HeaderProps {
  onArtistSelect: (artistId: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onArtistSelect }) => {
  const { logout } = useAuth();
  const { toggleTheme } = useTheme(); // Corrected usage

  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  return (
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
            <img src="/default-avatar.png" alt="Avatar" />
          </div>
        </button>
        {isDropdownOpen && (
          <ul className="menu dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52">
            <li><button>Profile</button></li>
            <li><button>Settings</button></li>
            <li><button onClick={toggleTheme}>Toggle Theme</button></li>
            <li><button onClick={handleLogout}>Logout</button></li>
          </ul>
        )}
      </div>
    </div>
  );
};

export default Header;