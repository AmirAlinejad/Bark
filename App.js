import { StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import SignUp from "./screens/SignUp";
import SignIn from "./screens/SignIn";
import Home from './screens/Home';
import NewClub from './screens/club/NewClub';
import ClubList from './screens/club/ClubList';
import ClubScreen  from './screens/club/ClubScreen';
import NewEvent from './screens/event/NewEvent'; 
import EventScreen from './screens/event/EventScreen';
import { NativeStackView, createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect, useMemo, useRef, useState } from "react";
 
const Stack = createNativeStackNavigator();

export default class App extends React.Component {
  render() {
      return (
        <NavigationContainer >
          <Stack.Navigator initialRouteName='ClubList'>
            <Stack.Screen name="ClubList" component={ClubList} options={{ headerShown: false }} />
            <Stack.Screen name="ClubScreen" component={ClubScreen} options={{ headerShown: false }} />
            <Stack.Screen name="NewClub" component={NewClub} options={{ headerShown: false }} />
            <Stack.Screen name="EventScreen" component={EventScreen} options={{ headerShown: false }} /> 
            <Stack.Screen name="NewEvent" component={NewEvent} options={{ headerShown: false }} />

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