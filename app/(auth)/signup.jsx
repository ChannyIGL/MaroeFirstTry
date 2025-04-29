import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image } from 'react-native';
import { Link } from 'expo-router';

const SignupScreen = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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

      {/* Name input */}
      <TextInput
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      {/* Phone input */}
      <TextInput
        placeholder="Phone Number"
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
        keyboardType="phone-pad"
      />

      {/* Address input */}
      <TextInput
        placeholder="Address"
        value={address}
        onChangeText={setAddress}
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
      <TouchableOpacity style={styles.signupButton}>
        <Text style={styles.signupButtonText}>Sign Up</Text>
      </TouchableOpacity>

      {/* Login link */}
      <Text style={styles.loginText}>
        Already have an account?{' '}
        <Link href="/(auth)/login" style={styles.loginLink}>
          Login
        </Link>
      </Text>
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
    marginBottom: 30,
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
