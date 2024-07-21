import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  Switch,
  Linking,
} from "react-native";
import Modal from "react-native-modal";
import { getAuth } from "firebase/auth";
import { signOut } from "firebase/auth";
import { Colors } from "../../styles/Colors";
import {
  getSetUserData,
  deleteAccount,
} from "../../functions/backendFunctions";
import {
  syncEventsToGoogleCalendar,
  unsyncEventsFromGoogleCalendar,
  checkToggleSyncGoogleCalendar,
  toggleSyncGoogleCalendar,
  signInToGoogleCalendar,
} from "../../functions/backendFunctions";
import Header from "../../components/display/Header";
import IconText from "../../components/display/IconText";
import IconButton from "../../components/buttons/IconButton";
import CustomText from "../../components/display/CustomText";
import CustomButton from "../../components/buttons/CustomButton";
import SettingsSection from "../../components/display/SettingsSection";
import { dateForObj } from "../../functions/timeFunctions";

const Settings = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(loading);
  // delete account overlay
  const [deleteAccountModal, setDeleteAccountModal] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);

  // toggle sync to google calendar
  const [syncGoogleCalendar, setSyncGoogleCalendar] = useState(false);

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
            navigation.navigate("EditProfile", {
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
        {
          id: "7",
          switch: true,
          icon: "calendar-outline",
          text: "Sync to Google Calendar",
          onPress: () => {
            if (syncGoogleCalendar) {
              unSyncFromGoogleCalendar();
              setSyncGoogleCalendar(false);
            } else {
              syncToGoogleCalendar();
              setSyncGoogleCalendar(true);
            }
          },
          value: syncGoogleCalendar,
        },
        {
          id: "8",
          switch: true,
          icon: "moon-outline",
          text: "Dark Mode",
          onPress: () => {
            console.log("dark mode");
          },
          value: null,
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
        {
          id: "6",
          icon: "information-circle-outline",
          text: "About Us",
          onPress: () => {
            navigation.navigate("AboutUs");
          },
        },
      ],
    },
    {
      title: ' ',
      data: [
        {
          id: "9",
          icon: "trash-outline",
          text: "Delete Account",
          onPress: () => {
            setDeleteAccountModal(true);
          },
          color: Colors.red,
        },
      ],
    },
  ];

  const syncToGoogleCalendar = async () => {
    // // see if user is logged in to google calendar
    // const isSignedIn = await checkGoogleCalendarSignIn();

    // // if not signed in, then sign in
    // if (!isSignedIn) {
    //   await signInToGoogleCalendar();
    // }
    signInToGoogleCalendar();

    // sync to google calendar
    syncEventsToGoogleCalendar();

    toggleSyncGoogleCalendar("true");
    setSyncGoogleCalendar(true);
  };

  // unsync
  const unSyncFromGoogleCalendar = async () => {
    // maybe eventually sign out from google calendar
    //await signOutFromGoogleCalendar();
    unsyncEventsFromGoogleCalendar();

    toggleSyncGoogleCalendar("false");
    setSyncGoogleCalendar(false);
  };

  useEffect(() => {
    const asyncFunc = async () => {
      setLoading(true);
      await getSetUserData(setUserData);

      // check if user is signed in to google calendar
      const isSignedIn = await checkToggleSyncGoogleCalendar();
      setSyncGoogleCalendar(isSignedIn);

      setLoading(false);
    };

    asyncFunc();
  }, []);

  // navigate to edit profile screen
  const goToEditProfile = () => {
    console.log(userData);
    navigation.navigate("EditProfile", {
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
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ backgroundColor: Colors.lightGray }}
        contentInsetAdjustmentBehavior="automatic"
      >
        <SettingsSection data={settingsData} />
      </ScrollView>

      <Modal isVisible={deleteAccountModal}>
        <View style={styles.modalContainer}>
          <CustomText
            style={styles.modalText}
            text="Are you sure you want to delete your account?"
          />
          <View style={styles.modalButtons}>
            <CustomButton
              text="Yes"
              onPress={deleteAccount}
              color={Colors.red}
            />
            <CustomButton
              text="No"
              onPress={() => setDeleteAccountModal(false)}
              color={Colors.green}
            />
          </View>
        </View>
      </Modal>

      <Modal isVisible={logoutModal}>
        <View style={styles.modalContainer}>
          <CustomText
            style={styles.modalText}
            text="Are you sure you want to log out of your account?"
          />
          <View style={styles.modalButtons}>
            <CustomButton text="Yes" onPress={logOut} color={Colors.red} />
            <CustomButton
              text="No"
              onPress={() => setLogoutModal(false)}
              color={Colors.buttonBlue}
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
    backgroundColor: Colors.lightGray,
    marginTop: 80,
  },
  setttingsContent: {
    justifyContent: "flex-start",
    flex: 4,
    marginTop: 20,
    paddingTop: 20,
    paddingLeft: 20,
    backgroundColor: Colors.white,

    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  settingsButton: {
    marginVertical: 10,
  },
  buttonContainerView: {
    flex: 1,
    marginTop: 0,
    marginBottom: 20,
  },
  separator: {
    backgroundColor: Colors.white,
    height: 1,
    marginRight: 20,
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
    color: Colors.darkGray,
    marginTop: 0,
    fontSize: 20,
    marginBottom: 30,
  },
  settings: {
    position: "absolute",
    top: 70,
    right: 30,
  },

  // modal styles
  modalContainer: {
    backgroundColor: Colors.white,
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
