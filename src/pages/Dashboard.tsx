import React, { useState } from 'react';
import Header from '../components/Header';
import ArtistView from '../components/ArtistView';

const Dashboard: React.FC = () => {
  const [activeBox, setActiveBox] = useState(0);
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);

  const handleArtistSelect = (artistId: string) => {
    setSelectedArtistId(artistId);
    setActiveBox(1); // Activate the middle box when an artist is selected
  };

  const renderBox = () => {
    switch (activeBox) {
      case 0:
        return <div className="p-4 bg-primary text-white">Box 1 Content</div>;
      case 1:
        return (
          <div className="p-4 bg-secondary text-white">
            {selectedArtistId ? (
              <ArtistView artistId={selectedArtistId} />
            ) : (
              "Select an artist to view details"
            )}
          </div>
        );
      case 2:
        return <div className="p-4 bg-accent text-white">Box 3 Content</div>;
      default:
        return <div className="p-4 bg-primary text-white">Box 1 Content</div>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen overflow-hidden px-4">
      {/* Render the Header */}
      <Header onArtistSelect={handleArtistSelect} />

      {/* Dashboard Content */}
      <div className="flex-grow flex flex-col lg:flex-row justify-around items-center p-4 overflow-hidden">
        <div className="hidden lg:block w-full lg:w-1/4 p-2">
          <div className="artboard artboard-demo bg-primary text-white h-[800px] rounded-lg shadow-lg overflow-auto">
            Box 1 Content
          </div>
        </div>
        <div className="hidden lg:block w-full lg:w-2/4 p-2">
          <div className="artboard artboard-demo bg-primary text-white h-[800px] rounded-lg shadow-lg overflow-auto">
            {selectedArtistId ? (
              <ArtistView artistId={selectedArtistId} />
            ) : (
              "Box 2 content"
            )}
          </div>
        </div>
        <div className="hidden lg:block w-full lg:w-1/4 p-2">
          <div className="artboard artboard-demo bg-primary text-white h-[800px] rounded-lg shadow-lg overflow-auto">
            Box 3 Content
          </div>
        </div>
        <div className="block lg:hidden w-full p-2 h-full">
          {renderBox()}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 bg-neutral text-center">
        <p>Footer Content</p>
      </div>

      {/* Buttons for smaller screens */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-neutral p-2 flex justify-around">
        <button className="btn btn-primary" onClick={() => setActiveBox(0)}>Box 1</button>
        <button className="btn btn-secondary" onClick={() => setActiveBox(1)}>Box 2</button>
        <button className="btn btn-accent" onClick={() => setActiveBox(2)}>Box 3</button>
      </div>
    </div>
  );
};

export default Dashboard;