import React, { useState } from 'react';
import Header from '../components/Header';
import ArtistView from '../components/ArtistView';
import Playlists from '../components/Playlists';
import SpotifyPlayer from '../components/webPlayer/SpotifyPlayer';
import Browse from '../components/Browse'; // Import the Browse component

const Dashboard: React.FC = () => {
  const [activeBox, setActiveBox] = useState(0);
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
  const [isArtistViewOpen, setArtistViewOpen] = useState(false); // New state for toggling ArtistView

  const handleArtistSelect = (artistId: string) => {
    setSelectedArtistId(artistId);
    setArtistViewOpen(true); // Open ArtistView when an artist is selected
    setActiveBox(1); // Switch to artist view in mobile
  };

  const handleCloseArtistView = () => {
    setArtistViewOpen(false); // Close ArtistView
  };

  const renderMiddleBox = () => {
    if (isArtistViewOpen && selectedArtistId) {
      return (
        <div className="p-4">
          <button onClick={handleCloseArtistView} className="text-right text-red-500">Close</button>
          <ArtistView artistId={selectedArtistId} />
        </div>
      );
    }
    return (
      <div className="p-4">
        <Browse />
        <button 
          onClick={() => setActiveBox(0)} // Set activeBox to 0 to return to Browse
          className="btn btn-primary mt-4"
        >
          Return to Browse
        </button>
      </div>
    ); // Render Browse by default
  };

  const renderBox = () => {
    switch (activeBox) {
      case 0:
        return <Playlists onArtistSelect={handleArtistSelect} />;
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
        return <Playlists onArtistSelect={handleArtistSelect} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen overflow-hidden px-4">
      <Header onArtistSelect={handleArtistSelect} />

      <div className="flex-grow flex flex-col lg:flex-row justify-around items-center overflow-hidden pb-24">
        <div className="hidden lg:block w-full lg:w-1/4">
          <div className="bg-secondary h-[calc(100vh-220px)] rounded-lg shadow-lg overflow-auto">
            <Playlists onArtistSelect={handleArtistSelect} />
          </div>
        </div>

        <div className="hidden lg:block w-full lg:w-2/4 p-5">
          <div className="bg-secondary h-[calc(100vh-220px)] rounded-lg shadow-lg overflow-auto">
            {renderMiddleBox()}
          </div>
        </div>

        <div className="hidden lg:block w-full lg:w-1/4">
          <div className="bg-secondary h-[calc(100vh-220px)] rounded-lg shadow-lg overflow-auto">
            <div className="p-4">
              Box 3 Content
            </div>
          </div>
        </div>

        <div className="block lg:hidden w-full h-[calc(100vh-230px)] bg-secondary rounded-lg shadow-lg overflow-auto">
          {renderBox()}
        </div>
      </div>

      <div className="hidden lg:block">
        <SpotifyPlayer />
      </div>

      <div className="lg:hidden fixed bottom-[56px] left-0 right-0">
        <SpotifyPlayer />
      </div>

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