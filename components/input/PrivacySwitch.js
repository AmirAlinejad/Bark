import React from 'react'
import { View, StyleSheet, Switch } from 'react-native';
// icons
import { Ionicons } from '@expo/vector-icons';
// colors
import { useTheme } from '@react-navigation/native';

const PrivacySwitch = ({ style, toggled, setToggled }) => {
    const { colors } = useTheme();

    const newStyle = {...styles.privacySwitch, ...style};

    return (
        <View style={newStyle}>
            <Ionicons
                name={toggled ? 'globe-outline' : 'lock-closed'}
                size={30}
                color={colors.text}
            />
            <Switch
                trackColor={{ false: colors.gray, true: colors.button }}
                thumbColor={colors.white}
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