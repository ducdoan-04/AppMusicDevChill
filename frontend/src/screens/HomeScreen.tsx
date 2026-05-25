import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { usePlayer, Song } from '../context/PlayerContext';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react-native';
import TopBar from '../components/TopBar';

interface HomeScreenProps {
  onPlaylistClick?: (id: string) => void;
  onShowAll?: (section: any) => void;
}

export default function HomeScreen({ onPlaylistClick, onShowAll }: HomeScreenProps) {
  const [top100, setTop100] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { playSongList } = usePlayer();

  useEffect(() => {
    fetch('http://localhost:5555/api/home')
      .then(res => res.json())
      .then(data => {
        const items = data?.data?.items || [];
        setTop100(items);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  return (
    <View style={styles.container}>
      <TopBar />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {/* Top Gradient */}
        <View style={styles.headerGradient} />

        {loading ? (
          <ActivityIndicator size="large" color="#1db954" style={{ marginTop: 100 }} />
        ) : (
          <View style={{ paddingTop: 80 }}>
            {top100.map((section, index) => (
              <HorizontalSection
                key={section.title || index}
                section={section}
                onPlaylistClick={onPlaylistClick}
                onShowAll={onShowAll}
                playSongList={playSongList}
              />
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const HorizontalSection = ({ section, onPlaylistClick, playSongList, onShowAll }: any) => {
  const scrollRef = useRef<ScrollView>(null);
  const [scrollX, setScrollX] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [layoutWidth, setLayoutWidth] = useState(0);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isSectionHovered, setIsSectionHovered] = useState(false);

  const items = section.items?.all || section.items || [];
  if (!Array.isArray(items) || items.length === 0) return null;
  if (!items[0].encodeId) return null; // Skip non-standard sections like weekChart for now

  const maxScroll = Math.max(0, contentWidth - layoutWidth);
  const showLeft = scrollX > 10;
  const showRight = maxScroll > 0 && scrollX < maxScroll - 10;

  const scrollLeft = () => {
    scrollRef.current?.scrollTo({ x: Math.max(0, scrollX - layoutWidth * 0.8), animated: true });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollTo({ x: Math.min(maxScroll, scrollX + layoutWidth * 0.8), animated: true });
  };

  let displayTitle = section.title;
  if (!displayTitle) {
    if (section.sectionType === 'RTChart') displayTitle = '#zingchart';
    else if (section.sectionType === 'quickPlay') displayTitle = 'Nghe Gần Đây';
    else if (section.sectionType === 'new-release') displayTitle = 'Mới Phát Hành';
    else displayTitle = 'Gợi ý cho bạn';
  }

  return (
    <View
      style={styles.section}
      {...({
        onMouseEnter: () => Platform.OS === 'web' && setIsSectionHovered(true),
        onMouseLeave: () => Platform.OS === 'web' && setIsSectionHovered(false),
      } as any)}
    >
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{displayTitle}</Text>
        <TouchableOpacity onPress={() => onShowAll && onShowAll(section)}>
          <Text style={styles.showAllText}>Show all</Text>
        </TouchableOpacity>
      </View>
      <View style={{ position: 'relative' }}>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          onScroll={(e) => setScrollX(e.nativeEvent.contentOffset.x)}
          scrollEventThrottle={16}
          onContentSizeChange={(w) => setContentWidth(w)}
          onLayout={(e) => setLayoutWidth(e.nativeEvent.layout.width)}
        >
          {items.map((item: any, index: number) => {
            const isHovered = hoveredItem === item.encodeId;
            const isPlaylist = section.sectionType === 'playlist';
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
                    playSongList(items, index);
                  }
                }}
                activeOpacity={1}
              >
                <View style={styles.imageContainer}>
                  <Image source={{ uri: item.thumbnailM }} style={isPlaylist ? styles.cardImage : styles.cardImageCircular} />
                  {(!isPlaylist && isHovered) && (
                    <TouchableOpacity style={styles.playButtonOverlay} onPress={() => playSongList(items, index)}>
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
        </ScrollView>
        {isSectionHovered && showLeft && (
          <TouchableOpacity style={[styles.navButton, styles.navButtonLeft]} onPress={scrollLeft}>
            <ChevronLeft color="#fff" size={20} />
          </TouchableOpacity>
        )}
        {isSectionHovered && showRight && (
          <TouchableOpacity style={[styles.navButton, styles.navButtonRight]} onPress={scrollRight}>
            <ChevronRight color="#fff" size={20} />
          </TouchableOpacity>
        )}
      </View>
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
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 332,
    backgroundColor: '#1f1f1f',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    // Note: React Native Web supports CSS backgroundImage for exact gradients if needed, but solid works as a fallback.
  },
  content: {
    paddingHorizontal: 32,
    paddingTop: 16,
  },
  section: {
    marginBottom: 32,
    zIndex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.04,
  },
  showAllText: {
    color: '#b3b3b3',
    fontSize: 14,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 16,
  },
  card: {
    width: 200,
    padding: 16,
    backgroundColor: '#181818',
    borderRadius: 8,
    marginRight: 24,
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
  navButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -24 }],
    width: 45,
    height: 45,
    borderRadius: 24,
    backgroundColor: 'rgba(165, 167, 164, 0.31)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  navButtonLeft: {
    left: -30,
  },
  navButtonRight: {
    right: -30,
  },
});
