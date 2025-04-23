import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, FlatList, Modal, TextInput, ActivityIndicator, Alert } from "react-native"
import { useNavigation } from "@react-navigation/native"
import Icon from "react-native-vector-icons/Feather"


export default function HomeScreen({route}) {
  const [activeCategory, setActiveCategory] = useState("Health")
  const [studyGuideModalVisible, setStudyGuideModalVisible] = useState(false)
  const [categoryInput, setCategoryInput] = useState("")
  const [studyGuide, setStudyGuide] = useState("")
  const [loading, setLoading] = useState(false)
  const [studyGuideResult, setStudyGuideResult] = useState({ visible: false, content: "", category: "" })
  const [username, setUsername] = useState("")
  const [userNotes, setUserNotes] = useState({})
  const [selectedNote, setSelectedNote] = useState(null)
  const [noteModalVisible, setNoteModalVisible] = useState(false)
  const [notesLoading, setNotesLoading] = useState(false)
  const navigation = useNavigation()
  
  // Extract user data from navigation route params
  const userData = route?.params?.userData || { userId: 1 }; // Default to userId: 1 if not provided
  const refreshTrigger = route?.params?.refresh;

  // Fetch user data to get the username
  useEffect(() => {
    fetchUserData();
    fetchUserNotes();
  }, []);

  // Additional effect to handle refresh trigger
  useEffect(() => {
    if (refreshTrigger) {
      fetchUserNotes();
    }
  }, [refreshTrigger]);

  const fetchUserData = async () => {
    if (!userData.userId && !userData.user_id) {
      return;
    }

    try {
      const userId = userData.userId || userData.user_id;
      const response = await fetch(`https://backend-study-app-production.up.railway.app/users/${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const data = await response.json();
      
      // Set username - prioritize username, then first name, or default to "User"
      setUsername(data.username || data.first_name || "User");
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUsername("User"); // Default fallback
    }
  };

  const fetchUserNotes = async () => {
    if (!userData.userId && !userData.user_id) {
      return;
    }

    try {
      setNotesLoading(true);
      const userId = userData.userId || userData.user_id;
      const response = await fetch(`https://backend-study-app-production.up.railway.app/users/${userId}/notes`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user notes');
      }
      
      const data = await response.json();
      
      // Organize notes by category
      const notesByCategory = {};
      const validCategories = ["Health", "Biology", "Arts", "English", "History"];
      
      // Initialize categories
      validCategories.forEach(category => {
        notesByCategory[category] = [];
      });
      
      // Sort notes into categories
      data.forEach(note => {
        const category = note.category;
        if (validCategories.includes(category)) {
          notesByCategory[category].push({
            id: note.id.toString(),
            title: note.title || "Untitled Note",
            content: getFirstSentence(note.summarized_notes),
            fullContent: note.summarized_notes,
            transcription: note.transcription,
            category: category
          });
        }
      });
      
      setUserNotes(notesByCategory);
    } catch (error) {
      console.error('Error fetching user notes:', error);
    } finally {
      setNotesLoading(false);
    }
  };

  // Helper function to get first sentence of text
  const getFirstSentence = (text) => {
    if (!text) return "";
    
    // Find the first sentence ending (period, exclamation, question mark)
    const match = text.match(/^.*?[.!?](?:\s|$)/);
    if (match) {
      return match[0] + "...";
    }
    
    // If no sentence ending found, return first 50 characters
    return text.length > 50 ? text.substring(0, 50) + "..." : text;
  };

  const handleViewFullNote = (note) => {
    setSelectedNote(note);
    setNoteModalVisible(true);
  };

  const renderNoteItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.noteCard}
      onPress={() => handleViewFullNote(item)}
    >
      <Text style={styles.noteTitle}>{item.title}</Text>
      <Text style={styles.noteContent}>{item.content}</Text>
    </TouchableOpacity>
  );

  const handleCreateStudyGuide = async () => {
    if (!categoryInput.trim()) {
      Alert.alert("Error", "Please enter a category");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://backend-study-app-production.up.railway.app/study-guide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          category: categoryInput.trim(),
          user_id: userData.userId || userData.user_id || 1
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setStudyGuideResult({
        visible: true,
        content: data.guide,
        category: data.category
      });
      setStudyGuideModalVisible(false);
      setCategoryInput("");
    } catch (error) {
      console.error('Error creating study guide:', error);
      Alert.alert("Error", "Failed to create study guide. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const closeStudyGuideResult = () => {
    setStudyGuideResult({ visible: false, content: "", category: "" });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Study Assistant</Text>
          
        </View>
        <TouchableOpacity style={styles.accountButton} onPress={() => navigation.navigate("AccountSettings", { userData })}>
          <Icon name="settings" size={20} color="white" />
          <Text style={styles.accountButtonText}>Account</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.title}>Welcome back, {username}</Text>

        <View style={styles.content}>
          {/* Actions Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Create New Notes</Text>

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

            <TouchableOpacity 
              style={[styles.whiteButton, {backgroundColor: '#f0f8ff', borderColor: '#4169e1'}]} 
              onPress={() => setStudyGuideModalVisible(true)}
            >
              <Icon name="book" size={20} color="#4169e1" />
              <Text style={[styles.whiteButtonText, {color: '#4169e1'}]}>Create Study Guide</Text>
            </TouchableOpacity>
          </View>

          {/* Notes Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>

            {/* Category Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryTabsContainer}>
              <View style={styles.categoryTabs}>
                {["Health", "Biology", "Arts", "English", "History"].map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[styles.categoryTab, activeCategory === category && styles.activeCategoryTab]}
                    onPress={() => setActiveCategory(category)}
                  >
                    <Text style={[styles.categoryTabText, activeCategory === category && styles.activeCategoryTabText]}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Notes List */}
            <View style={styles.notesListContainer}>
              {notesLoading ? (
                <ActivityIndicator size="large" color="#e53e3e" style={styles.notesLoader} />
              ) : userNotes[activeCategory] && userNotes[activeCategory].length > 0 ? (
                <FlatList
                  data={userNotes[activeCategory]}
                  renderItem={renderNoteItem}
                  keyExtractor={(item) => item.id}
                  style={styles.notesList}
                  scrollEnabled={true}
                  nestedScrollEnabled={true}
                />
              ) : (
                <View style={styles.emptyNotesContainer}>
                  <Text style={styles.emptyNotesText}>You have no notes under this subject</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Study Guide Category Input Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={studyGuideModalVisible}
        onRequestClose={() => setStudyGuideModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Study Guide</Text>
            <Text style={styles.modalDescription}>
              Enter the category to create a study guide from all your notes in that category.
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter category (e.g., Biology, History)"
              value={categoryInput}
              onChangeText={setCategoryInput}
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalCancelButton]} 
                onPress={() => {
                  setStudyGuideModalVisible(false);
                  setCategoryInput("");
                }}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalCreateButton]} 
                onPress={handleCreateStudyGuide}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.modalCreateButtonText}>Create</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Study Guide Result Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={studyGuideResult.visible}
        onRequestClose={closeStudyGuideResult}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.studyGuideResultModal]}>
            <View style={styles.studyGuideHeader}>
              <Text style={styles.studyGuideTitle}>Study Guide: {studyGuideResult.category}</Text>
              <TouchableOpacity onPress={closeStudyGuideResult}>
                <Icon name="x" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.studyGuideContent}>
              <Text style={styles.studyGuideText}>{studyGuideResult.content}</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Note Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={noteModalVisible}
        onRequestClose={() => setNoteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.noteDetailModal]}>
            <View style={styles.noteDetailHeader}>
              <Text style={styles.noteDetailTitle}>{selectedNote?.title}</Text>
              <TouchableOpacity onPress={() => setNoteModalVisible(false)}>
                <Icon name="x" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.noteDetailContent}>
              <Text style={styles.noteDetailText}>{selectedNote?.fullContent}</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
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
  contentContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    margin: 16,
  },
  content: {
    padding: 16,
    paddingTop: 0,
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
  categoryTabsContainer: {
    marginBottom: 16,
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
  notesListContainer: {
    height: 300, // Fixed height for the container
  },
  notesList: {
    flex: 1,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  modalInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    padding: 12,
    borderRadius: 5,
    width: '48%',
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#f2f2f2',
  },
  modalCreateButton: {
    backgroundColor: '#4169e1',
  },
  modalCancelButtonText: {
    color: '#333',
    fontWeight: '500',
  },
  modalCreateButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  studyGuideResultModal: {
    height: '80%',
    alignItems: 'stretch',
  },
  studyGuideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 10,
  },
  studyGuideTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  studyGuideContent: {
    flex: 1,
    width: '100%',
  },
  studyGuideText: {
    fontSize: 16,
    lineHeight: 24,
  },
  notesLoader: {
    marginTop: 40,
  },
  emptyNotesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyNotesText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  noteDetailModal: {
    height: '70%',
    alignItems: 'stretch',
  },
  noteDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 16,
  },
  noteDetailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  noteDetailContent: {
    flex: 1,
    width: '100%',
  },
  noteDetailText: {
    fontSize: 16,
    lineHeight: 24,
  },
})
