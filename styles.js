// styles.js
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#fff',
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
});