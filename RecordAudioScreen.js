import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { View, Text, TouchableOpacity, ScrollView, Platform, ActivityIndicator, Alert } from 'react-native';
=======
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Modal, Alert, Platform } from 'react-native';
>>>>>>> main
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import styles from './styles';

<<<<<<< HEAD
const BACKEND_URL = 'https://backend-study-app.up.railway.app';

const RecordAudioScreen = () => {
  const [recording, setRecording] = useState(null);
  const [recordedUri, setRecordedUri] = useState(null);
=======
const BACKEND_URL = 'https://backend-study-app-production.up.railway.app';

export default function RecordAudioScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUri, setAudioUri] = useState(null);
>>>>>>> main
  const [transcription, setTranscription] = useState('');
  const [summary, setSummary] = useState('');
  const [uploading, setUploading] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [sound, setSound] = useState();
<<<<<<< HEAD

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
    } catch (err) {
      console.error('Failed to start recording', err);
=======
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
>>>>>>> main
    }
  };

  const stopRecording = async () => {
    try {
<<<<<<< HEAD
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordedUri(uri);
      setRecording(null);
    } catch (err) {
      console.error('Failed to stop recording', err);
=======
      await isRecording.stopAndUnloadAsync();
      const uri = isRecording.getURI();
      setAudioUri(uri);
    } catch (err) {
      console.error('Failed to stop recording', err);
      Alert.alert('Error', 'Failed to stop recording.');
    } finally {
      setIsRecording(false);
>>>>>>> main
    }
  };

  const playRecording = async () => {
<<<<<<< HEAD
    try {
      const { sound } = await Audio.Sound.createAsync({ uri: recordedUri });
      setSound(sound);
      await sound.playAsync();
    } catch (err) {
      console.error('Failed to play recording', err);
    }
  };

  useEffect(() => {
    return sound ? () => sound.unloadAsync() : undefined;
  }, [sound]);

  const transcribeRecording = async () => {
    setUploading(true);
    setTranscription('');
    try {
      const formData = new FormData();
      if (Platform.OS === 'web') {
        const response = await fetch(recordedUri);
        const audioBlob = await response.blob();
        formData.append('file', new File([audioBlob], 'recording.wav', { type: 'audio/wav' }));
      } else {
        const ext = recordedUri.split('.').pop() || 'm4a';
        const mimeType = ext === 'mp3' ? 'audio/mpeg' : ext === 'wav' ? 'audio/wav' : 'audio/m4a';
        formData.append('file', {
          uri: recordedUri,
          name: `recording.${ext}`,
          type: mimeType,
        });
      }
      const response = await fetch(`${BACKEND_URL}/transcribe?stream=false`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setTranscription(data.transcription);
    } catch (err) {
      console.error('Transcription failed', err);
      Alert.alert('Error', 'Transcription failed.');
=======
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
>>>>>>> main
    } finally {
      setUploading(false);
    }
  };

  const summarizeText = async () => {
    if (!transcription) return;
    setSummarizing(true);
<<<<<<< HEAD
=======

>>>>>>> main
    try {
      const response = await fetch(`${BACKEND_URL}/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: transcription }),
      });
<<<<<<< HEAD
=======

>>>>>>> main
      const data = await response.json();
      setSummary(data.summary);
    } catch (err) {
      console.error('Summarization failed', err);
<<<<<<< HEAD
      Alert.alert('Error', 'Summarization failed.');
=======
      Alert.alert('Error', 'Failed to summarize the note.');
>>>>>>> main
    } finally {
      setSummarizing(false);
    }
  };

  return (
    <View style={styles.container}>
<<<<<<< HEAD
      <Text style={styles.title}>Record Audio</Text>
=======
      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Record Audio Note</Text>
            <Text style={styles.cardDescription}>Category: {selectedCategory || 'Not selected'}</Text>
          </View>
>>>>>>> main

      <TouchableOpacity style={styles.recordButton} onPress={recording ? stopRecording : startRecording}>
        <Text style={styles.recordButtonText}>{recording ? 'Stop Recording' : 'Start Recording'}</Text>
      </TouchableOpacity>

<<<<<<< HEAD
      {recordedUri && (
        <>
          <TouchableOpacity style={styles.sectionButton} onPress={playRecording}>
            <Text style={styles.sectionButtonText}>Replay</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sectionButton} onPress={transcribeRecording}>
            <Text style={styles.sectionButtonText}>Send Audio</Text>
          </TouchableOpacity>
        </>
      )}

      {uploading && <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />}

      {transcription !== '' && (
        <ScrollView style={styles.transcriptionBox}>
          <Text style={styles.transcriptionText}>{transcription}</Text>
          <TouchableOpacity style={styles.sectionButton} onPress={summarizeText} disabled={summarizing}>
            <Text style={styles.sectionButtonText}>Summarize</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {summary !== '' && (
        <ScrollView style={styles.transcriptionBox}>
          <Text style={styles.transcriptionText}>Summary: {summary}</Text>
        </ScrollView>
      )}
=======
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
            <ScrollView 
            style={styles.modalContent} 
            contentContainerStyle={{ alignItems: 'flex-start' }}  // Or center, stretch, etc.
          >
            <Text style={styles.modalTitle}>Transcription:</Text>
            <Text>{transcription}</Text>
          </ScrollView>

          )}
          {summary !== '' && (
            <ScrollView 
            style={styles.modalContent} 
            contentContainerStyle={{ alignItems: 'flex-start' }}  // Or center, stretch, etc.
          >
            <Text style={styles.modalTitle}>Transcription:</Text>
            <Text>{transcription}</Text>
          </ScrollView>
  
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
>>>>>>> main
    </View>
  );
};

<<<<<<< HEAD
export default RecordAudioScreen;

=======
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
>>>>>>> main
