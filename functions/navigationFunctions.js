import { emailSplit } from "./backendFunctions";
import { auth } from "../backend/FirebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getUserData } from "./profileFunctions";
import * as SecureStore from "expo-secure-store";
import { updateExpoPushTokenForUserClubs } from "./clubFunctions";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";

export const goToClubScreen = (clubId, navigation) => {
  navigation.navigate("ClubScreen", {
    clubId: clubId,
  });
};

export const goToEventScreen = (eventId, navigation) => {
  navigation.navigate("EventScreen", {
    eventId: eventId,
  });
};

export const goToChatScreen = async (clubName, clubId, clubImg, navigation) => {
  const schoolKey = await emailSplit();

  navigation.navigate("Chat", {
    name: clubName,
    id: clubId,
    img: clubImg,
    schoolKey: schoolKey,
  });
};

export const goToAdminChatScreen = async (club, navigation) => {
  const schoolKey = await emailSplit();

  navigation.push("Chat", {
    chatName: "admin",
    name: club.clubName,
    id: club.clubId,
    img: club.clubImg,
    club: club,
    schoolKey: schoolKey,
  });
};

export const startNavigation = async (expoPushToken, navigation) => {
  console.log("expoPushToken: ", expoPushToken);
  // navigate to the appropriate screen after 3 seconds
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
        auth,
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
