<<<<<<< HEAD
import React from 'react';
// react native components
import { View } from 'react-native';
// react navigation components
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// icons
import Ionicons from 'react-native-vector-icons/Ionicons';
// my components
import Profile from './profile/Profile';
import ClubList from './club/ClubList';
import CalendarScreen from './calendar/CalendarScreen';
import MyClubs from './club/MyClubs';
// styles
import { Colors } from '../styles/Colors';

const Tab = createBottomTabNavigator();
function HomeScreen({navigation}) { 

  function HomeScreen() {
    return (
      <View style={{ flex: 1,  justifyContent: 'center' }}>
        <MyClubs navigation={navigation} />
      </View>
    );
  }

  function Search() {
    return (
      <View style={{ flex: 1, alignItems: 'center'}}>
        <ClubList navigation={navigation} />
      </View>
    );
  }

  function Calendar() {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <CalendarScreen navigation={navigation} />
      </View>
    );
  }

  function ProfileTab() {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Profile navigation={navigation} />
      </View>
    );
  }

  return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarShowLabel: false,
          tabBarActiveTintColor: 'black',
          tabBarInactiveTintColor: 'black',
          tabBarLabelStyle: {
            fontSize: 9,
            fontWeight: 'bold',
          },
          tabBarStyle: {
            backgroundColor: Colors.white,
          },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
    
            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Search') {
              iconName = focused ? 'search' : 'search-outline';
            } else if (route.name === 'Calendar') {
              iconName = focused ? 'calendar' : 'calendar-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            }
    
            return <Ionicons name={iconName} size={28} color={color} />;
          },
          tabBarIconStyle: {
            marginTop: 10,
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Tab.Screen name="Search" component={Search} options={{ headerShown: false }} />
        <Tab.Screen name="Calendar" component={Calendar} options={{ headerShown: false }} />
        <Tab.Screen name="Profile" component={ProfileTab} options={{ headerShown: false }} />
      </Tab.Navigator>
    );
  }

=======
import React from 'react';
// react native components
import { View } from 'react-native';
// react navigation components
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// icons
import Ionicons from 'react-native-vector-icons/Ionicons';
// my components
import Profile from './profile/Profile';
import ClubList from './club/ClubList';
import CalendarScreen from './calendar/CalendarScreen';
import MyClubs from './club/MyClubs';

const Tab = createBottomTabNavigator();
function HomeScreen({navigation}) { 

  function HomeScreen() {
    return (
      <View style={{ flex: 1,  justifyContent: 'center' }}>
        <MyClubs navigation={navigation} />
      </View>
    );
  }

  function Search() {
    return (
      <View style={{ flex: 1, alignItems: 'center'}}>
        <ClubList navigation={navigation} />
      </View>
    );
  }

  function Calendar() {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <CalendarScreen navigation={navigation} />
      </View>
    );
  }

  function ProfileTab() {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Profile navigation={navigation} />
      </View>
    );
  }

  return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarActiveTintColor: 'black',
          tabBarInactiveTintColor: 'black',
          tabBarLabelStyle: {
            fontSize: 9,
            fontWeight: 'bold',
            
          },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
    
            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Search') {
              iconName = focused ? 'search' : 'search-outline';
            } else if (route.name === 'Calendar') {
              iconName = focused ? 'calendar' : 'calendar-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            }
    
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Tab.Screen name="Search" component={Search} options={{ headerShown: false }} />
        <Tab.Screen name="Calendar" component={Calendar} options={{ headerShown: false }} />
        <Tab.Screen name="Profile" component={ProfileTab} options={{ headerShown: false }} />
      </Tab.Navigator>
    );
  }

>>>>>>> dfe4a17ddd108df15325f902cdfdaa4361e7c37e
export default HomeScreen;