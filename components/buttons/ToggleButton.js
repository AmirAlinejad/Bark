import React from "react";
// react native components
import { StyleSheet, Pressable } from "react-native";
// icons
import { Ionicons } from "@expo/vector-icons";
// my components
import CustomText from "../display/CustomText";
// styles
import { useTheme } from "@react-navigation/native";

const ToggleButton = ({
  text,
  onPress,
  toggled,
  toggledCol,
  untoggledCol,
  icon,
}) => {
  const { colors } = useTheme();
  
  const containerStyle = [
    styles.container,
    {
      borderColor: toggledCol
    },
    // set bg color if toggled
    toggled
      ? {
          backgroundColor: toggledCol,

          // add shadow if toggled
          shadowColor: colors.text,
          shadowOffset: {
            width: 2,
            height: 2,
          },
          shadowOpacity: 0.15,
          shadowRadius: 2.5,
        }
      : { },
  ];

  // set text color if toggled
  const textStyle = [
    styles.text,
    toggled ? { color: colors.white } : { color: colors.textLight },
  ];

  // icon type
  const iconType = toggled ? icon : icon + "-outline";

  // icon color
  const iconColor = toggled ? colors.white : colors.textLight;

  return (
    <Pressable style={containerStyle} onPress={onPress}>
      {icon && <Ionicons name={iconType} size={20} color={iconColor} />}
      <CustomText style={textStyle} font="bold" text={text} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 30,
    padding: 6,
    paddingHorizontal: 15,
    gap: 8,
    borderWidth: 1,
  },
  text: {
    fontWeight: "bold",
    color: "white",
    fontSize: 15,
  },
});

export default ToggleButton;
