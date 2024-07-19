import React from "react";
// react native components
import { StyleSheet, TouchableOpacity, View } from "react-native";
// my components
import CustomText from "../display/CustomText";
// icons
import Ionicons from "react-native-vector-icons/Ionicons";
// colors
import { Colors } from "../../styles/Colors";

const CustomButton = ({ onPress, text, color, icon, width }) => {
  const backgroundColor = color ? color : Colors.buttonBlue;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        { backgroundColor: backgroundColor, width: width ? width : "auto" },
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={22}
          color={Colors.white}
          style={styles.icon}
        />
      )}
      <CustomText style={styles.text} text={text} font="bold" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 10,
    padding: 12,
    paddingHorizontal: 20,
    marginVertical: 5,
    borderRadius: 25,
  },
  text: {
    color: Colors.white,
    textAlign: "center",
    alignSelf: "center",
  },
});

export default CustomButton;
