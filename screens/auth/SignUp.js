import React, { useState } from "react";
// react native components
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
// assets
import Logo from "../../assets/logo.png";
// async storage
import AsyncStorage from "@react-native-async-storage/async-storage";
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

const SignUp = ({ route, navigation }) => {
  const expoPushToken = route.params?.expoPushToken;
  console.log(expoPushToken);

  // state variables
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(true);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
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

    try {
      // create user with email and password
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      // send email verification
      await sendEmailVerification(response.user);
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

      // clear async storage
      await AsyncStorage.clear();

      // navigate to verify school
      navigation.navigate("VerifySchool");
    } catch (error) {
      console.log(error);
      setErrorMessage("Signup failed: " + error.message);
    } finally {
      setLoading(false);
    }
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
            text="Nice to meet you."
            font="bold"
          />

          <CustomInput
            placeholder="School Email"
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
});

export default SignUp;
