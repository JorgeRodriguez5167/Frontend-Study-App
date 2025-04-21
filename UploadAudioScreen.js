import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Modal, Pressable, ScrollView, Alert
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import Icon from 'react-native-vector-icons/Feather';

export default function UploadAudioScreen() {
  const [audioUri, setAudioUri] = useState(null);
  const [sound, setSound] = useState(null);
  const [transcription, setTranscription] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const categoryOptions = ['Health', 'Biology', 'Arts', 'English', 'History'];

  const pickAudioFile = async () => {
    setTranscription(null);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });
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
    setTranscription(null);

    try {
      const response = await fetch(audioUri);
      const audioBlob = await response.blob();
      const file = new File([audioBlob], 'uploaded_audio.wav', { type: 'audio/wav' });
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('https://backend-study-app-production.up.railway.app/transcribe?stream=false', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Transcription failed');

      const data = await res.json();
      setTranscription(data.transcription);
    } catch (error) {
      console.error('Transcription error:', error);
      Alert.alert('Error', 'Failed to transcribe audio.');
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmAnswer = (answer) => {
    setShowConfirmModal(false);
    if (answer === 'no') {
      setAudioUri(null);
      setTranscription(null);
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
            <Text style={styles.cardDescription}>Select an audio file to upload</Text>
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
                <Icon name="upload" size={20} color="white" />
                <Text style={styles.buttonText}>Transcribe</Text>
              </TouchableOpacity>
            </>
          )}

          {uploading && <Text style={styles.statusText}>Uploading...</Text>}

          {transcription && (
            <ScrollView style={styles.transcriptionBox}>
              <Text style={{ color: '#1f2937' }}>{transcription}</Text>
            </ScrollView>
          )}

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
    marginBottom: 16,
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
  buttonText: { color: 'white', fontWeight: 'bold', marginLeft: 8 },
  supportedFormats: { textAlign: 'center', color: '#6b7280', fontSize: 14 },
  statusText: { textAlign: 'center', color: '#6b7280', fontSize: 14, marginBottom: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', borderRadius: 10, padding: 24, width: '80%', alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  sectionButton: {
    backgroundColor: '#1f2937',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginVertical: 6,
    width: '100%',
    alignItems: 'center',
  },
  sectionButtonText: { color: 'white', fontWeight: 'bold' },
  transcriptionBox: { maxHeight: 200, marginTop: 10, backgroundColor: '#fff', padding: 10, borderRadius: 6 },
});
