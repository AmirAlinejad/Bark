import React, { useState, useLayoutEffect } from "react";
// react native components
import { View, StyleSheet } from "react-native";
// firestore
import { setDoc, doc } from "firebase/firestore";
import { firestore } from "../../backend/FirebaseConfig";
// my components
import IconOverlay from "../../components/overlays/IconOverlay";
import Form from "../Form";
// functions
import { emailSplit, joinClub } from "../../functions/backendFunctions";
// macros
import { CLUBCATEGORIES } from "../../macros/macros";
// scroll view
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
// colors
import { useTheme } from "@react-navigation/native";
import CustomButton from "../../components/buttons/CustomButton";

const NewClub = ({ navigation }) => {
  // set state for all club vars
  const [form, setForm] = useState({
    clubName: "",
    clubDescription: "",
    categoriesSelected: [],
    publicClub: false,
  });
  const [loading, setLoading] = useState(false);
  // overlay
  const [overlayVisible, setOverlayVisible] = useState(false);

  const { colors } = useTheme();

  const formPropertiesAndTypes = [
    {
      propName: "clubName",
      type: "text",
      title: "Club Name",
      placeholder: "Club Name",
    },
    { propName: "publicClub", type: "boolean", title: "Public Club" },
    {
      propName: "clubDescription",
      type: "textLong",
      title: "Club Description",
      placeholder: "Tell us about your club!",
    },
    {
      propName: "categoriesSelected",
      type: "array",
      title: "Categories",
      options: CLUBCATEGORIES,
    },
  ];

  console.log(form);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "New Club",
    });
  }, [navigation]);

  // submit club
  const onSubmitPressed = async () => {
    setLoading(true);

    // make sure data is valid
    if (!form.clubName || !form.clubDescription) {
      alert("Please enter both name and description.");
      setLoading(false);
      return;
    }

    // add data to clubs
    try {
      // generate unique club id
      const clubId = (Math.random() + 1).toString(36).substring(7);

      const schoolKey = await emailSplit();
      console.log(schoolKey);

      // add club to clubData
      const clubDoc = doc(firestore, "schools", schoolKey, "clubData", clubId);
      await setDoc(clubDoc, {
        clubName: form.clubName,
        clubId: clubId,
        clubDescription: form.clubDescription,
        clubCategories: form.categoriesSelected,
        publicClub: form.publicClub,
      });

      // add club to club search data for each category
      for (let i = 0; i < form.categoriesSelected.length; i++) {
        const category = form.categoriesSelected[i];
        const categoryDoc = doc(
          firestore,
          "schools",
          schoolKey,
          "clubSearchData",
          category,
          "clubs",
          clubId
        );
        await setDoc(categoryDoc, {
          clubName: form.clubName,
          clubId: clubId,
          clubDescription: form.clubDescription,
          publicClub: form.publicClub,
          clubMembers: 0,
        });
      }

      // add user to club's members
      await joinClub(clubId, "owner");
    } catch (error) {
      console.log(error);
      alert("Club creation failed: " + error.message);
    } finally {
      setLoading(false);
      setOverlayVisible(true);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.elementsContainer}
        extraHeight={200}
        contentInsetAdjustmentBehavior="automatic"
      >
        <Form
          formPropertiesAndTypes={formPropertiesAndTypes}
          form={form}
          setForm={setForm}
        />
      </KeyboardAwareScrollView>
      <View style={{ alignSelf: "center", margin: 40, position: 'absolute', bottom: 0, }}>
        <CustomButton
          text="Submit"
          onPress={onSubmitPressed}
          loading={loading}
          width={100}
          color={form.clubName && form.clubDescription && form.categoriesSelected.length > 0 ? colors.button : colors.gray}
        />
      </View>

      <IconOverlay
        visible={overlayVisible}
        setVisible={setOverlayVisible}
        closeCondition={() => {
          navigation.goBack();
        }}
        icon="checkmark-circle"
        iconColor={colors.green}
        text="Club Created!"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  elementsContainer: {
    flex: 1,
    marginTop: 10,
    marginLeft: 20,
    gap: 5,
  },
});

export default NewClub;
