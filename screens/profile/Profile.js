import React, { useState } from "react";
// react native components
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
// my components
import CustomText from "../../components/display/CustomText";
import ProfileImg from "../../components/display/ProfileImg";
import IconButton from "../../components/buttons/IconButton";
// functions
import { deleteAccount } from "../../functions/profileFunctions";
import { getSetUserData } from "../../functions/profileFunctions";
// firebase
import { getAuth, signOut } from "firebase/auth";
// colors
import { useTheme } from "@react-navigation/native";
// stack
import { createStackNavigator } from "@react-navigation/stack";
import SettingsSection from "../../components/display/SettingsSection";

const Stack = createStackNavigator();

const Profile = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const { colors } = useTheme();

  // data for settings flatlist
  const settingsData = [
    {
      data: [
        {
          id: "1",
          icon: "create-outline",
          text: "Edit Profile",
          onPress: () => {
            navigation.navigate("Edit Profile", {
              userData: userData,
              navigation: navigation,
            });
          },
        },
        {
          id: "2",
          icon: "settings-outline",
          text: "App Settings",
          onPress: () => {
            navigation.navigate("Settings");
          },
        },
        {
          id: "5",
          icon: "chatbubble-outline",
          text: "Contact Us",
          onPress: () => {
            navigation.navigate("Feedback", {
              userData: userData,
              navigation: navigation,
            });
          },
        },
      ],
    },
  ];

  const asyncFunc = async () => {
    setLoading(true);
    await getSetUserData(setUserData);

    setLoading(false);
  };

  // get data from firebase
  useFocusEffect(
    React.useCallback(() => {
      asyncFunc();
    }, [])
  );

  // navigate to edit profile screen
  const goToEditProfile = () => {
    console.log(userData);
    navigation.navigate("Edit Profile", {
      userData: userData,
      navigation: navigation,
    });
  };

  // delete account
  const deleteAccountFunc = () => {
    deleteAccount();
    setDeleteAccountModal(false);
    navigation.navigate("SignIn");
  };

  // log out
  const logOut = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        navigation.navigate("SignIn");
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  };

  const gradYear = userData?.graduationYear
    ? userData.graduationYear
    : "Add Year";
  const major = userData?.major ? userData.major : "📚Add Major";

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Profile"
        options={{
          headerShown: false,
        }}
      >
        {() => (
          <View style={{ flex: 1, backgroundColor: colors.background }}>
            <ScrollView contentContainerStyle={styles.container}>
              <View style={styles.profileContainer}>
                <TouchableOpacity onPress={goToEditProfile}>
                  <ProfileImg profileImg={userData?.profileImg} width={120} />
                </TouchableOpacity>

                <CustomText
                  style={[styles.name, { color: colors.text }]}
                  text={userData?.firstName + " " + userData?.lastName}
                  font="bold"
                />
                <CustomText
                  style={[styles.userName, { color: colors.textLight }]}
                  text={"@" + userData?.userName}
                />

                <View style={styles.detailsView}>
                  <TouchableOpacity onPress={goToEditProfile}>
                    <CustomText
                      text={"🎓" + gradYear}
                      style={[styles.detailsText, { color: colors.textLight }]}
                    />
                  </TouchableOpacity>
                  <View style={{ width: 25 }} />
                  <TouchableOpacity onPress={goToEditProfile}>
                    <CustomText
                      text={major}
                      style={[styles.detailsText, { color: colors.textLight }]}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <SettingsSection data={settingsData} loading={loading} />
            </ScrollView>

            <IconButton
              icon="settings-outline"
              style={styles.settings}
              onPress={() => navigation.navigate("Settings")}
              color={colors.button}
            />
          </View>
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  profileContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: "40%",
  },
  detailsView: {
    flexDirection: "row",
    marginTop: 0,
  },
  detailsText: {
    fontSize: 16,
  },
  buttonContainerView: {
    marginTop: 0,
    marginBottom: 0,
  },
  title: {
    fontSize: 25,
    marginVertical: 0,
  },
  name: {
    marginTop: 10,
    fontSize: 30,
  },
  userName: {
    marginTop: 0,
    fontSize: 20,
    marginBottom: 30,
  },
  settings: {
    position: "absolute",
    top: 50,
    right: 20,
  },

  // modal styles
  modalContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    margin: 20,
    borderRadius: 20,
  },
  modalText: {
    textAlign: "center",
    fontSize: 18,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 80,
    justifyContent: "space-between",
  },
});

export default Profile;
