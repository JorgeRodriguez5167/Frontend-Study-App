import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Modal, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import Icon from 'react-native-vector-icons/Feather';

const BACKEND_URL = 'https://backend-study-app-production.up.railway.app';

export default function UploadAudioScreen({ navigation, route }) {
  const [audioUri, setAudioUri] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const userData = route?.params?.userData || { userId: 2 };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setShowCategoryModal(false);
    pickAudio();
  };

  const pickAudio = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'audio/*',
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled || !result.assets || !result.assets[0]?.uri) return;

    setAudioUri(result.assets[0].uri);
  };

  const handleTranscribeAndSave = async () => {
    if (!audioUri) {
      Alert.alert('Error', 'No audio file selected.');
      return;
    }

    Alert.prompt('Save Note', 'Enter a title for your note:', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Save',
        onPress: async (title) => {
          if (!title || title.trim() === '') {
            Alert.alert('Error', 'Please enter a valid title.');
            return;
          }

          setUploading(true);
          try {
            const result = await FileSystem.uploadAsync(`${BACKEND_URL}/transcribe?stream=false`, audioUri, {
              fieldName: 'file',
              httpMethod: 'POST',
              uploadType: FileSystem.FileSystemUploadType.MULTIPART,
              mimeType: 'audio/m4a',
            });

            const transcribeData = JSON.parse(result.body);
            const transcription = transcribeData.transcription || '';

            const summarizeRes = await fetch(`${BACKEND_URL}/summarize`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: transcription }),
            });

            const summarizeData = await summarizeRes.json();
            const summary = summarizeData.summary || '';

            const userId = userData.userId || userData.user_id || 2;

            const saveRes = await fetch(`${BACKEND_URL}/notes`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                user_id: userId,
                title: title.trim(),
                category: selectedCategory,
                transcription,
                summarized_notes: summary,
              }),
            });

            if (saveRes.ok) {
              Alert.alert('Success', 'Note saved successfully!');
              navigation.reset({
                index: 0,
                routes: [{ name: 'Home', params: { userData, refresh: Date.now() } }],
              });
              setAudioUri(null);
            } else {
              throw new Error('Failed to save note.');
            }
          } catch (err) {
            console.error(err);
            Alert.alert('Error', err.message || 'Something went wrong.');
          } finally {
            setUploading(false);
          }
        },
      },
    ], 'plain-text');
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Upload & Transcribe Audio</Text>
        <Text style={styles.cardDescription}>Category: {selectedCategory || 'Not selected'}</Text>

        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => setShowCategoryModal(true)}
        >
          <Icon name="upload" size={20} color="white" />
          <Text style={styles.buttonText}>Choose Audio</Text>
        </TouchableOpacity>

        {audioUri && (
          <TouchableOpacity style={styles.saveButton} onPress={handleTranscribeAndSave}>
            <Icon name="save" size={20} color="white" />
            <Text style={styles.buttonText}>Transcribe & Save</Text>
          </TouchableOpacity>
        )}

        {uploading && <ActivityIndicator size="large" color="#2196F3" style={{ marginTop: 16 }} />}
      </View>

      <Modal transparent visible={showCategoryModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Please choose the section:</Text>
            {['Health', 'Biology', 'Arts', 'English', 'History'].map((section) => (
              <TouchableOpacity key={section} style={styles.sectionButton} onPress={() => handleCategorySelect(section)}>
                <Text style={styles.sectionButtonText}>{section}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6', justifyContent: 'center', padding: 16 },
  card: { backgroundColor: 'white', borderRadius: 8, padding: 16, elevation: 2 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#e53e3e', marginBottom: 8, textAlign: 'center' },
  cardDescription: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 16 },
  uploadButton: { backgroundColor: '#1f2937', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 8, marginBottom: 16 },
  saveButton: { backgroundColor: '#4CAF50', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 8 },
  buttonText: { color: 'white', fontWeight: 'bold', marginLeft: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', borderRadius: 10, padding: 24, width: '80%', alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  sectionButton: { backgroundColor: '#1f2937', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 8, marginVertical: 6, width: '100%', alignItems: 'center' },
  sectionButtonText: { color: 'white', fontWeight: 'bold' },
});
