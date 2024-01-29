import React from "react";
// screens
import SignUp from "./screens/auth/SignUp";
import SignIn from "./screens/auth/SignIn";
import InitialPage from "./screens/auth/InitialPage";
import CalendarScreen from './screens/calendar/CalendarScreen';
import NewClub from './screens/club/NewClub';
import EventScreen from './screens/event/EventScreen';
import NewEvent from './screens/event/NewEvent';
import Chat from './screens/Chat';
import ClubList from './screens/club/ClubList';
import ClubScreen from './screens/club/ClubScreen';
import HomeScreen from './screens/HomeScreen';
import Profile from './screens/profile/Profile';
import EditProfile from './screens/profile/EditProfile';
import MyClubs from './screens/club/MyClubs';
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
          </Stack.Navigator>
        </NavigationContainer>
      );
  }
};