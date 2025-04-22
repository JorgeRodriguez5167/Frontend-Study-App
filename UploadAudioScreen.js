import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, Modal, ActivityIndicator, Platform
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import Icon from 'react-native-vector-icons/Feather';

const BACKEND_URL = 'https://backend-study-app-production.up.railway.app';

export default function UploadAudioScreen() {
  const [audioUri, setAudioUri] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setShowCategoryModal(false);
    pickAudioFile();
  };

  const pickAudioFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*' });
      if (!result.canceled) {
        setAudioUri(result.assets[0].uri);
        setTranscription('');
        setSummary('');
      }
    } catch (err) {
      console.error('File selection failed', err);
      Alert.alert('Error', 'Could not select audio file.');
    }
  };

  const transcribeAudio = async () => {
    if (!audioUri) return;
    setLoading(true);
    try {
      let response;
      if (Platform.OS === 'web') {
        const blob = await (await fetch(audioUri)).blob();
        const formData = new FormData();
        formData.append('file', new File([blob], 'upload.wav', { type: 'audio/wav' }));
        response = await fetch(`${BACKEND_URL}/transcribe?stream=false`, {
          method: 'POST',
          body: formData,
        });
      } else {
        const result = await FileSystem.uploadAsync(`${BACKEND_URL}/transcribe?stream=false`, audioUri, {
          fieldName: 'file',
          httpMethod: 'POST',
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
          mimeType: 'audio/m4a',
        });
        response = {
          json: async () => JSON.parse(result.body),
        };
      }

      const data = await response.json();
      setTranscription(data.transcription || '');
      Alert.alert("✅ Transcribed", "Audio transcription completed.");
    } catch (err) {
      console.error('Transcription failed', err);
      Alert.alert('Error', 'Failed to transcribe audio.');
    } finally {
      setLoading(false);
    }
  };

  const summarizeText = async () => {
    if (!transcription) return;
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: transcription })
      });

      const data = await response.json();
      setSummary(data.summary || '');
      Alert.alert("✅ Summarized", "Summary created successfully.");
    } catch (err) {
      console.error('Summarization failed', err);
      Alert.alert('Error', 'Failed to summarize the note.');
    } finally {
      setLoading(false);
    }
  };

  const makeNote = async (type, content) => {
    if (!content || !selectedCategory) return;
    const baseTitle = prompt(`Enter a title for your ${type}:`);
    if (!baseTitle) return;

    const title = `${baseTitle.trim()} ${type === 'Summary' ? 'Summary' : 'Notes'}`;
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 2,
          title,
          category: selectedCategory,
          transcription: type === 'Transcription' ? content : null,
          summarized_notes: type === 'Summary' ? content : null
        })
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert("✅ Success", `${type} saved as "${title}"`);
        console.log(`📝 Saved ${type}`, data);
      } else {
        Alert.alert("❌ Failed", `Could not save ${type}.`);
        console.error("Save error:", data);
      }
    } catch (err) {
      console.error("Save failed:", err);
      Alert.alert("Error", "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Upload Audio File</Text>
            <Text style={styles.cardDescription}>Category: {selectedCategory || 'Not selected'}</Text>
          </View>

          <TouchableOpacity style={styles.recordButton} onPress={() => setShowCategoryModal(true)}>
            <Icon name="upload" size={24} color="white" />
            <Text style={styles.buttonText}>Pick Audio File</Text>
          </TouchableOpacity>

          {audioUri && (
            <>
              <TouchableOpacity style={styles.recordButton} onPress={transcribeAudio}>
                <Icon name="file-text" size={24} color="white" />
                <Text style={styles.buttonText}>Transcribe</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.recordButton} onPress={summarizeText}>
                <Icon name="book-open" size={24} color="white" />
                <Text style={styles.buttonText}>Summarize</Text>
              </TouchableOpacity>
              {transcription !== '' && (
                <TouchableOpacity style={styles.recordButton} onPress={() => makeNote('Transcription', transcription)}>
                  <Icon name="save" size={20} color="white" />
                  <Text style={styles.buttonText}>Save Transcript</Text>
                </TouchableOpacity>
              )}
              {summary !== '' && (
                <TouchableOpacity style={styles.recordButton} onPress={() => makeNote('Summary', summary)}>
                  <Icon name="save" size={20} color="white" />
                  <Text style={styles.buttonText}>Save Summary</Text>
                </TouchableOpacity>
              )}
            </>
          )}

          {loading && <ActivityIndicator size="large" color="#2196F3" style={{ marginVertical: 10 }} />}
          <Text style={styles.statusText}>
            {audioUri ? "Audio selected. Ready to process." : "No audio file selected."}
          </Text>
        </View>
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
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  content: { flex: 1, padding: 16, justifyContent: "center" },
  card: { backgroundColor: "white", borderRadius: 8, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  cardHeader: { alignItems: "center", marginBottom: 24 },
  cardTitle: { fontSize: 20, fontWeight: "bold", color: "#e53e3e", marginBottom: 8 },
  cardDescription: { fontSize: 14, color: "#6b7280", textAlign: "center" },
  recordButton: { backgroundColor: "black", flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, marginBottom: 10 },
  buttonText: { color: "white", fontWeight: "bold", marginLeft: 8 },
  statusText: { textAlign: "center", color: "#6b7280", fontSize: 14 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "white", borderRadius: 10, padding: 24, width: "80%", alignItems: "center", marginBottom: 16 },
  sectionButton: { backgroundColor: "#1f2937", paddingVertical: 10, paddingHorizontal: 24, borderRadius: 8, marginVertical: 6, width: "100%", alignItems: "center" },
  sectionButtonText: { color: "white", fontWeight: "bold" },
});

