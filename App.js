import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity, Alert,
  SafeAreaView, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';

import HomeScreen from './HomeScreen';
import NoteSelection from './NoteSelection';
import AccountSettingsScreen from './AccountSettingsScreen';
import UploadTextScreen from './UploadTextScreen';
import UploadAudioScreen from './UploadAudioScreen';
import RecordAudioScreen from './RecordAudioScreen';

const Stack = createStackNavigator();

const LoginScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogin = () => {
    if (username.trim() === '' || password.trim() === '') {
      Alert.alert('Error', 'Please enter both username and password.');
      return;
    }
    navigation.replace('Home');
  };

  const handleSignup = () => {
    if (
      username.trim() === '' ||
      email.trim() === '' ||
      password.trim() === '' ||
      confirmPassword.trim() === ''
    ) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    navigation.replace('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>NoteApp</Text>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
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
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                  <Text style={styles.buttonText}>Log In</Text>
                </TouchableOpacity>
              </View>
            )}

            {activeTab === 'signup' && (
              <View style={styles.form}>
                <TextInput
                  style={styles.input}
                  placeholder="Choose a username"
                  value={username}
                  onChangeText={setUsername}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Create a password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
                <TouchableOpacity style={styles.button} onPress={handleSignup}>
                  <Text style={styles.buttonText}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
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
    backgroundColor: '#f5f5f5', // soft background
    padding: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#3e3e3e',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: '#3e3e3e',
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#e53e3e', // coral red
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
    marginTop: 12,
  },
  input: {
    width: '100%',
    maxWidth: 320,
    height: 52,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 18,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#3eb489', // mint green
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#3eb489',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
});
