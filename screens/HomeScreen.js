import React from "react";
// react native components
import { View, StyleSheet } from "react-native";
// react navigation components
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// icons
import Ionicons from "react-native-vector-icons/Ionicons";
// my components
import Profile from "./profile/Profile";
import ClubList from "./club/ClubList";
import CalendarScreen from "./calendar/CalendarScreen";
import MyClubs from "./club/MyClubs";
// styles
import { useTheme } from "@react-navigation/native";

const Tab = createBottomTabNavigator();
function HomeScreen({ route }) {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textLight,
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: "bold",
        },
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 0,
          shadowColor: "black",
          shadowOpacity: 0.1,
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Search") {
            iconName = focused ? "search" : "search-outline";
          } else if (route.name === "Calendar") {
            iconName = focused ? "calendar" : "calendar-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={28} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={MyClubs}
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Tab.Screen
        name="Search"
        component={ClubList}
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{ headerShown: false, gestureEnabled: false }}
      />
    </Tab.Navigator>
  );
}

export default HomeScreen;
