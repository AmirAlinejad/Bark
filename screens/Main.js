// parent component for main screens
import React from "react";
// screens
import HomeScreen from "./HomeScreen";

import ClubCalendar from "./calendar/ClubCalendar";

import EventScreen from "./event/EventScreen";
import EditEventScreen from "./event/EditEventScreen";
import NewEvent from "./event/NewEvent";
import MapPicker from "./event/MapPicker";
import AttendanceScreen from "./event/AttendanceScreen";
import AttendanceViewer from "./event/AttendanceViewer";

import Chat from "./chat/Chat";
import GifSelectionScreen from "./chat/GifSelectionScreen";
import ImageGalleryScreen from "./chat/ImageGalleryScreen";
import ImageViewerScreen from "./chat/ImageViewerScreen";
import MessageSearchScreen from "./chat/MessageSearchScreen";
import UserList from "./chat/UserList";

import MyClubs from "./club/MyClubs";
import ClubCategoryScreen from "./club/ClubCategoryScreen";
import NewClub from "./club/NewClub";
import ClubScreen from "./club/ClubScreen";
import InClubView from "./club/InClubView";
import EditClubScreen from "./club/EditClubScreen";
import Requests from "./club/Requests";

import EditProfile from "./profile/EditProfile";
import FeedbackScreen from "./profile/FeedbackScreen";
import Settings from "./profile/Settings";

import QRCodeScreen from "./QRCodeScreen";
// stack navigator
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { setParams } from "@react-navigation/native";
// colors
import { useTheme } from "@react-navigation/native";

function getHeaderTitle(route) {
  // If the focused route is not found, we need to assume it's the initial screen
  // This can happen during if there hasn't been any navigation inside the screen
  // In our case, it's "Feed" as that's the first screen inside the navigator
  const routeName = getFocusedRouteNameFromRoute(route) ?? "Feed";

  switch (routeName) {
    case "Home":
      return "My Clubs";
    case "Profile":
      return "Profile";
    case "Calendar":
      return "Calendar";
    case "Search":
      return "Search";
    default:
      return "Home";
  }
}

const dontShowHeaderProps = { headerShown: false, gestureEnabled: true };
const noTitleProps = {
  gestureEnabled: false,
  headerTitle: "",
  headerShadowVisible: false,
  headerTransparent: true,
  headerBlurEffect: "light",
};
const headerProps = {
  headerLargeTitle: true,
  headerShadowVisible: false,
  gestureEnabled: false,
  headerTransparent: true,
  headerBlurEffect: "light",
};

// stack navigator
const Stack = createNativeStackNavigator();

const Main = () => {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      initialRouteName={"Home Screen"}
      screenOptions={{
        headerLargeTitleStyle: {
          fontWeight: "bold",
          fontFamily: "Nunito",
          fontSize: 32,
        },
        headerBackTitleStyle: {
          fontFamily: "Nunito",
          fontSize: 18,
        },
        headerStyle: {
          backgroundColor: colors.background,
          shadowColor: "transparent",
          elevation: 0,
        },
      }}
    >
      {/* main */}
      <Stack.Screen
        name="Home Screen"
        component={HomeScreen}
        options={dontShowHeaderProps}
      />
      <Stack.Screen name="MyClubs" component={MyClubs} options={headerProps} />
      <Stack.Screen
        name="ClubScreen"
        component={ClubScreen}
        options={noTitleProps}
      />
      <Stack.Screen
        name="ClubCategoryScreen"
        component={ClubCategoryScreen}
        options={headerProps}
      />
       <Stack.Screen
        name="Club Calendar"
        component={ClubCalendar}
        options={headerProps}
      />
      <Stack.Screen
        name="Requests"
        component={Requests}
        options={{ ...headerProps, headerTitle: "Requests" }}
      />
      <Stack.Screen
        name="EventScreen"
        component={EventScreen}
        options={noTitleProps}
      />
      <Stack.Screen
        name="AttendanceScreen"
        component={AttendanceScreen}
        options={headerProps}
      />
      <Stack.Screen
        name="AttendanceViewer"
        component={AttendanceViewer}
        options={headerProps}
      />
      <Stack.Screen
        name="NewEvent"
        component={NewEvent}
        options={headerProps}
      />
      <Stack.Screen
        name="Map Picker"
        component={MapPicker}
        options={headerProps}
      />
      <Stack.Screen name="Chat" component={Chat} options={headerProps} />
      <Stack.Screen
        name="GifSelectionScreen"
        component={GifSelectionScreen}
        options={headerProps}
      />
      <Stack.Screen
        name="ImageGalleryScreen"
        component={ImageGalleryScreen}
        options={headerProps}
      />
      <Stack.Screen
        name="ImageViewerScreen"
        component={ImageViewerScreen}
        options={noTitleProps}
      />
      <Stack.Screen
        name="InClubView"
        component={InClubView}
        options={headerProps}
      />
      <Stack.Screen
        name="MessageSearchScreen"
        component={MessageSearchScreen}
        options={headerProps}
      />
      <Stack.Screen
        name="UserList"
        component={UserList}
        options={headerProps}
      />
      <Stack.Screen name="NewClub" component={NewClub} options={headerProps} />
      <Stack.Screen
        name="Edit Profile"
        component={EditProfile}
        options={headerProps}
      />
      <Stack.Screen
        name="Edit Club"
        component={EditClubScreen}
        options={headerProps}
      />
      <Stack.Screen
        name="Edit Event"
        component={EditEventScreen}
        options={headerProps}
      />
      <Stack.Screen
        name="Feedback"
        component={FeedbackScreen}
        options={headerProps}
      />
      <Stack.Screen
        name="QR Code"
        component={QRCodeScreen}
        options={headerProps}
      />
      <Stack.Screen
        name="Settings"
        component={Settings}
        options={headerProps}
      />
    </Stack.Navigator>
  );
};

export default Main;
