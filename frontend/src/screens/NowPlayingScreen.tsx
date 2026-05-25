import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, FlatList, ActivityIndicator, Dimensions } from 'react-native';
import { ChevronDown, Play, Music } from 'lucide-react-native';
import { usePlayer, Song } from '../context/PlayerContext';

interface LyricLine {
  text: string;
  startTime: number;
  endTime: number;
}

interface NowPlayingScreenProps {
  onClose: () => void;
}

export default function NowPlayingScreen({ onClose }: NowPlayingScreenProps) {
  const { currentSong, progress, playSongList } = usePlayer();
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [artistSongs, setArtistSongs] = useState<Song[]>([]);
  const [loadingLyrics, setLoadingLyrics] = useState(true);
  const [loadingSongs, setLoadingSongs] = useState(true);

  const scrollViewRef = useRef<ScrollView>(null);
  const lyricsContainerRef = useRef<View>(null);

  // Parse lyrics
  useEffect(() => {
    if (!currentSong) return;
    setLoadingLyrics(true);
    fetch(`http://localhost:5555/api/lyric?id=${currentSong.encodeId}`)
      .then(res => res.json())
      .then(data => {
        if (data?.data?.sentences) {
          const lines = data.data.sentences.map((s: any) => {
            const words = s.words || [];
            return {
              text: words.map((w: any) => w.data).join(' '),
              startTime: words[0]?.startTime || 0,
              endTime: words[words.length - 1]?.endTime || 0
            };
          });
          setLyrics(lines);
        } else {
          setLyrics([]);
        }
      })
      .catch(e => console.error(e))
      .finally(() => setLoadingLyrics(false));
  }, [currentSong?.encodeId]);

  // Fetch artist songs
  useEffect(() => {
    const artistId = currentSong?.artists?.[0]?.id;
    if (!artistId) {
       setLoadingSongs(false);
       return;
    }
    setLoadingSongs(true);
    fetch(`http://localhost:5555/api/artist-songs?id=${artistId}&page=1&count=20`)
      .then(res => res.json())
      .then(data => {
        if (data?.data?.items) {
          setArtistSongs(data.data.items);
        }
      })
      .catch(e => console.error(e))
      .finally(() => setLoadingSongs(false));
  }, [currentSong?.artists]);

  if (!currentSong) return null;

  const currentTimeMs = progress * (currentSong.duration || 180) * 1000;
  
  // Find active line index
  let activeIndex = -1;
  for (let i = 0; i < lyrics.length; i++) {
    if (currentTimeMs >= lyrics[i].startTime && currentTimeMs <= lyrics[i].endTime) {
      activeIndex = i;
      break;
    } else if (currentTimeMs > lyrics[i].startTime) {
      activeIndex = i; // keep updating to last passed line
    }
  }

  // Auto scroll lyrics (simplistic approach based on activeIndex)
  useEffect(() => {
    if (activeIndex >= 0 && scrollViewRef.current) {
      // scroll roughly to the active line position
      scrollViewRef.current.scrollTo({ y: Math.max(0, activeIndex * 40 - 150), animated: true });
    }
  }, [activeIndex]);

  const renderSongItem = ({ item, index }: { item: Song, index: number }) => (
    <TouchableOpacity 
      style={styles.songItem}
      onPress={() => playSongList(artistSongs, index)}
    >
      <Image source={{ uri: item.thumbnailM || item.thumbnail }} style={styles.songItemThumb} />
      <View style={styles.songItemInfo}>
        <Text style={[styles.songItemTitle, item.encodeId === currentSong.encodeId && { color: '#1db954' }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.songItemArtist} numberOfLines={1}>
          {item.artistsNames}
        </Text>
      </View>
      <Play color="#fff" size={16} style={styles.songItemPlay} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Top Bar / Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <ChevronDown color="#fff" size={28} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        
        {/* Left Side: Artwork & Details */}
        <View style={styles.leftPane}>
          <Image source={{ uri: currentSong.thumbnailM || currentSong.thumbnail }} style={styles.mainCover} />
          <Text style={styles.mainTitle}>{currentSong.title}</Text>
          <Text style={styles.mainArtist}>{currentSong.artistsNames}</Text>
        </View>

        {/* Right Side: Lyrics & Queue */}
        <View style={styles.rightPane}>
          
          {/* Lyrics Section */}
          <View style={styles.lyricsSection}>
            <Text style={styles.sectionTitle}>Lời bài hát</Text>
            {loadingLyrics ? (
              <ActivityIndicator color="#1db954" style={{ marginTop: 40 }} />
            ) : lyrics.length > 0 ? (
              <ScrollView 
                ref={scrollViewRef} 
                style={styles.lyricsScroll}
                showsVerticalScrollIndicator={false}
              >
                {lyrics.map((line, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <Text 
                      key={idx} 
                      style={[
                        styles.lyricLine, 
                        isActive && styles.activeLyricLine
                      ]}
                    >
                      {line.text}
                    </Text>
                  );
                })}
                <View style={{ height: 200 }} /> 
              </ScrollView>
            ) : (
              <View style={styles.noDataBox}>
                <Music color="#b3b3b3" size={32} />
                <Text style={styles.noDataText}>Không có lời bài hát</Text>
              </View>
            )}
          </View>

          {/* More from Artist Section */}
          <View style={styles.queueSection}>
            <Text style={styles.sectionTitle}>Cùng ca sĩ: {currentSong.artists?.[0]?.name}</Text>
            {loadingSongs ? (
              <ActivityIndicator color="#1db954" style={{ marginTop: 20 }} />
            ) : artistSongs.length > 0 ? (
              <FlatList
                data={artistSongs}
                keyExtractor={(item) => item.encodeId}
                renderItem={renderSongItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              />
            ) : (
              <Text style={styles.noDataText}>Không tìm thấy bài hát nào khác</Text>
            )}
          </View>

        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 24,
    borderRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  closeBtn: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 32,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    gap: 40,
  },
  leftPane: {
    flex: 1,
    maxWidth: 450,
    alignItems: 'flex-start',
  },
  mainCover: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  mainTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  mainArtist: {
    color: '#b3b3b3',
    fontSize: 16,
    fontWeight: '500',
  },
  rightPane: {
    flex: 1.5,
    flexDirection: 'column',
    gap: 30,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  lyricsSection: {
    flex: 1,
    backgroundColor: '#282828',
    borderRadius: 8,
    padding: 24,
    overflow: 'hidden',
  },
  lyricsScroll: {
    flex: 1,
  },
  lyricLine: {
    color: '#b3b3b3',
    fontWeight: '700',
    fontSize: 24,
    lineHeight: 38,
    marginBottom: 10,
  },
  activeLyricLine: {
    color: '#fff',
    fontSize: 26,
  },
  queueSection: {
    flex: 1,
    backgroundColor: '#181818',
    borderRadius: 8,
    padding: 24,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  songItemThumb: {
    width: 48,
    height: 48,
    borderRadius: 4,
  },
  songItemInfo: {
    flex: 1,
    marginLeft: 14,
  },
  songItemTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  songItemArtist: {
    color: '#b3b3b3',
    fontSize: 13,
  },
  songItemPlay: {
    opacity: 0.5,
  },
  noDataBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  noDataText: {
    color: '#b3b3b3',
    fontSize: 14,
  }
});
