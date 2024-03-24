import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
// icons
import Ionicons from 'react-native-vector-icons/Ionicons';

const ClubImg = ({clubImg, width, editable }) => {
    return (
        <View style={[styles.imgContainer, {width: width, height: width}]}>
            <Image source={{uri: clubImg}} style={[styles.imgContainer, {width: width, height: width}]} />

            {editable && (
                <View style={{position: 'absolute' }}>
                    <Ionicons name="camera" size={60} color='rgba(0,0,0,0.5)'  />
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    imgContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 100,
        height: 100,
        borderRadius: 20,
        backgroundColor: 'gray',
    },
});

export default ClubImg;