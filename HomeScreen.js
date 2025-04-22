import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Feather";

// Mock notes data
const mockNotes = {
  work: [
    { id: "1", title: "Meeting notes", content: "Discuss project timeline with team members..." },
    { id: "2", title: "Task list", content: "Complete report by Friday, review documentation..." },
  ],
  personal: [
    { id: "3", title: "Shopping list", content: "Milk, eggs, bread, vegetables, fruits..." },
    { id: "4", title: "Birthday reminder", content: "Mom's birthday next week, buy a gift..." },
  ],
  study: [
    { id: "5", title: "Math formulas", content: "Quadratic equation: ax² + bx + c = 0..." },
    { id: "6", title: "History dates", content: "World War II: 1939-1945, French Revolution: 1789..." },
  ],
  ideas: [
    { id: "7", title: "App idea", content: "Create a meal planning app with recipe suggestions..." },
    { id: "8", title: "Blog post", content: "Write about productivity tips for remote work..." },
  ],
  misc: [
    { id: "9", title: "Sample Note", content: "This is a preview of the note content..." },
    { id: "10", title: "Another Note", content: "Here's another note preview..." },
  ],
};

export default function HomeScreen() {
  const [activeCategory, setActiveCategory] = useState("misc");
  const navigation = useNavigation();

  const renderNoteItem = ({ item }) => (
    <View style={styles.noteCard}>
      <Text style={styles.noteTitle}>{item.title}</Text>
      <Text style={styles.noteContent}>{item.content}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>NoteApp</Text>
        </View>
        <TouchableOpacity style={styles.accountButton} onPress={() => navigation.navigate("AccountSettings")}>
          <Icon name="settings" size={20} color="white" />
          <Text style={styles.accountButtonText}>Account</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>

          <TouchableOpacity style={styles.blackButton} onPress={() => navigation.navigate("RecordAudio")}>
            <Icon name="mic" size={20} color="white" />
            <Text style={styles.blackButtonText}>Record Lecture</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.whiteButton} onPress={() => navigation.navigate("UploadAudio")}>
            <Icon name="upload" size={20} color="black" />
            <Text style={styles.whiteButtonText}>Upload Audio</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.whiteButton} onPress={() => navigation.navigate("UploadText")}>
            <Icon name="file-text" size={20} color="black" />
            <Text style={styles.whiteButtonText}>Upload Text</Text>
          </TouchableOpacity>
        </View>

        {/* Notes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>

          {/* Category Tabs */}
          <FlatList
            horizontal
            data={["Health", "Biology", "Arts", "English", "History"]}
            renderItem={({ item }) => (
              <TouchableOpacity
                key={item}
                style={[styles.categoryTab, activeCategory === item && styles.activeCategoryTab]}
                onPress={() => setActiveCategory(item)}
              >
                <Text style={[styles.categoryTabText, activeCategory === item && styles.activeCategoryTabText]}>
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            style={styles.categoryTabs}
          />

          {/* Notes List */}
          <FlatList
            data={mockNotes[activeCategory]}
            renderItem={renderNoteItem}
            keyExtractor={(item) => item.id}
            style={styles.notesList}
            nestedScrollEnabled={true}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    backgroundColor: "#e53e3e",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  accountButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
  },
  accountButtonText: {
    color: "white",
    marginLeft: 8,
  },
  content: {
    paddingBottom: 16,
  },
  section: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  blackButton: {
    backgroundColor: "black",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  blackButtonText: {
    color: "white",
    marginLeft: 8,
    fontWeight: "500",
  },
  whiteButton: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 12,
  },
  whiteButtonText: {
    color: "black",
    marginLeft: 8,
    fontWeight: "500",
  },
  categoryTabs: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 4,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  activeCategoryTab: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  categoryTabText: {
    color: "#6b7280",
    fontWeight: "500",
  },
  activeCategoryTabText: {
    color: "black",
  },
  notesList: {
    marginTop: 8,
  },
  noteCard: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  noteContent: {
    color: "#6b7280",
  },
});


