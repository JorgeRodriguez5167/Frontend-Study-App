import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert, ActivityIndicator, Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation, useRoute } from '@react-navigation/native';

const BACKEND_URL = 'https://backend-study-app-production.up.railway.app';

export default function UploadAudioScreen() {
  const [audioUri, setAudioUri] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const navigation = useNavigation();
  const route = useRoute();
  const userData = route?.params?.userData || { userId: 2 };

  const pickAudioFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'audio/*',
      copyToCacheDirectory: true,
    });

    if (result?.assets?.length > 0 && result.assets[0].uri) {
      setAudioUri(result.assets[0].uri);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setShowCategoryModal(false);
  };

  const handleUpload = async () => {
    if (!audioUri) return;

    Alert.prompt("Save Audio Note", "Enter a title for your note:", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Save",
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
            if (!transcription) throw new Error('Failed to transcribe audio.');

            const summarizeRes = await fetch(`${BACKEND_URL}/summarize`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: transcription }),
            });

            const { summary } = await summarizeRes.json();

            const userId = userData.userId || userData.user_id || 2;

            const saveNote = await fetch(`${BACKEND_URL}/notes`, {
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

            if (!saveNote.ok) throw new Error('Failed to save note.');

            Alert.alert('Success', 'Note saved successfully!');
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home', params: { userData, refresh: Date.now() } }],
            });
          } catch (error) {
            console.error(error);
            Alert.alert('Error', error.message || 'Something went wrong.');
          } finally {
            setUploading(false);
          }
        }
      }
    ], 'plain-text');
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Upload Audio File</Text>
        <Text style={styles.cardDescription}>Category: {selectedCategory || 'Not selected'}</Text>

        <TouchableOpacity style={styles.recordButton} onPress={pickAudioFile}>
          <Icon name="upload" size={24} color="white" />
          <Text style={styles.buttonText}>Select Audio File</Text>
        </TouchableOpacity>

        {audioUri && (
          <TouchableOpacity style={styles.saveButton} onPress={handleUpload}>
            <Icon name="save" size={24} color="white" />
            <Text style={styles.buttonText}>Transcribe + Save</Text>
          </TouchableOpacity>
        )}

        {uploading && <ActivityIndicator size="large" color="#2196F3" style={{ marginTop: 16 }} />}

        <Text style={styles.statusText}>
          {audioUri ? 'Audio file ready.' : 'Pick an audio file to transcribe.'}
        </Text>
      </View>

      <Modal transparent visible={showCategoryModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Please choose the section for your notes:</Text>
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
  container: { flex: 1, backgroundColor: "#f3f4f6", justifyContent: "center", padding: 16 },
  card: { backgroundColor: "white", borderRadius: 8, padding: 24, elevation: 2, alignItems: "center" },
  cardTitle: { fontSize: 20, fontWeight: "bold", color: "#e53e3e", marginBottom: 8 },
  cardDescription: { fontSize: 14, color: "#6b7280", textAlign: "center", marginBottom: 24 },
  recordButton: { backgroundColor: "#000000", flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 12, borderRadius: 8, marginBottom: 10, width: "100%" },
  saveButton: { backgroundColor: "#4CAF50", flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 12, borderRadius: 8, marginTop: 10, width: "100%" },
  buttonText: { color: "white", fontWeight: "bold", marginLeft: 8 },
  statusText: { color: "#6b7280", fontSize: 14, marginTop: 20, textAlign: "center" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "white", borderRadius: 10, padding: 24, width: "80%", alignItems: "center" },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  sectionButton: { backgroundColor: "#1f2937", paddingVertical: 10, paddingHorizontal: 24, borderRadius: 8, marginVertical: 6, width: "100%", alignItems: "center" },
  sectionButtonText: { color: "white", fontWeight: "bold" },
});
