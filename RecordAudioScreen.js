import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, ActivityIndicator, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import styles from './styles';

const BACKEND_URL = 'https://backend-study-app.up.railway.app';

const RecordAudioScreen = () => {
  const [recording, setRecording] = useState(null);
  const [recordedUri, setRecordedUri] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [summary, setSummary] = useState('');
  const [uploading, setUploading] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [sound, setSound] = useState();

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordedUri(uri);
      setRecording(null);
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  const playRecording = async () => {
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
      Alert.alert('Error', 'Summarization failed.');
    } finally {
      setSummarizing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Record Audio</Text>

      <TouchableOpacity style={styles.recordButton} onPress={recording ? stopRecording : startRecording}>
        <Text style={styles.recordButtonText}>{recording ? 'Stop Recording' : 'Start Recording'}</Text>
      </TouchableOpacity>

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
    </View>
  );
};

export default RecordAudioScreen;

