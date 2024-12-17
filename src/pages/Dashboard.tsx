import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import ArtistView from '../components/ArtistView';
import Playlists from '../components/Playlists';
import SpotifyPlayer from '../components/webPlayer/SpotifyPlayer';
import RecentlyPlayed from '../components/RecentlyPlayed';
import Feed from '../components/Feed';
import AlbumView from '../components/AlbumView';

const Dashboard: React.FC = () => {
  const [activeBox, setActiveBox] = useState(0);
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [isArtistViewOpen, setArtistViewOpen] = useState(false);
  const [isAlbumViewOpen, setAlbumViewOpen] = useState(false);

  useEffect(() => {
    const handleRouteChange = () => {
      const artistMatch = window.location.pathname.match(/\/artist\/([^/]+)/);
      if (artistMatch) {
        const artistId = artistMatch[1];
        setSelectedArtistId(artistId);
        setArtistViewOpen(true);
        setAlbumViewOpen(false);
        setActiveBox(1);
      }
    };

    handleRouteChange();

    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  const handleArtistSelect = (artistId: string) => {
    setSelectedArtistId(artistId);
    setSelectedAlbumId(null);
    setArtistViewOpen(true);
    setAlbumViewOpen(false);
  };

  const handleAlbumSelect = (albumId: string) => {
    setSelectedAlbumId(albumId);
    setArtistViewOpen(false);
    setAlbumViewOpen(true);
  };

  const handleCloseArtistView = () => {
    setArtistViewOpen(false);
    setSelectedArtistId(null);
    setSelectedAlbumId(null);
    setActiveBox(0);
    window.history.pushState(null, '', '/');
  };

  const handleCloseAlbumView = () => {
    setAlbumViewOpen(false);
    setSelectedAlbumId(null);
    setActiveBox(0);
    window.history.pushState(null, '', '/');
  };

  const renderMiddleBox = () => {
    if (isAlbumViewOpen && selectedAlbumId) {
      return (
        <AlbumView 
          albumId={selectedAlbumId} 
          onArtistSelect={handleArtistSelect}
          onClose={handleCloseAlbumView}
        />
      );
    }
    if (isArtistViewOpen && selectedArtistId) {
      return <ArtistView artistId={selectedArtistId} onArtistSelect={handleArtistSelect} />;
    }
    return <Feed onArtistSelect={handleArtistSelect} onAlbumSelect={handleAlbumSelect} />;
  };

  const renderBox = () => {
    switch (activeBox) {
      case 0:
        return <Playlists onArtistSelect={handleArtistSelect} />;
      case 1:
        return (
          <div className="p-4">
            {selectedArtistId ? (
              <ArtistView 
                artistId={selectedArtistId}
                onArtistSelect={handleArtistSelect}
                onClose={handleCloseArtistView}
              />
            ) : (
              <Feed onArtistSelect={handleArtistSelect} onAlbumSelect={handleAlbumSelect} />
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
      <Header 
        onArtistSelect={handleArtistSelect}
        onAlbumSelect={handleAlbumSelect}
      />

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