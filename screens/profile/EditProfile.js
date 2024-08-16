import React, { useState } from "react";
// react native components
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
// storage
import AsyncStorage from "@react-native-async-storage/async-storage";
// keyboard avoiding view
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
// my components
import CustomText from "../../components/display/CustomText";
import CustomButton from "../../components/buttons/CustomButton";
import ProfileImg from "../../components/display/ProfileImg";
import Form from "../Form";
// backend functions
import {
  emailSplit,
  handleImageUploadAndSend,
} from "../../functions/backendFunctions";
// colors
import { useTheme } from "@react-navigation/native";
// macros
import { MAJORS } from "../../macros/macros";
// backend
import { doc, setDoc } from "firebase/firestore";
import { firestore } from "../../backend/FirebaseConfig";

const EditProfile = ({ route, navigation }) => {
  // get user data from previous screen
  const { userData } = route.params;

  // state variables
  const [form, setForm] = useState({
    firstName: userData.firstName,
    lastName: userData.lastName,
    phone: userData.phone,
    graduationYear: userData.graduationYear,
    major: userData.major,
  });
  const [profileImg, setProfileImg] = useState(userData.profileImg);
  const [loading, setLoading] = useState(false);

  const { colors } = useTheme();

  // sort majors by alphabetical order by first character
  MAJORS.sort((a, b) => a.value.slice(2).localeCompare(b.value.slice(2)));

  const formPropertiesAndTypes = [
    {
      propName: "firstName",
      type: "text",
      title: "First Name",
      placeholder: "First Name",
    },
    {
      propName: "lastName",
      type: "text",
      title: "Last Name",
      placeholder: "Last Name",
    },
    {
      propName: "phone",
      type: "phone",
      title: "Phone Number",
      placeholder: "Phone Number",
    },
    {
      propName: "graduationYear",
      type: "year",
      title: "Graduation Year",
      placeholder: "Graduation Year",
    },
    {
      propName: "major",
      type: "select",
      title: "Major",
      options: MAJORS,
    },
  ];

  // edit profile
  const onEditProfileSubmitted = async (e) => {
    setLoading(true);
    e.preventDefault();

    // check if any fields are empty
    if (!form.firstName || !form.lastName) {
      alert("Please fill out all required fields");
      setLoading(false);
      return;
    }

    // check grad year
    if (!form.graduationYear == "" && form.graduationYear.length !== 4) {
      alert("Graduation year must be a 4-digit number");
      setLoading(false);
      return;
    }
    if (!form.graduationYear == "" && parseInt(form.graduationYear) < 2022) {
      alert("Graduation year must be 2022 or later");
      setLoading(false);
      return;
    }
    if (!form.graduationYear == "" && parseInt(form.graduationYear) > 2030) {
      alert("Graduation year must be 2030 or earlier");
      setLoading(false);
      return;
    }

    // check phone number
    let phoneNum = null;
    if (form.phone) {
      phoneNum = form.phone
        .replace("-", "")
        .replace("(", "")
        .replace(")", "")
        .replace(" ", "");
    }
    if (form.phone && phoneNum) {
      if (phoneNum.length !== 10) {
        alert("Please enter a valid phone number");
        setLoading(false);
        return;
      }
    }

    // try to submit the edit profile request
    try {
      let updatedUserData = {
        userName: userData.userName,
        password: userData.password,
        firstName: form.firstName,
        lastName: form.lastName,
        id: userData.id,
        email: userData.email,
      };
      if (phoneNum) updatedUserData.phone = phoneNum;
      if (form.graduationYear)
        updatedUserData.graduationYear = form.graduationYear;
      if (form.major) updatedUserData.major = form.major;
      if (profileImg) updatedUserData.profileImg = profileImg;
      if (userData.expoPushToken)
        updatedUserData.expoPushToken = userData.expoPushToken;
      if (userData.clubs) updatedUserData.clubs = userData.clubs;

      // update firestore
      const schoolKey = await emailSplit();
      await setDoc(
        doc(firestore, "schools", schoolKey, "userData", userData.id),
        updatedUserData
      );

      // update async storage
      await AsyncStorage.setItem("user", JSON.stringify(updatedUserData));

      navigation.goBack();
    } catch (error) {
      console.log(error);
      alert("Edit Profile failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAwareScrollView
        extraHeight={200}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={{ alignItems: "center", margin: 20 }}>
          <TouchableOpacity
            onPress={() => handleImageUploadAndSend("profile", setProfileImg)}
          >
            <ProfileImg profileImg={profileImg} width={170} editable />
          </TouchableOpacity>
        </View>

        <View style={styles.profileContainer}>
          <Form
            formPropertiesAndTypes={formPropertiesAndTypes}
            form={form}
            setForm={setForm}
          />

          <CustomText
            style={[styles.smallText, { color: colors.textLight }]}
            text="* Indicates a required field"
          />

          {loading && <ActivityIndicator size="large" color={colors.gray} />}
          <CustomButton
            text="Save Changes"
            onPress={onEditProfileSubmitted}
            width={135}
          />
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
  },
  profileContainer: {
    justifyContent: "flex-start",
    marginTop: 20,
    marginLeft: 20,
  },
  namesView: {
    flexDirection: "row",
  },
  buttonContainer: {
    marginVertical: 20,
    marginLeft: 20,
  },
  textNormal: {
    fontSize: 20,
    marginLeft: 5,
  },

  // dropdown
  boxStyles: {
    width: 300,
    borderRadius: 20,

    height: 50,
  },
  dropdownStyles: {
    width: 300,
    borderRadius: 20,
  },
  inputStyles: {
    fontSize: 14,
    marginTop: 3,
  },
  dropdownTextStyles: {
    fontSize: 14,
  },
  smallText: {
    marginTop: 10,
    fontSize: 14,
  },
});

export default EditProfile;
