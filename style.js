// styles.js
import { StyleSheet, Platform } from 'react-native';

/**
 * Cross-platform card styling helper
 * @param {number} elevation - The elevation level (1-24)
 * @returns {object} - Platform-specific shadow styles
 */
export const cardShadow = (elevation = 2) => {
  // Base styles for both platforms
  const baseStyles = {
    backgroundColor: 'white',
    borderRadius: 8, 
  };
  
  // Android uses elevation
  if (Platform.OS === 'android') {
    return {
      ...baseStyles,
      elevation: elevation,
    };
  }
  
  // iOS uses shadow properties
  // Adjust shadow properties based on elevation level
  const shadowOpacity = 0.1 + (elevation * 0.015); // Increase opacity with elevation
  const shadowRadius = elevation * 0.8;
  const shadowOffset = { 
    width: 0, 
    height: elevation > 1 ? elevation - 1 : elevation 
  };
  
  return {
    ...baseStyles,
    shadowColor: "#000",
    shadowOffset: shadowOffset,
    shadowOpacity: shadowOpacity,
    shadowRadius: shadowRadius,
  };
};

export const styles = {
  text: {
    color: 'black',
    fontSize: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  card: {
    ...cardShadow(2),
    padding: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#e53e3e',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  recordButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  sectionButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: 'center',
  },
  sectionButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  transcriptionBox: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    marginTop: 20,
    borderRadius: 10,
    maxHeight: 200,
  },
  transcriptionText: {
    fontSize: 14,
    color: '#333',
  }
};

export default styles;
