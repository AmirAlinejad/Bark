import React from "react";
import { View, StyleSheet, Modal } from "react-native";
// styles
import { Colors } from "../../styles/Colors";
// icons
import Ionicons from "react-native-vector-icons/Ionicons";
// my components
import CustomText from "../display/CustomText";
import CustomButton from "../buttons/CustomButton";

const IconOverlay = ({ visible, setVisible, icon, iconColor, text, closeCondition }) => {

    const closeOverlay = () => {
        if (closeCondition) {
            closeCondition();
        }
        setVisible(false);
    }

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={() => closeOverlay()}
        >
            <View style={styles.view}>
                <View style={styles.modal}>

                    <Ionicons name={icon} size={80} color={iconColor} />
                    <CustomText style={styles.text} text={text} font='bold'/>

                    <CustomButton text="Close" onPress={() => closeOverlay()} type="primary"/>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    view: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    modal: {
        width: 300,
        height: 300,
        backgroundColor: Colors.white,
        borderRadius: 30,
        padding: 20,
        gap: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 24,
        color: Colors.black,
        textAlign: 'center',
    },
  });

export default IconOverlay;