import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
// storage
import AsyncStorage from "@react-native-async-storage/async-storage";
// my components
import CustomText from "../../components/display/CustomText";
import CustomButton from "../../components/buttons/CustomButton";
// functions
import { getSetSchoolData } from "../../functions/backendFunctions";
// colors
import { useTheme } from "@react-navigation/native";
// linking
import * as Linking from "expo-linking";

const VerifySchool = ({ navigation }) => {
  const { colors } = useTheme();

  const [schoolData, setSchoolData] = useState(null);
  // loading and error handling
  const [loading, setLoading] = useState(true);

  const storeSchool = async () => {
    try {
      await AsyncStorage.setItem("school", JSON.stringify(schoolData));
    } catch (error) {
      console.log(error);
    }
  };

  const confirmSchool = () => {
    navigation.navigate("VerifyEmail");
    storeSchool();
  };

  useEffect(() => {
    // set school data
    setLoading(true);
    getSetSchoolData(setSchoolData);
    setLoading(false);
  }, []);

  const openHelpEmail = () => {
    Linking.openURL(
      "mailto: help.bark.mobile.com" + "?subject=New School Request"
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.elements}>
        {loading && <ActivityIndicator size="large" color={colors.gray} />}
        {!loading &&
          (schoolData ? (
            <View style={styles.content}>
              <CustomText
                style={styles.text}
                text={"It looks like you attend " + schoolData.name + "."}
              />
              <CustomText
                style={[styles.text, { fontSize: 30 }]}
                font="bold"
                text={"Go " + schoolData.mascot + schoolData.emoji + "!"}
              />
              <CustomText style={styles.text} text={"Is this correct? "} />
              <CustomButton text="Confirm" onPress={confirmSchool} />
            </View>
          ) : (
            <View style={styles.content}>
              <CustomText
                style={styles.text}
                text="We couldn't verify your school. Please check your email and try again."
              />
              <CustomText
                style={styles.text}
                text="If your school is new to Bark, please email us and we'd be happy to add it!"
              />
              <CustomButton text="Email Us" onPress={openHelpEmail} />
              <CustomButton text="Continue" onPress={confirmSchool} />
            </View>
          ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  elements: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 60,
    marginBottom: 50,
  },
  text: {
    textAlign: "center",
    fontSize: 18,
    marginBottom: 20,
  },
});

export default VerifySchool;
