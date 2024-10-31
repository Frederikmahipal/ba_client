import React, { useState } from 'react';
import Header from '../components/Header';
import ArtistView from '../components/ArtistView';
import Playlists from '../components/Playlists';
import SpotifyPlayer from '../components/webPlayer/SpotifyPlayer'; // Updated import

const Dashboard: React.FC = () => {
  const [activeBox, setActiveBox] = useState(0);
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);

  const handleArtistSelect = (artistId: string) => {
    setSelectedArtistId(artistId);
    setActiveBox(1); // Switch to artist view in mobile
  };

  const renderBox = () => {
    switch (activeBox) {
      case 0:
        return <Playlists onArtistSelect={handleArtistSelect} />; // Pass the handler
      case 1:
        return (
          <div className="p-4">
            {selectedArtistId ? (
              <ArtistView artistId={selectedArtistId} />
            ) : (
              "Select an artist to view details"
            )}
          </div>
        );
      case 2:
        return <div className="p-4">Box 3 Content</div>;
      default:
        return <Playlists onArtistSelect={handleArtistSelect} />; // Pass the handler
    }
  };

  return (
    <div className="flex flex-col min-h-screen overflow-hidden px-4">
      {/* Render the Header */}
      <Header onArtistSelect={handleArtistSelect} />

      {/* Dashboard Content */}
      <div className="flex-grow flex flex-col lg:flex-row justify-around items-center overflow-hidden pb-24">
        {/* Left Box - Playlists */}
        <div className="hidden lg:block w-full lg:w-1/4">
          <div className="bg-secondary h-[calc(100vh-220px)] rounded-lg shadow-lg overflow-auto">
            <Playlists onArtistSelect={handleArtistSelect} />
          </div>
        </div>

        {/* Middle Box - Artist View */}
        <div className="hidden lg:block w-full lg:w-2/4 p-5">
          <div className="bg-secondary h-[calc(100vh-220px)] rounded-lg shadow-lg overflow-auto">
            {selectedArtistId ? (
              <ArtistView artistId={selectedArtistId} />
            ) : (
              <div className="flex items-center justify-center h-full text-base-content/70">
                Select an artist to view details
              </div>
            )}
          </div>
        </div>

        {/* Right Box */}
        <div className="hidden lg:block w-full lg:w-1/4">
          <div className="bg-secondary h-[calc(100vh-220px)] rounded-lg shadow-lg overflow-auto">
            <div className="p-4">
              Box 3 Content
            </div>
          </div>
        </div>

        {/* Mobile View */}
        <div className="block lg:hidden w-full h-[calc(100vh-230px)] bg-secondary rounded-lg shadow-lg overflow-auto">
          {renderBox()}
        </div>
      </div>

      {/* Spotify Player - Desktop */}
      <div className="hidden lg:block">
        <SpotifyPlayer />
      </div>

      {/* Spotify Player - Mobile */}
      <div className="lg:hidden fixed bottom-[56px] left-0 right-0">
        <SpotifyPlayer />
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-secondary p-2 flex justify-around">
        <button 
          className={`btn ${activeBox === 0 ? 'btn-primary' : 'btn-ghost'}`} 
          onClick={() => setActiveBox(0)}
        >
          Playlists
        </button>
        <button 
          className={`btn ${activeBox === 1 ? 'btn-primary' : 'btn-ghost'}`} 
          onClick={() => setActiveBox(1)}
        >
          Artist
        </button>
        <button 
          className={`btn ${activeBox === 2 ? 'btn-primary' : 'btn-ghost'}`} 
          onClick={() => setActiveBox(2)}
        >
          Box 3
        </button>
      </div>
    </div>
  );
};

export default Dashboard;