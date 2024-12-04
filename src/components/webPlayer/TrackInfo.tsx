import React from 'react';

interface TrackInfoProps {
  currentTrack: {
    name: string;
    artists: Array<{ name: string }>;
    album: {
      images: Array<{ url: string }>;
    };
  } | null;
}

const TrackInfo: React.FC<TrackInfoProps> = ({ currentTrack }) => (
  <div className="flex items-center space-x-4">
    {currentTrack?.album.images[0]?.url && (
      <img
        src={currentTrack.album.images[0].url}
        alt={currentTrack.name}
        className="w-12 h-12 rounded-lg"
      />
    )}
    <div>
      <div className="font-medium">{currentTrack?.name}</div>
      <div className="text-sm opacity-70">
        {currentTrack?.artists.map((artist) => artist.name).join(', ')}
      </div>
    </div>
  </div>
);

export default TrackInfo;