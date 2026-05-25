import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, Platform, ImageBackground, TextInput } from 'react-native';
import { Play, Clock, Heart, PlusCircle, MoreHorizontal, ArrowLeft, Trash2, Search, X } from 'lucide-react-native';
import { usePlayer } from '../context/PlayerContext';
import { useUserPlaylists } from '../context/UserPlaylistsContext';
import { useLikedSongs } from '../context/LikedSongsContext';
import TopBar from '../components/TopBar';
import AddToPlaylistModal from '../components/AddToPlaylistModal';
import PromptModal from '../components/PromptModal';
import ConfirmModal from '../components/ConfirmModal';
import EditPlaylistModal from '../components/EditPlaylistModal';

export default function UserPlaylistScreen({ playlist, onBack }: any) {
  const { fetchPlaylistSongs, removeSongFromPlaylist, deletePlaylist, updatePlaylist, playlists, addSongToPlaylist } = useUserPlaylists();
  const { playSongList, currentSong } = usePlayer();
  const { likedSongs, toggleLike } = useLikedSongs();
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [songToAdd, setSongToAdd] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const currentPlaylist = playlists.find(p => p.id === playlist.id) || playlist;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearchSongs(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSongs = async (query: string) => {
    setSearchLoading(true);
    try {
      const res = await fetch(`http://localhost:5555/api/search?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      setSearchResults(data?.data?.songs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    loadSongs();
  }, [currentPlaylist.id]);

  const loadSongs = async () => {
    setLoading(true);
    const data = await fetchPlaylistSongs(playlist.id);
    setSongs(data);
    setLoading(false);
  };

  const handleRemoveSong = async (songId: string) => {
    await removeSongFromPlaylist(playlist.id, songId);
    setSongs(songs.filter(s => s.song_id !== songId));
  };

  const handleDeletePlaylist = async () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteModal(false);
    await deletePlaylist(currentPlaylist.id);
    onBack();
  };

  const handleEditPlaylist = async () => {
    setShowEditModal(true);
  };

  const handleConfirmEdit = async (updates: { title: string, cover_image?: string, post_image?: string }) => {
    setShowEditModal(false);
    if (updates.title && updates.title.trim()) {
      await updatePlaylist(currentPlaylist.id, {
        title: updates.title.trim(),
        cover_image: updates.cover_image,
        post_image: updates.post_image
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <TopBar />
        <ActivityIndicator size="large" color="#1db954" style={{ marginTop: 150 }} />
      </View>
    );
  }

  const renderSong = ({ item, index }: { item: any, index: number }) => {
    const songData = item.song_data;
    const isHovered = hoveredItem === item.song_id;
    const isPlaying = currentSong?.encodeId === item.song_id;
    const isLiked = likedSongs.some(s => s.encodeId === item.song_id);

    return (
      <TouchableOpacity
        style={[styles.songRow, isHovered && styles.songRowHovered]}
        onPress={() => playSongList(songs.map(s => s.song_data), index)}
        onMouseEnter={() => Platform.OS === 'web' && setHoveredItem(item.song_id)}
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
          <Image source={{ uri: songData.thumbnailM || songData.thumbnail }} style={styles.songImage} />
          <View style={styles.songInfo}>
            <Text style={[styles.songTitle, isPlaying && styles.playingText]} numberOfLines={1}>{songData.title}</Text>
            <Text style={styles.songArtist} numberOfLines={1}>{songData.artistsNames}</Text>
          </View>
        </View>

        <View style={styles.albumCol}>
          <Text style={styles.albumText} numberOfLines={1}>{songData.album?.title || songData.artistsNames}</Text>
        </View>

        <View style={styles.dateCol}>
          <Text style={styles.albumText}>{new Date(item.added_at).toLocaleDateString()}</Text>
        </View>

        <View style={styles.durationCol}>
          {isHovered && (
            <TouchableOpacity onPress={(e) => { e.stopPropagation(); setSongToAdd(songData); }} style={{ marginRight: 16 }}>
              <PlusCircle color="#b3b3b3" size={18} />
            </TouchableOpacity>
          )}
          {(isHovered || isLiked) && (
            <TouchableOpacity
              onPress={(e) => { e.stopPropagation(); toggleLike(songData); }}
              style={{ marginRight: 16 }}
            >
              <Heart color={isLiked ? "#1db954" : "#b3b3b3"} size={16} fill={isLiked ? "#1db954" : "none"} />
            </TouchableOpacity>
          )}
          <Text style={styles.durationText}>
            {Math.floor((songData.duration || 0) / 60)}:{(String((songData.duration || 0) % 60)).padStart(2, '0')}
          </Text>
          {isHovered && (
            <TouchableOpacity onPress={(e) => { e.stopPropagation(); handleRemoveSong(item.song_id); }}>
              <Trash2 color="#f74f4fff" size={20} style={{ marginLeft: 16 }} />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TopBar />

      <FlatList
        data={songs}
        keyExtractor={(item) => item.song_id}
        renderItem={renderSong}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Your playlist is currently empty</Text>
            <Text style={styles.emptySub}>Find some songs to add to it!</Text>
          </View>
        )}
        ListHeaderComponent={(
          <ImageBackground
            source={currentPlaylist.post_image ? { uri: currentPlaylist.post_image } : undefined}
            style={styles.headerContainer}
            imageStyle={{ opacity: currentPlaylist.post_image ? 0.3 : 1, backgroundColor: '#333' }}
          >
            <View style={styles.topRow}>
              <TouchableOpacity onPress={onBack} style={styles.backButton}>
                <ArrowLeft color="#fff" size={24} />
              </TouchableOpacity>
              <Text style={styles.headerType}>Playlist</Text>
            </View>
            <View style={styles.header}>
              <Image source={{ uri: currentPlaylist.cover_image }} style={styles.headerImagePlaceholder} />
              <View style={styles.headerInfo}>
                <Text style={styles.headerTitle} numberOfLines={2}>{currentPlaylist.title}</Text>
                <Text style={styles.headerMeta}>
                  {songs.length} bài hát
                  <View style={styles.actionRow}>
                    {songs.length > 0 && (
                      <TouchableOpacity style={styles.playButton} onPress={() => playSongList(songs.map(s => s.song_data), 0)}>
                        <Play color="#000" size={20} fill="#000" style={{ marginLeft: 4 }} />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity style={[styles.deleteButton, { marginRight: 16 }]} onPress={handleEditPlaylist}>
                      <Text style={styles.deleteButtonText}>Edit Playlist</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePlaylist}>
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </Text>

              </View>
            </View>



            {/* <View style={styles.searchSection}>
              <Text style={styles.searchTitle}>Let's find something for your playlist</Text>
              <View style={styles.searchBar}>
                <Search color="#b3b3b3" size={20} style={{ marginRight: 12 }} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search for songs"
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

              {searchLoading ? (
                <ActivityIndicator color="#1db954" style={{ marginTop: 32 }} />
              ) : (
                <View style={styles.searchResults}>
                  {searchResults.map(song => (
                    <View key={song.encodeId} style={styles.searchResultItem}>
                      <Image source={{ uri: song.thumbnailM }} style={styles.searchResultImage} />
                      <View style={styles.searchResultInfo}>
                        <Text style={styles.searchResultTitle} numberOfLines={1}>{song.title}</Text>
                        <Text style={styles.searchResultArtist} numberOfLines={1}>{song.artistsNames}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.addButton}
                        onPress={async () => {
                          await addSongToPlaylist(currentPlaylist.id, song);
                          loadSongs();
                          setSearchQuery('');
                          setSearchResults([]);
                        }}
                      >
                        <Text style={styles.addButtonText}>Add</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View> */}

            {songs.length > 0 && (
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
          </ImageBackground>
        )}
      />

      <AddToPlaylistModal
        visible={!!songToAdd}
        song={songToAdd}
        onClose={() => setSongToAdd(null)}
      />

      <EditPlaylistModal
        visible={showEditModal}
        initialTitle={currentPlaylist.title}
        initialCoverImage={currentPlaylist.cover_image}
        initialPostImage={currentPlaylist.post_image}
        onConfirm={handleConfirmEdit}
        onCancel={() => setShowEditModal(false)}
      />

      <ConfirmModal
        visible={showDeleteModal}
        title="Delete Playlist"
        message={`Are you sure you want to delete "${currentPlaylist.title}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
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
    backgroundColor: '#333',
    padding: 32,
    paddingBottom: 0,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    zIndex: 11,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    top: 60,
    zIndex: 10,
  },
  headerImagePlaceholder: {
    width: 232,
    height: 232,
    backgroundColor: '#282828',
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
    justifyContent: 'center',
  },
  headerType: {
    color: '#fff',
    fontSize: 25,
    fontWeight: '900',
    textTransform: 'uppercase',
    zIndex: 11,
    left: 0,
    top: 60,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 90,
    fontWeight: '900',
    lineHeight: 80,
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
    paddingHorizontal: 32,
    paddingTop: 0,
    paddingBottom: 0,
  },
  playButton: {
    width: 35,
    height: 35,
    borderRadius: 28,
    backgroundColor: '#1db954',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 24,
  },
  deleteButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#b3b3b3',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
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
    marginBottom: 3,
    paddingTop: 2,

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
  },
  searchSection: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  searchTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    paddingHorizontal: 16,
    height: 40,
    maxWidth: 500,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    outlineStyle: 'none',
  },
  searchResults: {
    marginTop: 24,
    maxWidth: 800,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  searchResultImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 16,
  },
  searchResultInfo: {
    flex: 1,
    marginRight: 16,
  },
  searchResultTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  searchResultArtist: {
    color: '#b3b3b3',
    fontSize: 14,
  },
  addButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#b3b3b3',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  }
});
