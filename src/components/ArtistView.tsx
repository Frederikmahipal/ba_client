import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePlayback } from '../utils/playback';
import api from '../services/api';
import { Track } from '../models/track';
import { User } from '../models/user';
import TrackItem from './TrackItem';

interface ArtistViewProps {
  artistId: string;
  initialExpandedAlbumId?: string | null;
  initialTrackNumber?: number | null;
  onArtistSelect?: (artistId: string) => void;
  onClose?: () => void;
}

interface Album {
  id: string;
  name: string;
  release_date: string;
  images: { url: string }[];
}

interface AlbumDetails extends Album {
  tracks: {
    items: Track[];
  };
}

interface FollowedArtist {
  spotifyArtistId: string;
  name: string;
  imageUrl: string;
  followedAt: string;
}

interface FeedData {
  followedUsers: User[];
  followedArtists: FollowedArtist[];
}

const fetchArtistDetails = async (artistId: string) => {
  const [artistResponse, albumsResponse, topTracksResponse] = await Promise.all([
    api.get(`/api/spotify/artist/${artistId}`),
    api.get(`/api/spotify/artist/${artistId}/albums`),
    api.get(`/api/spotify/artist/${artistId}/top-tracks`),
  ]);

  return {
    artist: artistResponse.data,
    albums: albumsResponse.data,
    topTracks: topTracksResponse.data,
  };
};

