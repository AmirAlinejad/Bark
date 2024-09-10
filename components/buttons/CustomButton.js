import React from "react";
// react native components
import { StyleSheet, TouchableOpacity } from "react-native";
// my components
import CustomText from "../display/CustomText";
// icons
import Ionicons from "react-native-vector-icons/Ionicons";
// colors
import { useTheme } from "@react-navigation/native";

const CustomButton = ({ onPress, text, color, textColor, icon, width }) => {
  const { colors } = useTheme();
  const backgroundColor = color ? color : colors.button;

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
          color={colors.white}
          style={styles.icon}
        />
      )}
      <CustomText
        style={[styles.text, { color: textColor ? textColor : colors.white }]}
        text={text}
        font="bold"
      />
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
    justifyContent: "center",
  },
  text: {
    textAlign: "center",
    alignSelf: "center",
  },
});

export default CustomButton;
