import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ENV, getCurrentEnv, setEnvironment } from '../config';

const EnvironmentSwitcher = () => {
  const currentEnv = getCurrentEnv();

  const switchEnvironment = (env) => {
    if (setEnvironment(env)) {
      // Reload the app or refresh the data as needed
      // You might want to add a callback here to refresh your data
      console.log(`Switched to ${env} environment`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Current Environment: {currentEnv}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            currentEnv === ENV.PUBLIC && styles.activeButton
          ]}
          onPress={() => switchEnvironment(ENV.PUBLIC)}
        >
          <Text style={styles.buttonText}>Public</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            currentEnv === ENV.DEV && styles.activeButton
          ]}
          onPress={() => switchEnvironment(ENV.DEV)}
        >
          <Text style={styles.buttonText}>Dev</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    margin: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
    minWidth: 100,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#000',
    fontWeight: '500',
  },
});

export default EnvironmentSwitcher; 