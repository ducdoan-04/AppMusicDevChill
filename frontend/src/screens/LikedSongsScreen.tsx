import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Play, Clock, Heart, PlusCircle, MoreHorizontal } from 'lucide-react-native';
import { usePlayer } from '../context/PlayerContext';
import { useLikedSongs } from '../context/LikedSongsContext';
import TopBar from '../components/TopBar';
import AddToPlaylistModal from '../components/AddToPlaylistModal';

export default function LikedSongsScreen() {
  const { likedSongs, loading, toggleLike } = useLikedSongs();
  const { playSongList, currentSong } = usePlayer();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [songToAdd, setSongToAdd] = useState<any>(null);

  if (loading) {
    return (
      <View style={styles.container}>
        <TopBar />
        <ActivityIndicator size="large" color="#1db954" style={{ marginTop: 150 }} />
      </View>
    );
  }

  const renderSong = ({ item, index }: { item: any, index: number }) => {
    const isHovered = hoveredItem === item.encodeId;
    const isPlaying = currentSong?.encodeId === item.encodeId;

    return (
      <TouchableOpacity
        style={[styles.songRow, isHovered && styles.songRowHovered]}
        onPress={() => playSongList(likedSongs, index)}
        onMouseEnter={() => Platform.OS === 'web' && setHoveredItem(item.encodeId)}
        onMouseLeave={() => Platform.OS === 'web' && setHoveredItem(null)}
        activeOpacity={1}
      >
        <View style={styles.indexCol}>
          {isHovered ? (
            <Play color="#fff" size={16} fill="#fff" />
          ) : (
            <Text style={[styles.indexText, isPlaying && styles.playingText]}>{index + 1}</Text>
          )}
        </View>

        <View style={styles.titleCol}>
          <Image source={{ uri: item.thumbnailM || item.thumbnail }} style={styles.songImage} />
          <View style={styles.songInfo}>
            <Text style={[styles.songTitle, isPlaying && styles.playingText]} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.songArtist} numberOfLines={1}>{item.artistsNames}</Text>
          </View>
        </View>

        <View style={styles.albumCol}>
          <Text style={styles.albumText} numberOfLines={1}>{item.album?.title || item.artistsNames}</Text>
        </View>

        <View style={styles.dateCol}>
          <Text style={styles.albumText}>Recently added</Text>
        </View>

        <View style={styles.durationCol}>
          {isHovered && (
            <TouchableOpacity onPress={(e) => { e.stopPropagation(); setSongToAdd(item); }} style={{ marginRight: 16 }}>
              <PlusCircle color="#b3b3b3" size={18} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={(e) => { e.stopPropagation(); toggleLike(item); }} style={{ marginRight: 16 }}>
            <Heart color="#1db954" size={16} fill="#1db954" />
          </TouchableOpacity>
          <Text style={styles.durationText}>
            {Math.floor((item.duration || 0) / 60)}:{(String((item.duration || 0) % 60)).padStart(2, '0')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TopBar />

      <FlatList
        data={likedSongs}
        keyExtractor={(item) => item.encodeId}
        renderItem={renderSong}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Heart color="#b3b3b3" size={40} fill="#f74f4fff" style={{ marginBottom: 24 }} />
            <Text style={styles.emptyTitle}>Chưa có bài hát yêu thích nào</Text>
            <Text style={styles.emptySub}>Hãy tìm kiếm và nhấn nút Trái Tim để lưu vào đây nhé.</Text>
          </View>
        )}
        ListHeaderComponent={(
          <View>
            <View style={styles.header}>
              <View style={styles.headerImagePlaceholder}>
                <Heart color="#fff" size={40} fill="#f74f4fff" />
              </View>
              <View style={styles.headerInfo}>
                <Text style={styles.headerType}>Playlist</Text>
                <Text style={styles.headerTitle} numberOfLines={2}>Bài Hát Yêu Thích</Text>
                <Text style={styles.headerMeta}>
                  {likedSongs.length} bài hát
                </Text>
              </View>
            </View>

            {likedSongs.length > 0 && (
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.playButton} onPress={() => playSongList(likedSongs, 0)}>
                  <Play color="#000" size={28} fill="#000" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
            )}

            {likedSongs.length > 0 && (
              <View style={styles.listHeader}>
                <Text style={[styles.listHeaderText, styles.indexCol]}>#</Text>
                <Text style={[styles.listHeaderText, styles.titleCol]}>TITLE</Text>
                <Text style={[styles.listHeaderText, styles.albumCol]}>ALBUM</Text>
                <Text style={[styles.listHeaderText, styles.dateCol]}>DATE ADDED</Text>
                <View style={styles.durationColHeader}>
                  <Clock color="#b3b3b3" size={16} />
                </View>
              </View>
            )}
          </View>
        )}
      />

      <AddToPlaylistModal 
        visible={!!songToAdd} 
        song={songToAdd} 
        onClose={() => setSongToAdd(null)} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 32,
    paddingTop: 80,
    backgroundColor: '#4a388b', // Unique purple color for Liked Songs
    // @ts-ignore
    backgroundImage: 'url("/uploads/images/covers/1.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  },
  headerImagePlaceholder: {
    width: 232,
    height: 232,
    backgroundColor: 'linear-gradient(135deg, #450af5, #c4efd9)',
    // @ts-ignore
    backgroundImage: 'url("/uploads/images/poster/4.png")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  headerInfo: {
    marginLeft: 24,
    flex: 1,
  },
  headerType: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 96,
    fontWeight: '900',
    lineHeight: 96,
    letterSpacing: -2,
    marginBottom: 24,
  },
  headerMeta: {
    color: '#b3b3b3',
    fontSize: 14,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1db954',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: 40,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#282828',
    marginBottom: 16,
    paddingHorizontal: 32,
  },
  listHeaderText: {
    color: '#b3b3b3',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 32,
    borderRadius: 4,
  },
  songRowHovered: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  indexCol: {
    width: 32,
    justifyContent: 'center',
  },
  indexText: {
    color: '#b3b3b3',
    fontSize: 14,
  },
  titleCol: {
    flex: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  albumCol: {
    flex: 4,
  },
  dateCol: {
    flex: 3,
  },
  durationCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 100,
  },
  durationColHeader: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 100,
    paddingRight: 16,
  },
  playingText: {
    color: '#1db954',
  },
  songImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 16,
  },
  songInfo: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 16,
  },
  songTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  songArtist: {
    color: '#b3b3b3',
    fontSize: 14,
  },
  albumText: {
    color: '#b3b3b3',
    fontSize: 14,
  },
  durationText: {
    color: '#b3b3b3',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySub: {
    color: '#b3b3b3',
    fontSize: 14,
  }
});
