import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface Playlist {
  id: string;
  title: string;
  cover_image: string;
  post_image?: string;
  created_at: string;
  user_id: string;
}

export interface PlaylistSong {
  id: string;
  playlist_id: string;
  song_id: string;
  song_data: any;
  added_at: string;
}

interface UserPlaylistsContextType {
  playlists: Playlist[];
  loading: boolean;
  createPlaylist: (title: string) => Promise<Playlist | null>;
  updatePlaylist: (id: string, updates: { title?: string, cover_image?: string, post_image?: string }) => Promise<Playlist | null>;
  deletePlaylist: (id: string) => Promise<void>;
  fetchPlaylistSongs: (playlistId: string) => Promise<PlaylistSong[]>;
  addSongToPlaylist: (playlistId: string, song: any) => Promise<void>;
  removeSongFromPlaylist: (playlistId: string, songId: string) => Promise<void>;
}

const UserPlaylistsContext = createContext<UserPlaylistsContextType | undefined>(undefined);

export const UserPlaylistsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPlaylists();
    } else {
      setPlaylists([]);
      setLoading(false);
    }
  }, [user]);

  const fetchPlaylists = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_playlists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlaylists(data || []);
    } catch (error) {
      console.error('Error fetching user playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPlaylist = async (title: string) => {
    if (!user) return null;

    // Randomly select cover image from covers (1-7) or poster (1-5)
    // To match what user mentioned: /uploads/images/covers/1.jpg or /uploads/images/poster/1.jpg
    const isCover = Math.random() > 0.5;
    const randomIdx = isCover ? Math.floor(Math.random() * 7) + 1 : Math.floor(Math.random() * 5) + 1;
    const folder = isCover ? 'covers' : 'poster';
    const ext = folder === 'poster' && randomIdx > 3 ? 'png' : 'jpg'; // From list_dir, posters 4 & 5 are png
    const coverImage = `/uploads/images/${folder}/${randomIdx}.${ext}`;

    try {
      const { data, error } = await supabase
        .from('user_playlists')
        .insert({
          user_id: user.id,
          title,
          cover_image: coverImage
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setPlaylists([data, ...playlists]);
        return data;
      }
    } catch (error) {
      console.error('Error creating playlist:', error);
    }
    return null;
  };

  const deletePlaylist = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_playlists')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setPlaylists(playlists.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting playlist:', error);
    }
  };

  const updatePlaylist = async (id: string, updates: { title?: string, cover_image?: string, post_image?: string }) => {
    try {
      const { data, error } = await supabase
        .from('user_playlists')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setPlaylists(playlists.map(p => p.id === id ? data : p));
        return data;
      }
    } catch (error) {
      console.error('Error updating playlist:', error);
    }
    return null;
  };

  const fetchPlaylistSongs = async (playlistId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_playlist_songs')
        .select('*')
        .eq('playlist_id', playlistId)
        .order('added_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching playlist songs:', error);
      return [];
    }
  };

  const addSongToPlaylist = async (playlistId: string, song: any) => {
    try {
      const { error } = await supabase
        .from('user_playlist_songs')
        .insert({
          playlist_id: playlistId,
          song_id: song.encodeId,
          song_data: song
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error adding song to playlist:', error);
    }
  };

  const removeSongFromPlaylist = async (playlistId: string, songId: string) => {
    try {
      const { error } = await supabase
        .from('user_playlist_songs')
        .delete()
        .match({ playlist_id: playlistId, song_id: songId });

      if (error) throw error;
    } catch (error) {
      console.error('Error removing song from playlist:', error);
    }
  };

  return (
    <UserPlaylistsContext.Provider
      value={{
        playlists,
        loading,
        createPlaylist,
        updatePlaylist,
        deletePlaylist,
        fetchPlaylistSongs,
        addSongToPlaylist,
        removeSongFromPlaylist
      }}
    >
      {children}
    </UserPlaylistsContext.Provider>
  );
};

export const useUserPlaylists = () => {
  const context = useContext(UserPlaylistsContext);
  if (context === undefined) {
    throw new Error('useUserPlaylists must be used within a UserPlaylistsProvider');
  }
  return context;
};
