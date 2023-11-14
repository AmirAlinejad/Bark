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
import Logo from '../assets/images/Heart.png'
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { FIREBASE_AUTH } from './auth/FirebaseConfig';


const SignUp = ({ onAdd, navigation }) => {
  const [userName, setUserName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("")
  const[loading, setLoading] = useState(false);
  const {height} = useWindowDimensions();
  const auth = FIREBASE_AUTH;


  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };
  //const navigate = useNavigate()
  const onLoginIn = () => {
    // Navigate to the sign-up screen
    navigation.navigate("SignIn");
  }
  const onSignUpPressed = async (e) => {
    setLoading(true);
    e.preventDefault()

    if(!userName) {
      alert("Please add a username")
      setLoading(false)
      return
    }
    if(!email) {
      alert("Please add a email")
      setLoading(false)
      return
    }
    if(!password) {
      alert("Please add a password")
      setLoading(false)
      return
    }
    if(password !== confirmPassword) {
      alert("Passwords do not match")
      setLoading(false)
      return
    }
    
    try {
      const response = await createUserWithEmailAndPassword(auth, email, password);
      navigation.navigate("Home");
    } catch (error) {
      console.log(error)
      alert('Signup failed: ' + error.message);
    } finally {
      setLoading(false);
    }
    
    setUserName('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    //navigate("/")
  }
  
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
        secureTextEntry = {!passwordVisible}
        onEyeIconPress={togglePasswordVisibility}
      />
      <CustomInput placeholder="Confirm Password" 
      value={confirmPassword} 
      setValue={setConfirmPassword}
      secureTextEntry = {!passwordVisible}
      onEyeIconPress={togglePasswordVisibility}
      />
      <CustomInput placeholder="Username" 
      value={userName} 
      setValue={setUserName}
      />
      
      { loading ? ( <ActivityIndicator size = "large"/>
      ) : ( 
        <CustomButton text="Sign Up" onPress={onSignUpPressed} />
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
})

export default SignUp