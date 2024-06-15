import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { updateProfileData } from "../../functions/backendFunctions";
import { Colors } from "../../styles/Colors";
import ProfileImg from "../display/ProfileImg";
import CustomText from "../display/CustomText";
import URLPreview from "./URLPreview"; // Import the URLPreview component
import filterMessage from "./FilterMessage"; // Correctly import the filterMessage function

const MessageItem = ({ item, navigation, setOverlayVisible, setOverlayUserData, userId }) => {

    const maxReplyToTextLength = 20; // Maximum length of the reply to text

    // format date time
    const formatDateTime = (date) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(date).toLocaleDateString(undefined, options);
    }

    // handle message press
    const onMessagePress = () => {
        setOverlayVisible(true);
        updateProfileData(item.user._id, setOverlayUserData);
    }

    // navigate to image/gif
    const onImagePress = () => {
        navigation.navigate('ImageViewerScreen', { imageUri: item.image });
    }

    const onGIFPress = () => {
        navigation.navigate('ImageViewerScreen', { imageUri: item.gifUrl });
    }

    // message time
    const messageTime = formatDateTime(item.createdAt).split(" ")[4];

    // reply to text
    let replyToText = '';
    if (item.replyTo && item.replyTo.text) {
        replyToText = filterMessage(item.replyTo.text.length > maxReplyToTextLength ? `${item.replyTo.text.substring(0, 20)}...` : item.replyTo.text);
    }

    
    return (
        <View style={styles.messageItem}>
            <TouchableOpacity style={styles.avatarContainer} onPress={onMessagePress}>
                <ProfileImg profileImg={item.user.avatar} width={40} />
            </TouchableOpacity>
            <View style={styles.messageContent}>
                {item.user._id !== userId && (
                    <CustomText style={styles.senderName} text={`${item.user.first} ${item.user.last}`} font="bold" />
                )}
                {/* Display text message with URL preview */}
                {item.text && <URLPreview displayText={item.text} />}
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
                        <CustomText style={styles.replyContextLabel} text={`${item.replyTo.user.first} ${item.replyTo.user.last}`} font="bold" />
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
                <CustomText style={styles.dateTime} text={messageTime} font="light" />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    messageItem: {
        flexDirection: 'row',
        padding: 10,
        borderRadius: 5,
    },
    avatarContainer: {
        marginRight: 10,
    },
    messageContent: {
        width: "78%", // Ensures the content takes up the remaining space
    },
    senderName: {
        fontSize: 16,
    },
    dateTime: {
        color: Colors.darkGray,
    },
    messageImage: {
        width: 140,
        height: 140,
        resizeMode: 'cover',
        borderRadius: 15,
        marginTop: 5,
        marginBottom: 5,
    },
    messageText: {
        marginTop: 0,
        marginRight: 110,
    },
    viewImageText: {
        fontSize: 14,
        color: Colors.primary,
        textDecorationLine: 'underline',
        textAlign: 'center',
    },
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
        transform: [{ rotate: '180deg' }],
    },
    replyContextLabel: {
        color: Colors.black,
        marginBottom: 5,
    },
    replyContent: {
        marginTop: 5,
    },
    replyImageContext: {
        width: 50,
        height: 50,
        resizeMode: 'cover',
        borderRadius: 15,
    },
    replyContextText: {
        marginTop: 0,
        color: Colors.darkGray,
    },
});

export default MessageItem;
