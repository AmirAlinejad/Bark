import { StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import SignUp from "./screens/SignUp";
import SignIn from "./screens/SignIn";
import Home from './screens/Home';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect, useMemo, useRef, useState } from "react";
 

const Stack = createNativeStackNavigator();

export default class App extends React.Component {
  render() {
      return (
        <NavigationContainer >
          <Stack.Navigator initialRouteName='SignIn'>
            <Stack.Screen name="SignIn" component={SignIn} options={{ headerShown: false }} />
            <Stack.Screen name="SignUp" component={SignUp} options={{ headerShown: false }} />
            <Stack.Screen name="Home" component={Home} options={{ headerShown: false }}/>
            
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