import { auth } from "../backend/FirebaseConfig";
import { getDoc, doc, deleteDoc } from "firebase/firestore";
import { AsyncStorage } from "react-native";
import { firestore } from "../backend/FirebaseConfig";
import * as SecureStore from "expo-secure-store";
import { deleteUser } from "firebase/auth";
import { Alert } from "react-native";
import { emailSplit } from "./backendFunctions";
import { leaveClubConfirmed } from "./clubFunctions";

const getSetUserData = async (setter) => {
  // get data from async storage
  try {
    const userData = await SecureStore.getItemAsync("user");
    if (userData) {
      setter(JSON.parse(userData));
    } else {
      if (!auth.currentUser) {
        Alert.alert("Error getting user auth:", "User not found");
        return;
      }

      const user = auth.currentUser;
      const schoolKey = await emailSplit();
      const userDocRef = doc(
        firestore,
        "schools",
        schoolKey,
        "userData",
        user.uid
      );
      const userDocSnapshot = await getDoc(userDocRef);

      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();
        setter(userData);
        // save to async storage
        await SecureStore.setItemAsync("user", JSON.stringify(userData));
      }
    }
  } catch (error) {
    console.error("Error getting user data:", error);
  }
};

const getUserData = async () => {
  try {
    const userData = await SecureStore.getItemAsync("user");
    if (userData) {
      return JSON.parse(userData);
    } else {
      if (!auth.currentUser) {
        Alert.alert("Error getting user auth:", "User not found");
        return;
      }

      const user = auth.currentUser;
      const schoolKey = await emailSplit();
      const userDocRef = doc(
        firestore,
        "schools",
        schoolKey,
        "userData",
        user.uid
      );
      const userDocSnapshot = await getDoc(userDocRef);

      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();
        // save to async storage
        await SecureStore.setItemAsync("user", JSON.stringify(userData));
        return userData;
      }
    }
  } catch (error) {
    console.error("Error getting user data:", error);
  }
};

const getProfileData = async (userId) => {
  const schoolKey = await emailSplit();
  try {
    const userDocRef = doc(firestore, "schools", schoolKey, "userData", userId);
    const userDocSnapshot = await getDoc(userDocRef);

    if (!userDocSnapshot.exists()) {
      Alert.alert("Error getting user data:", "User data not found");
      return;
    }

    return userDocSnapshot.data();
  } catch (error) {
    console.error("Error getting user data:", error);
  }
};

const updateProfileData = async (userId, setter) => {
  try {
    let schoolKey = await emailSplit();

    const userDocRef = doc(firestore, "schools", schoolKey, "userData", userId);
    const userDocSnapshot = await getDoc(userDocRef);

    if (!userDocSnapshot.exists()) {
      Alert.alert("Error updating user data:", "User data not found");
      return;
    }

    const userData = userDocSnapshot.data();

    // set user data
    setter(userData);
  } catch (error) {
    console.error("Error updating user data:", error);
  }
};

const deleteAccount = async () => {
  // get user id from async storage
  const userData = await SecureStore.getItemAsync("user");
  const user = JSON.parse(userData);
  const id = user.id;

  // get user's clubs from firestore
  const schoolKey = await emailSplit();
  const userDocRef = doc(firestore, "schools", schoolKey, "userData", id);
  const userDocSnapshot = await getDoc(userDocRef);
  const userFirestoreData = userDocSnapshot.data();

  if (!userFirestoreData) {
    Alert.alert("Error deleting account:", "User data not found");
    return;
  }

  const clubArray = userFirestoreData.clubs;

  console.log("Deleting account...");
  console.log("User clubs:", clubArray);

  // remove user from all clubs
  if (clubArray) {
    clubArray.forEach((club) => {
      leaveClubConfirmed(club);
    });
  }

  // remove user from database
  await deleteDoc(userDocRef);

  // delete user from auth
  const authUser = auth.currentUser;
  deleteUser(authUser)
    .then(() => {})
    .catch((error) => {
      Alert.alert("Error deleting user:", error);
    });

  // clear user data from async storage
  AsyncStorage.clear();
  SecureStore.deleteItemAsync("user");

  Alert.alert("Account Deleted", "Your account has been deleted");
};

export {
  getSetUserData,
  getUserData,
  getProfileData,
  updateProfileData,
  deleteAccount,
};
