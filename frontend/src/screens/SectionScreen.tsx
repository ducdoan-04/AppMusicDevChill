import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Platform } from 'react-native';
import { Play, ArrowLeft } from 'lucide-react-native';
import TopBar from '../components/TopBar';
import { usePlayer } from '../context/PlayerContext';

export default function SectionScreen({ section, onPlaylistClick, onBack }: any) {
  const { playSong } = usePlayer();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const items = section?.items?.all || section?.items || [];
  const isPlaylist = section?.sectionType === 'playlist';

  return (
    <View style={styles.container}>
      <TopBar />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ArrowLeft color="#fff" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{section?.title}</Text>
        </View>

        <View style={styles.grid}>
          {items.map((item: any) => {
            const isHovered = hoveredItem === item.encodeId;
            return (
              <TouchableOpacity
                key={item.encodeId}
                style={[styles.card, isHovered && styles.cardHovered]}
                onMouseEnter={() => Platform.OS === 'web' && setHoveredItem(item.encodeId)}
                onMouseLeave={() => Platform.OS === 'web' && setHoveredItem(null)}
                onPress={() => {
                  if (isPlaylist && onPlaylistClick) {
                    onPlaylistClick(item.encodeId);
                  } else if (!isPlaylist) {
                    playSong(item);
                  }
                }}
                activeOpacity={1}
              >
                <View style={styles.imageContainer}>
                  <Image source={{ uri: item.thumbnailM }} style={isPlaylist ? styles.cardImage : styles.cardImageCircular} />
                  {(!isPlaylist && isHovered) && (
                    <TouchableOpacity style={styles.playButtonOverlay} onPress={() => playSong(item)}>
                      <Play color="#000" size={24} fill="#000" style={{ marginLeft: 2 }} />
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.cardSubtitle} numberOfLines={2}>
                  {item.artistsNames || item.sortDescription || 'Various Artists'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 32,
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
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
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.04,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -12,
  },
  card: {
    width: 200,
    padding: 16,
    backgroundColor: '#181818',
    borderRadius: 8,
    marginHorizontal: 12,
    marginBottom: 24,
    //@ts-ignore
    transitionDuration: '0.3s',
  },
  cardHovered: {
    backgroundColor: '#282828',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  cardImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  cardImageCircular: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 100,
    backgroundColor: '#333',
  },
  playButtonOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1db954',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    transform: [{ translateY: -4 }],
  },
  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardSubtitle: {
    color: '#a7a7a7',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
});
