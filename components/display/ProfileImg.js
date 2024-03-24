import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
// icons
import Ionicons from 'react-native-vector-icons/Ionicons';

const ProfileImg = ({ profileImg, width, editable }) => {
    console.log(profileImg);
    return (
        <View style={[styles.imgContainer, {width: width, height: width, borderRadius: width/2}]}>
            <Image source={{uri: profileImg}} style={[styles.imgContainer, {width: width, height: width, borderRadius: width/2}]}/>

            {editable && (
                <View style={{position: 'absolute' }}>
                    <Ionicons name="camera" size={60} color='rgba(0,0,0,0.5)' />
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
        borderRadius: 50,
        backgroundColor: 'gray',
    },
});

export default ProfileImg;