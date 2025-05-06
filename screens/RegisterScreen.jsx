import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Alert
} from 'react-native';
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
    language: languages[0],
    community: communities[0],
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const { email, password, first_name, last_name, language, community } = form;

    // Validate required fields
    if (!email || !password || !first_name || !last_name) {
      return Alert.alert('Please fill in all required fields');
    }

    try {
      setLoading(true);

      // Create authentication user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (authError) {
        return Alert.alert('Error creating account', authError.message);
      }
      if (!authData?.user?.id) {
        return Alert.alert('Failed to get user ID from auth.');
      }

      // Normalize UUID dashes
      const rawId = authData.user.id;
      const cleanId = rawId.replace(/[\u2010-\u2015]/g, '-');

      // Insert profile record
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id:          cleanId,
          first_name,
          last_name,
          email,
          language:    language.trim(),
          communities: community.trim(),
        }]);
      if (profileError) {
        return Alert.alert('Database error', profileError.message);
      }

      // Success
      Alert.alert('Account created!', 'Check your email to confirm your account.');
      navigation.navigate('Login');
    } catch (err) {
      Alert.alert('Unexpected error', err.message);
    } finally {
      setLoading(false);
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
            <TouchableOpacity
              key={lang}
              onPress={() => setForm({ ...form, language: lang })}
            >
              <Text style={[
                styles.option,
                form.language === lang && styles.selected
              ]}>{lang}</Text>
            </TouchableOpacity>
          ))}

          <Text style={styles.label}>Community:</Text>
          {communities.map((com) => (
            <TouchableOpacity
              key={com}
              onPress={() => setForm({ ...form, community: com })}
            >
              <Text style={[
                styles.option,
                form.community === com && styles.selected
              ]}>{com}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Text>
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
  buttonDisabled: {
    backgroundColor: '#6c88ba',
    opacity: 0.7,
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