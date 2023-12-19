import { StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import SignUp from "./screens/SignUp";
import SignIn from "./screens/SignIn";
import HomeScreen from './screens/HomeScreen';
import NewClub from './screens/NewClub';
import ClubList from './screens/ClubList';
import ClubScreen  from './screens/ClubScreen';
import { NativeStackView, createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect, useMemo, useRef, useState } from "react";
import Club from './screens/Club';
import Chat from './screens/Chat';
const Stack = createNativeStackNavigator();

export default class App extends React.Component {
  render() {
      return (
        <NavigationContainer >
          <Stack.Navigator initialRouteName='SignIn'>
            <Stack.Screen name="SignIn" component={SignIn} options={{ headerShown: false }} />
            <Stack.Screen name="SignUp" component={SignUp} options={{ headerShown: false }} />
            <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }}/>
            <Stack.Screen name="ClubList" component={ClubList} options={{ headerShown: false }} />
            <Stack.Screen name="Club" component={Club} options={{ headerShown: false }} />
            <Stack.Screen name="ClubScreen" component={ClubScreen} options={{ headerShown: false }} />
            <Stack.Screen name="NewClub" component={NewClub} options={{ headerShown: false }} />
            <Stack.Screen name="Chat" component={Chat} options={{ headerShown: false }} />
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
