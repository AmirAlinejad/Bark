import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
// functions
import { updateProfileData } from "../../functions/backendFunctions";
import { auth } from "../../backend/FirebaseConfig";
// my components
import ProfileImg from "../display/ProfileImg";
import CustomText from "../display/CustomText";
// styles
import { Colors } from "../../styles/Colors";
// icons
import { MaterialCommunityIcons } from "@expo/vector-icons";
// image
import { Image } from "expo-image";

const MessageItem = ({ item, navigation, setOverlayVisible, setOverlayUserData }) => {

    // states
    const [userId, setUserId] = useState(null);

    const maxReplyToTextLength = 20; // Maximum length of the reply to text

    // format date time
    formatDateTime = (date) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(date).toLocaleDateString(undefined, options);
    }

    // use effect (maybe instead use item.user._id)
    useEffect(() => {
        setUserId(auth.currentUser.uid);
    }, []);

    // handle message press
    onMessagePress = () => {
        // Handle message press
        setOverlayVisible(true);
        updateProfileData(item.user._id, setOverlayUserData);
    }   

    // navigate to image/gif
    onImagePress = () => {
        navigation.navigate('ImageViewerScreen', { imageUri: item.image });
    }
    onGIFPress = () => {
        navigation.navigate('ImageViewerScreen', { imageUri: item.gifUrl });
    }

    // message time
    const messageTime = formatDateTime(item.createdAt).split(" ")[4];

    // reply to text
    let replyToText = '';
    if (item.replyTo) {
        replyToText = item.replyTo.text.length > maxReplyToTextLength ? `${item.replyTo.text.substring(0, 20)}...` : item.replyTo.text
    }

    return (
        <View style={styles.messageItem}>
            <TouchableOpacity style={styles.avatarContainer} onPress={onMessagePress}>
                <ProfileImg profileImg={item.user.avatar} width={40} />
            </TouchableOpacity>
            <View>
                {item.user._id != userId && (
                    <CustomText style={styles.senderName} text={item.user.first + ' ' + item.user.last} font="bold"/>
                )}
                {/* Display text message */}
                {item.text && <CustomText style={styles.messageText} text={item.text} />}
                {/* Display image with option to view larger */}
                {item.image && (
                <TouchableOpacity onPress={onImagePress}>
                    <Image source={{ uri: item.image }} style={styles.messageImage} />
                </TouchableOpacity>
                )}
                {/* Display GIF with option to view larger */}
                {item.gifUrl && (
                <TouchableOpacity onPress={onGIFPress}>
                    <Image source={{ uri: item.gifUrl }} style={styles.messageImage} />
                </TouchableOpacity>
                )}
                {item.replyTo && (
                <View style={styles.replyContextContainer}>
                    <View style={styles.arrowIcon}>
                        <MaterialCommunityIcons name="arrow-left-top" size={24} color={Colors.darkGray} />
                    </View>          
                    <CustomText style={styles.replyContextLabel} text={`${item.replyTo.user.first} ${item.replyTo.user.last}`} font="bold"/>
                    {item.replyTo.image && (
                    <TouchableOpacity style={styles.replyContent}>
                        <Image source={{ uri: item.replyTo.image }} style={styles.replyImageContext} />
                    </TouchableOpacity>
                    )}
                    {item.replyTo.gifUrl && (
                    <TouchableOpacity style={styles.replyContent}>
                        <Image source={{ uri: item.replyTo.gifUrl }} style={styles.replyImageContext} />
                    </TouchableOpacity>
                    )}
                    {item.replyTo.text && (
                    <CustomText style={styles.replyContextText} text={replyToText} />
                    )}
                </View>
                )}
                <CustomText style={styles.dateTime} text={messageTime} font="light"/>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    messageItem: {
        flexDirection: 'row',
        padding: 10,
        borderRadius: 5,
        marginBottom: 0,
    },
    avatarContainer: {
        marginRight: 10,
    },
    senderName: {
        fontSize: 16,
    },
    dateTime: {
        color: Colors.darkGray,
    },
    messageImage: {
        width: 140, // Adjust the size as needed
        height: 140, // Adjust the size as needed
        resizeMode: 'cover',
        borderRadius: 15, // Optional: if you want rounded corners
        marginTop: 5, // Spacing above and below the image
        marginBottom: 5,
    },
    messageText: {
        marginTop: 0,
        marginRight: 110,
    },

    // View image text styles
    viewImageText: {
        color: Colors.primary,
        textAlign: 'center',
        marginTop: 5,
    },
    viewImageText: {
        fontSize: 14,
        color: Colors.primary, // Use a color that indicates it's clickable
        textDecorationLine: 'underline',
        textAlign: 'center', // Center the text below the image
    },

    // Reply context styles
    replyContextContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        padding: 10,
        borderRadius: 15,
        marginVertical: 5,
        marginRight: 60,
        marginLeft: 28,
    },
    arrowIcon: {
        position: 'absolute',
        top: 0,
        left: -30,
        transform: [{ rotate: '180deg' }], // Rotate the arrow icon
    },
    replyContextLabel: {
        color: Colors.black,
        marginBottom: 5,
    },
    replyContent: {
        marginTop: 5,
    },
    replyImageContext: {
        width: 50, // Adjust the size as needed
        height: 50, // Adjust the size as needed
        resizeMode: 'cover',
        borderRadius: 15, // Optional: if you want rounded corners
    },
    replyContextText: {
        marginTop: 0,
        color: Colors.darkGray,
    },
});

export default MessageItem;