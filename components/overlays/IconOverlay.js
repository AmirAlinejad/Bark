import React from "react";
import { View, StyleSheet, Modal } from "react-native";
// styles
import { useTheme } from "@react-navigation/native";
// icons
import Ionicons from "react-native-vector-icons/Ionicons";
// my components
import CustomText from "../display/CustomText";
import CustomButton from "../buttons/CustomButton";

const IconOverlay = ({
  visible,
  setVisible,
  icon,
  iconColor,
  text,
  closeCondition,
}) => {
  const { colors } = useTheme();

  const closeOverlay = () => {
    if (closeCondition) {
      closeCondition();
    }
    setVisible(false);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={closeOverlay}
    >
      <View style={styles.view}>
        <View style={[styles.modal, { backgroundColor: colors.card }]}>
          <Ionicons name={icon} size={80} color={iconColor} />
          <CustomText
            style={[styles.text, { color: colors.text }]}
            text={text}
            font="bold"
          />

          <CustomButton text="Close" onPress={closeOverlay}/>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  view: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modal: {
    width: 300,
    height: 300,
    borderRadius: 30,
    padding: 20,
    gap: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 24,
    textAlign: "center",
  },
});

export default IconOverlay;
