import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { supabase } from '../supabase';

const AccountScreen = ({ isGuest, setIsGuest }) => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleCreateAccount = () => {
    setIsGuest(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Account</Text>

      {isGuest ? (
        <TouchableOpacity style={[styles.button, styles.createButton]} onPress={handleCreateAccount}>
          <Text style={styles.buttonText}>Sign up / Log in</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>Log Out</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 24,
    marginBottom: 30,
    color: '#2d4887',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#2d4887',
    padding: 15,
    borderRadius: 10,
    minWidth: 200,
  },
  createButton: {
    backgroundColor: '#888',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default AccountScreen;
