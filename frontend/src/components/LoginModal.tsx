import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { X } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function LoginModal() {
  const { showLogin, setShowLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);

  if (!showLogin) return null;

  const handleAuth = async () => {
    if (!email || !password) {
      setErrorMsg('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      if (isLoginMode) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        // On success sign up without email confirmation required, it might log in directly
        // If email confirmation is required, inform user:
        alert("Đăng ký thành công! Vui lòng kiểm tra email nếu cần xác thực.");
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Đã xảy ra lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => setShowLogin(false)}>
          <X color="#b3b3b3" size={24} />
        </TouchableOpacity>
        
        <Text style={styles.title}>{isLoginMode ? 'Đăng nhập vào Spotify' : 'Đăng ký tài khoản mới'}</Text>

        <TextInput
          style={styles.input}
          placeholder="Email của bạn"
          placeholderTextColor="#b3b3b3"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Mật khẩu"
          placeholderTextColor="#b3b3b3"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

        <TouchableOpacity 
          style={styles.submitBtn} 
          onPress={handleAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.submitBtnText}>{isLoginMode ? 'Đăng Nhập' : 'Đăng Ký'}</Text>
          )}
        </TouchableOpacity>

        <View style={styles.switchModeContainer}>
          <Text style={styles.switchText}>
            {isLoginMode ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
          </Text>
          <TouchableOpacity onPress={() => setIsLoginMode(!isLoginMode)}>
            <Text style={styles.switchBtnText}>
              {isLoginMode ? "Đăng ký ngay" : "Đăng nhập"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
  },
  modal: {
    backgroundColor: '#121212',
    width: '90%',
    maxWidth: 400,
    borderRadius: 8,
    padding: 32,
    alignItems: 'center',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.5,
      shadowRadius: 32,
      elevation: 10,
    }),
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 32,
    marginTop: 16,
  },
  input: {
    width: '100%',
    backgroundColor: '#282828',
    color: '#fff',
    padding: 14,
    borderRadius: 4,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3e3e3e',
  },
  errorText: {
    color: '#e22134',
    fontSize: 14,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  submitBtn: {
    width: '100%',
    backgroundColor: '#1db954',
    padding: 14,
    borderRadius: 32,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
  switchModeContainer: {
    flexDirection: 'row',
    marginTop: 32,
  },
  switchText: {
    color: '#b3b3b3',
    fontSize: 14,
  },
  switchBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  }
});
