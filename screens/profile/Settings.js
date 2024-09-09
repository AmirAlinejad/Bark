import React, { useState, useContext, useEffect } from "react";
import { View, StyleSheet, ScrollView, Linking } from "react-native";
import Modal from "react-native-modal";
import { getAuth } from "firebase/auth";
import { signOut } from "firebase/auth";
import { useTheme } from "@react-navigation/native";
import { deleteAccount } from "../../functions/profileFunctions";
import { getSetUserData } from "../../functions/profileFunctions";
import { setDarkMode } from "../../functions/backendFunctions";

import CustomText from "../../components/display/CustomText";
import CustomButton from "../../components/buttons/CustomButton";
import SettingsSection from "../../components/display/SettingsSection";
import { GlobalContext } from "../../App";
import * as SecureStore from "expo-secure-store";

const Settings = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(loading);
  // delete account overlay
  const [deleteAccountModal, setDeleteAccountModal] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);

  // toggle sync to  calendar
  const [syncCalendar, setSyncCalendar] = useState(false);

  const [state, setState] = useContext(GlobalContext);

  const switchTheme = () => {
    const newTheme = state.theme === "light" ? "dark" : "light";
    setDarkMode(newTheme === "dark" ? "true" : "false");
    setState({ ...state, theme: newTheme });
  };

  const { colors } = useTheme();

  // data for settings flatlist
  const settingsData = [
    {
      title: "Account",
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
          id: "4",
          icon: "log-out-outline",
          text: "Log Out",
          onPress: () => {
            setLogoutModal(true);
          },
        },
      ],
    },
    {
      title: "App Settings",
      data: [
        // {
        //   id: "7",
        //   icon: "calendar-outline",
        //   text: "Sync to Calendar",
        //   onPress: () => {
        //     syncEventsToCalendar();
        //     // toggleSyncCalendar("true");
        //     // setSyncCalendar(true);
        //   },
        //   value: syncCalendar,
        // },
        {
          id: "8",
          switch: true,
          icon: "moon-outline",
          text: "Dark Mode",
          onPress: () => {
            switchTheme();
          },
          value: state.theme === "dark",
        },
        {
          id: "3",
          icon: "phone-portrait-outline",
          text: "Phone Settings",
          onPress: () => {
            Linking.openSettings();
          },
        },
      ],
    },
    {
      title: "Support",
      data: [
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
    {
      title: " ",
      data: [
        {
          id: "9",
          icon: "trash-outline",
          text: "Delete Account",
          onPress: () => {
            setDeleteAccountModal(true);
          },
          color: colors.red,
        },
      ],
    },
  ];

  const asyncFunc = async () => {
    setLoading(true);
    await getSetUserData(setUserData);

    // check if user is signed in to calendar
    // const isSignedIn = await checkToggleSyncCalendar();
    // setSyncCalendar(isSignedIn);

    setLoading(false);
  };

  useEffect(() => {
    asyncFunc();
  }, []);

  // delete account
  const deleteAccountFunc = async () => {
    await deleteAccount();
    setDeleteAccountModal(false);
    navigation.navigate("Onboarding");
  };

  // log out
  const logOut = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        navigation.navigate("Onboarding");
        setLogoutModal(false);
        // set to light mode
        if (state.theme === "dark") {
          switchTheme();
        }

        // remove user data from async storage
        SecureStore.deleteItemAsync("user");
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
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentInsetAdjustmentBehavior="automatic"
      >
        <SettingsSection data={settingsData} />
      </ScrollView>

      <Modal isVisible={deleteAccountModal}>
        <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
          <CustomText
            style={[styles.modalText, { color: colors.text }]}
            text="Are you sure you want to delete your account?"
          />
          <View style={styles.modalButtons}>
            <CustomButton
              text="Yes"
              onPress={deleteAccountFunc}
              color={colors.red}
            />
            <CustomButton
              text="No"
              onPress={() => setDeleteAccountModal(false)}
            />
          </View>
        </View>
      </Modal>

      <Modal isVisible={logoutModal}>
        <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
          <CustomText
            style={[styles.modalText, { color: colors.text }]}
            text="Are you sure you want to log out of your account?"
          />
          <View style={styles.modalButtons}>
            <CustomButton text="Yes" onPress={logOut} color={colors.red} />
            <CustomButton
              text="No"
              onPress={() => setLogoutModal(false)}
              color={colors.button}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 80,
  },
  settingsButton: {
    marginVertical: 10,
  },
  buttonContainerView: {
    flex: 1,
    marginTop: 0,
    marginBottom: 20,
  },
  title: {
    fontSize: 25,
    marginVertical: 0,
  },
  name: {
    marginTop: 10,
    fontSize: 30,
  },
  settings: {
    position: "absolute",
    top: 70,
    right: 30,
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

export default Settings;
