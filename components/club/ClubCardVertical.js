import React from "react";
// react native components
import { View, StyleSheet, TouchableOpacity } from "react-native";
// my components
import CustomText from "../display/CustomText";
import ClubImg from "./ClubImg";
import { useTheme } from "@react-navigation/native";

// club card displayed on the club list screen
const ClubCardVertical = ({ onPress, name, description, img, memberCount }) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity style={styles.clubCard} onPress={onPress}>
      <View style={styles.container}>
        <ClubImg clubImg={img} width={100} />

        <View style={styles.cardText}>
          <View style={styles.nameAndDesc}>
            {/* club name and description */}
            <CustomText
              style={[styles.textName, { color: colors.text }]}
              text={name}
              numberOfLines={1}
              font="bold"
            />
            <CustomText
              style={[styles.textNormal, { color: colors.text }]}
              text={description}
              numberOfLines={3}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  clubCard: {
    width: 300,
    height: 100,
  },
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 15,
    flex: 1,
  },
  cardText: {
    flex: 1,
    height: 100,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  nameAndDesc: {
    flex: 1,
    flexDirection: "column",
    height: 100,
  },
  cardRight: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  textName: {
    fontSize: 20,
    marginBottom: 0,
  },
  textNormal: {
    fontSize: 15,
  },
  numberText: {
    fontSize: 18,
  },
});

export default ClubCardVertical;
