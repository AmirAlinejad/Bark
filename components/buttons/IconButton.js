import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
// custom components
import CustomText from '../CustomText';
// icons
import Ionicons from 'react-native-vector-icons/Ionicons';
// colors
import { Colors } from '../../styles/Colors';

const IconButton = ({ icon, text, onPress, style }) => {
    // add style to button
    const buttonStyle = {
        ...styles.button,
        ...style,
    };

    return (
        <TouchableOpacity style={buttonStyle} onPress={onPress} >
            <Ionicons name={icon} size={20} color="black" style={styles.icon} />
            <CustomText style={styles.buttonText} text={text} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    buttonText: {
        marginTop: 2,
        fontSize: 15,
    },
});

export default IconButton;