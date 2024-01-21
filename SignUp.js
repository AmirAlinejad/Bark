import React from 'react'
import { useState } from 'react'
import {
  Text,
  View,
  Image,
  StyleSheet,
  useWindowDimensions,
  ActivityIndicator
} from 'react-native';
import Logo from '../assets/logo.png'
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { FIREBASE_AUTH, db } from '../backend/FirebaseConfig';

const SignUp = ({ onAdd, navigation }) => {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { height } = useWindowDimensions();
  const auth = FIREBASE_AUTH;

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const onLoginIn = () => {
    navigation.navigate("SignIn");
  }

  const onSignUpPressed = async (e) => {
    setLoading(true);
    e.preventDefault();

    if (!userName || !email || !password || !confirmPassword) {
      alert("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(response.user, {
        displayName: userName,
      });

      const userRef = ref(db, `users/${response.user.uid}`);
      await set(userRef, {
        userName: userName,
        email: email,
        clubs: [], 
        clubsJoined: [],
      });

      navigation.navigate("HomeScreen");
    } catch (error) {
      console.log(error);
      alert('Signup failed: ' + error.message);
    } finally {
      setLoading(false);
    }

    setUserName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <View style={styles.container}>
      <Image
        source={Logo}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Sign Up!</Text>

      <CustomInput placeholder="School Email"
        value={email}
        setValue={setEmail}
      />
      <CustomInput
        placeholder="Password"
        value={password}
        setValue={setPassword}
        secureTextEntry={passwordVisible}
        onEyeIconPress={togglePasswordVisibility}
      />
      <CustomInput placeholder="Confirm Password"
        value={confirmPassword}
        setValue={setConfirmPassword}
        secureTextEntry={passwordVisible}
        onEyeIconPress={togglePasswordVisibility}
      />
      <CustomInput placeholder="Username"
        value={userName}
        setValue={setUserName}
      />

      {loading ? (<ActivityIndicator size="large" />
      ) : (
        <CustomButton text="Sign Up" onPress={onSignUpPressed} bgColor={'#FF5349'}/>
      )}

      <Text style={styles.signupText}>Have an account already?  <Text style={styles.signupLink} onPress={onLoginIn}>Login In</Text></Text>

    </View>

  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    marginTop: '-35%',
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
})

export default SignUp