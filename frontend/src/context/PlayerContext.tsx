import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { View, Text } from 'react-native';

export interface Song {
  encodeId: string;
  title: string;
  artistsNames: string;
  thumbnailM?: string;
  thumbnail?: string;
  duration?: number;
}

interface PlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  playSong: (song: Song) => void;
  playSongList: (songs: Song[], startIndex: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  pause: () => void;
  resume: () => void;
  seekTo: (positionMillis: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  sound: Audio.Sound | null;
  progress: number;
  currentTime: number;
  volume: number;
  isShuffle: boolean;
  toggleShuffle: () => void;
  repeatMode: 'off' | 'all' | 'one';
  toggleRepeat: () => void;
  showToast: (message: string, type?: 'error' | 'success' | 'info') => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [toast, setToast] = useState<{ message: string, type: 'error' | 'success' | 'info' } | null>(null);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off'|'all'|'one'>('off');

  const queueRef = useRef<Song[]>([]);
  const queueIndexRef = useRef<number>(-1);
  const soundRef = useRef<Audio.Sound | null>(null);
  const volumeRef = useRef(1);
  const isShuffleRef = useRef(false);
  const repeatModeRef = useRef<'off'|'all'|'one'>('off');

  const _loadAndPlay = async (song: Song) => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    
    setCurrentSong(song);
    setIsPlaying(true);
    setProgress(0);
    setCurrentTime(0);

    try {
      // Fetch stream URL first to check for VIP or availability errors
      const res = await fetch(`http://localhost:5555/api/song?id=${song.encodeId}`);
      const data = await res.json();
      
      const streamUrl = data?.data?.['128'];
      
      if (!streamUrl || typeof streamUrl !== 'string') {
        showToast(`Bỏ qua bài VIP: ${song.title}`, 'error');
        
        // Automatically skip to the next song if this one fails to load
        setTimeout(() => {
          _playNextRef();
        }, 1500);
        return;
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: streamUrl },
        { shouldPlay: true, volume: volumeRef.current },
        (status) => {
          if (status.isLoaded) {
            setIsPlaying(status.isPlaying);
            if (status.durationMillis) {
              setProgress(status.positionMillis / status.durationMillis);
            }
            setCurrentTime(status.positionMillis);
            
            // Auto skip when song finishes
            if (status.didJustFinish) {
              _playNextRef();
            }
          }
        }
      );
      soundRef.current = newSound;
      setSound(newSound);
    } catch (e) {
      console.error("Failed to play song", e);
      setIsPlaying(false);
      setTimeout(() => {
        _playNextRef();
      }, 1500);
    }
  };

  const _playNextRef = () => {
    if (queueRef.current.length === 0) return;

    if (repeatModeRef.current === 'one') {
      _loadAndPlay(queueRef.current[queueIndexRef.current]);
      return;
    }

    let nextIndex = queueIndexRef.current + 1;

    if (isShuffleRef.current) {
      if (queueRef.current.length > 1) {
        // Pick random different song
        let random;
        do {
          random = Math.floor(Math.random() * queueRef.current.length);
        } while (random === queueIndexRef.current);
        nextIndex = random;
      } else {
        nextIndex = 0;
      }
    }

    if (nextIndex >= queueRef.current.length) {
      if (repeatModeRef.current === 'all') {
        nextIndex = 0;
      } else {
        setIsPlaying(false);
        return;
      }
    }

    queueIndexRef.current = nextIndex;
    _loadAndPlay(queueRef.current[nextIndex]);
  };

  const playSong = async (song: Song) => {
    queueRef.current = [song];
    queueIndexRef.current = 0;
    await _loadAndPlay(song);
  };

  const playSongList = async (songs: Song[], startIndex: number) => {
    if (songs.length === 0 || startIndex < 0 || startIndex >= songs.length) return;
    queueRef.current = songs;
    queueIndexRef.current = startIndex;
    await _loadAndPlay(songs[startIndex]);
  };

  const playNext = () => {
    _playNextRef();
  };

  const playPrevious = async () => {
    if (queueRef.current.length === 0) return;

    if (currentTime > 3000 && soundRef.current) {
      // If played more than 3 seconds, previous goes to start of song
      await soundRef.current.setPositionAsync(0);
      return;
    }

    let prevIndex = queueIndexRef.current - 1;
    
    if (isShuffleRef.current) {
      if (queueRef.current.length > 1) {
        let random;
        do {
          random = Math.floor(Math.random() * queueRef.current.length);
        } while (random === queueIndexRef.current);
        prevIndex = random;
      } else {
        prevIndex = 0;
      }
    } else if (prevIndex < 0) {
      if (repeatModeRef.current === 'all') {
        prevIndex = queueRef.current.length - 1;
      } else {
        prevIndex = 0;
      }
    }

    queueIndexRef.current = prevIndex;
    await _loadAndPlay(queueRef.current[prevIndex]);
  };

  const pause = async () => {
    if (soundRef.current) {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
    }
  };

  const resume = async () => {
    if (soundRef.current) {
      await soundRef.current.playAsync();
      setIsPlaying(true);
    }
  };

  const seekTo = async (positionMillis: number) => {
    if (soundRef.current) {
      await soundRef.current.setPositionAsync(positionMillis);
      setCurrentTime(positionMillis);
      if (currentSong?.duration) {
        setProgress(positionMillis / (currentSong.duration * 1000));
      }
    }
  };

  const setVolume = async (newVolume: number) => {
    volumeRef.current = newVolume;
    if (soundRef.current) {
      await soundRef.current.setVolumeAsync(newVolume);
    }
    setVolumeState(newVolume);
  };

  const toggleShuffle = () => {
    const newShuffle = !isShuffle;
    setIsShuffle(newShuffle);
    isShuffleRef.current = newShuffle;
  };

  const toggleRepeat = () => {
    const nextMode = repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off';
    setRepeatMode(nextMode);
    repeatModeRef.current = nextMode;
  };

  const showToast = (message: string, type: 'error' | 'success' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  return (
    <PlayerContext.Provider value={{ 
      currentSong, isPlaying, playSong, playSongList, playNext, playPrevious,
      pause, resume, seekTo, setVolume, sound, progress, currentTime, volume,
      isShuffle, toggleShuffle, repeatMode, toggleRepeat, showToast
    }}>
      {children}
      {toast && (
        <View style={{
          position: 'absolute',
          top: 40,
          left: '50%',
          transform: [{ translateX: '-50%' }],
          backgroundColor: toast.type === 'error' ? '#e22134' : toast.type === 'success' ? '#1db954' : '#333',
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 8,
          zIndex: 9999,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 5,
          elevation: 6
        }}>
          <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>{toast.message}</Text>
        </View>
      )}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error("usePlayer must be used within PlayerProvider");
  return context;
};
