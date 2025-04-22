import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Modal, Platform
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import Icon from 'react-native-vector-icons/Feather';

const BACKEND_URL = 'https://backend-study-app-production.up.railway.app';

export default function RecordAudioScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUri, setAudioUri] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [summary, setSummary] = useState('');
  const [uploading, setUploading] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setShowCategoryModal(false);
    startRecording();
  };

  const startRecording = async () => {
    try {
      setTranscription('');
      setSummary('');
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) throw new Error('Permission to access microphone is required');

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setIsRecording(recording);
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording.');
    }
  };

  const stopRecording = async () => {
    try {
      await isRecording.stopAndUnloadAsync();
      const uri = isRecording.getURI();
      setAudioUri(uri);
    } catch (err) {
      console.error('Failed to stop recording', err);
      Alert.alert('Error', 'Failed to stop recording.');
    } finally {
      setIsRecording(false);
    }
  };

  const transcribeAudio = async () => {
    if (!audioUri) return;
    setUploading(true);
    setTranscription('');

    try {
      const result = await FileSystem.uploadAsync(`${BACKEND_URL}/transcribe?stream=false`, audioUri, {
        fieldName: 'file',
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        mimeType: 'audio/m4a'
      });
      const data = JSON.parse(result.body);
      setTranscription(data.transcription || '');
      Alert.alert("Transcribed", "Audio was transcribed successfully.");
    } catch (err) {
      console.error('Transcription failed', err);
      Alert.alert('Error', 'Failed to transcribe audio.');
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
      setSummary(data.summary || '');
      Alert.alert("Summarized", "Summary created successfully.");
    } catch (err) {
      console.error('Summarization failed', err);
      Alert.alert('Error', 'Failed to summarize the note.');
    } finally {
      setSummarizing(false);
    }
  };

  const saveNote = async (type, content) => {
    if (!content) return;

    Alert.prompt(`Save ${type}`, "Enter a title:", async (title) => {
      if (!title) return;

      const fullTitle = `${title} ${type === 'Summary' ? 'Summary' : 'Notes'}`;
      try {
        const response = await fetch(`${BACKEND_URL}/notes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: fullTitle,
            content,
            category: selectedCategory,
            user_id: 2
          })
        });
        if (response.ok) {
          Alert.alert( "Success", `${type} saved as \"${fullTitle}\"`);
        } else {
          Alert.alert("Failed", `Could not save ${type}.`);
        }
      } catch (err) {
        Alert.alert("Error", "Failed to save note.");
      }
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Record Audio</Text>
            <Text style={styles.cardDescription}>Category: {selectedCategory || 'Not selected'}</Text>
          </View>

          {isRecording ? (
            <TouchableOpacity style={styles.stopButton} onPress={stopRecording}>
              <Icon name="square" size={24} color="white" />
              <Text style={styles.buttonText}>Stop Recording</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.recordButton} onPress={() => setShowCategoryModal(true)}>
              <Icon name="mic" size={24} color="white" />
              <Text style={styles.buttonText}>Start Recording</Text>
            </TouchableOpacity>
          )}

          {audioUri && !isRecording && (
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
              <TouchableOpacity
                style={styles.recordButton}
                onPress={() => saveNote("Notes", transcription)}
                disabled={!transcription}
              >
                <Icon name="save" size={20} color="white" />
                <Text style={styles.buttonText}>Save Transcript</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.recordButton}
                onPress={() => saveNote("Summary", summary)}
                disabled={!summary}
              >
                <Icon name="save" size={20} color="white" />
                <Text style={styles.buttonText}>Save Summary</Text>
              </TouchableOpacity>
            </>
          )}

          {uploading && <ActivityIndicator size="large" color="#2196F3" style={{ marginVertical: 10 }} />}
          {summarizing && <ActivityIndicator size="large" color="#e53e3e" style={{ marginVertical: 10 }} />}

          <Text style={styles.statusText}>
            {isRecording ? "Recording in progress..." : audioUri ? "Recording saved." : "Ready to record."}
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
  stopButton: { backgroundColor: "#e53e3e", flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, marginBottom: 10 },
  buttonText: { color: "white", fontWeight: "bold", marginLeft: 8 },
  statusText: { textAlign: "center", color: "#6b7280", fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "white", borderRadius: 10, padding: 24, width: "80%", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  sectionButton: { backgroundColor: "#1f2937", paddingVertical: 10, paddingHorizontal: 24, borderRadius: 8, marginVertical: 6, width: "100%", alignItems: "center" },
  sectionButtonText: { color: "white", fontWeight: "bold" }
});
