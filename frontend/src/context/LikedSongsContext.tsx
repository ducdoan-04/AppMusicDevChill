import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { Song } from './PlayerContext';

interface LikedSongsContextType {
  likedSongs: Song[];
  isLiked: (songId: string) => boolean;
  toggleLike: (song: Song) => Promise<void>;
  loading: boolean;
}

const LikedSongsContext = createContext<LikedSongsContextType | undefined>(undefined);

export const LikedSongsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchLikedSongs();
    } else {
      setLikedSongs([]);
      setLoading(false);
    }
  }, [user]);

  const fetchLikedSongs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('liked_songs')
        .select('song_data')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const songs = data.map(item => item.song_data as Song);
      setLikedSongs(songs);
    } catch (e) {
      console.error("Error fetching liked songs", e);
    } finally {
      setLoading(false);
    }
  };

  const isLiked = (songId: string) => {
    return likedSongs.some(song => song.encodeId === songId);
  };

  const toggleLike = async (song: Song) => {
    if (!user) return; // Must be logged in

    const alreadyLiked = isLiked(song.encodeId);

    // Optimistic UI update
    if (alreadyLiked) {
      setLikedSongs(prev => prev.filter(s => s.encodeId !== song.encodeId));
      
      // Update Database
      const { error } = await supabase
        .from('liked_songs')
        .delete()
        .eq('user_id', user.id)
        .eq('song_id', song.encodeId);
        
      if (error) {
        console.error("Error removing like", error);
        // Revert on error
        setLikedSongs(prev => [song, ...prev]);
      }
    } else {
      setLikedSongs(prev => [song, ...prev]);
      
      // Update Database
      const { error } = await supabase
        .from('liked_songs')
        .insert({
          user_id: user.id,
          song_id: song.encodeId,
          song_data: song
        });
        
      if (error) {
        console.error("Error adding like", error);
        // Revert on error
        setLikedSongs(prev => prev.filter(s => s.encodeId !== song.encodeId));
      }
    }
  };

  return (
    <LikedSongsContext.Provider value={{ likedSongs, isLiked, toggleLike, loading }}>
      {children}
    </LikedSongsContext.Provider>
  );
};

export const useLikedSongs = () => {
  const context = useContext(LikedSongsContext);
  if (!context) throw new Error("useLikedSongs must be used within LikedSongsProvider");
  return context;
};
