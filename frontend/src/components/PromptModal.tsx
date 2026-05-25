import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput } from 'react-native';

interface PromptModalProps {
  visible: boolean;
  title: string;
  initialValue?: string;
  placeholder?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export default function PromptModal({ visible, title, initialValue = '', placeholder = '', onConfirm, onCancel }: PromptModalProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue, visible]);

  const handleConfirm = () => {
    onConfirm(value);
    setValue('');
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>{title}</Text>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={setValue}
            placeholder={placeholder}
            placeholderTextColor="#757575"
            autoFocus
            onSubmitEditing={handleConfirm}
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.confirmButton, !value.trim() && styles.confirmButtonDisabled]} onPress={handleConfirm} disabled={!value.trim()}>
              <Text style={styles.confirmButtonText}>Save</Text>
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
    width: 360,
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
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#3e3e3e',
    color: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 4,
    fontSize: 16,
    marginBottom: 24,
    //@ts-ignore
    outlineStyle: 'none',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#b3b3b3',
    fontSize: 16,
    fontWeight: '700',
  },
  confirmButton: {
    backgroundColor: '#1db954',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
  },
  confirmButtonDisabled: {
    backgroundColor: '#1db95480',
  },
  confirmButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  }
});
