// parent component for main screens
import React from 'react';
import { Text } from 'react-native';
// screens
import HomeScreen from './HomeScreen';

import CalendarScreen from './calendar/CalendarScreen';
import ClubCalendar from './calendar/ClubCalendar';

import EventScreen from './event/EventScreen';
import EditEventScreen from "./event/EditEventScreen";
import NewEvent from './event/NewEvent';
import MapPicker from "./event/MapPicker";
import AttendanceScreen from './event/AttendanceScreen';
import AttendanceViewer from './event/AttendanceViewer';

import Chat from './chat/Chat';
import AdminChat from './chat/AdminChat';
import GifSelectionScreen from './chat/GifSelectionScreen';
import ImageGalleryScreen from './chat/ImageGalleryScreen';
import ImageViewerScreen from './chat/ImageViewerScreen';
import MessageSearchScreen from './chat/MessageSearchScreen';
import UserList from './chat/UserList';

import MyClubs from './club/MyClubs';
import ClubList from './club/ClubList';
import ClubCategoryScreen from './club/ClubCategoryScreen';
import NewClub from './club/NewClub';
import ClubScreen from './club/ClubScreen';
import InClubView from './club/InClubView';
import EditClubScreen from "./club/EditClubScreen";
import Requests from './club/Requests';

import Profile from './profile/Profile';
import EditProfile from './profile/EditProfile';
import FeedbackScreen from "./profile/FeedbackScreen";
import Settings from './profile/Settings';

import QRCodeScreen from './QRCodeScreen';
// stack navigator
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

// stack navigator
const Stack = createNativeStackNavigator();

const Main = () => {

  return (
      <Stack.Navigator initialRouteName={'HomeScreen'}>

        {/* main */}
        <Stack.Screen name="CalendarScreen" component={CalendarScreen} options={{ headerShown: false, gestureEnabled: false }}/>
        <Stack.Screen name="ClubCalendar" component={ClubCalendar} options={{ headerShown: false, gestureEnabled: false }}/>
        <Stack.Screen name="ClubList" component={ClubList} options={{ 
          headerTitle: 'Search', 
          headerLargeTitle: true, 
          headerShadowVisible: false,
          gestureEnabled: false 
          }}
        />
        <Stack.Screen name="MyClubs" component={MyClubs} options={{ headerShown: false, gestureEnabled: false }}/>
        <Stack.Screen name="ClubScreen" component={ClubScreen} options={{ headerShown: false, gestureEnabled: false }}/>
        <Stack.Screen name="ClubCategoryScreen" component={ClubCategoryScreen} options={{ headerShown: false, gestureEnabled: false }}/>
        <Stack.Screen name="Requests" component={Requests} options={{ headerShown: false, gestureEnabled: false }}/>
        <Stack.Screen name="EventScreen" component={EventScreen} options={{ headerShown: false, gestureEnabled: false }}/>
        <Stack.Screen name="AttendanceScreen" component={AttendanceScreen} options={{ headerShown: false, gestureEnabled: false }}/>
        <Stack.Screen name="AttendanceViewer" component={AttendanceViewer} options={{ headerShown: false, gestureEnabled: false }}/>
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
        <Stack.Screen name="QRCodeScreen" component={QRCodeScreen} options={{ headerShown: false, gestureEnabled: false }}/>
        <Stack.Screen name="Settings" component={Settings} options={{ headerShown: false, gestureEnabled: false }}/>
      </Stack.Navigator>
  );
}

export default Main;