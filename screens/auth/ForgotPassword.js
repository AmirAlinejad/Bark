import React, { useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { sendPasswordResetEmail, getAuth } from 'firebase/auth';
import Header from '../../components/Header';
import {Colors} from "../../styles/Colors"
const ForgotPassword = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const auth = getAuth();

  const onResetPasswordPressed = async () => {
    if (email) {
      try {
        await sendPasswordResetEmail(auth, email);
        Alert.alert(
          'Check your email',
          'A link to reset your password has been sent to your email address.'
        );
        navigation.goBack();
      } catch (error) {
        Alert.alert('Error', error.message);
      }
    } else {
      Alert.alert('Enter Email', 'Please enter your email address.');
    }
  };

  const onBackToSignInPressed = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Header navigation={navigation} text="Forgot Password" back={true} style={styles.header} />
      <View style={styles.content}>
        <CustomInput
          placeholder="Email"
          value={email}
          setValue={setEmail}
          keyboardType="email-address"
          icon="email"
          style={styles.input}
        />
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
          style={[styles.button, { backgroundColor: Colors.primary, width: '90%', maxWidth: 400 }]}
          onPress={onResetPasswordPressed}
        >
          <Text style={styles.buttonText}>Send Reset Email</Text>
        </TouchableOpacity>
          
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#FAFAFA',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1, // Ensure the header stays above other content
  },
  content: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    marginTop: 60, // Adjust based on header height
  },
  input: {
    marginBottom: 20,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 40,
    
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ForgotPassword;
