import React from 'react';
// react native components
import { View, StyleSheet } from 'react-native';
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
      <View style={styles.screenStyle}>
        <MyClubs navigation={navigation} />
      </View>
    );
  }

  function Search() {
    return (
      <View style={styles.screenStyle}>
        <ClubList navigation={navigation} />
      </View>
    );
  }

  function Calendar() {
    return (
      <View style={styles.screenStyle}>
        <CalendarScreen navigation={navigation} />
      </View>
    );
  }

  function ProfileTab() {
    return (
      <View style={styles.screenStyle}>
        <Profile navigation={navigation} />
      </View>
    );
  }

  return (
    
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarShowLabel: false,
        tabBarActiveTintColor: Colors.black,
        tabBarInactiveTintColor: Colors.black,
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: 'bold',
        },
        tabBarStyle: {
          backgroundColor: Colors.white,
        },
        tabBarIcon: ({ focused, color }) => {
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

const styles = StyleSheet.create({
  screenStyle: {
    flex: 1,
    justifyContent: 'center',
  },
});
  

export default HomeScreen;