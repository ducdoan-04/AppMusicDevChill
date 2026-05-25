import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useUserPlaylists } from '../context/UserPlaylistsContext';
import { usePlayer } from '../context/PlayerContext';

interface AddToPlaylistModalProps {
  visible: boolean;
  song: any;
  onClose: () => void;
}

export default function AddToPlaylistModal({ visible, song, onClose }: AddToPlaylistModalProps) {
  const { playlists, addSongToPlaylist } = useUserPlaylists();
  const { showToast } = usePlayer();

  const handleAddToPlaylist = async (playlistId: string) => {
    if (song) {
      await addSongToPlaylist(playlistId, song);
      showToast('Added to playlist!', 'success');
      onClose();
    }
  };

  if (!visible || !song) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1}>
        <TouchableOpacity style={styles.modalContainer} activeOpacity={1}>
          <Text style={styles.title}>Add to Playlist</Text>
          
          <ScrollView style={styles.list}>
            {playlists.length === 0 ? (
              <Text style={styles.emptyText}>You don't have any playlists yet.</Text>
            ) : (
              playlists.map(playlist => (
                <TouchableOpacity 
                  key={playlist.id} 
                  style={styles.playlistItem}
                  onPress={() => handleAddToPlaylist(playlist.id)}
                >
                  <Text style={styles.playlistName}>{playlist.title}</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
          
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: 300,
    backgroundColor: '#282828',
    borderRadius: 8,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  list: {
    maxHeight: 300,
    marginBottom: 16,
  },
  playlistItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  playlistName: {
    color: '#fff',
    fontSize: 16,
  },
  emptyText: {
    color: '#b3b3b3',
    textAlign: 'center',
    marginTop: 16,
  },
  closeButton: {
    backgroundColor: '#333',
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  }
});
