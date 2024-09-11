import React from "react";
// react native components
import { View, StyleSheet } from "react-native";
// my components
import CustomButton from "../../components/buttons/CustomButton";
import CustomText from "../../components/display/CustomText";
// styles
import { useTheme } from "@react-navigation/native";

const AttendeesScreen = ({ route, navigation }) => {
  return (
    <View style={styles.container}>
      <CustomText text="Attendees" />
    </View>
  );
};

export default AttendeesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
