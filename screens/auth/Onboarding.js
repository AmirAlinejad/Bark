// parent component for sign in/up screens
import React from 'react';
import { Text } from 'react-native';
// screens
import SignUp from "./SignUp";
import SignIn from "./SignIn";
import VerifyEmail from "./VerifyEmail";
import VerifySchool from "./VerifySchool";
import ForgotPassword from "./ForgotPassword";
// stack navigator
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { getExpoPushTokenAsync } from 'expo-notifications';

// stack navigator
const Stack = createNativeStackNavigator();

const Onboarding = ({route}) => {
  const { expoPushToken } = route.params;
  return (
      <Stack.Navigator initialRouteName={'SignIn'}>

        {/* auth */}
        <Stack.Screen name="SignIn" component={SignIn} options={{ headerShown: false, gestureEnabled: false}} />
        <Stack.Screen name="SignUp">
          {props => <SignUp {...props} expoPushToken={expoPushToken} />}
        </Stack.Screen>
        <Stack.Screen name="VerifyEmail" component={VerifyEmail} options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="VerifySchool" component={VerifySchool} options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ headerShown: false, gestureEnabled: false }} />

      </Stack.Navigator>
  );
}

export default Onboarding;