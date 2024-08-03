import React from "react";
import { View, StyleSheet } from "react-native";
// my components
import CustomText from "./CustomText";

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
