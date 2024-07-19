import React from "react";
import { View, StyleSheet } from "react-native";
// my components
import CustomText from "./CustomText";
// colors
import { Colors } from "../../styles/Colors";
// icons
import { Ionicons } from "@expo/vector-icons";

const IconText = ({ icon, iconColor, text, onPress }) => {
  return (
    <View style={styles.container} onPress={onPress}>
      <CustomText style={styles.text} text={text} font="bold" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.primary,
    padding: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  text: {
    fontSize: 20,
    marginLeft: 10,
  },
});

export default IconText;
