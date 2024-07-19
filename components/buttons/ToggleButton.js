import React from "react";
// react native components
import { StyleSheet, Pressable } from "react-native";
// icons
import { Ionicons } from "@expo/vector-icons";
// my components
import CustomText from "../display/CustomText";
// styles
import { Colors } from "../../styles/Colors";

const ToggleButton = ({
  text,
  onPress,
  toggled,
  toggledCol,
  untoggledCol,
  icon,
}) => {
  const containerStyle = [
    styles.container,
    // set bg color if toggled
    toggled
      ? {
          backgroundColor: toggledCol,

          // add shadow if toggled
          shadowColor: "#000",
          shadowOffset: {
            width: 2,
            height: 2,
          },
          shadowOpacity: 0.15,
          shadowRadius: 1.5,
        }
      : { backgroundColor: untoggledCol },
  ];

  // set text color if toggled
  const textStyle = [
    styles.text,
    toggled ? { color: Colors.white } : { color: Colors.darkGray },
  ];

  // icon type
  const iconType = toggled ? icon : icon + "-outline";

  // icon color
  const iconColor = toggled ? Colors.white : Colors.darkGray;

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
    padding: 10,
    paddingHorizontal: 15,
    gap: 8,
  },
  text: {
    fontWeight: "bold",
    color: "white",
    fontSize: 15,
  },
});

export default ToggleButton;
