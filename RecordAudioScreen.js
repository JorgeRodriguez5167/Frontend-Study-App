import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Modal, Alert, Platform } from 'react-native';
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
  const [sound, setSound] = useState();
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');

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

  const playRecording = async () => {
    if (!audioUri) return;
    const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
    setSound(sound);
    await sound.playAsync();
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setShowCategoryModal(false);
    startRecording();
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
        formData.append('file', new File([blob], 'recording.wav', { type: 'audio/wav' }));
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
      console.log('📝 Transcribe response:', data);
      setTranscription(data.transcription || '');
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
        body: JSON.stringify({ text: transcription }),
      });

      const data = await response.json();
      setSummary(data.summary);
    } catch (err) {
      console.error('Summarization failed', err);
      Alert.alert('Error', 'Failed to summarize the note.');
    } finally {
      setSummarizing(false);
    }
  };

  const saveTranscriptNote = async () => {
    try {
      await fetch(`${BACKEND_URL}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: "Transcript Note",
          content: transcription,
          category: selectedCategory,
          user_id: 2
        })
      });
      Alert.alert("Success", "Transcript saved.");
    } catch (err) {
      Alert.alert("Error", "Failed to save transcript.");
    }
  };
  
  const saveSummaryNote = async () => {
    try {
      await fetch(`${BACKEND_URL}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: "Summary Note",
          content: summary,
          category: selectedCategory,
          user_id: 2
        })
      });
      Alert.alert("Success", "Summary saved.");
    } catch (err) {
      Alert.alert("Error", "Failed to save summary.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Record Audio Note</Text>
            <Text style={styles.cardDescription}>Category: {selectedCategory || 'Not selected'}</Text>
          </View>

          <View style={styles.recordingContainer}>
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
                <TouchableOpacity style={styles.replayButton} onPress={playRecording}>
                  <Icon name="play" size={24} color="white" />
                  <Text style={styles.buttonText}>Replay Audio</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.recordButton} onPress={transcribeAudio}>
                  <Icon name="upload" size={24} color="white" />
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
          </View>

          {uploading && <ActivityIndicator size="large" color="#2196F3" style={{ marginVertical: 10 }} />}

         


          {transcription !== '' && (
            <TouchableOpacity
              style={[styles.recordButton, { backgroundColor: "#1f2937" }]}
              onPress={saveTranscriptNote}
            >
              <Icon name="save" size={24} color="white" />
              <Text style={styles.buttonText}>Save Transcript</Text>
            </TouchableOpacity>
          )}

          

          {summary !== '' && (
            <TouchableOpacity
              style={[styles.stopButton, { backgroundColor: "#e53e3e" }]}
              onPress={saveSummaryNote}
            >
              <Icon name="save" size={24} color="white" />
              <Text style={styles.buttonText}>Save Summary</Text>
            </TouchableOpacity>
          )}


          <Text style={styles.statusText}>
            {isRecording ? "Recording in progress..." : audioUri ? "Recording saved. Ready to replay." : "Ready to record"}
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
  recordingContainer: { alignItems: "center", marginBottom: 24 },
  recordButton: { backgroundColor: "black", flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, marginBottom: 10 },
  stopButton: { backgroundColor: "#e53e3e", flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, marginBottom: 10 },
  replayButton: { backgroundColor: "#000000", flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8 },
  buttonText: { color: "white", fontWeight: "bold", marginLeft: 8 },
  statusText: { textAlign: "center", color: "#6b7280", fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "white", borderRadius: 10, padding: 24, width: "80%", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  sectionButton: { backgroundColor: "#1f2937", paddingVertical: 10, paddingHorizontal: 24, borderRadius: 8, marginVertical: 6, width: "100%", alignItems: "center" },
  sectionButtonText: { color: "white", fontWeight: "bold" },
});
