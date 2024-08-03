import React from "react";
// react native components
import { TouchableOpacity, StyleSheet } from "react-native";
// icons
import Icon from "react-native-vector-icons/Ionicons";
// colors
import { useTheme } from "@react-navigation/native";

const size = 60;

const CircleButton = ({ icon, onPress, position, color }) => {
  const { colors } = useTheme();

  // create button with given position and icon
  const buttonStyle = {
    ...styles.circleButton,
    ...position,
    backgroundColor: color ? color : colors.bark,
    height: size,
    width: size,
    borderRadius: size / 2,
  };

  return (
    <TouchableOpacity style={buttonStyle} onPress={onPress}>
      <Icon name={icon} size={size / 2} color="#FFF" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  circleButton: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    margin: 25,
    padding: 10,
    // shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
});

export default CircleButton;
