import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, Platform, TextInput } from 'react-native';
import { Play, Clock, Heart, PlusCircle, MoreHorizontal, ArrowLeft, Search, X } from 'lucide-react-native';
import { usePlayer } from '../context/PlayerContext';
import { useLikedSongs } from '../context/LikedSongsContext';
import TopBar from '../components/TopBar';
import AddToPlaylistModal from '../components/AddToPlaylistModal';

interface PlaylistScreenProps {
  playlistId: string;
  onBack?: () => void;
}

export default function PlaylistScreen({ playlistId, onBack }: PlaylistScreenProps) {
  const [playlist, setPlaylist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [songToAdd, setSongToAdd] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { playSongList, currentSong } = usePlayer();
  const { likedSongs, toggleLike } = useLikedSongs();

  useEffect(() => {
    fetch(`http://localhost:5555/api/detail-playlist?id=${playlistId}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setPlaylist(data?.data);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, [playlistId]);

  const songs = playlist?.song?.items || [];
  
  const filteredSongs = songs.filter((song: any) => 
    (song.title && song.title.toLowerCase().includes(searchQuery.toLowerCase())) || 
    (song.artistsNames && song.artistsNames.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderSong = ({ item, index }: { item: any, index: number }) => {
    const isHovered = hoveredItem === item.encodeId;
    const isPlaying = currentSong?.encodeId === item.encodeId;
    const isLiked = likedSongs.some(song => song.encodeId === item.encodeId);

    return (
      <TouchableOpacity
        style={[styles.songRow, isHovered && styles.songRowHovered]}
        onPress={() => playSongList(songs, index)}
        onMouseEnter={() => Platform.OS === 'web' && setHoveredItem(item.encodeId)}
        onMouseLeave={() => Platform.OS === 'web' && setHoveredItem(null)}
        activeOpacity={1}
      >
        {/* Column 1: Index / Play Button */}
        <View style={styles.indexCol}>
          {isHovered ? (
            <Play color="#fff" size={16} fill="#fff" />
          ) : (
            <Text style={[styles.indexText, isPlaying && styles.playingText]}>{index + 1}</Text>
          )}
        </View>

        {/* Column 2: Title & Artist */}
        <View style={styles.titleCol}>
          <Image source={{ uri: item.thumbnailM }} style={styles.songImage} />
          <View style={styles.songInfo}>
            <Text style={[styles.songTitle, isPlaying && styles.playingText]} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.songArtist} numberOfLines={1}>{item.artistsNames}</Text>
          </View>
        </View>

        {/* Column 3: Album */}
        <View style={styles.albumCol}>
          <Text style={styles.albumText} numberOfLines={1}>{item.album?.title || item.artistsNames}</Text>
        </View>

        {/* Column 4: Date Added */}
        <View style={styles.dateCol}>
          <Text style={styles.albumText}>2 days ago</Text>
        </View>

        {/* Column 5: Duration & Actions */}
        <View style={styles.durationCol}>
          {isHovered && (
            <TouchableOpacity onPress={(e) => { e.stopPropagation(); setSongToAdd(item); }} style={{ marginRight: 16 }}>
              <PlusCircle color="#b3b3b3" size={18} />
            </TouchableOpacity>
          )}
          {(isHovered || isLiked) && (
            <TouchableOpacity 
              onPress={(e) => { e.stopPropagation(); toggleLike(item); }} 
              style={{ marginRight: 16 }}
            >
              <Heart color={isLiked ? "#1db954" : "#b3b3b3"} size={16} fill={isLiked ? "#1db954" : "none"} />
            </TouchableOpacity>
          )}
          <Text style={styles.durationText}>
            {Math.floor((item.duration || 0) / 60)}:{(String((item.duration || 0) % 60)).padStart(2, '0')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading || !playlist) {
    return (
      <View style={styles.container}>
        <TopBar />
        <ActivityIndicator size="large" color="#1db954" style={{ marginTop: 150 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar />

      <FlatList
        data={filteredSongs}
        keyExtractor={(item) => item.encodeId}
        renderItem={renderSong}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={(
          <View style={styles.headerContainer}>
            <View style={[styles.topRow, { marginBottom: 0 }]}>
              <TouchableOpacity onPress={onBack} style={styles.backButton}>
                <ArrowLeft color="#fff" size={24} />
              </TouchableOpacity>
              <Text style={styles.headerType}>Playlist</Text>
            </View>
            <View style={styles.header}>
              <Image source={{ uri: playlist.thumbnailM }} style={styles.headerImage} />
              <View style={styles.headerInfo}>
                <Text style={styles.headerTitle} numberOfLines={2}>{playlist.title}</Text>
                <Text style={styles.headerDesc}>{playlist.sortDescription}</Text>
                <Text style={styles.headerMeta}>
                  <Text style={{ fontWeight: 'bold', color: '#fff' }}>{playlist.artistsNames || 'Zing MP3'}</Text> • {playlist.song?.total} songs
                </Text>
              </View>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.playButton} onPress={() => filteredSongs.length > 0 && playSongList(filteredSongs, 0)}>
                <Play color="#000" size={28} fill="#000" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
              <Heart color="#b3b3b3" size={32} style={{ marginHorizontal: 24 }} />
              <MoreHorizontal color="#b3b3b3" size={32} />

              <View style={styles.filterContainer}>
                <Search color="#b3b3b3" size={20} style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.filterInput}
                  placeholder="Find in playlist"
                  placeholderTextColor="#b3b3b3"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery ? (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <X color="#b3b3b3" size={20} />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            <View style={styles.listHeader}>
              <Text style={[styles.listHeaderText, styles.indexCol]}>#</Text>
              <Text style={[styles.listHeaderText, styles.titleCol]}>TITLE</Text>
              <Text style={[styles.listHeaderText, styles.albumCol]}>ALBUM</Text>
              <Text style={[styles.listHeaderText, styles.dateCol]}>DATE ADDED</Text>
              <View style={styles.durationColHeader}>
                <Clock color="#b3b3b3" size={16} />
              </View>
            </View>
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
  headerContainer: {
    backgroundColor: '#1f1f1f',
    padding: 32,
    paddingTop: 80, // Below TopBar
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerImage: {
    width: 232,
    height: 232,
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
    fontSize: 20,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 96,
    fontWeight: '900',
    lineHeight: 96,
    letterSpacing: -2,
    marginBottom: 24,
  },
  headerDesc: {
    color: '#b3b3b3',
    fontSize: 14,
    marginBottom: 8,
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
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    paddingHorizontal: 12,
    height: 40,
    flex: 1,
    marginLeft: 'auto',
    maxWidth: 250,
  },
  filterInput: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    outlineStyle: 'none',
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
});
