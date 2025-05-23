import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert, Modal, Platform, TextInput
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import Icon from 'react-native-vector-icons/Feather';
import { useRoute, useNavigation } from '@react-navigation/native';
// File worked on by Sebastian and Rodolfo
const BACKEND_URL = 'https://backend-study-app-production.up.railway.app';

export default function UploadAudioScreen() {
  const [audioUri, setAudioUri] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [summary, setSummary] = useState('');
  const [uploading, setUploading] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const route = useRoute();
  const navigation = useNavigation();
  const userData = route?.params?.userData || { userId: 1 };
  
  // For Android prompt
  const [showTitlePrompt, setShowTitlePrompt] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [promptType, setPromptType] = useState('');
  const [promptContent, setPromptContent] = useState('');

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setShowCategoryModal(false);
    pickAudioFile();  // Start file picker once category is selected
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
      Alert.alert(
        'Error',
        'Could not select audio file.',
        [{ text: 'OK' }]
      );
    }
  };

  const transcribeAudio = async () => {
    if (!audioUri) return;
    setUploading(true);
    setTranscription('');

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
          mimeType: 'audio/m4a', // adjust if needed
        });
        response = {
          json: async () => JSON.parse(result.body),
        };
      }

      const data = await response.json();
      setTranscription(data.transcription || '');
    } catch (err) {
      console.error('Transcription failed', err);
      Alert.alert(
        'Error',
        'Failed to transcribe audio.',
        [{ text: 'OK' }]
      );
    } finally {
      setUploading(false);
    }
  };

  const summarizeText = async () => {
    if (!transcription) return;
    setSummarizing(true);

    try {
      const response = await fetch(`${BACKEND_URL}/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: transcription })
      });

      const data = await response.json();
      setSummary(data.summary);
    } catch (err) {
      console.error('Summarization failed', err);
      Alert.alert(
        'Error',
        'Failed to summarize the note.',
        [{ text: 'OK' }]
      );
    } finally {
      setSummarizing(false);
    }
  };

 const saveNote = async (type, content) => {
  if (!content) return;
//IOS route worked on by Jorge
  if (Platform.OS === 'ios') {
    // Use native iOS Alert.prompt
    Alert.prompt(
      `Save ${type}`,
      "Enter a title:",
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Save',
          onPress: (baseTitle) => {
            if (!baseTitle || baseTitle.trim() === '') return;
            
            const finalTitle = `${baseTitle.trim()} ${type === 'Summary' ? 'Summary' : 'Notes'}`;
            
            saveNoteToServer(finalTitle, type, content);
          }
        },
      ],
      'plain-text'
    );
  } else {
    // Show custom modal for Android
    setTitleInput('');
    setPromptType(type);
    setPromptContent(content);
    setShowTitlePrompt(true);
  }
};

const saveNoteToServer = async (finalTitle, type, content) => {
  try {
    const userId = userData.userId || userData.user_id || 1;
    
    const response = await fetch(`${BACKEND_URL}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        title: finalTitle,
        category: selectedCategory,
        transcription: type === 'Transcription' ? content : null,
        summarized_notes: type === 'Summary' ? content : null
      })
    });

    const data = await response.json();
    if (response.ok) {
      Alert.alert(
        "Success",
        `${type} saved as '${finalTitle}'`,
        [{ text: 'OK' }]
      );
      console.log(`Saved ${type} note`, data);
      
      // Reset states
      setAudioUri(null);
      setTranscription('');
      setSummary('');
      
      // Navigate back to Home with refresh trigger
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home', params: { userData, refresh: Date.now() } }],
      });
    } else {
      Alert.alert(
        "Failed",
        `Could not save ${type}.`,
        [{ text: 'OK' }]
      );
      console.error("Save error:", data);
    }
  } catch (err) {
    console.error('Note save failed:', err);
    Alert.alert(
      "Error",
      "Something went wrong.",
      [{ text: 'OK' }]
    );
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
              <TouchableOpacity
                style={[styles.stopButton, { backgroundColor: summarizing || !transcription ? '#999' : '#e53e3e' }]}
                disabled={!transcription || summarizing}
                onPress={summarizeText}
              >
                <Icon name="book-open" size={24} color="white" />
                <Text style={styles.buttonText}>Summarize</Text>
              </TouchableOpacity>
            </>
          )}

          {uploading && <ActivityIndicator size="large" color="#2196F3" style={{ marginVertical: 10 }} />}

          {transcription !== '' && (
            <ScrollView style={{ padding: 16 }} contentContainerStyle={{ flexGrow: 1, alignItems: 'flex-start' }}>
              <Text style={styles.modalTitle}>Transcription:</Text>
              <Text>{transcription}</Text>
            </ScrollView>
          )}

          {summary !== '' && (
            <ScrollView style={{ padding: 16 }} contentContainerStyle={{ flexGrow: 1, alignItems: 'flex-start' }}>
              <Text style={styles.modalTitle}>Summary:</Text>
              <Text>{summary}</Text>
            </ScrollView>
          )}

          <Text style={styles.statusText}>
            {audioUri ? "Audio selected. Ready to transcribe." : "No audio file selected."}
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

      {/* Custom Android Title Input Modal */}
      <Modal transparent visible={showTitlePrompt} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{`Save ${promptType}`}</Text>
            <Text style={styles.modalDescription}>Enter a title:</Text>
            <TextInput
              style={styles.titleInput}
              value={titleInput}
              onChangeText={setTitleInput}
              placeholder="Enter title"
              autoFocus
            />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setShowTitlePrompt(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={() => {
                  setShowTitlePrompt(false);
                  if (!titleInput || titleInput.trim() === '') return;
                  
                  const finalTitle = `${titleInput.trim()} ${promptType === 'Summary' ? 'Summary' : 'Notes'}`;
                  saveNoteToServer(finalTitle, promptType, promptContent);
                }}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
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
  stopButton: { backgroundColor: "#e53e3e", flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, marginBottom: 10 },
  buttonText: { color: "white", fontWeight: "bold", marginLeft: 8 },
  statusText: { textAlign: "center", color: "#6b7280", fontSize: 14 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  modalDescription: { fontSize: 14, color: "#6b7280", textAlign: "center", marginBottom: 20 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "white", borderRadius: 10, padding: 24, width: "80%", alignItems: "center", marginBottom: 16 },
  titleInput: { width: '100%', height: 40, borderColor: 'gray', borderWidth: 1, padding: 10, borderRadius: 5, marginBottom: 10 },
  modalButtonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 20 },
  modalButton: { padding: 10, borderRadius: 5, width: '48%', alignItems: 'center' },
  cancelButton: { backgroundColor: "#e53e3e" },
  cancelButtonText: { color: "white", fontWeight: "bold" },
  saveButton: { backgroundColor: "#4CAF50" },
  saveButtonText: { color: "white", fontWeight: "bold" },
  sectionButton: { backgroundColor: "#1f2937", paddingVertical: 10, paddingHorizontal: 24, borderRadius: 8, marginVertical: 6, width: "100%", alignItems: "center" },
  sectionButtonText: { color: "white", fontWeight: "bold" },
});

