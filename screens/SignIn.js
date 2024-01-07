import React, { useState } from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Logo from '../assets/images/Heart.png';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import Icon from 'react-native-vector-icons/Feather';

const SignIn = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const auth = getAuth();
  const onSignInPressed = async () => {
    setLoading(true);

    if (!email || !password) {
      alert("Please enter both email and password.");
      setLoading(false);
      return;
    }

    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      navigation.navigate("Home");
    } catch (error) {
      console.log(error);
      alert('Sign-in failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  const onForgotPasswordPressed = () => {
    // Implement the forgot password logic or navigate to the appropriate screen
    // For example:
    // navigation.navigate("ForgotPassword");
    alert('Forgot password feature coming soon!');
  }

  const onSignUp = () => {
    // Navigate to the sign-up screen
    navigation.navigate("SignUp");
  }

  return (
    <View style={styles.container}>
      <Image
        source={Logo}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Welcome Back!</Text>

      <CustomInput
        placeholder="Email"
        value={email}
        setValue={setEmail}
        keyboardType="email-address"
        icon="email"
      />
      <CustomInput
        placeholder="Password"
        value={password}
        setValue={setPassword}
        secureTextEntry={!passwordVisible}
        onEyeIconPress={togglePasswordVisibility}
      />

      <CustomButton text="Sign In" onPress={onSignInPressed} type="primary" />

      <CustomButton
        text="Forgot Password?"
        onPress={onForgotPasswordPressed}
        type="secondary"
      />

      <Text style={styles.signupText}>Don't have an account? <Text style={styles.signupLink} onPress={onSignUp}>Sign Up</Text></Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2C3E50',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    color: '#ECF0F1',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  signupText: {
    marginTop: 20,
    fontSize: 16,
    color: '#ECF0F1',
  },
  signupLink: {
    color: '#3498db',
    fontWeight: 'bold',
  },
});

export default SignIn;