import { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, TextInput, Switch } from "react-native"
import Icon from "react-native-vector-icons/Feather"

export default function AccountSettingsScreen() {
  const [activeTab, setActiveTab] = useState("profile")

  // Profile state
  const [firstName, setFirstName] = useState("John")
  const [lastName, setLastName] = useState("Doe")
  const [displayName, setDisplayName] = useState("JohnD")
  const [email, setEmail] = useState("john.doe@example.com")
  const [bio, setBio] = useState("I'm a student who loves taking notes and staying organized.")

  // Preferences state
  const [darkMode, setDarkMode] = useState(false)
  const [autoSave, setAutoSave] = useState(true)
  const [highQualityAudio, setHighQualityAudio] = useState(false)
  const [language, setLanguage] = useState("English")
  const [defaultCategory, setDefaultCategory] = useState("Misc")

  // Notifications state
  const [emailReminders, setEmailReminders] = useState(true)
  const [accountUpdates, setAccountUpdates] = useState(true)
  const [newFeatures, setNewFeatures] = useState(false)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [notificationSound, setNotificationSound] = useState(false)
  const [notificationFrequency, setNotificationFrequency] = useState("Daily")

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <View style={styles.tabContent}>
            <View style={styles.profileImageContainer}>
              <View style={styles.profileImage}>
                <Icon name="user" size={40} color="#9ca3af" />
              </View>
              <TouchableOpacity style={styles.uploadPhotoButton}>
                <Text style={styles.uploadPhotoText}>Upload Photo</Text>
              </TouchableOpacity>
              <Text style={styles.photoHint}>JPG, GIF or PNG. Max size 2MB.</Text>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>First Name</Text>
                <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Last Name</Text>
                <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Display Name</Text>
              <TextInput style={styles.input} value={displayName} onChangeText={setDisplayName} />
              <Text style={styles.hint}>This is how your name will appear in the app.</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity style={styles.saveButton}>
              <Icon name="save" size={20} color="white" />
              <Text style={styles.saveButtonText}>Save Profile</Text>
            </TouchableOpacity>
          </View>
        )

      case "security":
        return (
          <View style={styles.tabContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Current Password</Text>
              <TextInput style={styles.input} secureTextEntry placeholder="Enter current password" />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>New Password</Text>
              <TextInput style={styles.input} secureTextEntry placeholder="Enter new password" />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Confirm New Password</Text>
              <TextInput style={styles.input} secureTextEntry placeholder="Confirm new password" />
              <Text style={styles.hint}>
                Password must be at least 8 characters and include a number and a special character.
              </Text>
            </View>

            <View style={styles.sectionTitle}>
              <Text style={styles.sectionTitleText}>Two-Factor Authentication</Text>
            </View>

            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingTitle}>Enable 2FA</Text>
                <Text style={styles.settingDescription}>Add an extra layer of security to your account</Text>
              </View>
              <Switch
                value={false}
                onValueChange={() => {}}
                trackColor={{ false: "#d1d5db", true: "#f87171" }}
                thumbColor={false ? "#e53e3e" : "#f4f3f4"}
              />
            </View>

            <TouchableOpacity style={styles.saveButton}>
              <Icon name="save" size={20} color="white" />
              <Text style={styles.saveButtonText}>Save Security Settings</Text>
            </TouchableOpacity>
          </View>
        )

      case "preferences":
        return (
          <View style={styles.tabContent}>
            <View style={styles.sectionTitle}>
              <Text style={styles.sectionTitleText}>Theme</Text>
            </View>

            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingTitle}>Dark Mode</Text>
                <Text style={styles.settingDescription}>Switch between light and dark mode</Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: "#d1d5db", true: "#f87171" }}
                thumbColor={darkMode ? "#e53e3e" : "#f4f3f4"}
              />
            </View>

            <View style={styles.sectionTitle}>
              <Text style={styles.sectionTitleText}>Note Settings</Text>
            </View>

            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingTitle}>Auto-Save</Text>
                <Text style={styles.settingDescription}>Automatically save notes while typing</Text>
              </View>
              <Switch
                value={autoSave}
                onValueChange={setAutoSave}
                trackColor={{ false: "#d1d5db", true: "#f87171" }}
                thumbColor={autoSave ? "#e53e3e" : "#f4f3f4"}
              />
            </View>

            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingTitle}>High Quality Audio</Text>
                <Text style={styles.settingDescription}>Record audio in high quality (uses more storage)</Text>
              </View>
              <Switch
                value={highQualityAudio}
                onValueChange={setHighQualityAudio}
                trackColor={{ false: "#d1d5db", true: "#f87171" }}
                thumbColor={highQualityAudio ? "#e53e3e" : "#f4f3f4"}
              />
            </View>

            <TouchableOpacity style={styles.saveButton}>
              <Icon name="save" size={20} color="white" />
              <Text style={styles.saveButtonText}>Save Preferences</Text>
            </TouchableOpacity>
          </View>
        )

      case "notifications":
        return (
          <View style={styles.tabContent}>
            <View style={styles.sectionTitle}>
              <Text style={styles.sectionTitleText}>Email Notifications</Text>
            </View>

            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingTitle}>Note Reminders</Text>
                <Text style={styles.settingDescription}>Receive reminders about your notes</Text>
              </View>
              <Switch
                value={emailReminders}
                onValueChange={setEmailReminders}
                trackColor={{ false: "#d1d5db", true: "#f87171" }}
                thumbColor={emailReminders ? "#e53e3e" : "#f4f3f4"}
              />
            </View>

            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingTitle}>Account Updates</Text>
                <Text style={styles.settingDescription}>Receive updates about your account</Text>
              </View>
              <Switch
                value={accountUpdates}
                onValueChange={setAccountUpdates}
                trackColor={{ false: "#d1d5db", true: "#f87171" }}
                thumbColor={accountUpdates ? "#e53e3e" : "#f4f3f4"}
              />
            </View>

            <View style={styles.sectionTitle}>
              <Text style={styles.sectionTitleText}>Push Notifications</Text>
            </View>

            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingTitle}>Enable Push Notifications</Text>
                <Text style={styles.settingDescription}>Receive notifications on your device</Text>
              </View>
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
                trackColor={{ false: "#d1d5db", true: "#f87171" }}
                thumbColor={pushNotifications ? "#e53e3e" : "#f4f3f4"}
              />
            </View>

            <TouchableOpacity style={styles.saveButton}>
              <Icon name="save" size={20} color="white" />
              <Text style={styles.saveButtonText}>Save Notification Settings</Text>
            </TouchableOpacity>
          </View>
        )

      default:
        return null
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Manage Your Account</Text>
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
              <TouchableOpacity
                style={[styles.tab, activeTab === "profile" && styles.activeTab]}
                onPress={() => setActiveTab("profile")}
              >
                <Text style={[styles.tabText, activeTab === "profile" && styles.activeTabText]}>Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === "security" && styles.activeTab]}
                onPress={() => setActiveTab("security")}
              >
                <Text style={[styles.tabText, activeTab === "security" && styles.activeTabText]}>Security</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === "preferences" && styles.activeTab]}
                onPress={() => setActiveTab("preferences")}
              >
                <Text style={[styles.tabText, activeTab === "preferences" && styles.activeTabText]}>Preferences</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === "notifications" && styles.activeTab]}
                onPress={() => setActiveTab("notifications")}
              >
                <Text style={[styles.tabText, activeTab === "notifications" && styles.activeTabText]}>
                  Notifications
                </Text>
              </TouchableOpacity>
            </View>

            {renderTabContent()}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#e53e3e",
  },
  tabText: {
    fontSize: 14,
    color: "#6b7280",
  },
  activeTabText: {
    color: "#e53e3e",
    fontWeight: "bold",
  },
  tabContent: {
    padding: 16,
  },
  profileImageContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  uploadPhotoButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 4,
    marginBottom: 4,
  },
  uploadPhotoText: {
    fontSize: 14,
    color: "#374151",
  },
  photoHint: {
    fontSize: 12,
    color: "#6b7280",
  },
  formRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  formGroup: {
    flex: 1,
    marginBottom: 16,
    marginHorizontal: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
    color: "#374151",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  hint: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: "#e53e3e",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginTop: 8,
  },
  saveButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 12,
  },
  sectionTitleText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },
  settingDescription: {
    fontSize: 14,
    color: "#6b7280",
  },
})
