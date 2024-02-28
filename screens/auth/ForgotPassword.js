import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { sendPasswordResetEmail, getAuth } from 'firebase/auth';
const ForgotPassword = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const auth = getAuth();
  
    const onResetPasswordPressed = async () => {
      if (email) {
        try {
          await sendPasswordResetEmail(auth, email);
          Alert.alert('Check your email', 'A link to reset your password has been sent to your email address.');
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
        <CustomInput
          placeholder="Email"
          value={email}
          setValue={setEmail}
          keyboardType="email-address"
          icon="email"
        />
        <CustomButton
          text="Send Password Reset Email"
          onPress={onResetPasswordPressed}
          type="primary"
        />
        <CustomButton
          text="Back to Sign In"
          onPress={onBackToSignInPressed}
          type="secondary"
        />
      </View>
    );
  };
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    },
    // Add more styles as needed
  });
  export default ForgotPassword;
