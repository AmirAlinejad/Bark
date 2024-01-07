import React from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();

function Search() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Search</Text>
      {/* Add tab-specific content here */}
    </View>
  );
}

function HomeScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Home</Text>
      {
        
      }
    </View>
  );
}

function Calendar() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Calendar</Text>
      {/* Add tab-specific content here */}
    </View>
  );
}

function ProfileTab() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Profile Tab</Text>
      {}
    </View>
  );
}

function Chats() {
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
          <Tab.Screen name="Search" component={Search} options={{ headerShown: false }} />
          <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Tab.Screen name="Calendar" component={Calendar} options={{ headerShown: false }} />
          <Tab.Screen name="Profile" component={ProfileTab} options={{ headerShown: false }} />
        </Tab.Navigator>
      );
}

export default Chats;