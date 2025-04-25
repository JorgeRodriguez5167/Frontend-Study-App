import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native"
import Icon from "react-native-vector-icons/Feather"
import { useNavigation, useRoute } from "@react-navigation/native"

export default function AccountSettingsScreen({ route }) {
  const navigation = useNavigation()
  const [activeTab, setActiveTab] = useState("profile")
  const [loading, setLoading] = useState(false)

  // Get user data from navigation params
  const userData = route?.params?.userData || {};
  
  // Profile state
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")

  // Security state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [securityLoading, setSecurityLoading] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [passwordFocused, setPasswordFocused] = useState(false)

  // Load user data
  useEffect(() => {
    if (userData && userData.userId) {
      fetchUserData(userData.userId);
    }
  }, [userData]);

  const fetchUserData = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch(`https://backend-study-app-production.up.railway.app/users/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const data = await response.json();
      setFirstName(data.first_name || "");
      setLastName(data.last_name || "");
      setDisplayName(data.username || "");
      setEmail(data.email || "");
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!userData || !userData.userId) {
      Alert.alert('Error', 'User ID not found');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`https://backend-study-app-production.up.railway.app/users/${userData.userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email: email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update profile');
      }

      const data = await response.json();
      console.log('Update response:', data);
      
      Alert.alert(
        'Success',
        'Profile updated successfully',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = () => {
    setPasswordError("");
    
    if (!currentPassword) {
      setPasswordError("Current password is required");
      return false;
    }
    
    if (!newPassword) {
      setPasswordError("New password is required");
      return false;
    }
    
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return false;
    }
    
    // Check for at least one letter
    if (!/[a-zA-Z]/.test(newPassword)) {
      setPasswordError("Password must include at least one letter");
      return false;
    }
    
    // Check for at least one symbol
    if (!/[^a-zA-Z0-9]/.test(newPassword)) {
      setPasswordError("Password must include at least one symbol");
      return false;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }
    
    return true;
  };

  const handleSavePassword = async () => {
    if (!userData || !userData.userId) {
      Alert.alert('Error', 'User ID not found');
      return;
    }

    if (!validatePassword()) {
      return;
    }

    try {
      setSecurityLoading(true);
      const response = await fetch(`https://backend-study-app-production.up.railway.app/users/${userData.userId}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update password');
      }

      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      Alert.alert(
        'Success',
        'Password updated successfully',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error updating password:', error);
      setPasswordError(error.message || 'Failed to update password');
    } finally {
      setSecurityLoading(false);
    }
  };

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
            {loading ? (
              <ActivityIndicator size="large" color="#e53e3e" style={styles.loader} />
            ) : (
              <>
                <View style={styles.formRow}>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>First Name</Text>
                    <TextInput 
                      style={styles.input} 
                      value={firstName} 
                      onChangeText={setFirstName}
                      placeholder="Enter first name" 
                    />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Last Name</Text>
                    <TextInput 
                      style={styles.input} 
                      value={lastName} 
                      onChangeText={setLastName}
                      placeholder="Enter last name" 
                    />
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
                    placeholder="Enter email address"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={handleSaveProfile}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Icon name="save" size={20} color="white" />
                      <Text style={styles.saveButtonText}>Save Profile</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        )

      case "security":
        return (
          <View style={styles.tabContent}>
            {passwordError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{passwordError}</Text>
              </View>
            ) : null}
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Current Password</Text>
              <TextInput 
                style={styles.input} 
                secureTextEntry 
                placeholder="Enter current password" 
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>New Password</Text>
              {passwordFocused && (
                <View style={styles.passwordTooltip}>
                  <Text style={styles.tooltipText}>
                    Password must contain:
                  </Text>
                  <Text style={styles.tooltipText}>• At least 8 characters</Text>
                  <Text style={styles.tooltipText}>• At least one letter</Text>
                  <Text style={styles.tooltipText}>• At least one symbol</Text>
                </View>
              )}
              <TextInput 
                style={styles.input} 
                secureTextEntry 
                placeholder="Enter new password" 
                value={newPassword}
                onChangeText={setNewPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Confirm New Password</Text>
              <TextInput 
                style={styles.input} 
                secureTextEntry 
                placeholder="Confirm new password" 
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <Text style={styles.hint}>
                Password must be at least 8 characters long.
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSavePassword}
              disabled={securityLoading}
            >
              {securityLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Icon name="save" size={20} color="white" />
                  <Text style={styles.saveButtonText}>Save Security Settings</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )

      default:
        return null
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <ScrollView 
          style={styles.scrollView}
          keyboardShouldPersistTaps="handled"
        >
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
      </KeyboardAvoidingView>
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
  loader: {
    marginTop: 16,
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f87171',
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 14,
  },
  passwordTooltip: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    width: '100%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
    zIndex: 1,
  },
  tooltipText: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 2,
  },
})
