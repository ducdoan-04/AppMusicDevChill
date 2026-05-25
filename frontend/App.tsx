import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, SafeAreaView, Platform, DeviceEventEmitter } from 'react-native';

import { PlayerProvider } from './src/context/PlayerContext';
import Player from './src/components/Player';
import HomeScreen from './src/screens/HomeScreen';
import SearchScreen from './src/screens/SearchScreen';
import PlaylistScreen from './src/screens/PlaylistScreen';
import NowPlayingScreen from './src/screens/NowPlayingScreen';
import Sidebar from './src/components/Sidebar';
import { AuthProvider } from './src/context/AuthContext';
import { LikedSongsProvider } from './src/context/LikedSongsContext';
import { UserPlaylistsProvider } from './src/context/UserPlaylistsContext';
import LoginModal from './src/components/LoginModal';
import LikedSongsScreen from './src/screens/LikedSongsScreen';
import AccountScreen from './src/screens/AccountScreen';
import SectionScreen from './src/screens/SectionScreen';
import UserPlaylistScreen from './src/screens/UserPlaylistScreen';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<'Home' | 'Search' | 'Playlist' | 'NowPlaying' | 'LikedSongs' | 'Account' | 'Section' | 'UserPlaylist'>('Home');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<any>(null);
  const [selectedUserPlaylist, setSelectedUserPlaylist] = useState<any>(null);

  const navigateToPlaylist = (id: string) => {
    setSelectedPlaylistId(id);
    setActiveScreen('Playlist');
  };

  const navigateToSection = (section: any) => {
    setSelectedSection(section);
    setActiveScreen('Section');
  };

  const navigateToUserPlaylist = (playlist: any) => {
    setSelectedUserPlaylist(playlist);
    setActiveScreen('UserPlaylist');
  };

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('navigate', (screen) => {
      setActiveScreen(screen);
    });
    return () => subscription.remove();
  }, []);

  return (
    <AuthProvider>
      <LikedSongsProvider>
        <UserPlaylistsProvider>
          <PlayerProvider>
            <SafeAreaView style={styles.container}>
              <StatusBar style="light" />

              {/* Main Application Area (Sidebar + Content) */}
              <View style={styles.mainLayout}>

                {/* Left Sidebar */}
                {Platform.OS === 'web' && (
                  <Sidebar activeScreen={['Playlist', 'Section', 'UserPlaylist'].includes(activeScreen) ? 'Home' : activeScreen as any} onNavigate={(screen, data) => {
                    if (screen === 'UserPlaylist') {
                      navigateToUserPlaylist(data);
                    } else {
                      setActiveScreen(screen as any);
                    }
                  }} />
                )}

                {/* Right Content Area */}
                <View style={styles.contentArea}>
                  {activeScreen === 'Home' && <HomeScreen onPlaylistClick={navigateToPlaylist} onShowAll={navigateToSection} />}
                  {activeScreen === 'Search' && <SearchScreen />}
                  {activeScreen === 'Playlist' && selectedPlaylistId && (
                    <PlaylistScreen playlistId={selectedPlaylistId} onBack={() => setActiveScreen('Home')} />
                  )}
                  {activeScreen === 'Section' && selectedSection && (
                    <SectionScreen section={selectedSection} onPlaylistClick={navigateToPlaylist} onBack={() => setActiveScreen('Home')} />
                  )}
                  {activeScreen === 'UserPlaylist' && selectedUserPlaylist && (
                    <UserPlaylistScreen playlist={selectedUserPlaylist} onBack={() => setActiveScreen('Home')} />
                  )}
                  {activeScreen === 'NowPlaying' && <NowPlayingScreen onClose={() => setActiveScreen('Home')} />}
                  {activeScreen === 'LikedSongs' && <LikedSongsScreen />}
                  {activeScreen === 'Account' && <AccountScreen />}
                </View>
              </View>

              {/* Global Bottom Player */}
              <Player onMaximize={() => setActiveScreen('NowPlaying')} />

              {/* Authentication Modal */}
              <LoginModal />

            </SafeAreaView>
          </PlayerProvider>
        </UserPlaylistsProvider>
      </LikedSongsProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  mainLayout: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: 90,
  },
  contentArea: {
    flex: 1,
    backgroundColor: '#121212',
    borderRadius: Platform.OS === 'web' ? 8 : 0,
    marginRight: Platform.OS === 'web' ? 8 : 0,
    marginTop: Platform.OS === 'web' ? 8 : 0,
    overflow: 'hidden',
  }
});

