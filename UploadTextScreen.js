import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, Alert, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const BACKEND_URL = 'https://backend-study-app-production.up.railway.app';

export default function UploadTextScreen({ navigation, route }) {
  const [inputText, setInputText] = useState('');
  const [summary, setSummary] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const userData = route?.params?.userData || { userId: 2 };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setShowCategoryModal(false);
  };

  const handleSummarizeAndSave = async () => {
    if (!inputText.trim()) {
      Alert.alert("Error", "Please enter some text.");
      return;
    }

    Alert.prompt("Save Note", "Enter a title for your note:", [
      {
        text: "Cancel",
        style: "cancel"
      },
      {
        text: "Save",
        onPress: async (title) => {
          if (!title || title.trim() === '') {
            Alert.alert('Error', 'Please enter a valid title.');
            return;
          }

          try {
            setUploading(true);

            const response = await fetch(`${BACKEND_URL}/summarize`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: inputText })
            });

            const data = await response.json();
            const summaryText = data.summary || '';

            const userId = userData.userId || userData.user_id || 2;

            const saveRes = await fetch(`${BACKEND_URL}/notes`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                user_id: userId,
                title: title.trim(),
                category: selectedCategory,
                transcription: inputText,
                summarized_notes: summaryText
              })
            });

            if (saveRes.ok) {
              Alert.alert("Success", "Note saved successfully!");
              setInputText('');
              navigation.reset({
                index: 0,
                routes: [{ name: 'Home', params: { userData, refresh: Date.now() } }],
              });
            } else {
              throw new Error("Failed to save note.");
            }
          } catch (err) {
            console.error("Error saving note:", err);
            Alert.alert("Error", err.message || "Something went wrong.");
          } finally {
            setUploading(false);
          }
        }
      }
    ], 'plain-text');
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Summarize Your Notes</Text>
        <Text style={styles.cardDescription}>Category: {selectedCategory || 'Not selected'}</Text>

        <TouchableOpacity
          style={styles.categoryButton}
          onPress={() => setShowCategoryModal(true)}
        >
          <Icon name="list" size={20} color="white" />
          <Text style={styles.buttonText}>Choose Category</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          multiline
          placeholder="Paste or write your notes here..."
          value={inputText}
          onChangeText={setInputText}
        />

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSummarizeAndSave}
          disabled={uploading}
        >
          <Icon name="save" size={20} color="white" />
          <Text style={styles.buttonText}>Summarize & Save</Text>
        </TouchableOpacity>

        {uploading && <ActivityIndicator size="large" color="#2196F3" style={{ marginTop: 16 }} />}
      </View>

      <Modal transparent visible={showCategoryModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Please choose the section:</Text>
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
  container: { flex: 1, backgroundColor: "#f3f4f6", justifyContent: "center", padding: 16 },
  card: { backgroundColor: "white", borderRadius: 8, padding: 16, elevation: 2 },
  cardTitle: { fontSize: 20, fontWeight: "bold", color: "#e53e3e", marginBottom: 8, textAlign: 'center' },
  cardDescription: { fontSize: 14, color: "#6b7280", textAlign: "center", marginBottom: 16 },
  input: { backgroundColor: "#f9fafb", borderColor: "#d1d5db", borderWidth: 1, borderRadius: 8, padding: 12, height: 150, textAlignVertical: "top", marginBottom: 16 },
  saveButton: { backgroundColor: "#4CAF50", flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 12, borderRadius: 8 },
  categoryButton: { backgroundColor: "#1f2937", flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 10, borderRadius: 8, marginBottom: 16 },
  buttonText: { color: "white", fontWeight: "bold", marginLeft: 8 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "white", borderRadius: 10, padding: 24, width: "80%", alignItems: "center" },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 16 },
  sectionButton: { backgroundColor: "#1f2937", paddingVertical: 10, paddingHorizontal: 24, borderRadius: 8, marginVertical: 6, width: "100%", alignItems: "center" },
  sectionButtonText: { color: "white", fontWeight: "bold" }
});
