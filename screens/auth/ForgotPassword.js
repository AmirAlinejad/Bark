import React, { useState } from "react";
import { View, StyleSheet, Alert, TouchableOpacity } from "react-native";
// custom components
import CustomInput from "../../components/input/CustomInput";
import CustomButton from "../../components/buttons/CustomButton";
// auth functions
import { sendPasswordResetEmail, getAuth } from "firebase/auth";
import { useTheme } from "@react-navigation/native";
import CustomText from "../../components/display/CustomText";

const ForgotPassword = ({ navigation }) => {
  const { colors } = useTheme();

  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const auth = getAuth();

  const onResetPasswordPressed = async () => {
    if (email) {
      try {
        await sendPasswordResetEmail(auth, email);
        Alert.alert(
          "Check your email",
          "A link to reset your password has been sent to your email address."
        );
        setEmailSent(true);

        // Navigate back to sign in screen
        onBackToSignInPressed();
      } catch (error) {
        Alert.alert("Error", error.message);
      }
    } else {
      Alert.alert("Enter Email", "Please enter your email address.");
    }
  };

  const onBackToSignInPressed = () => {
    navigation.navigate("SignIn", { email });
  };

  return (
    <View style={[styles.container, { color: colors.background }]}>
      <View style={styles.content}>
        <CustomText text="Forgot Password" style={styles.text} font="bold" />
        {!emailSent && (
          <CustomText
            text="Enter your email address to reset your password."
            style={styles.buttonText}
          />
        )}
        <CustomInput
          placeholder="Email"
          value={email}
          setValue={setEmail}
          keyboardType="email-address"
          icon="email"
          style={styles.input}
        />

        {emailSent && (
          <View>
            <CustomText
              text="A link to reset your password has been sent to your email address."
              style={styles.buttonText}
            />
          </View>
        )}
        <TouchableOpacity onPress={onBackToSignInPressed}>
          <CustomText
            style={{ ...styles.buttonText, color: colors.button }}
            text="Go back to sign up"
          />
        </TouchableOpacity>
      </View>

      <View
        style={{
          position: "absolute",
          width: "100%",
          bottom: 20,
          alignItems: "center",
        }}
      >
        <CustomButton
          text="Reset Password"
          onPress={onResetPasswordPressed}
          color={email.includes(".edu") ? colors.button : colors.gray}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "flex-start",
  },
  content: {
    flex: 1,
    width: "100%",
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  input: {
    marginBottom: 20,
  },
  text: {
    fontSize: 24,
  },
  buttonText: {
    fontSize: 16,
  },
});

export default ForgotPassword;
