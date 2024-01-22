import React, { useState } from 'react';
// react native components
import { View, Image, StyleSheet } from 'react-native';
// assets
import Logo from '../../assets/logo.png';
// my components
import CustomText from '../../components/CustomText';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
// backend
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import { get, ref } from 'firebase/database';
import { db } from '../../backend/FirebaseConfig';

const SignIn = ({ navigation }) => {
  // state variables
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const auth = getAuth();

  // password visibility
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  // sign in
  const onSignInPressed = async () => {
    setLoading(true);

    // Validate input
    if (!email || !password) {
      alert("Please enter both email and password.");
      setLoading(false);
      return;
    }

    // try to submit the sign-in request
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

  // forgot password
  const onForgotPasswordPressed = () => {
    // navigation.navigate("ForgotPassword");
    alert('Forgot password feature coming soon!');
  };

  // go to sign up
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

      <CustomText style={styles.title}>Welcome Back!</CustomText>

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

      <CustomText style={styles.signupText} text="Don't have an account?" />
      <CustomText style={styles.signupLink} onPress={onSignUp} text="Sign Up" />
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
    marginTop: 100,
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
