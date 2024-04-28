import React, { useState, useEffect } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { AppState, Platform } from 'react-native';
// screens
import SignUp from "./screens/auth/SignUp";
import SignIn from "./screens/auth/SignIn";
import VerifyEmail from "./screens/auth/VerifyEmail";
import VerifySchool from "./screens/auth/VerifySchool";
import ForgotPassword from "./screens/auth/ForgotPassword";

import HomeScreen from './screens/HomeScreen';

import CalendarScreen from './screens/calendar/CalendarScreen';
import ClubCalendar from './screens/calendar/ClubCalendar';

import EventScreen from './screens/event/EventScreen';
import EditEventScreen from "./screens/event/EditEventScreen";
import NewEvent from './screens/event/NewEvent';
import MapPicker from "./screens/event/MapPicker";

import Chat from './screens/chat/Chat';
import AdminChat from './screens/chat/AdminChat';
import GifSelectionScreen from './screens/chat/GifSelectionScreen';
import ImageGalleryScreen from './screens/chat/ImageGalleryScreen';
import ImageViewerScreen from './screens/chat/ImageViewerScreen';
import MessageSearchScreen from './screens/chat/MessageSearchScreen';
import UserList from './screens/chat/UserList';

import MyClubs from './screens/club/MyClubs';
import ClubList from './screens/club/ClubList';
import ClubCategoryScreen from './screens/club/ClubCategoryScreen';
import NewClub from './screens/club/NewClub';
import ClubScreen from './screens/club/ClubScreen';
import InClubView from './screens/club/InClubView';
import EditClubScreen from "./screens/club/EditClubScreen";
import Requests from './screens/club/Requests';

import Profile from './screens/profile/Profile';
import EditProfile from './screens/profile/EditProfile';
import FeedbackScreen from "./screens/profile/FeedbackScreen";
// stack navigator
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
// firebase
import { getAuth } from 'firebase/auth';
import app from './backend/FirebaseConfig';

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await
    Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }

    token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig.extra.eas.projectId,
    });
    console.log(token);
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token?.data;
}

const Stack = createNativeStackNavigator();

export default App = () => {
  // notifications
  const [expoPushToken, setExpoPushToken] = useState('');
  const [appState, setAppState] = useState(AppState.currentState);

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true, 
      shouldPlaySound: false,
      shouldSetBadge: true,
    }),
  });

  // start screen
  const [startScreen, setStartScreen] = useState('SignIn');

  useEffect(() => {
      // check if user is already signed in
      const auth = getAuth();
      auth.onAuthStateChanged((user) => {
        if (user) {
          setStartScreen('HomeScreen');
        }
      });

      // notifications
      registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

      const handleAppStateChange = nextAppState => {
        setAppState(nextAppState);
        console.log('App state changed:', nextAppState);
      };

      const subscription = AppState.addEventListener('change', handleAppStateChange);

      return () => {
        subscription.remove();
      };

  }, []);

  return (
    <NavigationContainer >
      <Stack.Navigator initialRouteName={startScreen}>
        <Stack.Screen name="SignIn" component={SignIn} options={{ headerShown: false, gestureEnabled: false}} />
        <Stack.Screen name="SignUp" component={SignUp} options={{ headerShown: false, gestureEnabled: false }} initialParams={{expoPushToken}}/>
        <Stack.Screen name="VerifyEmail" component={VerifyEmail} options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="VerifySchool" component={VerifySchool} options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="CalendarScreen" component={CalendarScreen} options={{ headerShown: false, gestureEnabled: false }}/>
        <Stack.Screen name="ClubCalendar" component={ClubCalendar} options={{ headerShown: false, gestureEnabled: false }}/>
        <Stack.Screen name="ClubList" component={ClubList} options={{ headerShown: false, gestureEnabled: false }}/>
        <Stack.Screen name="MyClubs" component={MyClubs} options={{ headerShown: false, gestureEnabled: false }}/>
        <Stack.Screen name="ClubScreen" component={ClubScreen} options={{ headerShown: false, gestureEnabled: false }}/>
        <Stack.Screen name="ClubCategoryScreen" component={ClubCategoryScreen} options={{ headerShown: false, gestureEnabled: false }}/>
        <Stack.Screen name="Requests" component={Requests} options={{ headerShown: false, gestureEnabled: false }}/>
        <Stack.Screen name="EventScreen" component={EventScreen} options={{ headerShown: false, gestureEnabled: false }}/>
        <Stack.Screen name="NewEvent" component={NewEvent} options={{ headerShown: false, gestureEnabled: false }}/>
        <Stack.Screen name="MapPicker" component={MapPicker} options={{ headerShown: false, gestureEnabled: false }}/>
        <Stack.Screen name="Chat" component={Chat} options={{ headerShown: false, gestureEnabled: false }}/>
        <Stack.Screen name="AdminChat" component={AdminChat} options={{ headerShown: false, gestureEnabled: false }}/>
        <Stack.Screen name="GifSelectionScreen" component={GifSelectionScreen} options={{ headerShown: false, gestureEnabled: false }}/>
        <Stack.Screen name="ImageGalleryScreen" component={ImageGalleryScreen} options={{ headerShown: false, gestureEnabled: false }}/>
        <Stack.Screen name="ImageViewerScreen" component={ImageViewerScreen} options={{ headerShown: false, gestureEnabled: false }}/>
        <Stack.Screen name="InClubView" component={InClubView} options={{ headerShown: false, gestureEnabled: false }}/>
        <Stack.Screen name="MessageSearchScreen" component={MessageSearchScreen} options={{ headerShown: false, gestureEnabled: false }}/>
        <Stack.Screen name="UserList" component={UserList} options={{ headerShown: false, gestureEnabled: false }}/>
        <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false, gestureEnabled: false }}/>
        <Stack.Screen name="NewClub" component={NewClub} options={{ headerShown: false, gestureEnabled: false }}/>
        <Stack.Screen name="Profile" component={Profile} options={{ headerShown: false, gestureEnabled: false }}/>
        <Stack.Screen name="EditProfile" component={EditProfile} options={{ headerShown: false, gestureEnabled: false }}/>
        <Stack.Screen name="EditClub" component={EditClubScreen} options={{ headerShown: false, gestureEnabled: false }}/>
        <Stack.Screen name="EditEvent" component={EditEventScreen} options={{ headerShown: false, gestureEnabled: false }}/>
        <Stack.Screen name="Feedback" component={FeedbackScreen} options={{ headerShown: false, gestureEnabled: false }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
