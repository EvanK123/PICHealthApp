import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../supabase';

const languages = ['Spanish', 'Chamorro', 'Samoan', 'Tongan', 'Hawaiian', 'English'];
const communities = ['Pacific Islander', 'Latino'];

const RegisterScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    language: '',
    community: ''
  });

  const handleRegister = async () => {
    const { email, password, first_name, last_name, language, community } = form;

    try {
      console.log('Attempting signup with:', { email });

      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        console.error('Signup error:', error.message);
        alert(error.message);
        return;
      }

      const user = data?.user || data?.session?.user;
      const userId = user?.id;

      if (!userId) {
        console.error('No user ID available after signup:', data);
        return alert('User ID not available.');
      }

      const profile = {
        id: userId,
        email,
        first_name,
        last_name,
        language,
        communities: community,
      };

      console.log('Profile object being inserted:', profile);

      const { error: profileError } = await supabase.from('profiles').insert([profile]);

      if (profileError) {
        console.error('Profile insert error:', profileError);
        return alert('Database error saving new user: ' + profileError.message);
      }

      alert('Account created!');
      navigation.navigate('Login');
    } catch (err) {
      console.error('Unexpected error during registration:', err);
      alert('Unexpected error: ' + err.message);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/beach-bg.jpg')}
      style={styles.image}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Create an Account</Text>

          {['first_name', 'last_name', 'email', 'password'].map((field) => (
            <TextInput
              key={field}
              style={styles.input}
              placeholder={field.replace('_', ' ')}
              placeholderTextColor="#555"
              secureTextEntry={field === 'password'}
              value={form[field]}
              onChangeText={(text) => setForm({ ...form, [field]: text })}
            />
          ))}

          <Text style={styles.label}>Preferred Language:</Text>
          {languages.map((lang) => (
            <TouchableOpacity key={lang} onPress={() => setForm({ ...form, language: lang })}>
              <Text style={[
                styles.option,
                form.language === lang && styles.selected
              ]}>{lang}</Text>
            </TouchableOpacity>
          ))}

          <Text style={styles.label}>Community:</Text>
          {communities.map((com) => (
            <TouchableOpacity key={com} onPress={() => setForm({ ...form, community: com })}>
              <Text style={[
                styles.option,
                form.community === com && styles.selected
              ]}>{com}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>Already have an account? Log In</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    padding: 30,
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#2d4887',
    alignSelf: 'center',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  label: {
    marginTop: 15,
    fontWeight: 'bold',
    color: '#2d4887',
  },
  option: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginVertical: 3,
    borderRadius: 6,
    backgroundColor: '#eee',
    color: '#333',
  },
  selected: {
    backgroundColor: '#2d4887',
    color: 'white',
  },
  button: {
    backgroundColor: '#2d4887',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
  link: {
    marginTop: 15,
    color: '#2d4887',
    textAlign: 'center',
  },
});

export default RegisterScreen;
