import React, { useState } from 'react';
import Header from '../components/Header';
import ArtistView from '../components/ArtistView';
import Playlists from '../components/Playlists';
import SpotifyPlayer from '../components/webPlayer/SpotifyPlayer';
import RecentlyPlayed from '../components/RecentlyPlayed';

const Dashboard: React.FC = () => {
  const [activeBox, setActiveBox] = useState(0);
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
  const [isArtistViewOpen, setArtistViewOpen] = useState(false);

  const handleArtistSelect = (artistId: string) => {
    setSelectedArtistId(artistId);
    setArtistViewOpen(true);
    setActiveBox(1);
  };

  const handleCloseArtistView = () => {
    setArtistViewOpen(false);
    setSelectedArtistId(null);
    setActiveBox(0);
  };

  const renderMiddleBox = () => {
    if (isArtistViewOpen && selectedArtistId) {
      return (
        <div className="p-4">
          <button 
            onClick={handleCloseArtistView} 
            className="mb-4 btn btn-sm btn-error"
          >
            Close
          </button>
          <ArtistView 
            artistId={selectedArtistId}
            onArtistSelect={handleArtistSelect}
          />
        </div>
      );
    }
  };

  const renderBox = () => {
    switch (activeBox) {
      case 0:
        return <Playlists onArtistSelect={handleArtistSelect} />;
      case 1:
        return (
          <div className="p-4">
            {selectedArtistId ? (
              <>
                <button 
                  onClick={handleCloseArtistView} 
                  className="mb-4 btn btn-sm btn-error"
                >
                  Close
                </button>
                <ArtistView 
                  artistId={selectedArtistId}
                  onArtistSelect={handleArtistSelect}
                />
              </>
            ) : (
              "Select an artist to view details"
            )}
          </div>
        );
      case 2:
        return <RecentlyPlayed onArtistSelect={handleArtistSelect} />;
      default:
        return <Playlists onArtistSelect={handleArtistSelect} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen overflow-hidden px-4">
      <Header onArtistSelect={handleArtistSelect} />

      <div className="flex-grow flex flex-col lg:flex-row justify-around items-center overflow-hidden pb-24">
        {/* Left Column - Playlists */}
        <div className="hidden lg:block w-full lg:w-1/4">
          <div className="bg-secondary h-[calc(100vh-220px)] rounded-lg shadow-lg overflow-auto">
            <Playlists onArtistSelect={handleArtistSelect} />
          </div>
        </div>

        {/* Middle Column - Artist View */}
        <div className="hidden lg:block w-full lg:w-2/4 p-5">
          <div className="bg-secondary h-[calc(100vh-220px)] rounded-lg shadow-lg overflow-auto">
            {renderMiddleBox()}
          </div>
        </div>

        {/* Right Column */}
        <div className="hidden lg:block w-full lg:w-1/4">
      <div className="bg-secondary h-[calc(100vh-220px)] rounded-lg shadow-lg overflow-auto">
        <RecentlyPlayed onArtistSelect={handleArtistSelect} />
      </div>
    </div>

        {/* Mobile View */}
        <div className="block lg:hidden w-full h-[calc(100vh-230px)] bg-secondary rounded-lg shadow-lg overflow-auto">
          {renderBox()}
        </div>
      </div>

      {/* Desktop Player */}
      <div className="hidden lg:block">
        <SpotifyPlayer />
      </div>

      {/* Mobile Player */}
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