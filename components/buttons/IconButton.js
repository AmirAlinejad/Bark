import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
// custom components
import CustomText from '../display/CustomText';
// icons
import Ionicons from 'react-native-vector-icons/Ionicons';
// colors
import { Colors } from '../../styles/Colors';

const IconButton = ({ icon, text, onPress, style, color }) => {
    // add style to button
    const buttonStyle = {
        ...styles.button,
        ...style,
    };

    // add color to text
    const textStyle = {
        ...styles.buttonText,
        color: color ? color : Colors.black,
    };

    return (
        <TouchableOpacity style={buttonStyle} onPress={onPress} >
            <Ionicons name={icon} size={25} color={color ? color : Colors.black} style={styles.icon} />
            <CustomText style={textStyle} text={text} />
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
        fontSize: 16,
    },
});

export default IconButton;