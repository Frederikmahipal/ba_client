import React from 'react';

interface PlayerControlsProps {
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  isPaused: boolean;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({ onPlayPause, onNext, onPrevious, isPaused }) => (
  <div className="flex items-center justify-center gap-2 lg:gap-4 mb-1">
    {/* Previous Button */}
    <button 
      className="text-[#b3b3b3] hover:text-white transition-colors p-2"
      onClick={onPrevious}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M3.3 1a.7.7 0 0 1 .7.7v5.15l9.95-5.744a.7.7 0 0 1 1.05.606v12.575a.7.7 0 0 1-1.05.607L4 9.149V14.3a.7.7 0 0 1-.7.7H1.7a.7.7 0 0 1-.7-.7V1.7a.7.7 0 0 1 .7-.7h1.6z" />
      </svg>
    </button>

    {/* Play/Pause Button */}
    <button 
      className="flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-white hover:scale-105 transition-transform"
      onClick={onPlayPause}
    >
      {isPaused ? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="black">
          <path d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713z" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="black">
          <path d="M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z" />
        </svg>
      )}
    </button>

    {/* Next Button */}
    <button 
      className="text-[#b3b3b3] hover:text-white transition-colors p-2"
      onClick={onNext}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M12.7 1a.7.7 0 0 0-.7.7v5.15L2.05 1.107A.7.7 0 0 0 1 1.712v12.575a.7.7 0 0 0 1.05.607L12 9.149V14.3a.7.7 0 0 0 .7.7h1.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-1.6z" />
      </svg>
    </button>
  </div>
);

export default PlayerControls;