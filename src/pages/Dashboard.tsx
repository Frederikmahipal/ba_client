import React, { useState } from 'react';
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
  };

  const handleCloseAlbumView = () => {
    setAlbumViewOpen(false);
    setSelectedAlbumId(null);
    setActiveBox(0);
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
      return (
        <ArtistView 
          artistId={selectedArtistId} 
          onArtistSelect={handleArtistSelect}
          onClose={handleCloseArtistView}
        />
      );
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
            {selectedAlbumId ? (
              <AlbumView 
                albumId={selectedAlbumId}
                onArtistSelect={handleArtistSelect}
                onClose={handleCloseAlbumView}
              />
            ) : selectedArtistId ? (
              <ArtistView 
                artistId={selectedArtistId}
                onArtistSelect={handleArtistSelect}
                onClose={handleCloseArtistView}
              />
            ) : (
              <Feed 
                onArtistSelect={handleArtistSelect} 
                onAlbumSelect={handleAlbumSelect} 
              />
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
    <div className="h-screen flex flex-col overflow-hidden px-4">
      {/* Header  */}
      <div className="flex-none py-4">
        <Header 
          onArtistSelect={handleArtistSelect}
          onAlbumSelect={handleAlbumSelect}
        />
      </div>

      {/* Main content area - takes remaining height */}
      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 mb-24">
        {/* Left Column - Playlists */}
        <div className="hidden lg:block lg:w-1/4">
          <div className="bg-secondary h-full rounded-lg shadow-lg overflow-y-auto">
            <Playlists onArtistSelect={handleArtistSelect} />
          </div>
        </div>

        {/* Middle Column - Artist View */}
        <div className="hidden lg:block lg:w-2/4">
          <div className="bg-secondary h-full rounded-lg shadow-lg overflow-y-auto">
            {renderMiddleBox()}
          </div>
        </div>

        {/* Right Column */}
        <div className="hidden lg:block lg:w-1/4">
          <div className="bg-secondary h-full rounded-lg shadow-lg overflow-y-auto">
            <RecentlyPlayed onArtistSelect={handleArtistSelect} />
          </div>
        </div>

        {/* Mobile View */}
        <div className="block lg:hidden flex-1 bg-secondary rounded-lg shadow-lg overflow-y-auto mb-[80px]">
          {renderBox()}
        </div>
      </div>

      {/* Player section */}
      <div className="flex-none">
        <div className="fixed lg:absolute bottom-[56px] lg:bottom-0 left-0 right-0 bg-secondary border-t border-base-300">
          <SpotifyPlayer />
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-secondary p-2 flex justify-around border-t border-base-300">
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
            Queue
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;