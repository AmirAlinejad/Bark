import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { sendEmailVerification } from 'firebase/auth';
import { FIREBASE_AUTH } from '../../backend/FirebaseConfig';

const VerifyEmail = () => {
  const navigation = useNavigation();
  const [isSending, setIsSending] = useState(false); // State to manage resend button loading state

  useEffect(() => {
    const intervalId = setInterval(async () => {
      if (FIREBASE_AUTH.currentUser) {
        await FIREBASE_AUTH.currentUser.reload();
        const user = FIREBASE_AUTH.currentUser;
        if (user.emailVerified) {
          clearInterval(intervalId);
          navigation.navigate("SignIn");
        }
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(intervalId);
  }, [navigation]);

  const resendVerificationEmail = async () => {
    if (FIREBASE_AUTH.currentUser && !isSending) {
      setIsSending(true);
      try {
        await sendEmailVerification(FIREBASE_AUTH.currentUser);
        alert('Verification email sent. Check your inbox.');
      } catch (error) {
        console.error('Failed to send verification email', error);
        alert('Failed to resend verification email. Please try again later.');
      } finally {
        setIsSending(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Please verify your email. Check your inbox for a verification link.</Text>
      {isSending ? (
        <ActivityIndicator size="small" />
      ) : (
        <Button
          title="Resend Email"
          onPress={resendVerificationEmail}
          color="#3498db" // You can adjust the color to match your app's theme
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 20, // Add some space between the text and the button
  },
});

export default VerifyEmail;
