import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
// my components
import CustomText from "../../components/display/CustomText";
import CustomButton from "../../components/buttons/CustomButton";
import Header from "../../components/display/Header";
// icons
import Ionicons from "react-native-vector-icons/Ionicons";
// firebase
import { FIREBASE_AUTH } from "../../backend/FirebaseConfig";
import { sendEmailVerification } from "firebase/auth";
// colors
import { useTheme } from "@react-navigation/native";

const VerifyEmail = ({ navigation }) => {
  const { colors } = useTheme();

  const [isSending, setIsSending] = useState(false); // State to manage resend button loading state

  const goToSignIn = () => {
    navigation.navigate("SignIn", {
      email: FIREBASE_AUTH.currentUser?.email,
    });
  };

  useEffect(() => {
    // Check if the user is verified every 5 seconds
    const intervalId = setInterval(async () => {
      if (FIREBASE_AUTH.currentUser) {
        await FIREBASE_AUTH.currentUser.reload();
        const user = FIREBASE_AUTH.currentUser;

        if (user.emailVerified) {
          clearInterval(intervalId);

          // Navigate to sign in page with email prefilled
          goToSignIn();
        }
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(intervalId);
  }, []);

  const resendVerificationEmail = async () => {
    // Resend verification email
    if (FIREBASE_AUTH.currentUser && !isSending) {
      setIsSending(true);
      try {
        await sendEmailVerification(FIREBASE_AUTH.currentUser);
        alert("Verification email sent. Check your inbox.");
      } catch (error) {
        console.error("Failed to send verification email", error);
        alert("Failed to resend verification email. Please try again later.");
      } finally {
        setIsSending(false);
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <CustomText
          style={[styles.text, { color: colors.textLight }]}
          text="Please verify your email. Check your inbox for a verification link."
        />

        <Ionicons name="mail-outline" size={100} color={colors.textLight} />

        <CustomText style={styles.text} text="This may take a few minutes." />

        {isSending ? (
          <ActivityIndicator size="small" />
        ) : (
          <CustomButton text="Resend" onPress={resendVerificationEmail} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 50,
    padding: 20,
  },
  text: {
    textAlign: "center",
    fontSize: 18,
    marginBottom: 20,
  },
});

export default VerifyEmail;
