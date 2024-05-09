import React, { useState } from 'react';
// storage
import AsyncStorage from '@react-native-async-storage/async-storage';
// react native components
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
// assets
import Logo from '../../assets/logo.png';
// my components
import CustomText from '../../components/display/CustomText';
import CustomInput from '../../components//input/CustomInput';
import CustomButton from '../../components/buttons/CustomButton';
// keyboard aware scroll view
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
// backend
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';
// styling
import { Colors } from '../../styles/Colors';

const SignIn = ({ route, navigation }) => {
  // state variables
  const [email, setEmail] = useState(route.params?.email || '');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(true);
  // loading and error handling
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const auth = getAuth();

  // password visibility
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  // Function to handle Firebase errors
  const handleFirebaseError = (error) => {
    switch (error.code) {
      case 'auth/user-not-found':
        return 'User not found.';
      case 'auth/wrong-password':
        return 'Invalid password.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      default:
        return 'Sign-in failed. Please try again.';
    }
  };

  // sign in function
  const onSignInPressed = async () => {
    // if loading, return
    if (loading) return;

    setLoading(true);
    setErrorMessage('');

    // Validate input
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      setLoading(false);
      return;
    }

    // try to submit the sign-in request
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);

      // make sure email is verified
      if (!response.user.emailVerified) {
        setErrorMessage('Please verify your email before signing in.');
        setLoading(false);
        return;
      }

      // Navigate to the home screen
      navigation.navigate('HomeScreen');

      // set user data in async storage
      // get user data from db first***

      console.log(response.user);
      
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
    } catch (error) {
      console.log(error);
      setErrorMessage(handleFirebaseError(error));
    } finally {
      setLoading(false);
    }
  };

  // forgot password
  const onForgotPasswordPressed = () => {
    navigation.navigate('ForgotPassword');
  };

  // go to sign up
  const onSignUp = () => {
    // Navigate to the sign-up screen
    navigation.navigate('SignUp');
  };

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView 
        contentContainerStyle={styles.elementsContainer}
        extraHeight={-100}
      >
        <View style={styles.topElements}>
          <Image source={Logo} style={styles.logo} />
        </View>

        <View style={styles.signInContainer}>
          <CustomText style={styles.title} text='Welcome back!' font='bold'/>

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

          {errorMessage ? (
            <CustomText style={styles.errorMessage} text={errorMessage} />
          ) : null}
          {errorMessage == 'Please verify your email before signing in.' ? (
            <CustomText style={styles.signupLink} text="Still waiting on an email?." onPress={() => {
              navigation.navigate('VerifyEmail');
            }} />
          ) : null}

          <CustomButton text="Sign In" onPress={onSignInPressed} color={Colors.red} />

          <CustomText text="Forgot Password?" onPress={onForgotPasswordPressed} style={styles.signupLink} />
          <CustomText style={styles.signupText} text="Don't have an account?" />
          <CustomText style={styles.signupLink} onPress={onSignUp} text="Sign Up" />
        </View>

        {/* make sure bottom part is white*/}
        <View style={{position: "absolute", bottom: -600, left: 0, right: 0, backgroundColor: Colors.white, height: 600}}/>
      </KeyboardAwareScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    backgroundColor: Colors.lightGray,
  },
  elementsContainer: {
    flex: 1,
    width: 390,
  },
  topElements: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: 40,
  },
  signInContainer: {
    flex: 2,
    padding: 20,
    paddingTop: 30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: Colors.white,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    marginTop: 100,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  signupText: {
    fontSize: 16,
    color: 'black',
    marginTop: 15,
  },
  signupLink: {
    marginTop: 5,
    color: Colors.buttonBlue,
    fontSize: 16,
  },
  errorMessage: {
    color: Colors.red,
    marginBottom: 10,
  },
});

export default SignIn;
