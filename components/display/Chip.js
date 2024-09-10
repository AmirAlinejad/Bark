import React from "react";
import { View, StyleSheet } from "react-native";
// my components
import CustomText from "./CustomText";
// icons
import { Ionicons } from "@expo/vector-icons";
// colors
import { useTheme } from "@react-navigation/native";

const Chip = ({ text, icon, color, textColor }) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: color ? color : colors.gray },
      ]}
    >
      {icon && <Ionicons name={icon} size={20} color={colors.textColor} />}
      <CustomText
        style={[styles.text, { color: textColor }]}
        text={text}
        font="bold"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 5,
    paddingRight: 10,
    paddingVertical: 8,
    borderRadius: 10,
    margin: 5,
  },
  text: {
    marginLeft: 5,
    fontSize: 14,
    color: "rgba(0,0,0,0.4)",
  },
});

export default Chip;
