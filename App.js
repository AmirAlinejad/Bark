import React from "react";
// screens
import SignUp from "./screens/auth/SignUp";
import SignIn from "./screens/auth/SignIn";
import InitialPage from "./screens/auth/InitialPage";
import CalendarScreen from './screens/calendar/CalendarScreen';
import NewClub from './screens/club/NewClub';
import EventScreen from './screens/event/EventScreen';
import NewEvent from './screens/event/NewEvent';
import Chat from './screens/chat/Chat';
import ClubList from './screens/club/ClubList';
import ClubScreen from './screens/club/ClubScreen';
import HomeScreen from './screens/HomeScreen';
import Profile from './screens/profile/Profile';
import EditProfile from './screens/profile/EditProfile';
import MyClubs from './screens/club/MyClubs';
import UserList from './screens/chat/UserList';
import ImageViewerScreen from "./screens/chat/ImageViewerScreen";
import MessageSearchScreen from './screens/chat/MessageSearchScreen';
import InClubView from "./screens/chat/InClubView";
import PinnedMessagesScreen from "./screens/chat/PinnedMessagesScreen";
import ForgotPassword from "./screens/auth/ForgotPassword";
import VerifyEmail from "./screens/auth/VerifyEmail";
import ImageGalleryScreen from "./screens/chat/ImageGalleryScreen";
import AdminChat from "./screens/chat/AdminChat";
// stack navigator
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

const Stack = createNativeStackNavigator();

export default class App extends React.Component {
  render() {
      return (
        <NavigationContainer >
          <Stack.Navigator initialRouteName='SignIn'>
            <Stack.Screen name="InitialPage" component={InitialPage} options={{ headerShown: false }} />
            <Stack.Screen name="SignIn" component={SignIn} options={{ headerShown: false }} />
            <Stack.Screen name="SignUp" component={SignUp} options={{ headerShown: false }} />
            <Stack.Screen name="CalendarScreen" component={CalendarScreen} options={{ headerShown: false }}/>
            <Stack.Screen name="ClubList" component={ClubList} options={{ headerShown: false }}/>
            <Stack.Screen name="MyClubs" component={MyClubs} options={{ headerShown: false }}/>
            <Stack.Screen name="ClubScreen" component={ClubScreen} options={{ headerShown: false }}/>
            <Stack.Screen name="EventScreen" component={EventScreen} options={{ headerShown: false }}/>
            <Stack.Screen name="NewEvent" component={NewEvent} options={{ headerShown: false }}/>
            <Stack.Screen name="Chat" component={Chat} options={{ headerShown: false }}/>
            <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }}/>
            <Stack.Screen name="NewClub" component={NewClub} options={{ headerShown: false }}/>
            <Stack.Screen name="Profile" component={Profile} options={{ headerShown: false }}/>
            <Stack.Screen name="EditProfile" component={EditProfile} options={{ headerShown: false }}/>
            <Stack.Screen name="UserList" component={UserList} options={{ headerShown: false }}/>
            <Stack.Screen name="ImageViewerScreen" component={ImageViewerScreen} options={{ headerShown: false }}/>
            <Stack.Screen name="MessageSearchScreen" component={MessageSearchScreen} options={{ headerShown: false }}/>
            <Stack.Screen name="InClubView" component={InClubView} options={{ headerShown: false }}/>
            <Stack.Screen name="PinnedMessagesScreen" component={PinnedMessagesScreen} options={{ headerShown: false }}/>
            <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ headerShown: false }}/>
            <Stack.Screen name="VerifyEmail" component={VerifyEmail} options={{ headerShown: false }}/>
            <Stack.Screen name="ImageGalleryScreen" component={ImageGalleryScreen} options={{ headerShown: false }}/>
            <Stack.Screen name="AdminChat" component={AdminChat} options={{ headerShown: false }}/>
          </Stack.Navigator>
        </NavigationContainer>
      );
  }
};