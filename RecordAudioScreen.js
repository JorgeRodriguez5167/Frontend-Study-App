import React, { useState, useRef, useEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Audio } from 'expo-av';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';

export default function RecordAudioScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [audioUri, setAudioUri] = useState(null);
  const [sound, setSound] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [transcription, setTranscription] = useState(null);
  const [uploading, setUploading] = useState(false);

  const navigation = useNavigation();
  const categoryOptions = ['Health', 'Biology', 'Arts', 'English', 'History'];

  const requestMicPermission = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Microphone access is needed to record audio.');
      return false;
    }
    return true;
  };

  const startRecording = async () => {
    const hasPermission = await requestMicPermission();
    if (!hasPermission) return;

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true
      });
      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await newRecording.startAsync();
      setRecording(newRecording);
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording', error);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setAudioUri(uri);
      setRecording(null);
      setIsRecording(false);
      setShowConfirmModal(true);
    } catch (error) {
      console.error('Failed to stop recording', error);
    }
  };

  const playRecording = async () => {
    if (!audioUri) return;
    try {
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: audioUri });
      setSound(newSound);
      await newSound.playAsync();
    } catch (error) {
      console.error('Error playing sound', error);
    }
  };

  const transcribeRecording = async () => {
    if (!audioUri) return;
    setUploading(true);
    setTranscription(null);
    try {
      const response = await fetch(audioUri);
      const audioBlob = await response.blob();
      const file = new File([audioBlob], 'recorded_audio.wav', {
        type: 'audio/wav',
      });
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('https://backend-study-app-production.up.railway.app/transcribe?stream=false', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Transcription failed');

      const data = await res.json();
      setTranscription(data.transcription);

      // 🚀 Send transcription and selected category to HomeScreen
      navigation.navigate('HomeScreen', {
        transcribedText: data.transcription,
        category: selectedCategory,
      });

    } catch (error) {
      console.error('Upload or transcription error:', error);
      Alert.alert('Error', 'Failed to transcribe the audio.');
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmAnswer = (answer) => {
    setShowConfirmModal(false);
    if (answer === 'no') {
      setAudioUri(null);
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
            <Text style={styles.cardTitle}>Record Audio Note</Text>
            <Text style={styles.cardDescription}>Click the button to start recording your audio note</Text>
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

                <TouchableOpacity style={styles.replayButton} onPress={transcribeRecording}>
                  <Icon name="upload" size={24} color="white" />
                  <Text style={styles.buttonText}>Transcribe</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Category Selection Modal */}
      <Modal transparent visible={showCategoryModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose a category:</Text>
            {categoryOptions.map((section) => (
              <TouchableOpacity
                key={section}
                style={styles.sectionButton}
                onPress={() => {
                  setSelectedCategory(section);
                  setShowCategoryModal(false);
                  startRecording();
                }}
              >
                <Text style={styles.sectionButtonText}>{section}</Text>
              </TouchableOpacity>
            ))}
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
  recordingContainer: { alignItems: 'center', marginBottom: 24 },
  recordButton: {
    backgroundColor: 'black',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
  },
  stopButton: {
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
  buttonText: { color: 'white', fontWeight: 'bold', marginLeft: 8 },
  statusText: { textAlign: 'center', color: '#6b7280', fontSize: 14 },
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
