// report attendance for an event
import React from 'react';
import { StyleSheet } from 'react-native';
import { View } from 'react-native';
// components
import CustomText from '../../components/display/CustomText';
import CustomButton from '../../components/buttons/CustomButton';
// functions
import { attendEvent } from '../../functions/backendFunctions';

const AttendanceScreen = ({ eventId, navigation }) => {

    const handleAttendance = () => {
        attendEvent(eventId);
        navigation.navigate('HomeScreen');
    };

    return (
        <View style={styles.view}>
            <CustomText style={{fontSize: 20}} font='bold' text='Present?' />
            <CustomButton onPress={handleAttendance} text='Here!'/>
        </View>
    );
};

const styles = StyleSheet.create({
    view: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20,
    },
});

export default AttendanceScreen;