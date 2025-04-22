import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity, Alert,
  SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Image,
  ActivityIndicator
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

const LoginScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [major, setMajor] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [year, setYear] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    if (username.trim() === '' || password.trim() === '') {
      Alert.alert('Error', 'Please enter both username and password.');
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
      age.trim() === '' ||
      major.trim() === '' ||
      month.trim() === '' ||
      day.trim() === '' ||
      year.trim() === ''
    ) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    // Validate date format
    const monthNum = parseInt(month);
    const dayNum = parseInt(day);
    const yearNum = parseInt(year);
    
    if (monthNum < 1 || monthNum > 12 || dayNum < 1 || dayNum > 31 || yearNum < 1900 || yearNum > new Date().getFullYear()) {
      Alert.alert('Error', 'Please enter a valid date of birth.');
      return;
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
      age: parseInt(age),
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
      Alert.alert(
        'Success',
        'Account created successfully!',
        [{ text: 'OK', onPress: () => navigation.replace('Home') }]
      );
    })
    .catch(error => {
      Alert.alert('Error', error.message);
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>NoteApp</Text>

      {/* Logo */}
      <Image source={NoteAppLogo} style={styles.logo} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.scrollViewContainer}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome to NoteApp</Text>

            <View style={styles.tabs}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'login' && styles.activeTab]}
                onPress={() => setActiveTab('login')}
              >
                <Text style={[styles.tabText, activeTab === 'login' && styles.activeTabText]}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'signup' && styles.activeTab]}
                onPress={() => setActiveTab('signup')}
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
              <ScrollView contentContainerStyle={styles.signupScrollContainer}>
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
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Last Name"
                    value={lastName}
                    onChangeText={setLastName}
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
                    placeholder="Age"
                    value={age}
                    onChangeText={setAge}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Major"
                    value={major}
                    onChangeText={setMajor}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  logo: {
    position: 'absolute',
    top: 40, // Adjust the value for the exact placement
    right: 20, // Adjust the value for the exact placement
    width: 100, // Adjust the size (double the original size)
    height: 100, // Adjust the size (double the original size)
    resizeMode: 'contain',
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
  scrollViewContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupScrollContainer: {
    flexGrow: 1,
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
});
