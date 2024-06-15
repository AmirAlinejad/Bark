import React, { useState } from 'react';
// react native components
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
// assets
import Logo from '../../assets/logo.png';
// styles
import { Colors } from '../../styles/Colors';
// my components
import CustomText from '../../components/display/CustomText';
import CustomInput from '../../components//input/CustomInput';
import CustomButton from '../../components/buttons/CustomButton';
// backend
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
// keyboard aware scroll view
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
// firebase
import { doc, setDoc } from 'firebase/firestore';
import { FIREBASE_AUTH, firestore } from '../../backend/FirebaseConfig';

const SignUp = ({ route, navigation, expoPushToken }) => {

  console.log('Received Expo Push Token:', expoPushToken);

  // state variables
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  // loading and error handling
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  // firebase
  const auth = FIREBASE_AUTH;

  // password visibility
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  // go to sign in page
  const onLoginIn = () => {
    navigation.navigate('SignIn');
  };

  // sign up
  const onSignUpPressed = async (e) => {
    setLoading(true);
    setErrorMessage('');
    e.preventDefault();

    if (!userName || !email || !password || !confirmPassword) {
      setErrorMessage('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!email.endsWith('.edu')) {
      setErrorMessage('Email must end with .edu');
      setLoading(false);
      return;
    }

    try {
      // create user with email and password
      const response = await createUserWithEmailAndPassword(auth, email, password);
      // send email verification
      await sendEmailVerification(response.user);
      // update user profile in auth
      const emailSplit = email.split('@')[1].split('.')[0];

      // create user in firestore
      await setDoc(doc(firestore, 'schools', emailSplit, 'userData', response.user.uid), {
        userName: userName,
        email: email,
        firstName: firstName,
        lastName: lastName,
        expoPushToken: expoPushToken,
        id: response.user.uid,
      });

      // navigate to verify school
      navigation.navigate('VerifySchool');
    } catch (error) {
      console.log(error);
      setErrorMessage('Signup failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView 
        contentContainerStyle={styles.elementsContainer}
      >
        <View style={styles.topElements}>
          <Image source={Logo} style={styles.logo} />
        </View>

        <View style={styles.signInContainer}>
          <CustomText style={styles.title} text='Nice to meet you.' font='bold'/>

          <CustomInput placeholder="School Email" value={email} setValue={setEmail} />
          <CustomInput
            placeholder="Password"
            value={password}
            setValue={setPassword}
            secureTextEntry={passwordVisible}
            onEyeIconPress={togglePasswordVisibility}
          />
          <CustomInput
            placeholder="Confirm Password"
            value={confirmPassword}
            setValue={setConfirmPassword}
            secureTextEntry={passwordVisible}
            onEyeIconPress={togglePasswordVisibility}
          />
          <CustomInput placeholder="Username" value={userName} setValue={setUserName} />
          <CustomInput placeholder="First Name" value={firstName} setValue={setFirstName} />
          <CustomInput placeholder="Last Name" value={lastName} setValue={setLastName} />

          {errorMessage ? (
            <CustomText style={styles.errorMessage} text={errorMessage} />
          ) : null}

          {loading ? (
            <ActivityIndicator size="large" />
          ) : (
            <CustomButton text="Sign Up" onPress={onSignUpPressed} bgColor={'#FF5349'} />
          )}

          <CustomText style={styles.signupText} text={'Have an account already?'} />
          <CustomText style={styles.signupLink} onPress={onLoginIn} text="Log In" />

          <View style={{position: "absolute", backgroundColor: Colors.white, height: 600}}/>
        </View>
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
    flex: 3,
    padding: 20,
    paddingTop: 30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: Colors.white,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 60,
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
    color: '#3498db',
    fontSize: 16,
  },
  errorMessage: {
    color: 'red',
    marginBottom: 10,
  },
});

export default SignUp;
