import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, PanResponder, Platform } from 'react-native';
import { Play, Pause, SkipBack, SkipForward, Repeat, Repeat1, Shuffle, Volume2, Heart, ListMusic, MonitorSpeaker, Mic2, Maximize2 } from 'lucide-react-native';
import { usePlayer } from '../context/PlayerContext';
import { useLikedSongs } from '../context/LikedSongsContext';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const WebSlider = ({ value, onChange, onSeek }: { value: number, onChange: (v: number) => void, onSeek: (v: number) => void }) => {
  if (Platform.OS !== 'web') return null;
  return React.createElement('input', {
    type: 'range',
    min: '0',
    max: '1',
    step: '0.001',
    value: value,
    onChange: (e: any) => onChange(parseFloat(e.target.value)),
    onPointerUp: (e: any) => onSeek(parseFloat(e.target.value)),
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      opacity: 0,
      cursor: 'pointer',
      margin: 0,
      zIndex: 10
    }
  });
};

export default function Player({ onMaximize }: { onMaximize?: () => void }) {
  const { currentSong, isPlaying, pause, resume, progress, seekTo, volume, setVolume, playNext, playPrevious, isShuffle, toggleShuffle, repeatMode, toggleRepeat } = usePlayer();
  const { isLiked, toggleLike } = useLikedSongs();
  const { setShowLogin, user } = useAuth();
  
  // Drag states
  const [dragProgress, setDragProgress] = useState<number | null>(null);
  const [dragVolume, setDragVolume] = useState<number | null>(null);

  // Refs for tracking dimensions and drag state for native
  const progressWidthRef = useRef(0);
  const volumeWidthRef = useRef(0);
  const progressStartRef = useRef(0);
  const volumeStartRef = useRef(0);

  // PanResponder for Progress (Native only fallback)
  const progressResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => Platform.OS !== 'web',
      onMoveShouldSetPanResponder: () => Platform.OS !== 'web',
      onPanResponderGrant: (evt) => {
        if (progressWidthRef.current > 0) {
          const clickX = evt.nativeEvent.locationX;
          let initialPercentage = clickX / progressWidthRef.current;
          initialPercentage = Math.max(0, Math.min(1, initialPercentage));
          progressStartRef.current = initialPercentage;
          setDragProgress(initialPercentage);
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        if (progressWidthRef.current > 0) {
          let newPercentage = progressStartRef.current + (gestureState.dx / progressWidthRef.current);
          newPercentage = Math.max(0, Math.min(1, newPercentage));
          setDragProgress(newPercentage);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (progressWidthRef.current > 0) {
          let newPercentage = progressStartRef.current + (gestureState.dx / progressWidthRef.current);
          newPercentage = Math.max(0, Math.min(1, newPercentage));
          if (currentSong?.duration) {
            seekTo(newPercentage * currentSong.duration * 1000);
          }
        }
        setDragProgress(null);
      }
    })
  ).current;

  // PanResponder for Volume (Native only fallback)
  const volumeResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => Platform.OS !== 'web',
      onMoveShouldSetPanResponder: () => Platform.OS !== 'web',
      onPanResponderGrant: (evt) => {
        if (volumeWidthRef.current > 0) {
          const clickX = evt.nativeEvent.locationX;
          let initialPercentage = clickX / volumeWidthRef.current;
          initialPercentage = Math.max(0, Math.min(1, initialPercentage));
          volumeStartRef.current = initialPercentage;
          setDragVolume(initialPercentage);
          setVolume(initialPercentage);
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        if (volumeWidthRef.current > 0) {
          let newPercentage = volumeStartRef.current + (gestureState.dx / volumeWidthRef.current);
          newPercentage = Math.max(0, Math.min(1, newPercentage));
          setDragVolume(newPercentage);
          setVolume(newPercentage);
        }
      },
      onPanResponderRelease: () => {
        setDragVolume(null);
      }
    })
  ).current;

  if (!currentSong) return null;

  // Render variables
  const displayProgress = dragProgress !== null ? dragProgress : progress;
  const displayVolume = dragVolume !== null ? dragVolume : volume;

  return (
    <View style={styles.container}>
      {/* Left side: Song info */}
      <View style={styles.leftSection}>
        <Image source={{ uri: currentSong.thumbnailM }} style={styles.cover} />
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>{currentSong.title}</Text>
          <Text style={styles.artist} numberOfLines={1}>{currentSong.artistsNames}</Text>
        </View>
        <TouchableOpacity 
          style={styles.likeBtn} 
          onPress={() => {
            if (!user) setShowLogin(true);
            else toggleLike(currentSong);
          }}
        >
          <Heart 
            color={isLiked(currentSong.encodeId) ? "#1db954" : "#b3b3b3"} 
            size={16} 
            fill={isLiked(currentSong.encodeId) ? "#1db954" : "none"} 
          />
        </TouchableOpacity>
      </View>

      {/* Center side: Controls and Progress */}
      <View style={styles.centerSection}>
        <View style={styles.controls}>
          <TouchableOpacity style={styles.iconButton} onPress={toggleShuffle}>
            <Shuffle color={isShuffle ? "#1db954" : "#b3b3b3"} size={16} />
            {isShuffle && <View style={styles.activeDot} />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={playPrevious}>
            <SkipBack color="#b3b3b3" size={20} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.playButton} 
            onPress={isPlaying ? pause : resume}
          >
            {isPlaying ? <Pause color="#000" size={16} fill="#000" /> : <Play color="#000" size={16} fill="#000" style={{marginLeft: 2}} />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={playNext}>
            <SkipForward color="#b3b3b3" size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={toggleRepeat}>
            {repeatMode === 'one' ? (
              <Repeat1 color="#1db954" size={16} />
            ) : (
              <Repeat color={repeatMode === 'all' ? "#1db954" : "#b3b3b3"} size={16} />
            )}
            {repeatMode !== 'off' && <View style={styles.activeDot} />}
          </TouchableOpacity>
        </View>

        <View style={styles.progressRow}>
          <Text style={styles.timeText}>
            {Math.floor((displayProgress * (currentSong.duration || 180))) / 60 >= 1 ? Math.floor(displayProgress * (currentSong.duration || 180) / 60) : 0}:{String(Math.floor((displayProgress * (currentSong.duration || 180)) % 60)).padStart(2, '0')}
          </Text>
          
          {/* Progress Slider */}
          <View 
            style={styles.progressBarContainer}
            onLayout={(e) => { progressWidthRef.current = e.nativeEvent.layout.width; }}
            {...progressResponder.panHandlers}
          >
            <View pointerEvents="none" style={styles.progressTrack} />
            <View pointerEvents="none" style={[styles.progressBar, { width: `${displayProgress * 100}%`, backgroundColor: '#1db954' }]} />
            <View pointerEvents="none" style={[styles.progressDot, { left: `${displayProgress * 100}%`, opacity: 1 }]} />
            
            {/* Invisible Native HTML Slider for Web */}
            <WebSlider 
              value={displayProgress} 
              onChange={setDragProgress} 
              onSeek={(val) => {
                if (currentSong?.duration) {
                  seekTo(val * currentSong.duration * 1000);
                }
                setDragProgress(null);
              }}
            />
          </View>
          
          <Text style={styles.timeText}>
             {Math.floor((currentSong.duration || 180) / 60)}:{(String((currentSong.duration || 180) % 60)).padStart(2, '0')}
          </Text>
        </View>
      </View>

      {/* Right side: Extras (Volume, etc) */}
      <View style={styles.rightSection}>
        <TouchableOpacity style={styles.extraIconButton}>
          <Mic2 color="#b3b3b3" size={16} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.extraIconButton}>
          <ListMusic color="#b3b3b3" size={16} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.extraIconButton}>
          <MonitorSpeaker color="#b3b3b3" size={16} />
        </TouchableOpacity>
        <View style={styles.volumeContainer}>
          <TouchableOpacity style={styles.extraIconButton} onPress={() => setVolume(volume === 0 ? 1 : 0)}>
            <Volume2 color="#b3b3b3" size={16} />
          </TouchableOpacity>
          
          {/* Volume Slider */}
          <View 
            style={styles.volumeBar}
            onLayout={(e) => { volumeWidthRef.current = e.nativeEvent.layout.width; }}
            {...volumeResponder.panHandlers}
          >
             <View pointerEvents="none" style={styles.volumeTrack} />
             <View pointerEvents="none" style={[styles.volumeProgress, { width: `${displayVolume * 100}%`, backgroundColor: '#1db954' }]} />
             <View pointerEvents="none" style={[styles.progressDot, { left: `${displayVolume * 100}%`, opacity: 1 }]} />
             
             {/* Invisible Native HTML Slider for Web */}
             <WebSlider 
               value={displayVolume} 
               onChange={(val) => {
                 setDragVolume(val);
                 setVolume(val);
               }} 
               onSeek={(val) => {
                 setDragVolume(null);
                 setVolume(val);
               }}
             />
          </View>

        </View>
        <TouchableOpacity style={styles.extraIconButton} onPress={onMaximize}>
          <Maximize2 color="#b3b3b3" size={16} />
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: '#181818',
    borderTopWidth: 1,
    borderTopColor: '#282828',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    zIndex: 100,
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 180,
  },
  cover: {
    width: 56,
    height: 56,
    borderRadius: 4,
  },
  info: {
    marginLeft: 14,
    justifyContent: 'center',
    marginRight: 14,
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  artist: {
    color: '#b3b3b3',
    fontSize: 11,
  },
  likeBtn: {
    padding: 8,
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 722,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 16,
  },
  iconButton: {
    padding: 8,
    position: 'relative',
    alignItems: 'center',
  },
  activeDot: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1db954',
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  timeText: {
    color: '#a7a7a7',
    fontSize: 11,
    width: 40,
    textAlign: 'center',
  },
  progressBarContainer: {
    flex: 1,
    marginHorizontal: 8,
    position: 'relative',
    justifyContent: 'center',
    paddingVertical: 10, // give bigger touch target
  },
  progressTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    marginTop: -2,
    height: 4,
    backgroundColor: '#4d4d4d',
    borderRadius: 2,
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    top: '50%',
    marginTop: -2,
    height: 4,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  progressDot: {
    position: 'absolute',
    top: '50%',
    marginTop: -6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
    marginLeft: -6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  rightSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 180,
  },
  extraIconButton: {
    padding: 8,
    marginHorizontal: 2,
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  volumeBar: {
    width: 93,
    marginLeft: 4,
    marginRight: 8,
    position: 'relative',
    justifyContent: 'center',
    paddingVertical: 10, // give bigger touch target
  },
  volumeTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    marginTop: -2,
    height: 4,
    backgroundColor: '#4d4d4d',
    borderRadius: 2,
  },
  volumeProgress: {
    position: 'absolute',
    left: 0,
    top: '50%',
    marginTop: -2,
    height: 4,
    backgroundColor: '#fff',
    borderRadius: 2,
  }
});
