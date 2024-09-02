import { getAuth } from "firebase/auth";
// storage
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
// macros
import { SCHOOLS } from "../macros/macros";
// toast
import Toast from "react-native-toast-message";

const emailSplit = async () => {
  // try async storage first
  try {
    const value = await AsyncStorage.getItem("schoolKey");
    if (value !== null) {
      return value;
    }
  } catch (error) {
    console.error("Error getting school key from async:", error);
  }

  // if not there, get from auth
  const auth = getAuth();
  const user = auth.currentUser;
  const schoolKey = user.email.split("@")[1].split(".")[0];

  // save to async storage
  await AsyncStorage.setItem("schoolKey", schoolKey);

  return schoolKey;
};

const getSetSchoolData = async (setter) => {
  const schoolKey = await emailSplit();
  // return school data from macros
  await setter(SCHOOLS[schoolKey]);
};

// save dark mode setting
const setDarkMode = async (darkMode) => {
  await AsyncStorage.setItem("darkMode", darkMode);
};

// get dark mode setting
const getDarkMode = async () => {
  const darkMode = await AsyncStorage.getItem("darkMode");
  return darkMode === "true";
};

const showToastIfNewUser = async (type, text1, text2) => {
  const user = await SecureStore.getItemAsync("user");
  const userData = JSON.parse(user);
  if (!userData.clubs || userData.clubs.length === 0) {
    Toast.show({
      text1: text1,
      text2: text2,
      type: type,
    });
  }
};

export {
  emailSplit,
  getSetSchoolData,
  setDarkMode,
  getDarkMode,
  showToastIfNewUser,
};
