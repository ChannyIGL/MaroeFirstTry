import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image } from 'react-native';

const LoginScreen = () => {
  // States for input fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      {/* App logo */}
      <Image
        source={require('../../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* App name */}
      <Text style={styles.appName}>MAROE</Text>
      <Text style={styles.subtitle}>Sign in to your account</Text>

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

      {/* Forgot password link */}
      <TouchableOpacity>
        <Text style={styles.forgotText}>Forgot your password?</Text>
      </TouchableOpacity>

      {/* Login button */}
      <TouchableOpacity style={styles.loginButton}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>

      {/* Signup link */}
      <Text style={styles.signupText}>
        Don’t have an account? <Text style={styles.signupLink}>Sign up</Text>
      </Text>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#fff',
  },
  logo: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
  appName: {
    fontSize: 18,
    letterSpacing: 5,
    marginBottom: 20,
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
  forgotText: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    color: '#555',
  },
  loginButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 100,
    borderRadius: 30,
    marginBottom: 25,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  signupText: {
    color: '#444',
  },
  signupLink: {
    textDecorationLine: 'underline',
  },
});
