import React, { useState, useEffect } from "react";
// react native components
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Switch,
  ScrollView,
} from "react-native";
// my components
import CustomText from "../../components/display/CustomText";
import ProfileImg from "../../components/display/ProfileImg";
import IconButton from "../../components/buttons/IconButton";
import Header from "../../components/display/Header";
import IconText from "../../components/display/IconText";
import CustomButton from "../../components/buttons/CustomButton";
// functions
import {
  getSetUserData,
  deleteAccount,
  signInToGoogleCalendar,
  signOutFromGoogleCalendar,
  checkGoogleCalendarSignIn,
  checkToggleGoogleCalendar,
  syncEventsToGoogleCalendar,
  toggleSyncGoogleCalendar,
  unsyncEventsFromGoogleCalendar,
  checkToggleSyncGoogleCalendar,
} from "../../functions/backendFunctions";
// firebase
import { getAuth, signOut } from "firebase/auth";
// modal
import Modal from "react-native-modal";
// colors
import { Colors } from "../../styles/Colors";
// stack
import { createStackNavigator } from "@react-navigation/stack";
import SettingsSection from "../../components/display/SettingsSection";

const Stack = createStackNavigator();

const Profile = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  // delete account overlay
  const [deleteAccountModal, setDeleteAccountModal] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);

  // toggle sync to google calendar
  const [syncGoogleCalendar, setSyncGoogleCalendar] = useState(false);

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
    <Stack.Navigator>
      <Stack.Screen
        name="Profile"
        options={{
          headerShown: false,
        }}
      >
        {() => (
          <View style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.container}>
              <View style={styles.profileContainer}>
                <TouchableOpacity onPress={goToEditProfile}>
                  <ProfileImg profileImg={userData?.profileImg} width={120} />
                </TouchableOpacity>

                <CustomText
                  style={styles.name}
                  text={userData?.firstName + " " + userData?.lastName}
                  font="bold"
                />
                <CustomText
                  style={styles.userName}
                  text={"@" + userData?.userName}
                />

                <View style={styles.detailsView}>
                  <TouchableOpacity onPress={goToEditProfile}>
                    <CustomText
                      text={"🎓" + gradYear}
                      style={styles.detailsText}
                    />
                  </TouchableOpacity>
                  <View style={{ width: 25 }} />
                  <TouchableOpacity onPress={goToEditProfile}>
                    <CustomText text={major} style={styles.detailsText} />
                  </TouchableOpacity>
                </View>
              </View>

              <SettingsSection data={settingsData} loading={loading} />
              
            </ScrollView>

            <IconButton
              icon="settings-outline"
              style={styles.settings}
              onPress={() => navigation.navigate("Settings")}
              color={Colors.buttonBlue}
            />

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
                  <CustomButton
                    text="Yes"
                    onPress={logOut}
                    color={Colors.red}
                  />
                  <CustomButton
                    text="No"
                    onPress={() => setLogoutModal(false)}
                    color={Colors.green}
                  />
                </View>
              </View>
            </Modal>
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
    marginTop: 88,
  },
  detailsView: {
    flexDirection: "row",
    marginTop: 0,
  },
  detailsText: {
    fontSize: 16,
    color: Colors.darkGray,
  },
  settingsContent: {
    justifyContent: "flex-start",
    justifySelf: "flex-end",
    paddingTop: 20,
    paddingBottom: 10,
    paddingLeft: 20,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  buttonContainerView: {
    marginTop: 0,
    marginBottom: 0,
  },
  separator: {
    backgroundColor: Colors.lightGray,
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
    top: 30,
    right: 20,
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

export default Profile;
