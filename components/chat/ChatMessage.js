import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
// components
import MessageItem from "./MessageItem";
import CustomText from "../display/CustomText";
// icons
import { Ionicons } from "@expo/vector-icons";
// firebase
import { getDoc, updateDoc } from "firebase/firestore";
// styles
import { useTheme } from "@react-navigation/native";
// functions
import {
  handleLongPress,
  handlePressMessage,
} from "../../functions/chatFunctions";
import { chatFormatDate } from "../../functions/timeFunctions";

const ChatMessage = ({
  message,
  isFirstMessageOfTheDay,
  isLikedByUser,
  likedMessages,
  setLikedMessages,
  currentUserPrivilege,
  setLikedProfileImages,
  setIsLikesModalVisible,
  setReplyingToMessage,
  setOverlayVisible,
  setOverlayUserData,
  messageRef,
  userId,
  navigation,
}) => {
  const { colors } = useTheme();

  // toggle like
  const toggleLike = async () => {
    // compares by id
    let newLikedMessages = new Set(likedMessages);
    const isCurrentlyLiked = likedMessages.has(message.id);
    if (isCurrentlyLiked) {
      newLikedMessages.delete(message.id);
    } else {
      newLikedMessages.add(message.id);
    }
    setLikedMessages(newLikedMessages);

    try {
      const messageDoc = await getDoc(messageRef);
      if (!messageDoc.exists()) {
        throw new Error("Document does not exist!");
      }

      const data = messageDoc.data();
      const likesArray = data.likes || [];
      const isLikedByUser = likesArray.includes(userId);

      const newLikesArray = isLikedByUser
        ? likesArray.filter((id) => id !== userId)
        : [...likesArray, userId];

      await updateDoc(messageRef, {
        likes: newLikesArray,
      });
    } catch (error) {
      console.error("Error updating like:", error);
      // If error, revert the optimistic update
      setLikedMessages(likedMessages); // revert to previous state
    }
  };

  // animate like button
  const animatedValue = new Animated.Value(1);
  useEffect(() => {
    if (isLikedByUser) {
      Animated.timing(animatedValue, {
        toValue: 1.2,
        duration: 200,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => {
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 200,
          easing: Easing.linear,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [isLikedByUser]);

  const likeMessageStyle = {
    transform: [{ scale: animatedValue }],
  };

  // get background color based on pinned and user id
  const getBackgroundColor = () => {
    if (message.pinned) {
      return colors.mediumLightGray;
    } else if (message.user._id == userId) {
      return;
    } else {
      return;
    }
  };

  // like count
  const likeCount = message.likes ? message.likes.length : 0;

  // heart icon color
  const heartColor = isLikedByUser ? colors.red : colors.darkGray;
  const heartIcon = isLikedByUser ? "heart" : "heart-outline";

  return (
    <View>
      {isFirstMessageOfTheDay && (
        <View style={styles.dateContainer}>
          <View style={styles.dateWrapper}>
            <CustomText
              style={[styles.dateText, { color: colors.textLight }]}
              text={chatFormatDate(message.createdAt)}
            />
          </View>
        </View>
      )}
      <View
        style={[
          styles.messageContainer,
          { backgroundColor: getBackgroundColor() },
        ]}
      >
        <TouchableOpacity
          style={{ flex: 1, justifyContent: "center" }}
          onPress={() =>
            handlePressMessage(
              message.likes,
              setLikedProfileImages,
              setIsLikesModalVisible
            )
          }
          onLongPress={() =>
            handleLongPress(
              message,
              currentUserPrivilege,
              setReplyingToMessage,
              messageRef
            )
          }
        >
          <MessageItem
            item={message}
            navigation={navigation}
            setOverlayVisible={setOverlayVisible}
            setOverlayUserData={setOverlayUserData}
            userId={userId}
            messageRef={messageRef}
            setReplyingToMessage={setReplyingToMessage}
            swipeable={message.voteOptions ? false : true}
            onLongPress={() => {
              handleLongPress(
                message,
                currentUserPrivilege,
                setReplyingToMessage,
                messageRef
              );
            }}
          />
          {!message.voteOptions && (
            <TouchableOpacity onPress={toggleLike} style={styles.likeButton}>
              <Animated.View style={likeMessageStyle}>
                <Ionicons name={heartIcon} size={24} color={heartColor} />
              </Animated.View>
              <CustomText
                style={[styles.likeCountText, { color: colors.textLight }]}
                text={likeCount}
              />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dateContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  dateWrapper: {
    borderRadius: 10,
    padding: 5,
  },
  dateText: {
    fontSize: 16,
    marginTop: -15,
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 8,
  },
  likeButton: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    right: 15,
  },
  likeCountText: {
    marginLeft: 5,
  },
});

export default ChatMessage;
