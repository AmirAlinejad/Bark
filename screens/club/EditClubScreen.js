import React, { useState } from "react";
// react native components
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
// my components
import CustomText from "../../components/display/CustomText";
import CustomInput from "../../components/input/CustomInput";
import CustomButton from "../../components/buttons/CustomButton";
import Header from "../../components/display/Header";
import ClubImg from "../../components/club/ClubImg";
import PrivacySwitch from "../../components/input/PrivacySwitch";
import Form from "../Form";
// functions
import { emailSplit } from "../../functions/backendFunctions";
// image picking
import { handleImageUploadAndSend } from "../../functions/backendFunctions";
// backend
import { ref, update } from "firebase/database";
import { db, firestore } from "../../backend/FirebaseConfig";
import { updateDoc, doc } from "firebase/firestore";
// colors
import { useTheme } from "@react-navigation/native";
// keyboard avoiding view
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scrollview";

const EditClubScreen = ({ route, navigation }) => {
  // get user data from previous screen
  const { name, id, img, description, categories, publicClub } = route.params;

  console.log(route.params);

  // state variables
  const [form, setForm] = useState({ 
    clubName: name, 
    clubDescription: description
  });
  const [clubImg, setClubImg] = useState(img);
  const [loading, setLoading] = useState(false);

  const { colors } = useTheme();

  const formPropertiesAndTypes = [
    {
      propName: "clubName",
      type: "text",
      title: "Club Name",
      placeholder: "Club Name",
    },
    {
      propName: "clubDescription",
      type: "text",
      title: "Club Description",
      placeholder: "Club Description",
    },
  ];

  // edit club
  const onEditClubSubmitted = async (e) => {
    setLoading(true);
    // prevent default form submission if there is an error
    e.preventDefault();

    // make sure all fields are filled out
    if (!form.clubName || !form.clubDescription) {
      alert("Please fill out all fields.");
      setLoading(false);
      return;
    }

    // try to submit the edit profile request
    try {
      const schoolKey = await emailSplit();

      const newClubData = {
        clubName: form.clubName,
        clubDescription: form.clubDescription,
        // publicClub: form.publicClubState,
      };
      if (clubImg) newClubData.clubImg = clubImg;

      // update clubData
      await updateDoc(
        doc(firestore, "schools", schoolKey, "clubData", id),
        newClubData
      );

      // update clubSearch data for each category
      for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        const categoryDoc = doc(
          firestore,
          "schools",
          schoolKey,
          "clubSearchData",
          category,
          "clubs",
          id
        );
       
        await updateDoc(categoryDoc, newClubData);
      }

      navigation.navigate("ClubScreen", {
        clubId: id,
      });
    } catch (error) {
      console.log(error);
      alert("Edit Club failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.elementsContainer}
        extraHeight={200}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={styles.clubImg}>
          <TouchableOpacity
            onPress={() => handleImageUploadAndSend("club", setClubImg)}
          >
            <ClubImg clubImg={clubImg} width={170} editable />
          </TouchableOpacity>
        </View>

        <View style={styles.clubContainer}>
          <Form formPropertiesAndTypes={formPropertiesAndTypes} form={form} setForm={setForm} />
        </View>

        <View style={styles.buttonContainer}>
          <CustomButton text="Save Changes" onPress={onEditClubSubmitted} />
        </View>
        {loading && <ActivityIndicator size="large" color={colors.gray} />}
      </KeyboardAwareScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
  },
  clubImg: {
    marginTop: 20,
    alignItems: "center",
  },
  clubContainer: {
    justifyContent: "flex-start",
    marginTop: 20,
    marginLeft: 20,
    gap: 0,
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 20,
    height: 100,
    width: "90%",
    padding: 15,
    marginBottom: 10,
  },
  buttonContainer: {
    marginLeft: 20,
    width: 135,
  },
  text: {
    fontSize: 20,
    marginLeft: 5,
  },
});
export default EditClubScreen;
