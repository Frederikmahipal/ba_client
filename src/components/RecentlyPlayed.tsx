import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usePlayback } from '../utils/playback';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Track, PlayedTrack } from '../models/track';
import TrackItem from './TrackItem';

type SpotifyContextType = 'album' | 'artist' | 'playlist' | 'queue';

interface SpotifyContext {
  type: SpotifyContextType;
  id: string;
  uri: string;
  name?: string;
}

interface CurrentlyPlayingData {
  item: Track;
  is_playing: boolean;
  context?: SpotifyContext;
}

interface QueueData {
  currently_playing: Track | null;
  queue: Track[];
}

const RecentlyPlayed: React.FC<{ onArtistSelect?: (artistId: string) => void }> = ({ onArtistSelect }) => {
  const { user } = useAuth();
  const { handlePlayTrack } = usePlayback();
  const queryClient = useQueryClient();

  // Fetch currently playing and its context
  const { data: currentlyPlaying, isLoading: isLoadingCurrent } = useQuery<CurrentlyPlayingData | null>({
    queryKey: ['currentlyPlaying'],
    queryFn: async () => {
      const response = await api.get('/api/spotify/currently-playing', {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`
        }
      });
      if (response.status === 204 || !response.data) {
        return null;
      }
      return response.data;
    },
    enabled: !!user?.accessToken,
    refetchInterval: 5000,
    select: (newData) => {
      const prevData = queryClient.getQueryData<CurrentlyPlayingData>(['currentlyPlaying']);
      if (prevData?.item?.id !== newData?.item?.id && prevData?.item) {
        api.post('/api/spotify/recently-played/add', {
          track: prevData.item,
          context: prevData.context
        }, {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`
          }
        }).then(() => {
          queryClient.invalidateQueries({ queryKey: ['recentlyPlayed'] });
        });
      }
      return newData;
    }
  });

  // Fetch queue data
  const { data: queueData, isLoading: isLoadingQueue, refetch: refetchQueue } = useQuery<QueueData>({
    queryKey: ['queue', currentlyPlaying?.context?.uri],
    queryFn: async () => {
      const response = await api.get('/api/spotify/player/queue', {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`
        }
      });
      return {
        currently_playing: response.data?.currently_playing || null,
        queue: response.data?.queue || []
      };
    },
    enabled: !!user?.accessToken && !!currentlyPlaying,
    refetchInterval: 10000
  });

  // Fetch recently played history
  const { data: recentTracks, isLoading: isLoadingHistory } = useQuery<PlayedTrack[]>({
    queryKey: ['recentlyPlayed'],
    queryFn: async () => {
      const response = await api.get('/api/spotify/recently-played', {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`
        }
      });
      return response.data.items;
    },
    enabled: !!user?.accessToken,
    staleTime: 0,
  });

  const handleQueueTrackClick = (track: Track, index: number) => {
    if (!currentlyPlaying?.context) return;
    
    handlePlayTrack(track.uri, track, {
      type: currentlyPlaying.context.type as SpotifyContextType,
      id: currentlyPlaying.context.id,
      uri: currentlyPlaying.context.uri,
      position: index,
      offset: { uri: track.uri }
    }).then(async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      await refetchQueue();
    });
  };

  if (isLoadingCurrent || isLoadingQueue || isLoadingHistory) {
    return (
      <div className="flex justify-center items-center h-full">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Context Info */}
      {currentlyPlaying?.context && (
        <div className="text-sm opacity-75">
          Playing from {currentlyPlaying.context.type}: {currentlyPlaying.context.name}
        </div>
      )}

      {/* Queue Section */}
      {queueData && queueData.queue.length > 0 && (
        <div className="bg-base-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">
            Coming Up Next
            {queueData.queue.length > 5 && (
              <span className="text-sm opacity-50 ml-2">
                (Showing 5 of {queueData.queue.length})
              </span>
            )}
          </h3>
          <div className="space-y-2">
            {queueData.queue.slice(0, 5).map((track: Track, index: number) => (
              <TrackItem
                key={`${track.id}-${index}`}
                track={track}
                index={index + 1}
                onClick={() => handleQueueTrackClick(track, index)}
                onArtistSelect={onArtistSelect}
                showOptions={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Currently Playing */}
      {currentlyPlaying?.item && (
        <div className="bg-primary bg-opacity-10 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Now Playing</h3>
          <TrackItem
            track={currentlyPlaying.item}
            isPlaying={currentlyPlaying.is_playing}
            onArtistSelect={onArtistSelect}
            showOptions={false}
          />
        </div>
      )}

      {/* Recently Played History */}
      <div className="bg-base-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Recently Played</h3>
        <div className="space-y-2">
          {recentTracks?.map((item: PlayedTrack) => (
            <TrackItem
              key={`${item.track.id}-${item.played_at}`}
              track={item.track}
              timestamp={item.played_at}
              onClick={() => {
                handlePlayTrack(
                  item.track.uri,
                  item.track,
                  item.context && {
                    type: item.context.type as SpotifyContextType,
                    id: item.context.id,
                    uri: item.context.uri,
                    position: 0
                  }
                ).then(() => {
                  queryClient.invalidateQueries({ queryKey: ['currentlyPlaying'] });
                  queryClient.invalidateQueries({ queryKey: ['recentlyPlayed'] });
                });
              }}
              onArtistSelect={onArtistSelect}
              showOptions={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentlyPlayed;