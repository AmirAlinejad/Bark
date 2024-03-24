<<<<<<< HEAD
import React, { useState } from 'react'
// react native components
import {
  View,
  Image,
  StyleSheet,
  useWindowDimensions,
  ActivityIndicator
} from 'react-native';
// assets
import Logo from '../../assets/logo.png'
// my components
import CustomText from '../../components/CustomText';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
// backend
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { FIREBASE_AUTH, db } from '../../backend/FirebaseConfig';

const SignUp = ({ onAdd, navigation }) => {
  // state variables
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { height } = useWindowDimensions();
  const auth = FIREBASE_AUTH;

  // password visibility
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  // go to sign in page
  const onLoginIn = () => {
    navigation.navigate("SignIn");
  }

  // sign up
  const onSignUpPressed = async (e) => {
    setLoading(true);
    e.preventDefault();

    // Validate input
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

    // try to submit the sign-up request
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
        uid: response.user.uid,
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

      <CustomText style={styles.title} text='Sign Up!' />

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

      <CustomText style={styles.signupText} text={'Have an account already?'} />
      <CustomText style={styles.signupLink} onPress={onLoginIn} text='Log In'/>

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
    marginTop: 120,
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

=======
import React, { useState } from 'react'
// react native components
import {
  View,
  Image,
  StyleSheet,
  useWindowDimensions,
  ActivityIndicator
} from 'react-native';
// assets
import Logo from '../../assets/logo.png'
// my components
import CustomText from '../../components/CustomText';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
// backend
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { FIREBASE_AUTH, db } from '../../backend/FirebaseConfig';

const SignUp = ({ onAdd, navigation }) => {
  // state variables
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { height } = useWindowDimensions();
  const auth = FIREBASE_AUTH;

  // password visibility
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  // go to sign in page
  const onLoginIn = () => {
    navigation.navigate("SignIn");
  }

  // sign up
  const onSignUpPressed = async (e) => {
    setLoading(true);
    e.preventDefault();

    // Validate input
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

    // try to submit the sign-up request
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

      <CustomText style={styles.title} text='Sign Up!' />

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

      <CustomText style={styles.signupText} text={'Have an account already?'} />
      <CustomText style={styles.signupLink} onPress={onLoginIn} text='Log In'/>

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
    marginTop: 120,
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

>>>>>>> dfe4a17ddd108df15325f902cdfdaa4361e7c37e
export default SignUp