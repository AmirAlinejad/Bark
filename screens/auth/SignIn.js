import React, { useState, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
// navigation
import { useFocusEffect } from "@react-navigation/native";
// react native components
import { View, StyleSheet, TouchableOpacity } from "react-native";
// firebase
import { FIREBASE_AUTH } from "../../backend/FirebaseConfig";
// assets
import Logo from "../../assets/brand/logo.png";
// functions
import { getUserData } from "../../functions/profileFunctions";
// my components
import CustomText from "../../components/display/CustomText";
import CustomInput from "../../components//input/CustomInput";
import CustomButton from "../../components/buttons/CustomButton";
// keyboard aware scroll view
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
// backend
import { signInWithEmailAndPassword } from "firebase/auth";
// styling
import { useTheme } from "@react-navigation/native";
import Animated, { FadeInUp } from "react-native-reanimated";
// toast
import Toast from "react-native-toast-message";

const SignIn = ({ route, navigation }) => {
  // state variables
  const [email, setEmail] = useState(route.params?.email || "");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(true);
  const [signInSaying, setSignInSaying] = useState("");
  // loading and error handling
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { colors } = useTheme();

  // password visibility
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  // Function to handle Firebase errors
  const handleFirebaseError = (error) => {
    switch (error.code) {
      case "auth/user-not-found":
        return "User not found.";
      case "auth/wrong-password":
        return "Invalid password.";
      case "auth/invalid-email":
        return "Invalid email address.";
      default:
        return "Sign-in failed. Please try again.";
    }
  };

  // sign in function
  const onSignInPressed = async () => {
    // if loading, return
    if (loading) return;

    setLoading(true);
    setErrorMessage("");

    // Validate input
    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      setLoading(false);
      return;
    }

    // try to submit the sign-in request
    try {
      const response = await signInWithEmailAndPassword(
        FIREBASE_AUTH,
        email,
        password
      );

      console.log("response: ", response);

      if (!response) {
        setErrorMessage("Sign-in failed. Please try again.");
        setLoading(false);
        return;
      }

      // make sure email is verified
      if (!response.user.emailVerified) {
        setErrorMessage("Please verify your email before signing in.");
        alert("Please verify your email before signing in.");
        navigation.navigate("VerifyEmail");
        setLoading(false);
        return;
      }

      const schoolKey = response.user.email.split("@")[1].split(".")[0];

      // set school key in async storage
      await AsyncStorage.setItem("schoolKey", schoolKey);

      const userData = await getUserData();

      console.log("userData: ", userData);

      // save to async storage
      await SecureStore.setItemAsync("user", JSON.stringify(userData));

      // Navigate to the home screen
      navigation.navigate("Main");

      // show welcome toast
      if (userData.clubs.length == 0) {
        Toast.show({
          type: "info",
          text1: "Welcome to Bark! 🎉",
          text2: "Join a club to start chatting with clubs and classmates!",
        });
      }
    } catch (error) {
      console.log(error);
      setErrorMessage(handleFirebaseError(error));
    } finally {
      setLoading(false);
    }
  };

  // forgot password
  const onForgotPasswordPressed = () => {
    navigation.navigate("ForgotPassword");
  };

  const onSignUp = () => {
    // Navigate to the sign-up screen
    navigation.navigate("SignUp");
  };

  const signInSayings = [
    "Welcome back!",
    "Nice to see you again!",
    "We missed you!",
    "Glad you're back!",
  ];

  useFocusEffect(
    React.useCallback(() => {
      setSignInSaying(
        signInSayings[Math.floor(Math.random() * signInSayings.length)]
      );
    }, [])
  );

  return (
    <View style={[styles.container, { color: colors.background }]}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.elementsContainer}
        style={{ width: "100%" }}
        extraHeight={-100}
      >
        <View style={styles.topElements}>
          <Animated.Image
            etnering={FadeInUp}
            source={Logo}
            style={styles.logo}
          />
        </View>

        <View style={styles.signInContainer}>
          <CustomText
            style={[styles.title, { color: colors.text }]}
            text={signInSaying}
            font="bold"
          />

          <CustomInput
            placeholder="Email"
            value={email}
            setValue={setEmail}
            keyboardType="email-address"
            icon="email"
          />
          <CustomInput
            placeholder="Password"
            value={password}
            setValue={setPassword}
            secureTextEntry={passwordVisible}
            onEyeIconPress={togglePasswordVisibility}
          />

          {errorMessage ? (
            <CustomText style={styles.errorMessage} text={errorMessage} />
          ) : null}
          {errorMessage == "Please verify your email before signing in." ? (
            <CustomText
              style={styles.signupLink}
              text="Still waiting on an email?."
              onPress={() => {
                navigation.navigate("VerifyEmail");
              }}
            />
          ) : null}

          <CustomButton
            text="Sign In"
            onPress={onSignInPressed}
            color={colors.bark}
          />

          <TouchableOpacity onPress={onForgotPasswordPressed}>
            <CustomText text="Forgot Password?" style={styles.signupLink} />
          </TouchableOpacity>
          <CustomText
            style={[styles.signupText, { color: colors.textLight }]}
            text="Don't have an account?"
          />
          <TouchableOpacity onPress={onSignUp}>
            <CustomText style={styles.signupLink} text="Sign Up" />
          </TouchableOpacity>
        </View>

        {/* make sure bottom part is white*/}
        <View
          style={{
            position: "absolute",
            bottom: -600,
            left: 0,
            right: 0,
            backgroundColor: colors.background,
            height: 600,
          }}
        />
      </KeyboardAwareScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  elementsContainer: {
    flex: 1,
    width: "100%",
  },
  topElements: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  signInContainer: {
    flex: 2,
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 30,
  },
  logo: {
    width: 160,
    height: 120,
    marginBottom: 20,
    marginTop: 100,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  signupText: {
    fontSize: 16,
    color: "black",
    marginTop: 5,
  },
  signupLink: {
    marginTop: 5,
    color: "#3498db",
    fontSize: 16,
  },
  errorMessage: {
    color: "red",
    marginBottom: 10,
  },
});

export default SignIn;
