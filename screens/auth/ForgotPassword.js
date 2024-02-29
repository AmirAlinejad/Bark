import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { sendPasswordResetEmail, getAuth } from 'firebase/auth';
import Header from '../../components/Header';

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
          <CustomButton
            text="Send Password Reset Email"
            onPress={onResetPasswordPressed}
            type="primary"
            bgColor={'orange'}
            style={styles.button}
          />
          <CustomButton
            text="Back to Sign In"
            onPress={onBackToSignInPressed}
            type="secondary"
            bgColor={'orange'}
            style={styles.button}
          />
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
    backgroundColor: 'white',
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
  buttonsContainer: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  button: {
    width: '48%',
  },
});

export default ForgotPassword;
