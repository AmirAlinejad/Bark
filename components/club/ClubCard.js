import React, { memo } from "react";
// react native components
import { View, StyleSheet, TouchableOpacity } from "react-native";
// functions
import { goToClubScreen } from "../../functions/navigationFunctions";
// my components
import CustomText from "../display/CustomText";
import ClubImg from "./ClubImg";

// club card displayed on the club list screen
const ClubCard = ({ clubId, onPress, name, description, img, navigation }) => {
  // navigate to the club screen
  onPress = () => {
    goToClubScreen(clubId, navigation);
  };

  return (
    <TouchableOpacity style={styles.clubCard} onPress={onPress}>
      <ClubImg clubImg={img} width={100} />
      <CustomText text={name} numberOfLines={1} font="bold" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  clubCard: {
    justifyContent: "flex-start",
    alignItems: "flex-start",
    borderRadius: 10,
    width: 100,
    gap: 5,
    marginBottom: 5,
  },
});

export default memo(ClubCard);
