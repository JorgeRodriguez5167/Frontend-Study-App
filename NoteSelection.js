import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
//file worked on by Sebastian A.
const HomeScreen = ({ navigation }) => {
  const handleSubmit = () => {
    console.log('Submit button clicked!');
    // Here you can handle the logic for submitting something (e.g., form, file, etc.)
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Home!</Text>

      {/* Submit Button */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Record a lecture</Text>
      </TouchableOpacity>

      {/* Logout Button */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.replace('Login')}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>

      {/* Type notes */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Notes')}>
        <Text style={styles.buttonText}>Select Notes</Text>

      
      
        
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#3eb489',
    padding: 15,
    marginTop: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});



