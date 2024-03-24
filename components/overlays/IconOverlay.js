import React, { useState } from "react";
import { View, StyleSheet, TouchableWithoutFeedback, Modal } from "react-native";
// styles
import { Colors } from "../../styles/Colors";
// icons
import Ionicons from "react-native-vector-icons/Ionicons";
// my components
import CustomText from "../CustomText";

const IconOverlay = ({ visible, setVisible, icon, iconColor, text }) => {

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={() => {
                setVisible(false);
            }}
        >
            <View style={styles.modal}>
                <Ionicons name={icon} size={80} color={iconColor} />
                <CustomText style={styles.text} text={text} font='bold'/>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modal: {
        width: 300,
        height: 300,
        backgroundColor: Colors.white,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 24,
        color: Colors.black,
    },
  });

export default IconOverlay;