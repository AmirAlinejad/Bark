import React, { useState } from "react";
import { View, StyleSheet, Alert, TouchableOpacity } from "react-native";
// custom components
import CustomInput from "../../components/input/CustomInput";
import CustomButton from "../../components/buttons/CustomButton";
import Header from "../../components/display/Header";
// auth functions
import { sendPasswordResetEmail, getAuth } from "firebase/auth";
// styles
import { Colors } from "../../styles/Colors";

const ForgotPassword = ({ navigation }) => {
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
    <View style={styles.container}>
      <Header
        navigation={navigation}
        text="Forgot Password"
        back={true}
        onBack={onBackToSignInPressed}
      />

      <View style={styles.content}>
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
              style={styles.text}
            />
            <TouchableOpacity onPress={onBackToSignInPressed}>
              <CustomText style={styles.buttonText} text="Back to sign in" />
            </TouchableOpacity>
          </View>
        )}
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
          width={"50%"}
          text="Reset Password"
          onPress={onResetPasswordPressed}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "flex-start",
    backgroundColor: Colors.lightGray,
  },
  content: {
    flex: 1,
    width: "100%",
    padding: 20,
    alignItems: "flex-start",
  },
  input: {
    marginBottom: 20,
  },
  text: {
    color: Colors.black,
    fontSize: 16,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ForgotPassword;