const ArtistView: React.FC<ArtistViewProps> = ({ 
  artistId, 
  initialExpandedAlbumId,
  initialTrackNumber,
  onArtistSelect,
  onClose 
}) => {
  const [expandedAlbumId, setExpandedAlbumId] = useState<string | null>(initialExpandedAlbumId || null);
  const { handlePlayTrack } = usePlayback();

  const queryClient = useQueryClient();

  const followArtistMutation = useMutation({
    mutationFn: async () => {
      await api.post('/api/users/follow/artist', { artistId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    }
  });

  const unfollowArtistMutation = useMutation({
    mutationFn: async () => {
      await api.post('/api/users/unfollow/artist', { artistId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    }
  });

  const { data: feedData } = useQuery<FeedData>({
    queryKey: ['feed'],
    queryFn: async () => {
      const response = await api.get('/api/users/feed');
      return response.data;
    }
  });

  const isFollowingArtist = () => {
    return feedData?.followedArtists.some(
      (followedArtist: FollowedArtist) => followedArtist.spotifyArtistId === artistId
    );
  };

  const handleFollowClick = async () => {
    try {
      if (isFollowingArtist()) {
        await unfollowArtistMutation.mutateAsync();
      } else {
        await followArtistMutation.mutateAsync();
      }
    } catch (error) {
      console.error('Error following/unfollowing artist:', error);
    }
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['artistDetails', artistId, initialExpandedAlbumId],
    queryFn: async () => {
      const data = await fetchArtistDetails(artistId);
      
      // Handle album section scrolling after data is fetched
      if (initialExpandedAlbumId) {
        setTimeout(() => {
          const albumsSection = document.getElementById('albums-section');
          if (albumsSection) {
            albumsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
      
      return data;
    }
  });

  const { data: albumDetails, isLoading: isLoadingAlbumDetails } = useQuery({
    queryKey: ['albumDetails', expandedAlbumId],
    queryFn: async () => {
      if (!expandedAlbumId) return null;
      const response = await api.get(`/api/spotify/album/${expandedAlbumId}`);
      return response.data as AlbumDetails;
    },
    enabled: !!expandedAlbumId,
    select: (data) => {
      if (initialTrackNumber && data && expandedAlbumId === initialExpandedAlbumId) {
        setTimeout(() => {
          const trackElement = document.getElementById(`track-${initialTrackNumber}`);
          if (trackElement) {
            trackElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            trackElement.classList.add('bg-primary/20');
            setTimeout(() => trackElement.classList.remove('bg-primary/20'), 2000);
          }
        }, 100);
      }
      return data;
    }
  });

  const handleAlbumClick = (albumId: string) => {
    setExpandedAlbumId(expandedAlbumId === albumId ? null : albumId);
  };



  const handleTrackClick = (track: Track, index: number) => {
    // Ensure track has complete album data
    const trackWithAlbum = {
      ...track,
      album: expandedAlbumId ? {
        id: albumDetails!.id,
        name: albumDetails!.name,
        images: albumDetails!.images
      } : track.album
    };
  
    if (expandedAlbumId) {
      // Playing from an album context
      handlePlayTrack(track.uri, trackWithAlbum, {
        type: 'album',
        id: expandedAlbumId,
        uri: `spotify:album:${expandedAlbumId}`,
        position: index
      });
    } else {
      // Playing from artist's top tracks context
      handlePlayTrack(track.uri, trackWithAlbum, {
        type: 'artist',
        id: artistId,
        uri: `spotify:artist:${artistId}`,
        position: index
      });
    }
  };


  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading artist details</div>;

  const { artist, albums, topTracks } = data!;
  const artistImage = artist.images?.[0]?.url;
  const followerCount = new Intl.NumberFormat().format(artist.followers?.total || 0);

  return (
    <div className="relative h-full overflow-x-hidden">
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 btn btn-sm btn-circle btn-ghost z-50"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M6 18L18 6M6 6l12 12" 
            />
          </svg>
        </button>
      )}

      {/* Hero Section */}
      <div className="relative h-[350px] mb-6 z-0">
        {artistImage && (
          <>
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${artistImage})` }}>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-base-300/50 to-base-300" />
            </div>
            <div className="absolute bottom-0 left-0 p-6 z-10">
              <div className="flex items-end gap-6">
                <img src={artistImage} alt={artist.name} className="w-52 h-52 rounded-full shadow-2xl object-cover" />
                <div>
                  <h1 className="text-5xl font-bold mb-4 text-white drop-shadow-lg">{artist.name}</h1>
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-white/80">{followerCount} followers</p>
                    <button 
                      onClick={handleFollowClick}
                      disabled={followArtistMutation.isPending || unfollowArtistMutation.isPending}
                      className={`btn btn-sm ${
                        isFollowingArtist() ? 'btn-secondary' : 'btn-primary'
                      }`}
                    >
                      {followArtistMutation.isPending || unfollowArtistMutation.isPending ? (
                        <span className="loading loading-spinner loading-sm"></span>
                      ) : (
                        isFollowingArtist() ? 'Following' : 'Follow'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Content Section */}
      <div className="px-6">
        {/* Popular Tracks Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Popular Tracks</h2>
          <div className="space-y-2 overflow-x-hidden">
            {topTracks.map((track: Track, index: number) => (
              <TrackItem
                key={track.id}
                track={track}
                index={index + 1}
                onClick={() => handleTrackClick(track, index)}
                onArtistSelect={onArtistSelect}
              />
            ))}
          </div>
        </div>

        {/* Albums Section */}
        <div id="albums-section">
          <h2 className="text-2xl font-bold mb-4">Albums</h2>
          <div className="space-y-4">
            {albums.length > 0 ? (
              albums.map((album: Album) => (
                <div 
                  key={album.id} 
                  className={`bg-base-200 rounded-lg overflow-hidden shadow-lg ${
                    expandedAlbumId === album.id ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <div 
                    className="cursor-pointer hover:bg-base-300 transition-colors"
                    onClick={() => handleAlbumClick(album.id)}
                  >
                    <div className="flex items-center p-4">
                      <img 
                        src={album.images[0]?.url} 
                        alt={album.name} 
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="ml-4 flex-1">
                        <p className="font-bold text-lg">{album.name}</p>
                        <p className="text-sm opacity-75">
                          {new Date(album.release_date).getFullYear()}
                        </p>
                      </div>
                      <svg 
                        className={`w-6 h-6 transform transition-transform ${
                          expandedAlbumId === album.id ? 'rotate-180' : ''
                        }`}
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M19 9l-7 7-7-7" 
                        />
                      </svg>
                    </div>
                  </div>

                  {expandedAlbumId === album.id && (
                    <div className="border-t border-base-300">
                      {isLoadingAlbumDetails ? (
                        <div className="p-4 text-center">
                          <span className="loading loading-spinner loading-md"></span>
                        </div>
                      ) : albumDetails ? (
                        <div className="p-4 space-y-2">
                          {albumDetails.tracks.items.map((track, index) => (
                            <TrackItem
                              key={track.id}
                              track={track}
                              index={track.track_number}
                              onClick={() => handleTrackClick(track, index)}
                              onArtistSelect={onArtistSelect}
                              albumImages={albumDetails.images}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-error">
                          Failed to load album tracks
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p>No albums available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistView;