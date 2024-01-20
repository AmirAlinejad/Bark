import React from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Profile from './Profile';
import ClubList from './club/ClubList';
import CalendarScreen from './calendar/CalendarScreen';
import MyClubs from './club/MyClubs';

const Tab = createBottomTabNavigator();
function HomeScreen({navigation}) { 
  function Search() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        {<ClubList navigation={navigation} />}
      </View>
    );
  }

  function Calendar() {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <CalendarScreen navigation={navigation} />
        {}
      </View>
    );
  }

  function ProfileTab() {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Profile navigation={navigation} />
        {}
      </View>
    );
  }
  function HomeScreen() {
    return (
      <View style={{ flex: 1,  justifyContent: 'center' }}>
        {<MyClubs navigation={navigation} />}
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
      
              if (route.name === 'Search') {
                iconName = focused ? 'search' : 'search-outline';
              } else if (route.name === 'Home') {
                iconName = focused ? 'home' : 'home-outline';
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

export default HomeScreen;


