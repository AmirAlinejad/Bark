import { StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import SignUp from "./screens/SignUp";
import SignIn from "./screens/SignIn";
import CalendarScreen from './screens/Calendar/CalendarScreen';
import NewClub from './screens/NewClub';
import EventScreen from './screens/event/EventScreen';
import NewEvent from './screens/event/NewEvent';
import Chat from './screens/Chat';
import ClubList from './screens/club/ClubList';
import ClubScreen from './screens/club/ClubScreen';
import HomeScreen from './screens/HomeScreen';
import Profile from './screens/Profile';
import SignupPages from './screens/SignupPages';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect, useMemo, useRef, useState } from "react";
import MyClubs from './screens/club/MyClubs';

const Stack = createNativeStackNavigator();

export default class App extends React.Component {
  render() {
      return (
        <NavigationContainer >
          <Stack.Navigator initialRouteName='SignIn'>
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
            <Stack.Screen name="SignupPages" component={SignupPages} options={{ headerShown: false }}/>
          </Stack.Navigator>
          
        </NavigationContainer>
      );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});