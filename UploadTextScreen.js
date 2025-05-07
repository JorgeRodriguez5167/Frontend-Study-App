import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { useRoute } from "@react-navigation/native";
//File workd on by Sebastian and Rodolfo 
export default function UploadTextScreen() {
  const [file, setFile] = useState(null);
  const route = useRoute();
  const userData = route?.params?.userData || { userId: 1 };

  const handleUpload = () => {
    // In a real app, you would upload the file to your server here
    //Feature was not complete
    console.log("Uploading file...", userData);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Upload Text Note</Text>
            <Text style={styles.cardDescription}>Select a text file to upload</Text>
          </View>

          {/* Upload Button */}
          <TouchableOpacity
            style={[styles.uploadButton, !file && styles.disabledButton]}
            onPress={handleUpload}
            disabled={!file}
          >
            <Icon name="upload" size={20} color="white" />
            <Text style={styles.buttonText}>Upload Text</Text>
          </TouchableOpacity>

          <Text style={styles.supportedFormats}>Supported formats: TXT, DOC, DOCX, PDF</Text>
        </View>
      </View>
    </SafeAreaView>
  );
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
  uploadButton: {
    backgroundColor: "#e53e3e",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 16,
  },
  disabledButton: {
    backgroundColor: "#f87171",
    opacity: 0.7,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
  },
  supportedFormats: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: 14,
  },
});
