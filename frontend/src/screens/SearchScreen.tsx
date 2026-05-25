import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Image, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Search, Play, Clock, Heart, PlusCircle, MoreHorizontal } from 'lucide-react-native';
import { usePlayer } from '../context/PlayerContext';
import { useLikedSongs } from '../context/LikedSongsContext';
import TopBar from '../components/TopBar';
import AddToPlaylistModal from '../components/AddToPlaylistModal';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [songToAdd, setSongToAdd] = useState<any>(null);
  const { playSongList, currentSong } = usePlayer();
  const { likedSongs, toggleLike } = useLikedSongs();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSubmittedQuery('');
      return;
    }

    const timer = setTimeout(() => {
      handleSearch(query.trim());
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = async (searchQuery: string) => {
    setSubmittedQuery(searchQuery);
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5555/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      const fetchedSongs = data?.data?.songs || [];
      
      // Sort by newest release date first
      fetchedSongs.sort((a: any, b: any) => (b.releaseDate || 0) - (a.releaseDate || 0));
      
      setResults(fetchedSongs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const renderSong = ({ item, index }: { item: any, index: number }) => {
    const isHovered = hoveredItem === item.encodeId;
    const isPlaying = currentSong?.encodeId === item.encodeId;
    const isLiked = likedSongs.some(song => song.encodeId === item.encodeId);

    return (
      <TouchableOpacity
        style={[styles.songRow, isHovered && styles.songRowHovered]}
        onPress={() => playSongList(results, index)}
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

        {/* Column 4: Date Released */}
        <View style={styles.dateCol}>
          <Text style={styles.albumText}>
            {item.releaseDate ? new Date(item.releaseDate * 1000).toLocaleDateString() : ''}
          </Text>
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

  return (
    <View style={styles.container}>
      <TopBar>
        <View style={styles.searchBar}>
          <Search color="#121212" size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="What do you want to listen to?"
            placeholderTextColor="#757575"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
        </View>
      </TopBar>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#1db954" style={{ marginTop: 150 }} />
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.encodeId}
            renderItem={renderSong}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false} //xóa thanh sroll
            ListHeaderComponent={() => (
              results.length > 0 ? (
                <View style={styles.listHeader}>
                  <Text style={[styles.headerText, styles.indexCol]}>#</Text>
                  <Text style={[styles.headerText, styles.titleCol]}>TITLE</Text>
                  <Text style={[styles.headerText, styles.albumCol]}>ALBUM</Text>
                  <Text style={[styles.headerText, styles.dateCol]}>DATE ADDED</Text>
                  <View style={styles.durationColHeader}>
                    <Clock color="#b3b3b3" size={16} />
                  </View>
                </View>
              ) : null
            )}
            ListEmptyComponent={() => (
              submittedQuery && !loading ? <Text style={styles.emptyText}>No results found for "{submittedQuery}"</Text> : null
            )}
          />
        )}
      </View>

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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 12,
    height: 40,
    width: 360,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#000',
    fontSize: 14,
    fontWeight: '500',
    outlineStyle: 'none',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    marginTop: 64, // below top bar
  },
  listContent: {
    paddingBottom: 40,
    paddingTop: 16,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#282828',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  headerText: {
    color: '#b3b3b3',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
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
  emptyText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 18,
    fontWeight: 'bold',
  }
});
