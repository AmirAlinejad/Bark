import React, { useState, createContext, useEffect } from "react";
import { Text, View } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { AppState, Platform } from "react-native";
// screen segments
import SplashScreen from "./screens/auth/SplashScreen";
import Onboarding from "./screens/auth/Onboarding";
import Main from "./screens/Main";
// navigation
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
// linking
import * as Linking from "expo-linking";
// backend
import { getDarkMode } from "./functions/backendFunctions";
// toast
import Toast from 'react-native-toast-message';

export const GlobalContext = createContext();

// linking
const prefix = Linking.createURL("/");

// notifications
async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }

    token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig.extra.eas.projectId,
    });
    console.log('token: ', token);
  } else {
    alert("Must use physical device for Push Notifications");
  }

  return token?.data;
}

// stack navigator
const Stack = createNativeStackNavigator();

export default App = () => {

  const [state, setState] = useState({
    theme: "light",
  });

  // dark mode
  useEffect(() => {
    getDarkMode().then((darkMode) => {
      setState({ ...state, theme: darkMode ? "dark" : "light" });
    });
  }, []);

  const colors = {
    // brand colors
    primary: "#1E90FF",
    bark: "#FF5028",
    barkLight: "#FFEBE6",
    barkDark: "#EF476F",

    // buttons and input
    button: "#1E90FF",

    // base colors
    red: "#EF476F",
    orange: "#FFB703",
    yellow: "#FFD166",
    green: "#06D6A0",
    blue: "#118AB2",
    darkBlue: "#073B4C",
    purple: "#8338EC",
    pink: "#FF6B6B",
    white: "#fff",
    black: "#0c0d1c",
  };

  // themes
  const DarkTheme = {
    dark: true,
    colors: {
      ...colors,
      lightGray: "#808080",
      mediumLightGray: "#12142b",
      gray: "#323563",
      darkGray: "#F5F5F5",
      background: "#0c0d1c",
      card: "#1d1e36",

      // text
      text: "#fff",
      textLight: "#a5abc7",
      inputBorder: "#323563",
    },
  };

  const DefaultTheme = {
    dark: false,
    colors: {
      ...colors,
      lightGray: "#F5F5F5",
      mediumLightGray: "#e8e8e8",
      gray: "#D9D9D9",
      darkGray: "#808080",
      background: "#F5F5F5",
      card: "#fff",

      // text
      text: "#0c0d1c",
      textLight: "#808080",
      inputBorder: "#D9D9D9",
    },
  };

  // notifications
  const [appState, setAppState] = useState(AppState.currentState);

  // linking
  const linking = {
    prefixes: [prefix],
  };

  // notifications
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: true,
    }),
  });

  useEffect(() => {
    // notifications
    registerForPushNotificationsAsync().then((token) =>
      setState({ ...state, expoPushToken: token })
    );

    const handleAppStateChange = (nextAppState) => {
      setAppState(nextAppState);
      console.log("App state changed:", nextAppState);
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <GlobalContext.Provider value={[state, setState]}>
      <View
        style={{
          flex: 1,
          backgroundColor: state.theme === "dark" ? "#000" : "#fff",
        }}
      >
        <NavigationContainer
          linking={linking}
          fallback={<Text>Loading...</Text>}
          theme={state.theme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack.Navigator initialRouteName={"SignIn"}>
            {/* splash */}
            <Stack.Screen
              name="SplashScreen"
              component={SplashScreen}
              options={{ headerShown: false, gestureEnabled: false }}
            />

            {/* auth */}
            <Stack.Screen
              name="Onboarding"
              component={Onboarding}
              options={{ headerShown: false, gestureEnabled: false }}
            />

            {/* main */}
            <Stack.Screen
              name="Main"
              component={Main}
              options={{ headerShown: false, gestureEnabled: false }}
            />
          </Stack.Navigator>
        </NavigationContainer>

        <Toast />
      </View>
    </GlobalContext.Provider>
  );
};
