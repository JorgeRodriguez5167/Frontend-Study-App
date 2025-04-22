import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Modal, Alert, ActivityIndicator
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import Icon from 'react-native-vector-icons/Feather';

const BACKEND_URL = 'https://backend-study-app-production.up.railway.app';

export default function UploadAudioScreen() {
  const [audioUri, setAudioUri] = useState(null);
  const [sound, setSound] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [summary, setSummary] = useState('');
  const [uploading, setUploading] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const categoryOptions = ['Health', 'Biology', 'Arts', 'English', 'History'];

  const pickAudioFile = async () => {
    setTranscription('');
    setSummary('');
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*', copyToCacheDirectory: true });
      if (!result.canceled && result.assets?.[0]?.uri) {
        setAudioUri(result.assets[0].uri);
        setShowCategoryModal(true);
      }
    } catch (error) {
      console.error('File selection error:', error);
    }
  };

  const playAudio = async () => {
    if (!audioUri) return;
    try {
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: audioUri });
      setSound(newSound);
      await newSound.playAsync();
    } catch (error) {
      console.error('Playback error:', error);
    }
  };

  const transcribeAudio = async () => {
    if (!audioUri) return;
    setUploading(true);
    setTranscription('');

    try {
      const response = await fetch(audioUri);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append('file', blob, 'uploaded_audio.wav');

      const res = await fetch(`${BACKEND_URL}/transcribe?stream=false`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      setTranscription(data.transcription || '');
      Alert.alert(' Transcription Complete', 'Audio has been successfully transcribed.');
    } catch (error) {
      console.error('Transcription error:', error);
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
      setSummary(data.summary || '');
      Alert.alert(' Summarized', 'Summary created successfully.');
    } catch (err) {
      console.error('Summarization failed', err);
      Alert.alert('Error', 'Failed to summarize.');
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
          }),
        });

        if (response.ok) {
          Alert.alert(' Success', `${type} saved as "${fullTitle}"`);
        } else {
          Alert.alert('Failed', `Could not save ${type}.`);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to save note.');
      }
    });
  };

  const handleConfirmAnswer = (answer) => {
    setShowConfirmModal(false);
    if (answer === 'no') {
      setAudioUri(null);
      setTranscription('');
      setSummary('');
    }
  };

  useEffect(() => {
    return sound ? () => sound.unloadAsync() : undefined;
  }, [sound]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Upload Audio Note</Text>
            <Text style={styles.cardDescription}>Category: {selectedCategory || 'Not selected'}</Text>
          </View>

          <TouchableOpacity style={styles.uploadButton} onPress={pickAudioFile}>
            <Icon name="upload" size={20} color="white" />
            <Text style={styles.buttonText}>Upload Audio</Text>
          </TouchableOpacity>

          {audioUri && (
            <>
              <TouchableOpacity style={styles.replayButton} onPress={playAudio}>
                <Icon name="play" size={20} color="white" />
                <Text style={styles.buttonText}>Replay</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.replayButton} onPress={transcribeAudio}>
                <Icon name="file-text" size={20} color="white" />
                <Text style={styles.buttonText}>Transcribe</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.stopButton, { backgroundColor: summarizing || !transcription ? '#999' : '#e53e3e' }]}
                disabled={!transcription || summarizing}
                onPress={summarizeText}
              >
                <Icon name="book-open" size={20} color="white" />
                <Text style={styles.buttonText}>Summarize</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => saveNote("Notes", transcription)}
                disabled={!transcription}
              >
                <Icon name="save" size={20} color="white" />
                <Text style={styles.buttonText}>Save Transcript</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.uploadButton}
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

          <Text style={styles.supportedFormats}>Supported formats: MP3, WAV, M4A</Text>
        </View>
      </View>

      <Modal transparent visible={showCategoryModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose the category:</Text>
            {categoryOptions.map((cat) => (
              <TouchableOpacity key={cat} style={styles.sectionButton} onPress={() => {
                setSelectedCategory(cat);
                setShowCategoryModal(false);
                setShowConfirmModal(true);
              }}>
                <Text style={styles.sectionButtonText}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      <Modal transparent visible={showConfirmModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Is this the audio you want to send?</Text>

            <TouchableOpacity style={styles.sectionButton} onPress={() => handleConfirmAnswer("yes")}>
              <Text style={styles.sectionButtonText}>Yes</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sectionButton} onPress={() => handleConfirmAnswer("no")}>
              <Text style={styles.sectionButtonText}>No</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  content: { flex: 1, padding: 16, justifyContent: 'center' },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: { alignItems: 'center', marginBottom: 24 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#e53e3e', marginBottom: 8 },
  cardDescription: { fontSize: 14, color: '#6b7280', textAlign: 'center' },
  uploadButton: {
    backgroundColor: '#e53e3e',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
  },
  replayButton: {
    backgroundColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
  },
  stopButton: {
    backgroundColor: '#1f2937',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: { color: 'white', fontWeight: 'bold', marginLeft: 8 },
  supportedFormats: { textAlign: 'center', color: '#6b7280', fontSize: 14, marginTop: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', borderRadius: 10, padding: 24, width: '80%', alignItems: 'center' },
  modalTitle: {
