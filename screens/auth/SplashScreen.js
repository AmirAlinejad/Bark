// get auth and deep linking params and navigate to the appropriate screen
import React, { useEffect } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
// auth
import { FIREBASE_AUTH } from "../../backend/FirebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
// storage
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
// notifications
import * as Notifications from "expo-notifications";
// logo
import SplashScreenImg from "../../assets/brand/whiteLogo.png";
import SplashScreenFx from "../../assets/fx/splashOverlay.png";
// gradient
import { LinearGradient } from "expo-linear-gradient";
// linking
import * as Linking from "expo-linking";
// theme
import { useTheme } from "@react-navigation/native";
// backend
import { updateExpoPushTokenForUserClubs } from "../../functions/clubFunctions";
import { getUserData } from "../../functions/profileFunctions";
// context
import { GlobalContext } from "../../App";
// navigation
import {
  goToAdminChatScreen,
  goToChatScreen,
} from "../../functions/navigationFunctions";

// screen
const SplashScreen = ({ navigation }) => {
  // useEffect(() => {
  //   let isMounted = true;
  //   let clubId = "";
  //   let chatName = "";
  //   let URL = "";

  //   async function redirect(notification, navigation) {
  //     const url = notification.request.content.data?.url;
  //     if (url) {
  //       const { queryParams } = Linking.parse(url);
  //       clubId = queryParams.clubId;
  //       chatName = queryParams.chatName;
  //       URL = url;

  //       console.log("clubId: ", clubId);
  //       console.log("chatName: ", chatName);
  //     }

  //     // see if user is logged in
  //     const user = await SecureStore.getItemAsync("user").then((data) => {
  //       return data ? JSON.parse(data) : null;
  //     });

  //     // if user is signed in, navigate to the home screen, otherwise navigate to the onboarding screens
  //     if (user) {
  //       // does not need auth right now but eventually will save email and password in async storage (update permissions in firebase)
  //       try {
  //         const response = await signInWithEmailAndPassword(
  //           auth,
  //           user.email,
  //           user.password
  //         );

  //         if (!response.user.emailVerified) {
  //           alert("Please verify your email before signing in.");
  //           navigation.navigate("Onboarding");
  //           AsyncStorage.clear();
  //           SecureStore.deleteItemAsync("user");
  //         }

  //         // different cases for different screens
  //         if (clubId) {
  //           if (chatName) {
  //             if (chatName == "chat") {
  //               // get club data
  //               const clubData = await getClubData(clubId);

  //               if (!clubData) {
  //                 alert("Club not found.");
  //                 return;
  //               }

  //               // navigate to the chat screen
  //               navigation.navigate("Main", { screen: "HomeScreen" });
  //               goToChatScreen(
  //                 clubData.clubName,
  //                 clubData.clubId,
  //                 clubData.clubImg,
  //                 navigation
  //               );
  //             } else if (chatName == "admin") {
  //               // get club data
  //               const clubData = await getClubData(clubId);

  //               if (!clubData) {
  //                 alert("Club not found.");
  //                 return;
  //               }

  //               // navigate to the chat screen
  //               navigation.navigate("Main", { screen: "HomeScreen" });
  //               navigation.navigate("Main", {
  //                 screen: "ClubScreen",
  //                 params: { clubId: clubId, goToHomeScreen: true },
  //               });
  //               goToAdminChatScreen(clubData, navigation);
  //             }
  //           } else {
  //             // navigate to the club screen
  //             navigation.navigate("Main", { screen: "HomeScreen" });
  //             navigation.navigate("Main", {
  //               screen: "ClubScreen",
  //               params: { clubId: clubId, goToHomeScreen: true },
  //             });
  //           }
  //         } else {
  //           navigation.navigate("Main"); // put back
  //         }
  //       } catch (error) {
  //         console.log(error);
  //         navigation.navigate("Onboarding");
  //         AsyncStorage.clear();
  //         SecureStore.deleteItemAsync("user");
  //       }
  //     } else {
  //       navigation.navigate("Onboarding");
  //     }
  //   }

  //   Notifications.getLastNotificationResponseAsync().then((response) => {
  //     if (!isMounted || !response?.notification) {
  //       return;
  //     }
  //     redirect(response?.notification);
  //   });

  //   const subscription = Notifications.addNotificationResponseReceivedListener(
  //     (response) => {
  //       redirect(response.notification);
  //     }
  //   );

  //   return () => {
  //     isMounted = false;
  //     subscription.remove();
  //   };
  // }, []);

  // get the global state
  const globalState = React.useContext(GlobalContext);

  const { colors } = useTheme();

  state = {
    opacity: new Animated.Value(1),
    height: new Animated.Value(300),
    scale: new Animated.Value(1),
    rotation: new Animated.Value(0),
  };

  showContent = () => {
    const { opacity, height, scale, rotation } = this.state;

    Animated.timing(height, {
      toValue: 20,
      duration: 1000,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false, // <-- neccessary
    }).start();
    Animated.timing(opacity, {
      toValue: 0,
      duration: 1000,
      easing: Easing.linear,
      useNativeDriver: false, // <-- neccessary
    }).start();
    Animated.timing(scale, {
      toValue: 1,
      duration: 1000,
      easing: Easing.linear,
      useNativeDriver: false, // <-- neccessary
    }).start();
    Animated.timing(rotation, {
      toValue: 1,
      duration: 1000,
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

              console.log("screenName: ", screenName);
            }
          })
          .catch((err) => console.error("An error occurred", err));

        // see if user is logged in
        const user = await SecureStore.getItemAsync("user").then((data) => {
          return data ? JSON.parse(data) : null;
        });

        // if user is signed in, navigate to the home screen, otherwise navigate to the onboarding screens
        if (user) {
          console.log("user: ", user);
          // does not need auth right now but eventually will save email and password in async storage (update permissions in firebase)
          try {
            const response = await signInWithEmailAndPassword(
              FIREBASE_AUTH,
              user.email,
              user.password
            );

            if (!response) {
              navigation.navigate("Onboarding");
              AsyncStorage.clear();
              SecureStore.deleteItemAsync("user");
              return;
            }

            // get expo push token
            const userData = await getUserData();

            const expoPushToken = globalState[0].expoPushToken;

            // update user data with expo push token
            if (expoPushToken && !userData.expoPushToken) {
              userData.expoPushToken = expoPushToken;

              // update user data
              await SecureStore.setItemAsync("user", JSON.stringify(userData));

              updateExpoPushTokenForUserClubs(userData.id, expoPushToken);
            }

            // different cases for different screens
            if (screenName == "club") {
              const { queryParams } = Linking.parse(URL);
              const clubId = queryParams.clubId;

              // navigate to the club screen
              navigation.navigate("Main", { screen: "HomeScreen" });
              navigation.navigate("Main", {
                screen: "ClubScreen",
                params: { clubId: clubId },
              });
            } else if (screenName == "event") {
              const { queryParams } = Linking.parse(URL);
              const eventId = queryParams.eventId;

              // navigate to the event screen
              navigation.navigate("Main", { screen: "HomeScreen" });
              navigation.navigate("Main", {
                screen: "EventScreen",
                params: { eventId: eventId },
              });
            } else if (screenName == "attendance") {
              const { queryParams } = Linking.parse(URL);
              const eventId = queryParams.eventId;

              // navigate to the event screen
              navigation.navigate("Main", { screen: "HomeScreen" });
              navigation.navigate("Main", {
                screen: "Attendees",
                params: { eventId: eventId },
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
            } else {
              navigation.navigate("Main", { screen: "HomeScreen" });
            }

            if (!response.user.emailVerified) {
              alert("Please verify your email before signing in.");
            }
          } catch (error) {
            console.log(error);
            navigation.navigate("Onboarding");
            AsyncStorage.clear();
            SecureStore.deleteItemAsync("user");
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

  // interpolate the rotation value
  const spin = this.state.rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "10deg"],
  });

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
        colors={["#FF5028", "#ff7a28"]}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: "100%",
        }}
      />
      <Animated.Image
        source={SplashScreenFx}
        style={{
          width: "100%",
          height: "100%",
          transform: [{ scale: this.state.scale }],
        }}
      />

      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Animated.Image
          source={SplashScreenImg}
          style={{
            opacity: this.state.opacity,
            width: this.state.height,
            height: this.state.height,
            transform: [{ rotate: spin }],
          }}
        />
      </View>
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
