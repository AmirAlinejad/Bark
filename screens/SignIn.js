import React, { useState } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import Logo from '../assets/logo.png';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import { get, ref } from 'firebase/database';
import { auth, db } from '../backend/FirebaseConfig';

const SignIn = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const auth = getAuth();

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const onSignInPressed = async () => {
    setLoading(true);

    if (!email || !password) {
      alert("Please enter both email and password.");
      setLoading(false);
      return;
    }

    try {
      const response = await signInWithEmailAndPassword(auth, email, password);

      // Fetch user data from the database
      const userRef = ref(db, `users/${response.user.uid}`);
      const userSnapshot = await get(userRef);

      if (userSnapshot.exists()) {
        const userData = userSnapshot.val();
        console.log('User Data:', userData);

        // Now you can use userData in your application
      } else {
        console.log('User data not found in the database.');
      }

      navigation.navigate("HomeScreen");
    } catch (error) {
      console.log(error);
      alert('Sign-in failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const onForgotPasswordPressed = () => {
    
    // navigation.navigate("ForgotPassword");
    alert('Forgot password feature coming soon!');
  };

  const onSignUp = () => {
    // Navigate to the sign-up screen
    navigation.navigate("SignUp");
  };

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
        secureTextEntry={passwordVisible}
        onEyeIconPress={togglePasswordVisibility}
      />

      <CustomButton text="Sign In" onPress={onSignInPressed} type="primary" bgColor={'#FF5349'} />

      <CustomButton
        text="Forgot Password?"
        onPress={onForgotPasswordPressed}
        type="secondary"
        bgColor={'white'}
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
    backgroundColor: 'white',
    marginTop: '-30%',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    marginTop: 10,
    fontSize: 28,
    color: '#361E25',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  signupText: {
    marginTop: 20,
    fontSize: 16,
    color: 'black',
  },
  signupLink: {
    color: '#3498db',
    fontWeight: 'bold',
  },
});

export default SignIn;
