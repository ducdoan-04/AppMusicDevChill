import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Modal, TouchableOpacity, Image, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { X, Check } from 'lucide-react-native';

const PRESET_COVERS = [
  '/uploads/images/covers/1.jpg',
  '/uploads/images/covers/2.jpg',
  '/uploads/images/covers/3.jpg',
  '/uploads/images/covers/4.jpg',
  '/uploads/images/covers/5.jpg',
  '/uploads/images/covers/6.jpg',
  '/uploads/images/covers/7.jpg',
];

const PRESET_POSTERS = [
  '/uploads/images/poster/1.jpg',
  '/uploads/images/poster/2.jpg',
  '/uploads/images/poster/3.jpg',
  '/uploads/images/poster/4.png',
  '/uploads/images/poster/5.png',
];

interface EditPlaylistModalProps {
  visible: boolean;
  initialTitle: string;
  initialCoverImage: string;
  initialPostImage?: string;
  onConfirm: (data: { title: string, cover_image?: string, post_image?: string }) => void;
  onCancel: () => void;
}

export default function EditPlaylistModal({ visible, initialTitle, initialCoverImage, initialPostImage, onConfirm, onCancel }: EditPlaylistModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [coverImage, setCoverImage] = useState<string | undefined>(initialCoverImage);
  const [postImage, setPostImage] = useState<string | undefined>(initialPostImage);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (visible) {
      setTitle(initialTitle);
      setCoverImage(initialCoverImage);
      setPostImage(initialPostImage);
      setIsProcessing(false);
    }
  }, [visible, initialTitle, initialCoverImage, initialPostImage]);

  const handleConfirm = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onConfirm({
        title: title.trim() || 'My Playlist',
        cover_image: coverImage, // avatar
        post_image: postImage // banner
      });
    }, 100);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Edit Details</Text>
            <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
              <X color="#b3b3b3" size={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Playlist Name</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Playlist Name"
                placeholderTextColor="#b3b3b3"
                autoFocus
                maxLength={100}
              />
            </View>

            <View style={styles.imageSection}>
              <Text style={styles.imageLabel}>Avatar (Poster)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
                {PRESET_POSTERS.map((uri) => (
                  <TouchableOpacity
                    key={uri}
                    style={[styles.presetImageContainer, coverImage === uri && styles.presetImageSelected]}
                    onPress={() => setCoverImage(uri)}
                  >
                    <Image source={{ uri }} style={styles.presetImage} />
                    {coverImage === uri && (
                      <View style={styles.checkIcon}>
                        <Check color="#fff" size={16} />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.imageSection}>
              <Text style={styles.imageLabel}>Cover (Banner)</Text>
              <View style={styles.wrapContainer}>
                {PRESET_COVERS.map((uri) => (
                  <TouchableOpacity
                    key={uri}
                    style={[styles.presetCoverContainer, postImage === uri && styles.presetImageSelected]}
                    onPress={() => setPostImage(uri)}
                  >
                    <Image source={{ uri }} style={styles.presetImage} />
                    {postImage === uri && (
                      <View style={styles.checkIcon}>
                        <Check color="#fff" size={16} />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.saveButton, isProcessing && styles.saveButtonDisabled]} 
              onPress={handleConfirm}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="#000" size="small" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
    width: 600,
    backgroundColor: '#282828',
    borderRadius: 8,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flexDirection: 'column',
    gap: 20,
  },
  imageSection: {
    flexDirection: 'column',
  },
  imageLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  scrollView: {
    flexDirection: 'row',
  },
  wrapContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  presetImageContainer: {
    width: 80,
    height: 80,
    marginRight: 12,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  presetCoverContainer: {
    width: 126,
    height: 71,
    marginRight: 12,
    marginBottom: 12,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  presetImageSelected: {
    borderColor: '#1db954',
  },
  presetImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  checkIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#1db954',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputSection: {
    marginBottom: 8,
  },
  inputLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#3e3e3e',
    color: '#fff',
    padding: 12,
    borderRadius: 4,
    fontSize: 16,
    height: 48,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
  },
  saveButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
    minWidth: 100,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  }
});
