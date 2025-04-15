import { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from "react-native"
import Icon from "react-native-vector-icons/Feather"
import { Audio } from "expo-av"

export default function RecordScreen() {
  const [isRecording, setIsRecording] = useState(false)
  const [recording, setRecording] = useState(null)
  const [audioUri, setAudioUri] = useState(null)
  const [sound, setSound] = useState(null)

  const requestMicPermission = async () => {
    const { status } = await Audio.requestPermissionsAsync()
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Microphone access is needed to record audio.")
      return false
    }
    return true
  }

  const startRecording = async () => {
    const hasPermission = await requestMicPermission()
    if (!hasPermission) return

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      })

      const newRecording = new Audio.Recording()
      await newRecording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY)
      await newRecording.startAsync()

      setRecording(newRecording)
      setIsRecording(true)
    } catch (error) {
      console.error("Failed to start recording:", error)
    }
  }

  const stopRecording = async () => {
    if (!recording) return

    try {
      await recording.stopAndUnloadAsync()
      const uri = recording.getURI()
      setAudioUri(uri)
      setRecording(null)
      setIsRecording(false)
      console.log("Recording saved at:", uri)
    } catch (error) {
      console.error("Failed to stop recording:", error)
    }
  }

  const playRecording = async () => {
    if (!audioUri) return

    try {
      const { sound: playbackSound } = await Audio.Sound.createAsync({ uri: audioUri })
      setSound(playbackSound)
      await playbackSound.playAsync()
    } catch (error) {
      console.error("Failed to play recording:", error)
    }
  }

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
              <TouchableOpacity style={styles.recordButton} onPress={startRecording}>
                <Icon name="mic" size={24} color="white" />
                <Text style={styles.buttonText}>Start Recording</Text>
              </TouchableOpacity>
            )}

            {audioUri && !isRecording && (
              <TouchableOpacity style={styles.replayButton} onPress={playRecording}>
                <Icon name="play" size={24} color="white" />
                <Text style={styles.buttonText}>Replay Audio</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.statusText}>
            {isRecording ? "Recording in progress..." : audioUri ? "Recording saved. Ready to replay." : "Ready to record"}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#e53e3e",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  recordingContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  recordButton: {
    backgroundColor: "black",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
  },
  stopButton: {
    backgroundColor: "#e53e3e",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
  },
  replayButton: {
    backgroundColor: "#000000",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
  },
  statusText: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: 14,
  },
})
