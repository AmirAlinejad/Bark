import React, { useState, useEffect } from 'react';
import { Text } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { AppState, Platform } from 'react-native';
// screen segments
import SplashScreen from './screens/auth/SplashScreen';
import Onboarding from './screens/auth/Onboarding';
import Main from './screens/Main';
// navigation
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
// linking
import * as Linking from 'expo-linking';

// linking
const prefix = Linking.createURL('/');

// notifications
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

// stack navigator
const Stack = createNativeStackNavigator();

export default App = () => {

  // notifications
  const [expoPushToken, setExpoPushToken] = useState('');
  const [appState, setAppState] = useState(AppState.currentState);

  // linking
  const linking = {
    prefixes: [prefix],
  };

  // notifications
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true, 
      shouldPlaySound: false,
      shouldSetBadge: true,
    }),
  });

  useEffect(() => {
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
    <NavigationContainer linking={linking} fallback={<Text>Loading...</Text>}>
      <Stack.Navigator initialRouteName={'SignIn'}>
        {/* splash */}
        <Stack.Screen name="SplashScreen" component={SplashScreen} options={{ headerShown: false, gestureEnabled: false }}/>

        {/* auth */}
        <Stack.Screen name="Onboarding" component={Onboarding} options={{ headerShown: false, gestureEnabled: false }} initialParams={{expoPushToken}}/>

        {/* main */}
        <Stack.Screen name="Main" component={Main} options={{ headerShown: false, gestureEnabled: false }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
