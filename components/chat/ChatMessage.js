import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
// components
import MessageItem from './MessageItem';
import CustomText from '../display/CustomText';
// icons
import { Ionicons } from '@expo/vector-icons';
// firebase
import { auth, firestore } from '../../backend/FirebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
// styles
import { Colors } from '../../styles/Colors';
// functions
import { handleLongPress, handlePressMessage } from '../../functions/backendFunctions';
import { chatFormatDate } from '../../functions/timeFunctions';

const ChatMessage = ({ 
  item, 
  isLastMessageOfTheDay, 
  isLikedByUser, 
  likedMessages, 
  setLikedMessages, 
  currentUserPrivilege,
  setLikedUsernames,
  setIsLikesModalVisible,
  setReplyingToMessage,
  setOverlayVisible,
  setOverlayUserData,
  chatType,
  navigation,
}) => {

  const toggleLike = async (message) => {
    const userId = auth.currentUser.uid;
    const messageRef = doc(firestore, chatType, message._id);
  
    let newLikedMessages = new Set(likedMessages);
    const isCurrentlyLiked = likedMessages.has(message._id);
    if (isCurrentlyLiked) {
      newLikedMessages.delete(message._id);
    } else {
      newLikedMessages.add(message._id);
    }
    setLikedMessages(newLikedMessages);
  
    try {
      const messageDoc = await getDoc(messageRef);
      if (!messageDoc.exists()) {
        console.error("Document does not exist!");
        throw new Error("Document does not exist!");
      }
  
      const data = messageDoc.data();
      const likesArray = data.likes || [];
      const isLikedByUser = likesArray.includes(userId);
  
      const newLikesArray = isLikedByUser
        ? likesArray.filter(id => id !== userId)
        : [...likesArray, userId];
      const newLikeCount = isLikedByUser
        ? (data.likeCount || 0) - 1
        : (data.likeCount || 0) + 1;
  
      await updateDoc(messageRef, {
        likes: newLikesArray,
        likeCount: newLikeCount
      });
    } catch (error) {
      console.error('Error updating like:', error);
      // If error, revert the optimistic update
      setLikedMessages(likedMessages); // revert to previous state
    }
  };

  // get background color based on pinned and user id
  const getBackgroundColor = () => {
    if (item.pinned) {
      return Colors.chatBubblePinned;
    } else if (item.user._id == auth.currentUser.uid) {
      return Colors.lightGray;
    } else {
      return Colors.lightGray;
    }
  }

  return (
    <View>
        {isLastMessageOfTheDay && (
        <View style={styles.dateContainer}>
          <View style={styles.dateWrapper}>
            <CustomText style={styles.dateText} text={chatFormatDate(item.createdAt)} />
          </View>
        </View>
        )}
        <TouchableOpacity 
          onPress={() => handlePressMessage(item.likes, setLikedUsernames, setIsLikesModalVisible)}
          onLongPress={() => handleLongPress(item, currentUserPrivilege, setReplyingToMessage, chatType)} 
          style={[styles.messageContainer, {backgroundColor : getBackgroundColor()}, item.pinned && styles.pinnedMessage]}>
          <MessageItem item={item} navigation={navigation} setOverlayVisible={setOverlayVisible} setOverlayUserData={setOverlayUserData}/>
          <TouchableOpacity onPress={() => toggleLike(item)} style={styles.likeButton}>
            <Ionicons name={isLikedByUser ? "heart" : "heart-outline"} size={24} color={isLikedByUser ? "red" : "black"} />
            <CustomText style={styles.likeCountText} text={item.likeCount || 0} />
          </TouchableOpacity>
        </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
    dateContainer: {
        alignItems: 'center',
        marginTop: 10,
    },
    dateWrapper: {
        borderRadius: 10,
        padding: 5,
    },
    dateText: {
        color: Colors.darkGray,
        fontSize: 16,
        marginTop: -15,
    },
    messageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    likeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute',
        right: 15,
    },
    likeCountText: {
        marginLeft: 5,
    },
});

export default ChatMessage;