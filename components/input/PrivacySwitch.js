import React from 'react'
import { View, StyleSheet, Switch } from 'react-native';
// icons
import { Ionicons } from '@expo/vector-icons';
// colors
import { Colors } from '../../styles/Colors';

const PrivacySwitch = ({ style, toggled, setToggled }) => {

    const newStyle = {...styles.privacySwitch, ...style};

    return (
        <View style={newStyle}>
            <Ionicons
                name={toggled ? 'globe-outline' : 'lock-closed'}
                size={30}
                color={Colors.black}
            />
            <Switch
                trackColor={{ false: Colors.black, true: Colors.buttonBlue }}
                thumbColor={Colors.white}
                onValueChange={setToggled}
                value={toggled}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    privacySwitch: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        gap: 10,
    },
});

export default PrivacySwitch;