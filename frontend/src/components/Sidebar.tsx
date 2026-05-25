import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Home, Search, Library, Heart, Globe, LogIn, LogOut, User as UserIcon, Music } from 'lucide-react-native';
import { Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useUserPlaylists } from '../context/UserPlaylistsContext';
import PromptModal from './PromptModal';
import ConfirmModal from './ConfirmModal';

interface SidebarProps {
  activeScreen: 'Home' | 'Search' | 'LikedSongs' | 'Account' | 'UserPlaylist';
  onNavigate: (screen: string, data?: any) => void;
}

export default function Sidebar({ activeScreen, onNavigate }: SidebarProps) {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { user, profile, setShowLogin, signOut } = useAuth();
  const { playlists, createPlaylist } = useUserPlaylists();

  const handleCreatePlaylistClick = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setShowCreateModal(true);
  };

  const handleConfirmCreate = async (name: string) => {
    setShowCreateModal(false);
    if (name && name.trim()) {
      const newPlaylist = await createPlaylist(name.trim());
      if (newPlaylist) {
        onNavigate('UserPlaylist', newPlaylist);
      }
    }
  };

  const renderNavItem = (id: string, label: string, icon: React.ReactNode, onPress: () => void, isActive: boolean = false) => {
    const isHovered = hoveredLink === id;
    const color = isActive || isHovered ? '#fff' : '#b3b3b3';
    return (
      <TouchableOpacity
        style={styles.navItem}
        onPress={onPress}
        onMouseEnter={() => Platform.OS === 'web' && setHoveredLink(id)}
        onMouseLeave={() => Platform.OS === 'web' && setHoveredLink(null)}
        activeOpacity={1}
      >
        <View style={styles.iconWrapper}>
          {React.cloneElement(icon as React.ReactElement, { color, fill: isActive ? color : 'none' })}
        </View>
        <Text style={[styles.navText, { color }]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        {/* Simplified Logo */}
        <Image
          source={{ uri: '/uploads/images/logo/DevChill.png' }}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.navSection}>
        {renderNavItem('home', 'Home', <Home size={24} />, () => onNavigate('Home'), activeScreen === 'Home')}
        {renderNavItem('search', 'Search', <Search size={24} />, () => onNavigate('Search'), activeScreen === 'Search')}
        {renderNavItem('library', 'Your Library', <Library size={24} />, () => { })}
        {renderNavItem('liked', 'Liked Songs', <Heart size={24} />, () => onNavigate('LikedSongs'), activeScreen === 'LikedSongs')}
      </View>

      <View style={styles.navSectionSpaced}>
        <TouchableOpacity
          style={[styles.navItem, { marginTop: -20 }]}
          onPress={handleCreatePlaylistClick}
          onMouseEnter={() => Platform.OS === 'web' && setHoveredLink('create')}
          onMouseLeave={() => Platform.OS === 'web' && setHoveredLink(null)}
        >
          <View style={styles.createPlaylistIcon}>
            <Text style={{ color: '#000', fontSize: 18, fontWeight: 'bold' }}>+</Text>
          </View>
          <Text style={[styles.navText, { color: hoveredLink === 'create' ? '#fff' : '#b3b3b3' }]}>Create Playlist</Text>
        </TouchableOpacity>

        <View style={{ paddingHorizontal: 24, marginTop: 10, marginBottom: -10, marginLeft: -10 }}>
          <Text style={[styles.navText, { color: '#b3b3b3', fontSize: 12, fontWeight: 'bold', marginLeft: 2 }]}>Your Playlists</Text>
          <View style={{ borderBottomWidth: 1, borderBottomColor: '#b3b3b3', marginBottom: 1 }} />
        </View>

        <View>

        </View>

        <ScrollView style={{ marginTop: 16, flex: 1 }} showsVerticalScrollIndicator={false}>
          {playlists.map(playlist => {
            const isHovered = hoveredLink === playlist.id;
            return (
              <TouchableOpacity
                key={playlist.id}
                style={[styles.navItem, { paddingVertical: 6, paddingHorizontal: 8 }]}
                onPress={() => onNavigate('UserPlaylist', playlist)}
                onMouseEnter={() => Platform.OS === 'web' && setHoveredLink(playlist.id)}
                onMouseLeave={() => Platform.OS === 'web' && setHoveredLink(null)}
              >
                {playlist.cover_image ? (
                  <Image source={{ uri: playlist.cover_image }} style={{ width: 24, height: 24, borderRadius: 2, marginRight: 12, marginLeft: 11 }} />
                ) : (
                  <View style={{ width: 24, height: 24, borderRadius: 2, backgroundColor: '#282828', marginRight: 12, alignItems: 'center', justifyContent: 'center' }}>
                    <Music size={14} color="#b3b3b3" />
                  </View>
                )}
                <Text style={[styles.navText, { marginLeft: 0, color: isHovered ? '#fff' : '#b3b3b3', fontWeight: '500' }]} numberOfLines={1}>
                  {playlist.title}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>

      <View style={styles.flexFiller} />

      <View style={styles.footer}>
        <View style={styles.footerLinks}>
          {['Legal', 'Privacy Center', 'Privacy Policy', 'Cookies', 'About', 'Ads'].map(link => (
            <Text key={link} style={styles.footerLinkText}>{link}</Text>
          ))}
        </View>
        <TouchableOpacity style={styles.languageButton}>
          <Globe color="#fff" size={16} />
          <Text style={styles.languageText}>English</Text>
        </TouchableOpacity>
      </View>

      <PromptModal
        visible={showCreateModal}
        title="Create Playlist"
        placeholder="Enter playlist name"
        onConfirm={handleConfirmCreate}
        onCancel={() => setShowCreateModal(false)}
      />
      <ConfirmModal
        visible={showLoginModal}
        title="Please log in"
        message="Please log in to create a playlist"
        confirmText="Log In"
        onConfirm={() => {
          setShowLoginModal(false);
          setShowLogin(true);
        }}
        onCancel={() => setShowLoginModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 240,
    backgroundColor: '#000000',
    height: '100%',
    paddingTop: 24,
    display: 'flex',
    flexDirection: 'column',
  },
  logoContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  logo: {
    width: 130,
    height: 40,
  },
  navSection: {
    paddingHorizontal: 8,
    marginBottom: 24,
    marginTop: 20,
  },
  navSectionSpaced: {
    paddingHorizontal: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    transitionDuration: '0.2s',
  },
  iconWrapper: {
    width: 24,
    alignItems: 'center',
  },
  navText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 16,
    transitionDuration: '0.2s',
  },
  createPlaylistIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#b3b3b3',
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  likedSongsIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#450af5',
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flexFiller: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  footerLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  footerLinkText: {
    color: '#a7a7a7',
    fontSize: 11,
    marginRight: 16,
    marginBottom: 8,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#727272',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  languageText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 6,
  }
});
