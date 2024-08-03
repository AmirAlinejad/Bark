import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
// custom components
import CustomText from "../display/CustomText";
// icons
import Ionicons from "react-native-vector-icons/Ionicons";
// colors
import { useTheme } from "@react-navigation/native";

const IconButton = ({ icon, text, onPress, style, color }) => {
  const { colors } = useTheme();
  // add style to button
  const buttonStyle = {
    ...styles.button,
    ...style,
  };

  // add color to text
  const textStyle = {
    ...styles.buttonText,
    color: color ? color : colors.text,
  };

  return (
    <TouchableOpacity style={buttonStyle} onPress={onPress}>
      <Ionicons
        name={icon}
        size={25}
        color={color ? color : colors.text}
        style={styles.icon}
      />
      <CustomText style={textStyle} text={text} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  buttonText: {
    marginTop: 2,
    fontSize: 16,
  },
});

export default IconButton;
