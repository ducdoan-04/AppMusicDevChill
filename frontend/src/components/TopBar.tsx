import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image, Platform, DeviceEventEmitter } from 'react-native';
import { ChevronLeft, ChevronRight, User as UserIcon, LogOut } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

interface TopBarProps {
  children?: React.ReactNode;
}

export default function TopBar({ children }: TopBarProps) {
  const [hoveredButton, setHoveredButton] = useState<'signup' | 'login' | null>(null);
  const { user, profile, setShowLogin, signOut } = useAuth();

  return (
    <View style={[styles.container, { backgroundColor: "black" }]}>
      <View style={styles.navigation}>
        <TouchableOpacity style={styles.navButton} activeOpacity={0.7}>
          <ChevronLeft color="#fff" size={24} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} activeOpacity={0.7}>
          <ChevronRight color="#fff" size={24} />
        </TouchableOpacity>
        {children}
      </View>

      <View style={styles.actions}>
        {!user ? (
          <>
            <TouchableOpacity
              style={[styles.signupButton, { backgroundColor: "green", borderRadius: 30 }]}
              onMouseEnter={() => Platform.OS === 'web' && setHoveredButton('signup')}
              onMouseLeave={() => Platform.OS === 'web' && setHoveredButton(null)}
              onPress={() => setShowLogin(true)}
              activeOpacity={0.7}
            >
              <Text style={[styles.signupText, hoveredButton === 'signup' && styles.textHovered, { color: "white" }]}>Sign up</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.loginButton, hoveredButton === 'login']}
              onMouseEnter={() => Platform.OS === 'web' && setHoveredButton('login')}
              onMouseLeave={() => Platform.OS === 'web' && setHoveredButton(null)}
              onPress={() => setShowLogin(true)}
              activeOpacity={0.8}
            >
              <Text style={[styles.loginText, hoveredButton === 'login' && styles.loginButtonHovered]}>Log in</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.userSection}>
            <TouchableOpacity 
              style={styles.profileBtn} 
              activeOpacity={0.7}
              onPress={() => DeviceEventEmitter.emit('navigate', 'Account')}
            >
              <View style={styles.avatarContainer}>
                {profile?.url_avatar ? (
                  <Image source={{ uri: profile.url_avatar }} style={styles.avatarImage} />
                ) : (
                  <UserIcon color="#b3b3b3" size={20} />
                )}
              </View>
              <Text style={styles.profileName} numberOfLines={1}>
                {profile?.full_name || user.email?.split('@')[0]}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={signOut} style={styles.logoutBtn}>
              <LogOut color="#b3b3b3" size={20} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingTop: 16,
    zIndex: 10,
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signupButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  signupText: {
    color: '#a7a7a7',
    fontSize: 16,
    fontWeight: 'bold',
  },
  textHovered: {
    color: '#fff',
    transform: [{ scale: 1.05 }],
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  loginButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 32,
    marginLeft: 16,
  },
  loginButtonHovered: {
    transform: [{ scale: 1.05 }],
  },
  loginText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  profileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 4,
    paddingRight: 16,
    borderRadius: 32,
    gap: 8,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#282828',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  profileName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    maxWidth: 120,
  },
  logoutBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  }
});
