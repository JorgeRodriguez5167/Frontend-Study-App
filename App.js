
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity, Alert,
  SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Image,
  ActivityIndicator, LogBox
} from 'react-native';

import HomeScreen from './HomeScreen';
import NoteSelection from './NoteSelection';
import AccountSettingsScreen from './AccountSettingsScreen';
import UploadTextScreen from './UploadTextScreen';
import UploadAudioScreen from './UploadAudioScreen';
import RecordAudioScreen from './RecordAudioScreen';

// Import the logo image
import NoteAppLogo from './assets/NoteAppLogo.png';

const Stack = createStackNavigator();

LogBox.ignoreLogs(['VirtualizedLists should never be nested']);

const LoginScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [year, setYear] = useState('');
  const [major, setMajor] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleLogin = () => {
    // Simple validation
    if (!username || !password) {
      Alert.alert(
        'Error',
        'Please enter both username and password.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Call the backend API to login
    const loginData = {
      username: username,
      password: password
    };

    setIsLoading(true);

    // Railway hosted backend URL - correct domain
    fetch('https://backend-study-app-production.up.railway.app/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    })
    .then(response => {
      console.log('Login response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Backend service not found. Please check if the server is running.');
        }
        if (response.status === 401) {
          throw new Error('Invalid username or password.');
        }
        if (response.status === 500) {
          throw new Error('Server error. Please try again later.');
        }
        
        return response.text().then(text => {
          try {
            const data = JSON.parse(text);
            throw new Error(data.detail || data.message || 'Login failed');
          } catch (e) {
            // If response isn't valid JSON
            console.error('Login error response:', text);
            throw new Error(`Login failed: ${response.status} ${text.substring(0, 100)}`);
          }
        });
      }
      return response.json();
    })
    .then(data => {
      console.log('Login successful');
      // Store user info/token in app state or AsyncStorage
      // In a real app, you'd use AsyncStorage or a state management solution
      
      // Store user ID and token for future authenticated requests
      const userData = {
        userId: data.user_id,
        username: data.username,
        token: data.access_token
      };
      
      // For now, just log the stored information
      console.log('User data stored:', userData);
      
      // Navigate to the home screen with the user information
      navigation.replace('Home', { userData });
    })
    .catch(error => {
      console.error('Login error:', error);
      Alert.alert('Error', error.message);
    })
    .finally(() => {
      setIsLoading(false);
    });
  };

  const handleSignup = () => {
    if (
      username.trim() === '' ||
      email.trim() === '' ||
      password.trim() === '' ||
      confirmPassword.trim() === '' ||
      firstName.trim() === '' ||
      lastName.trim() === '' ||
      major.trim() === '' ||
      month.trim() === '' ||
      day.trim() === '' ||
      year.trim() === ''
    ) {
      Alert.alert(
        'Error',
        'Please fill out all fields.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Email validation
    if (!validateEmail(email)) {
      Alert.alert(
        'Error',
        'Please enter a valid email address with @ and domain (e.g., example@domain.com).',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Password validation
    if (!validatePassword(password)) {
      Alert.alert(
        'Error',
        'Password must be at least 8 characters long and include at least one letter and one symbol.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert(
        'Error',
        'Passwords do not match.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Validate date format
    const monthNum = parseInt(month);
    const dayNum = parseInt(day);
    const yearNum = parseInt(year);
    
    if (isNaN(monthNum) || isNaN(dayNum) || isNaN(yearNum) || 
        monthNum < 1 || monthNum > 12 || 
        dayNum < 1 || dayNum > 31 || 
        yearNum < 1900 || yearNum > new Date().getFullYear()) {
      Alert.alert(
        'Error',
        'Please enter a valid date of birth.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Additional validation for specific months
    if ((monthNum === 4 || monthNum === 6 || monthNum === 9 || monthNum === 11) && dayNum > 30) {
      Alert.alert(
        'Error',
        'The selected month has only 30 days.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // February validation (including leap years)
    if (monthNum === 2) {
      const isLeapYear = (yearNum % 4 === 0 && yearNum % 100 !== 0) || (yearNum % 400 === 0);
      const maxDays = isLeapYear ? 29 : 28;
      
      if (dayNum > maxDays) {
        Alert.alert(
          'Error',
          `February ${yearNum} has only ${maxDays} days.`,
          [{ text: 'OK' }]
        );
        return;
      }
    }

    // Format date of birth in ISO format (YYYY-MM-DD)
    const formattedMonth = monthNum.toString().padStart(2, '0');
    const formattedDay = dayNum.toString().padStart(2, '0');
    const dateOfBirth = `${yearNum}-${formattedMonth}-${formattedDay}`;

    // Call the backend API to register the user
    const userData = {
      username: username,
      password: password,
      email: email,
      first_name: firstName,
      last_name: lastName,
      major: major,
      date_of_birth: dateOfBirth
    };

    // Railway hosted backend URL - correct domain
    fetch('https://backend-study-app-production.up.railway.app/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })
    .then(response => {
      console.log(`Registration response status:`, response.status);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Backend service not found. Please check if the server is running.');
        }
        if (response.status === 500) {
          throw new Error('Server error. Please try again later.');
        }
        
        return response.text().then(text => {
          try {
            const data = JSON.parse(text);
            throw new Error(data.detail || data.message || 'Registration failed');
          } catch (e) {
            // If response isn't valid JSON
            console.error('Registration error response:', text);
            throw new Error(`Registration failed: ${response.status} ${text.substring(0, 100)}`);
          }
        });
      }
      return response.json();
    })
    .then(data => {
      // Create userData object similar to login response
      const userData = {
        userId: data.id,
        username: data.username
      };

      Alert.alert(
        'Success',
        'Account created successfully!',
        [{ text: 'OK', onPress: () => navigation.replace('Home', { userData }) }]
      );
    })
    .catch(error => {
      Alert.alert(
        'Error',
        error.message,
        [{ text: 'OK' }]
      );
    });
  };

  // Add email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Add password validation function
  const validatePassword = (password) => {
    // Check length
    if (password.length < 8) return false;
    
    // Check for at least one letter
    if (!/[a-zA-Z]/.test(password)) return false;
    
    // Check for at least one symbol (non-alphanumeric)
    if (!/[^a-zA-Z0-9]/.test(password)) return false;
    
    return true;
  };

  const clearForm = () => {
    setUsername('');
    setPassword('');
    setEmail('');
    setConfirmPassword('');
    setFirstName('');
    setLastName('');
    setMonth('');
    setDay('');
    setYear('');
    setMajor('');
    setIsLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Logo - centered at the top, hidden when signup tab is active */}
      {activeTab !== 'signup' && (
        <Text style={styles.titleText}>Study Assistant</Text>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}
        contentContainerStyle={{flex: 1}}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <View style={styles.scrollViewContainer}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome to Study Assistant</Text>

            <View style={styles.tabs}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'login' && styles.activeTab]}
                onPress={() => {
                  if (activeTab !== 'login') {
                    setActiveTab('login');
                    clearForm();
                  }
                }}
              >
                <Text style={[styles.tabText, activeTab === 'login' && styles.activeTabText]}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'signup' && styles.activeTab]}
                onPress={() => {
                  if (activeTab !== 'signup') {
                    setActiveTab('signup');
                    clearForm();
                  }
                }}
              >
                <Text style={[styles.tabText, activeTab === 'signup' && styles.activeTabText]}>Sign Up</Text>
              </TouchableOpacity>
            </View>

            {activeTab === 'login' && (
              <View style={styles.form}>
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
                {isLoading ? (
                  <ActivityIndicator size="large" color="#e53e3e" style={styles.loader} />
                ) : (
                  <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>Log In</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {activeTab === 'signup' && (
              <ScrollView 
                contentContainerStyle={styles.signupScrollContainer}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
                style={{width: '100%', maxHeight: activeTab === 'signup' ? '100%' : 'auto'}}
                nestedScrollEnabled={true}
              >
                <View style={styles.form}>
                  <TextInput
                    style={styles.input}
                    placeholder="Choose a username"
                    value={username}
                    onChangeText={setUsername}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="First Name"
                    value={firstName}
                    onChangeText={setFirstName}
                    autoCapitalize="words"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Last Name"
                    value={lastName}
                    onChangeText={setLastName}
                    autoCapitalize="words"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <View style={styles.dateContainer}>
                    <Text style={styles.dateLabel}>Date of Birth:</Text>
                    <View style={styles.dateInputsContainer}>
                      <TextInput
                        style={[styles.dateInput, {flex: 2}]}
                        placeholder="MM"
                        value={month}
                        onChangeText={setMonth}
                        keyboardType="numeric"
                        maxLength={2}
                      />
                      <Text style={styles.dateSeparator}>/</Text>
                      <TextInput
                        style={[styles.dateInput, {flex: 2}]}
                        placeholder="DD"
                        value={day}
                        onChangeText={setDay}
                        keyboardType="numeric"
                        maxLength={2}
                      />
                      <Text style={styles.dateSeparator}>/</Text>
                      <TextInput
                        style={[styles.dateInput, {flex: 3}]}
                        placeholder="YYYY"
                        value={year}
                        onChangeText={setYear}
                        keyboardType="numeric"
                        maxLength={4}
                      />
                    </View>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Major"
                    value={major}
                    onChangeText={setMajor}
                  />
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
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                  />
                  {isLoading ? (
                    <ActivityIndicator size="large" color="#e53e3e" style={styles.loader} />
                  ) : (
                    <TouchableOpacity style={styles.button} onPress={handleSignup}>
                      <Text style={styles.buttonText}>Sign Up</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Notes" component={NoteSelection} />
        <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} />
        <Stack.Screen name="UploadText" component={UploadTextScreen} />
        <Stack.Screen name="UploadAudio" component={UploadAudioScreen} />
        <Stack.Screen name="RecordAudio" component={RecordAudioScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  centeredLogo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  keyboardAvoidingContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  scrollViewContainer: {
    width: '100%',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    width: '100%',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#e53e3e',
  },
  tabText: {
    fontSize: 16,
    color: '#6b7280',
  },
  activeTabText: {
    color: '#e53e3e',
    fontWeight: 'bold',
  },
  form: {
    marginTop: 8,
    width: '100%',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    maxWidth: 300,
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingLeft: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#e53e3e',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
  signupScrollContainer: {
    flexGrow: 1,
    width: '100%',
    alignItems: 'center',
    paddingBottom: 20,
  },
  dateContainer: {
    width: '100%',
    maxWidth: 300,
    marginBottom: 15,
  },
  dateLabel: {
    fontSize: 14,
    marginBottom: 5,
    color: '#374151',
  },
  dateInputsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingLeft: 10,
    backgroundColor: '#fff',
    textAlign: 'center',
  },
  dateSeparator: {
    fontSize: 18,
    marginHorizontal: 5,
  },
  loader: {
    marginTop: 20,
    marginBottom: 10,
  },
  titleText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 20,
    color: '#e53e3e',
    textAlign: 'center',
  },
  passwordTooltip: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    width: '90%',
    maxWidth: 280,
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
});
