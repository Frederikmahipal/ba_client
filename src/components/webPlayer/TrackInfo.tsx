import React from 'react';
import { TrackInfoProps } from '../../models/track';


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
      <div className="font-medium text-white">{currentTrack?.name}</div>
      <div className="text-sm text-gray-400">
        {currentTrack?.artists.map((artist) => artist.name).join(', ')}
      </div>
    </div>
  </div>
);

export default TrackInfo;