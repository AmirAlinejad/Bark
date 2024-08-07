// get auth and deep linking params and navigate to the appropriate screen
import React, { useEffect, useRef } from "react";
import { View, Image, StyleSheet, Animated, Easing } from "react-native";
// auth
import { auth } from "../../backend/FirebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
// storage
import AsyncStorage from "@react-native-async-storage/async-storage";
// logo
import SplashScreenImg from "../../assets/whiteLogo.png";
// gradient
import { LinearGradient } from "expo-linear-gradient";
// linking
import * as Linking from "expo-linking";
// theme
import { useTheme } from "@react-navigation/native";

// screen
const SplashScreen = ({ navigation }) => {
  const { colors } = useTheme();

  state = { opacity: new Animated.Value(1), height: new Animated.Value(380) };

  showContent = () => {
    const { opacity, height } = this.state;

    Animated.timing(height, {
      toValue: 0,
      duration: 500,
      easing: Easing.linear,
      useNativeDriver: false, // <-- neccessary
    }).start();
    Animated.timing(opacity, {
      toValue: 0,
      duration: 500,
      easing: Easing.linear,
      useNativeDriver: false, // <-- neccessary
    }).start();
  };

  // navigate to the appropriate screen after 3 seconds
  useEffect(() => {
    setTimeout(() => {
      const asyncFunction = async () => {
        let URL = "";
        let screenName = "";

        // deep linking (get the screen to go to)
        Linking.getInitialURL()
          .then((url) => {
            if (url) {
              console.log(`Initial url is: ${url}`);

              // parse url to get the params
              const { queryParams } = Linking.parse(url);
              URL = url;
              screenName = queryParams.screen;
            }
          })
          .catch((err) => console.error("An error occurred", err));

        // see if user is logged in
        const user = await AsyncStorage.getItem("user").then((data) => {
          return data ? JSON.parse(data) : null;
        });
        
        // if user is signed in, navigate to the home screen, otherwise navigate to the onboarding screens
        if (user) {
          // does not need auth right now but eventually will save email and password in async storage (update permissions in firebase)
          try {
            const response = await signInWithEmailAndPassword(
              auth,
              user.email,
              '123456' // fix this
            );

            // different cases for different screens
            if (screenName == "club") {
              const { queryParams } = Linking.parse(URL);
              const clubId = queryParams.clubId;

              // navigate to the club screen
              navigation.navigate("Main", { screen: "HomeScreen" });
              navigation.navigate("Main", {
                screen: "ClubScreen",
                params: { clubId: clubId, goToHomeScreen: true },
              });
            } else if (screenName == "event") {
              const { queryParams } = Linking.parse(URL);
              const eventId = queryParams.eventId;

              // navigate to the event screen
              navigation.navigate("Main", { screen: "HomeScreen" });
              navigation.navigate("Main", {
                screen: "EventScreen",
                params: { eventId: eventId, goToHomeScreen: true },
              });
            } else if (screenName == "chat") {
              const { queryParams } = Linking.parse(URL);
              const chatId = queryParams.chatId;

              // navigate to the chat screen
              navigation.navigate("Main", { screen: "HomeScreen" });
              navigation.navigate("Main", {
                screen: "Chat",
                params: { chatId: chatId },
              });
            } else if (screenName == "chat") {
              const { queryParams } = Linking.parse(URL);
              const chatId = queryParams.chatId;

              // navigate to the chat screen
              navigation.navigate("Main", { screen: "HomeScreen" });
              navigation.navigate("Main", {
                screen: "Chat",
                params: { chatId: chatId },
              });
            } else if (screenName == "attendance") {
              const { queryParams } = Linking.parse(URL);
              const eventId = queryParams.eventId;

              // navigate to the chat screen
              navigation.navigate("Main", { screen: "HomeScreen" });
              navigation.navigate("Main", {
                screen: "EventAttendance",
                params: { eventId: eventId },
              });
            } else {
              navigation.navigate("Main"); // put back
            }

            if (!response.user.emailVerified) {
              alert("Please verify your email before signing in.");
            }
          } catch (error) {
            console.log(error);
            navigation.navigate("Onboarding");
          }
        } else {
          navigation.navigate("Onboarding");
        }
      };

      asyncFunction();
    }, 1000);

    setTimeout(() => {
      this.showContent();
    }, 500);
  }, []);

  return (
    <View
      style={[
        styles.screenStyle,
        {
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
        },
      ]}
    >
      <LinearGradient
        colors={["#ff3131", "#ff914d"]}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: "100%",
        }}
      />
      <Animated.Image
        source={SplashScreenImg}
        style={{
          opacity: this.state.opacity,
          width: this.state.height,
          height: this.state.height,
        }}
      />
    </View>
  );
};

// styles
const styles = StyleSheet.create({
  screenStyle: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SplashScreen;
