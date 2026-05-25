import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, ActivityIndicator, Platform, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, Check } from 'lucide-react-native';
import TopBar from '../components/TopBar';

export default function AccountScreen() {
  const { user, profile, updateProfile, signOut } = useAuth();
  const [fullName, setFullName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // 13 avatars available in public/uploads/images/avatars
  const AVATARS = Array.from({ length: 13 }, (_, i) => `/uploads/images/avatars/${i + 1}.png`);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setSelectedAvatar(profile.url_avatar || null);
    }
  }, [profile]);

  if (!user) {
    return (
      <View style={styles.container}>
        <TopBar />
        <View style={styles.centerContent}>
          <Text style={styles.emptyTitle}>Vui lòng đăng nhập</Text>
          <Text style={styles.emptySub}>Bạn cần đăng nhập để quản lý tài khoản.</Text>
        </View>
      </View>
    );
  }

  const handleSave = async () => {
    setLoading(true);
    setSuccessMsg('');
    const { error } = await updateProfile({
      full_name: fullName,
      url_avatar: selectedAvatar
    });

    setLoading(false);
    if (error) {
      alert("Cập nhật thất bại: " + error.message);
    } else {
      setSuccessMsg("Cập nhật thông tin thành công!");
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  return (
    <View style={styles.container}>
      <TopBar />
      <View style={styles.splitScreen}>
        {/* Nửa trái: Quản lý hồ sơ */}
        <ScrollView
          style={styles.leftColumn}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerRow}>
            <View style={styles.avatarPreviewContainer}>
              {selectedAvatar ? (
                <Image source={{ uri: selectedAvatar }} style={styles.avatarLarge} />
              ) : (
                <View style={[styles.avatarLarge, styles.avatarPlaceholder]}>
                  <UserIcon color="#b3b3b3" size={64} />
                </View>
              )}
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.headerType}>Hồ Sơ</Text>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {fullName || user.email?.split('@')[0]}
              </Text>
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={user.email || ''}
                editable={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tên hiển thị (Tùy chọn)</Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Nhập tên của bạn"
                placeholderTextColor="#b3b3b3"
              />
            </View>
          </View>

          <View style={styles.avatarSection}>
            <Text style={styles.sectionTitle}>Chọn Ảnh Đại Diện</Text>
            <View style={styles.avatarGrid}>
              {AVATARS.map((avatarUri, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.avatarOption,
                    selectedAvatar === avatarUri && styles.avatarOptionSelected
                  ]}
                  onPress={() => setSelectedAvatar(avatarUri)}
                >
                  <Image source={{ uri: avatarUri }} style={styles.avatarOptionImage} />
                  {selectedAvatar === avatarUri && (
                    <View style={styles.checkBadge}>
                      <Check color="#fff" size={14} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.saveButtonText}>Lưu Thay Đổi</Text>
              )}
            </TouchableOpacity>

            {successMsg ? <Text style={styles.successText}>{successMsg}</Text> : null}

            <View style={{ flex: 1 }} />

            <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
              <Text style={styles.logoutText}>Đăng Xuất</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Nửa phải: Lịch sử nghe nhạc */}
        <View style={styles.rightColumn}>
          <Text style={styles.historyTitle}>Lịch sử nghe nhạc</Text>
          <View style={styles.historyPlaceholder}>
            <Text style={styles.historySubText}>Chưa có dữ liệu lịch sử nghe nhạc.</Text>
            <Text style={styles.historySubText}>Tính năng này sẽ sớm ra mắt!</Text>
          </View>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  splitScreen: {
    flex: 1,
    flexDirection: 'row',
  },
  leftColumn: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#282828',
    paddingBottom: 20,
  },
  rightColumn: {
    flex: 1,
    padding: 32,
    paddingTop: 80,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySub: {
    color: '#b3b3b3',
    fontSize: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingTop: 80,
    backgroundColor: 'linear-gradient(180deg, #333333 0%, #121212 100%)',
  },
  avatarPreviewContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    backgroundColor: '#282828',
  },
  avatarLarge: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    marginLeft: 20,
    flex: 1,
  },
  headerType: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  formSection: {
    paddingHorizontal: 20,
    paddingTop: 5,
    maxWidth: 600,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#b3b3b3',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#3e3e3e',
    color: '#fff',
    padding: 10,
    borderRadius: 4,
    fontSize: 13,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  avatarSection: {
    paddingHorizontal: 20,
    paddingTop: 5,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  avatarOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
    position: 'relative',
  },
  avatarOptionSelected: {
    borderColor: '#1db954',
  },
  avatarOptionImage: {
    width: '100%',
    height: '100%',
  },
  checkBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1db954',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },
  saveButton: {
    backgroundColor: '#1db954',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 110,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  successText: {
    color: '#1db954',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  logoutBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#b3b3b3',
  },
  logoutText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  historyTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  historyPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#181818',
    borderRadius: 8,
    padding: 24,
  },
  historySubText: {
    color: '#b3b3b3',
    fontSize: 15,
    marginTop: 8,
  }
});
