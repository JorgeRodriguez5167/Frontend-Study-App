import { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, TextInput, Alert } from "react-native"
import Icon from "react-native-vector-icons/Feather"
import { useNavigation } from "@react-navigation/native"

export default function AccountSettingsScreen() {
  const navigation = useNavigation()
  const [activeTab, setActiveTab] = useState("profile")

  // Profile state
  const [firstName, setFirstName] = useState("John")
  const [lastName, setLastName] = useState("Doe")
  const [displayName, setDisplayName] = useState("JohnD")
  const [email, setEmail] = useState("john.doe@example.com")

  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          onPress: () => {
            // Clear any stored authentication data here if needed
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            })
          },
          style: "destructive"
        }
      ]
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <View style={styles.tabContent}>
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
              <Text style={styles.label}>Username</Text>
              <TextInput 
                style={[styles.input, styles.readOnlyInput]} 
                value={displayName} 
                editable={false} 
              />
              <Text style={styles.hint}>Your unique identifier in the app.</Text>
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

            <TouchableOpacity style={styles.saveButton}>
              <Icon name="save" size={20} color="white" />
              <Text style={styles.saveButtonText}>Save Security Settings</Text>
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
              <Text style={styles.cardTitle}>Account Settings</Text>
            </View>

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
            </View>

            {renderTabContent()}
          </View>
          
          {/* Global Logout Button */}
          <TouchableOpacity style={styles.globalLogoutButton} onPress={handleLogout}>
            <Icon name="log-out" size={20} color="white" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
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
  logoutButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 16,
  },
  globalLogoutButton: {
    backgroundColor: "#dc2626",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginTop: 24,
    marginBottom: 40,
  },
  readOnlyInput: {
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
  },
})
