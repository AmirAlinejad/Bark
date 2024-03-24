import React from 'react';
import { View, StyleSheet } from 'react-native';
// my components
import CustomText from '../CustomText';
// colors
import { Colors } from '../../styles/Colors';
// icons
import { Ionicons } from '@expo/vector-icons';

const IconText = ({ icon, iconColor, text, onPress }) => {
    return (
        <View style={styles.container} onPress={onPress}>
            <View style={[styles.iconCircle, {backgroundColor: iconColor}]}>
                <Ionicons name={icon} size={25} color={Colors.black} />
            </View>
            <CustomText style={styles.text} text={text} font='bold'/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconCircle: {
        backgroundColor: Colors.primary,
        padding: 12,
        width: 50,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 24,
        marginLeft: 10,
    },
});

export default IconText;