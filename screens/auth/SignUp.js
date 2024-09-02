import React, { useState, useContext } from "react";
// react native components
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
// navigation
import { useFocusEffect } from "@react-navigation/native";
// assets
import Logo from "../../assets/brand/logo.png";
// my components
import CustomText from "../../components/display/CustomText";
import CustomInput from "../../components//input/CustomInput";
import CustomButton from "../../components/buttons/CustomButton";
// backend
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
// keyboard aware scroll view
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
// firebase
import { doc, setDoc } from "firebase/firestore";
import { FIREBASE_AUTH, firestore } from "../../backend/FirebaseConfig";
// theme
import { useTheme } from "@react-navigation/native";
// global context
import { GlobalContext } from "../../App";
// ionicons
import { Ionicons } from "@expo/vector-icons";

const SignUp = ({ navigation }) => {
  // global context
  const [state, setState] = useContext(GlobalContext);

  // state variables
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(true);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [signUpSaying, setSignUpSaying] = useState("");
  // loading and error handling
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  // firebase
  const auth = FIREBASE_AUTH;

  const { colors } = useTheme();

  // password visibility
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  // go to sign in page
  const onLoginIn = () => {
    navigation.navigate("SignIn");
  };

  // sign up
  const onSignUpPressed = async (e) => {
    setLoading(true);
    setErrorMessage("");
    e.preventDefault();

    if (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[!@#$%^&*]/.test(password)
    ) {
      setErrorMessage("Password invalid, please enter a new password");
      setLoading(false);
      return;
    }

    if (!userName || !email || !password || !confirmPassword) {
      setErrorMessage("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      setLoading(false);
      return;
    }

    if (!email.endsWith(".edu")) {
      setErrorMessage("Email must end with .edu");
      setLoading(false);
      return;
    }

    const expoPushToken = state.expoPushToken;

    if (expoPushToken === undefined) {
      setErrorMessage("Failed to get push token for push notification!");
      setLoading(false);
    }

    try {
      // create user with email and password
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // update user profile in auth
      const emailSplit = email.split("@")[1].split(".")[0];

      // create user in firestore
      const user = {
        userName: userName,
        email: email,
        password: password,
        firstName: firstName,
        lastName: lastName,
        id: response.user.uid,
      };
      if (expoPushToken !== undefined) {
        user.expoPushToken = expoPushToken;
      }
      await setDoc(
        doc(firestore, "schools", emailSplit, "userData", response.user.uid),
        {
          ...user,
        }
      );

      // navigate to verify school
      navigation.navigate("VerifySchool");

      // send email verification
      await sendEmailVerification(response.user);
    } catch (error) {
      console.log(error);
      setErrorMessage("Signup failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const signUpSayings = [
    "Nice to meet you.",
    "Welcome to Bark!",
    "Let's get started!",
    "We're excited to have you!",
  ];

  useFocusEffect(
    React.useCallback(() => {
      setSignUpSaying(
        signUpSayings[Math.floor(Math.random() * signUpSayings.length)]
      );
    }, [])
  );

  const renderCheckMark = (bool, text) => {
    return (
      <View style={{ flexDirection: "row" }}>
        <View
          style={[
            styles.checkMark,
            { backgroundColor: bool ? colors.green : colors.gray },
          ]}
        >
          <Ionicons
            name={bool ? "checkmark" : "checkmark"}
            size={20}
            color={colors.white}
          />
        </View>
        <CustomText
          style={{ marginLeft: 10, marginTop: 4, color: colors.textLight }}
          text={text}
        />
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.elementsContainer}
        style={{ width: "100%" }}
      >
        <View style={styles.topElements}>
          <Image source={Logo} style={styles.logo} />
        </View>

        <View style={styles.signInContainer}>
          <CustomText
            style={[styles.title, { color: colors.text }]}
            text={signUpSaying}
            font="bold"
          />

          <CustomInput
            placeholder="School Email (.edu)"
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

          {
            renderCheckMark(password.length >= 8, "At least 8 characters") // TODO: add password validation
          }
          {
            renderCheckMark(
              /[A-Z]/.test(password),
              "At least 1 uppercase letter"
            ) // TODO: add password validation
          }
          {
            renderCheckMark(
              /[!@#$%^&*]/.test(password),
              "At least 1 special character"
            ) // TODO: add password validation
          }
          <View style={{ height: 10 }} />
          <CustomInput
            placeholder="Confirm Password"
            value={confirmPassword}
            setValue={setConfirmPassword}
            secureTextEntry={passwordVisible}
            onEyeIconPress={togglePasswordVisibility}
          />
          <CustomInput
            placeholder="Username"
            value={userName}
            setValue={setUserName}
          />
          <CustomInput
            placeholder="First Name"
            value={firstName}
            setValue={setFirstName}
          />
          <CustomInput
            placeholder="Last Name"
            value={lastName}
            setValue={setLastName}
          />

          {errorMessage ? (
            <CustomText style={styles.errorMessage} text={errorMessage} />
          ) : null}

          {loading ? (
            <ActivityIndicator size="large" color={colors.gray} />
          ) : (
            <CustomButton
              text="Sign Up"
              width={93}
              onPress={onSignUpPressed}
              bgColor={"#FF5349"}
            />
          )}

          <CustomText
            style={[styles.signupText, { color: colors.textLight }]}
            text={"Have an account already?"}
          />
          <TouchableOpacity onPress={onLoginIn}>
            <CustomText style={styles.signupLink} text="Log In" />
          </TouchableOpacity>

          <View style={{ height: 50 }} />
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  elementsContainer: {
    width: "100%",
    height: "auto",
  },
  topElements: {
    justifyContent: "center",
    marginTop: 40,
  },
  signInContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  logo: {
    width: 160,
    height: 100,
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  signupText: {
    fontSize: 16,
    color: "black",
    marginTop: 15,
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
  checkMark: {
    width: 25,
    height: 25,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
});

export default SignUp;
