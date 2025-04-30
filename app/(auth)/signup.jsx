import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image } from 'react-native';
import { Link } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';

const SignupScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Handle signup
  const handleSignup = async () => {
    setError('');
    setSuccess(false);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo and brand */}
      <View style={styles.brandContainer}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.appName}>MAROE</Text>
      </View>

      <Text style={styles.subtitle}>Create your account</Text>

      {/* Success message */}
      {success && (
        <>
          <Text style={styles.successText}>Account created! Please log in below.</Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity style={styles.signupButton}>
              <Text style={styles.signupButtonText}>Go to Login</Text>
            </TouchableOpacity>
          </Link>
        </>
      )}

      {/* Error message */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Only show form if not successful */}
      {!success && (
        <>
          {/* Name input */}
          <TextInput
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />

          {/* Email input */}
          <TextInput
            placeholder="E-mail"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Password input */}
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry
          />

          {/* Confirm password input */}
          <TextInput
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={styles.input}
            secureTextEntry
          />

          {/* Signup button */}
          <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
            <Text style={styles.signupButtonText}>Sign Up</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Login link (hidden after success) */}
      {!success && (
        <Text style={styles.loginText}>
          Already have an account?{' '}
          <Link href="/(auth)/login" style={styles.loginLink}>
            Login
          </Link>
        </Text>
      )}
    </View>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#fff',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 50,
    height: 50,
    marginBottom: 4,
  },
  appName: {
    fontSize: 18,
    letterSpacing: 5,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  successText: {
    color: 'green',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },
  signupButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 100,
    borderRadius: 30,
    marginBottom: 25,
  },
  signupButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loginText: {
    color: '#444',
  },
  loginLink: {
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
});
