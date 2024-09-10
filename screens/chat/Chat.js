import React, {
  useState,
  useEffect,
  useCallback,
  useLayoutEffect,
  useRef,
} from "react";
import {
  TouchableOpacity,
  View,
  TextInput,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
  Dimensions,
  RefreshControl,
  Animated,
  Easing,
} from "react-native";
// keyboard listener
import KeyboardListener from "react-native-keyboard-listener";
// firebase
import {
  collection,
  addDoc,
  orderBy,
  query,
  onSnapshot,
  where,
  getDocs,
  getDoc,
  updateDoc,
  limit,
  doc,
} from "firebase/firestore";
import { firestore } from "../../backend/FirebaseConfig";
// icons
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Ionicons from "react-native-vector-icons/Ionicons";
// image
import { Image } from "expo-image";
// my components
import BottomSheetModal from "../../components/chat/BottomSheetModal";
import ChatMessage from "../../components/chat/ChatMessage";
import LikesModal from "../../components/chat/LikesModal";
import ProfileOverlay from "../../components/overlays/ProfileOverlay";
import CustomText from "../../components/display/CustomText";
import ReplyPreview from "../../components/chat/ReplyPreview";
import IconButton from "../../components/buttons/IconButton";
import ClubImg from "../../components/club/ClubImg";
// functions
import {
  handleImageUploadAndSend,
  handleCameraPress,
  handleDocumentUploadAndSend,
  sendChatNotification,
} from "../../functions/chatFunctions";
import { getSetUserData } from "../../functions/profileFunctions";
import { fetchMessages } from "../../functions/chatFunctions";
import { checkMembership } from "../../functions/clubFunctions";
import { deleteImageFromStorage } from "../../functions/fileFunctions";
import { isSameDay } from "../../functions/timeFunctions";
import { goToClubScreen } from "../../functions/navigationFunctions";
import { GestureHandlerRootView } from "react-native-gesture-handler";
// colors
import { useFocusEffect, useTheme } from "@react-navigation/native";
// auth
import { getAuth } from "firebase/auth";

export default function Chat({ route, navigation }) {
  // keyboard state
  const [keyboardIsOpen, setKeyboardIsOpen] = useState(false);

  // Define state for refreshing the messages
  const [fetchLimit, setFetchLimit] = useState(20);
  const [refreshing, setRefreshing] = useState(false);

  // Define states for message text, messages, image URL, and pinned message count
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const [imageUrl, setImageUrl] = useState(null); // Define imageUrl state
  const [tempImageUrl, setTempImageUrl] = useState(null); // Define tempImageUrl state
  const [pinnedMessageCount, setPinnedMessageCount] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(true); // Initially assume the user is at the bottom
  const [likedMessages, setLikedMessages] = useState(new Set());
  const [gifUrl, setGifUrl] = useState(null); // Define gifUrl state
  const [showSendButton, setShowSendButton] = useState(false); // Define showSendButton state

  // Define states for the liked messages modal
  const [isLikesModalVisible, setIsLikesModalVisible] = useState(false);
  //const [likedUsernames, setLikedUsernames] = useState(new Set()); // user ids instead of usernames
  const [likedProfileImages, setLikedProfileImages] = useState(new Set());

  // replying state
  const [replyingToMessage, setReplyingToMessage] = useState(null);

  // user state
  const [userData, setUserData] = useState(null);
  const [currentUserPrivilege, setCurrentUserPrivilege] = useState(""); // Define currentUserPrivilege state

  // overlay state
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayUserData, setOverlayUserData] = useState(null);

  const chatName = route?.params?.chatName || "chat";
  const clubId = route?.params?.id;
  const clubName = route?.params?.name;
  const clubImg = route?.params?.img;
  const schoolKey = route?.params?.schoolKey;

  const flatListRef = useRef(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { colors } = useTheme();

  // header options
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLargeTitle: false,
      headerTitle: () => (
        <TouchableOpacity
          style={styles.clubNameButton}
          onPress={navigateToClubScreen}
        >
          <View style={styles.clubNameContainer}>
            <View style={{ marginRight: 10 }}>
              <ClubImg clubImg={clubImg} width={40} />
            </View>
            <CustomText
              text={
                clubName.length > 30
                  ? clubName.substring(0, 30) + "..."
                  : clubName
              }
              style={[
                styles.clubNameText,
                {
                  color: colors.text,
                  fontSize: clubName.length > 12 ? 16 : 20,
                },
              ]}
              font="bold"
            />
          </View>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <IconButton
          icon="search"
          text=""
          onPress={goToMessageSearchScreen}
          style={styles.searchButton}
        />
      ),
    });
  }, [navigation]);

  // Define functions to handle modal open and close
  const openModal = () => {
    setIsModalVisible(true);

    scrollToBottom();
  };

  // Define function to close the modal
  const closeModal = () => {
    setIsModalVisible(false);
  };

  // Fetch messages on initial render
  useEffect(() => {
    // Fetching messages in descending order to suit the inverted list.
    const messagesQuery = query(
      collection(
        firestore,
        "schools",
        schoolKey,
        "chatData",
        "clubs",
        clubId,
        "chats",
        chatName
      ),
      orderBy("createdAt", "desc"),
      limit(fetchLimit)
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (querySnapshot) => {
        fetchMessages(
          querySnapshot,
          setMessages,
          setPinnedMessageCount,
          scrollToBottom
        );
      },
      (error) => {
        console.error("Error fetching messages: ", error);
      }
    );

    // Get the user data from AsyncStorage
    getSetUserData(setUserData);

    // Check the user's membership status
    checkMembership(clubId, setCurrentUserPrivilege, () => {});

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, [fetchLimit]);

  const clearUnreadMessages = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      return;
    }

    const clubMemberRef = doc(
      firestore,
      "schools",
      schoolKey,
      "clubMemberData",
      "clubs",
      clubId,
      user.uid
    );
    updateDoc(clubMemberRef, { unreadMessages: 0 });
  };

  // clear unread messages once user data is fetched
  useEffect(() => {
    if (userData) {
      clearUnreadMessages();
    }
  }, [userData]);

  // Fetch liked messages on initial render after messages are fetched and scroll to bottom
  useEffect(() => {
    // Function to fetch liked messages and update the local state
    const fetchLikedMessages = async () => {
      const messagesRef = collection(
        firestore,
        "schools",
        schoolKey,
        "chatData",
        "clubs",
        clubId,
        "chats",
        chatName
      );

      if (!userData) {
        return;
      }
      const q = query(
        messagesRef,
        where("likes", "array-contains", userData.id)
      );

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        return;
      }
      const likedMsgs = new Set();
      querySnapshot.forEach((doc) => {
        likedMsgs.add(doc.id);
      });
      setLikedMessages(likedMsgs);
    };

    fetchLikedMessages();
  }, [messages]);

  useFocusEffect(
    useCallback(() => {
      // Do something when the screen is focused
      setTimeout(() => {
        scrollToBottom();
      }, 10);
      return () => {
        // Do something when the screen is unfocused
      };
    }, [])
  );

  // Use the route params to set the selected GIF URL
  useEffect(() => {
    setGifUrl(route.params.gif);
  }, [route.params]);

  // clear unread messages once you leave page
  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      clearUnreadMessages();
    });

    return unsubscribe;
  }, []);

  // Function to navigate to the message search screen
  const navigateToMessageSearchScreen = (pin) => {
    navigation.navigate("MessageSearchScreen", {
      clubId,
      chatName,
      pin,
      schoolKey,
    });
  };

  // checks if user is not at the bottom of the chat
  const isCloseToBottom = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }) => {
    const paddingToBottom = 20;
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    );
  };

  // fix to only pass in the clubId
  const navigateToClubScreen = () => {
    goToClubScreen(clubId, navigation); // Pass the image URLs to the next screen
  };

  // scrolls to bottom of chat
  const scrollToBottom = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  // go to gif selection screen
  const handleGifSend = () => {
    // Example: Navigate to a new screen for selecting a GIF
    navigation.navigate("GifSelectionScreen", {
      chatName,
      clubId,
      clubName,
      clubImg,
      schoolKey,
      setGifUrl,
    });
    closeModal();
  };

  // send message
  const sendMessage = useCallback(async () => {
    // Clear the message input field, image URL, and gifUrl
    setMessageText("");
    setImageUrl(null);
    setTempImageUrl(null);
    setGifUrl(null); // Reset the gifUrl after sending the message
    setReplyingToMessage(null);

    scrollToBottom();

    // List of threat words
    const threatWords = ["bomb", "kill", "violence", "gun", "shoot"];

    // Check if there's either text, an image URL, or a gifUrl
    if (messageText.trim() != "" || tempImageUrl || gifUrl) {
      // Include gifUrl in the condition (figure out how tempImageUrl works)
      try {
        // Create the sender object
        const sender = {
          _id: userData.id,
          name: userData.userName,
          first: userData.firstName,
          last: userData.lastName,
        };
        if (userData.profileImg) {
          sender.avatar = userData.profileImg;
        }

        // clear invalid data types from replyTo message

        // Create the message object
        const message = {
          id: new Date().getTime().toString(),
          createdAt: new Date(),
          user: sender,
          likeCount: 0,
          pinned: false,
          likes: [],
          userId: userData.id,
        };
        if (messageText.trim() != "") {
          message.text = messageText.trim();
        }
        if (imageUrl) {
          message.image = imageUrl;
        }
        if (gifUrl) {
          message.gif = gifUrl;
        }

        if (replyingToMessage) {
          let newReplyingToMessage;
          newReplyingToMessage = {
            id: replyingToMessage.id,
            createdAt: replyingToMessage.createdAt,
            user: replyingToMessage.user,
            likeCount: replyingToMessage.likeCount,
            pinned: replyingToMessage.pinned,
            likes: replyingToMessage.likes,
          };
          if (replyingToMessage.text) {
            newReplyingToMessage.text = replyingToMessage.text;
          }
          if (replyingToMessage.image) {
            newReplyingToMessage.image = replyingToMessage.image;
          }
          if (replyingToMessage.gif) {
            newReplyingToMessage.gif = replyingToMessage.gif;
          }
          message.replyTo = newReplyingToMessage;
        }

        // Check for threat words
        const messageTextLower = messageText.trim().toLowerCase();
        const containsThreatWord = threatWords.some((threatWord) =>
          messageTextLower.includes(threatWord)
        );

        if (containsThreatWord) {
          // Add the message to the flaggedMessages collection in Firestore
          await addDoc(
            collection(firestore, "schools", schoolKey, "flaggedMessages"),
            { ...message, email: userData.email }
          );
        }
        // Add the message to Firestore
        await addDoc(
          collection(
            firestore,
            "schools",
            schoolKey,
            "chatData",
            "clubs",
            clubId,
            "chats",
            chatName
          ),
          message
        );

        // add message to club data
        if (chatName === "chat") {
          const clubRef = doc(
            firestore,
            "schools",
            schoolKey,
            "clubData",
            clubId
          );

          await updateDoc(clubRef, { mostRecentMessage: message });
        }

        // say "sent an image" if no text
        let notificationText = replyingToMessage ? "Replied to - " : "";
        if (replyingToMessage) {
          notificationText +=
            replyingToMessage.user.first +
            " " +
            replyingToMessage.user.last +
            ": ";
        }

        notificationText += messageText.trim();
        if (messageText.trim() === "") {
          if (imageUrl) {
            notificationText = "sent an image.";
          } else if (gifUrl) {
            notificationText = "sent a gif.";
          }
        }

        // do for all members in club (if not muted)
        const clubMembersCollection = collection(
          firestore,
          "schools",
          schoolKey,
          "clubMemberData",
          "clubs",
          clubId
        );
        const clubMembers = await getDocs(clubMembersCollection);

        let clubMembersArray = clubMembers.docs;
        // filter club members if admin chat
        if (chatName === "admin") {
          clubMembersArray = clubMembers.docs.filter(
            (member) =>
              member.data().privilege === "admin" ||
              member.data().privilege === "owner"
          );
        }

        // loop through all members in the club
        for (const member of clubMembersArray) {
          if (!member.data().muted && member.id !== userData.id) {
            if (member.data().expoPushToken) {
              // send the push notification
              sendChatNotification(
                member.data().expoPushToken,
                notificationText,
                userData.firstName,
                userData.lastName,
                clubName,
                clubId,
                chatName
              );
            }
          }

          // increment unread messages in club member's data
          const memberRef = doc(
            firestore,
            "schools",
            schoolKey,
            "clubMemberData",
            "clubs",
            clubId,
            member.id
          );
          const memberSnapshot = await getDoc(memberRef);
          const memberData = memberSnapshot.data();
          const unreadMessages = memberData.unreadMessages + 1;

          await updateDoc(memberRef, { unreadMessages });

          // clear unread messages if user is at the bottom
          clearUnreadMessages();
        }
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  }, [messageText, imageUrl, gifUrl]); // Include gifUrl in the dependency array

  // open and close keyboard
  const openKeyboard = () => {
    setKeyboardIsOpen(true);

    // set delay and then scroll to bottom
    setTimeout(() => {
      scrollToBottom();
    }, 10);
  };
  const closeKeyboard = () => {
    setKeyboardIsOpen(false);
  };

  // refresh messages
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setFetchLimit(fetchLimit + 20);

    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  // go to message search screen
  const goToMessageSearchScreen = () => {
    navigateToMessageSearchScreen(false);
  };

  // delete image preview
  const deleteImagePreview = () => {
    deleteImageFromStorage(imageUrl);

    setImageUrl(null);
    setTempImageUrl(null);
  };

  // render message
  const renderMessage = ({ item, index }) => {
    const isFirstMessageOfTheDay =
      index === 0 || !isSameDay(item.createdAt, messages[index - 1].createdAt);
    const isLikedByUser = likedMessages.has(item.id);

    // Create a reference to the message document
    const messageRef = doc(
      firestore,
      "schools",
      schoolKey,
      "chatData",
      "clubs",
      clubId,
      "chats",
      chatName,
      item.id
    );

    return (
      <ChatMessage
        message={item}
        isFirstMessageOfTheDay={isFirstMessageOfTheDay}
        likedMessages={likedMessages}
        isLikedByUser={isLikedByUser}
        setLikedMessages={setLikedMessages}
        currentUserPrivilege={currentUserPrivilege}
        //setLikedUsernames={setLikedUsernames}
        setLikedProfileImages={setLikedProfileImages}
        setIsLikesModalVisible={setIsLikesModalVisible}
        setReplyingToMessage={setReplyingToMessage}
        setOverlayUserData={setOverlayUserData}
        setOverlayVisible={setOverlayVisible}
        messageRef={messageRef}
        userId={userData.id}
        navigation={navigation}
      />
    );
  };

  // animate size of send button
  const sendButtonSize = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(sendButtonSize, {
      toValue: showSendButton ? 1 : 0,
      duration: 200,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, [showSendButton]);

  // send button style
  const sendButtonStyle = {
    transform: [
      {
        scale: sendButtonSize.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
        }),
      },
      {
        rotate: sendButtonSize.interpolate({
          inputRange: [0, 1],
          outputRange: ["-90deg", "0deg"],
        }),
      },
    ],
  };

  // update send button visibility
  useEffect(() => {
    if (messageText || tempImageUrl || gifUrl) {
      setShowSendButton(true);
    } else {
      setShowSendButton(false);
    }
  }, [messageText, tempImageUrl, gifUrl]);

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
      }}
      accessible={false}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Keyboard listener */}
        <KeyboardListener
          onWillShow={openKeyboard}
          onWillHide={closeKeyboard}
        />

        <View style={{ height: 39 }} />

        {/* Admin Chat */}
        {chatName === "admin" && (
          <View
            style={[styles.adminChatBanner, { backgroundColor: colors.red }]}
          >
            <Ionicons name="key" size={20} color={colors.white} />
            <CustomText
              style={[styles.pinnedMessagesText, { color: colors.white }]}
              text={`Admin Chat`}
            />
          </View>
        )}

        {/* Pinned Messages */}
        {pinnedMessageCount > 0 && (
          <TouchableOpacity
            style={[
              styles.pinnedMessagesContainer,
              { backgroundColor: colors.button },
            ]}
            onPress={() => navigateToMessageSearchScreen(true)}
          >
            <MaterialCommunityIcons name="pin" size={20} color={colors.white} />
            <CustomText
              style={[styles.pinnedMessagesText, { color: colors.white }]}
              text={`Pinned Messages: ${pinnedMessageCount}`}
            />
          </TouchableOpacity>
        )}

        {/* Scroll to bottom button */}
        {!isAtBottom && (
          <TouchableOpacity
            style={{
              position: "absolute", // Ensures it's positioned relative to the container.
              right: 20, // Adjust this value to ensure it's comfortably reachable.
              bottom: 100, // Adjust this so it's above your keyboard avoiding view or other lower components.
              backgroundColor: "rgba(255,255,255,0.7)",
              borderRadius: 25,
              padding: 10, // Increasing padding can help with touchability.
              zIndex: 1, // Only if necessary, to ensure it's above other components.
            }}
            onPress={scrollToBottom}
          >
            <Ionicons name="arrow-down" size={24} color="black" />
          </TouchableOpacity>
        )}

        {/* Show if no messages */}
        {messages.length === 0 && (
          <View
            style={{
              position: "absolute",
              left: Dimensions.get("window").width / 2 - 110,
              top: 360,
            }}
          >
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <Ionicons name="chatbubbles" size={100} color={colors.gray} />
              <CustomText
                text="Start chatting!"
                font="bold"
                style={{ fontSize: 20, color: colors.textLight }}
              />
              <CustomText
                text="Send a message to get started."
                style={{ fontSize: 16, color: colors.textLight }}
              />
            </View>
          </View>
        )}

        {/* Messages */}
        <GestureHandlerRootView style={{ flex: 1 }}>
          <FlatList
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ref={flatListRef}
            renderItem={renderMessage}
            keyExtractor={(item) => item._id}
            data={messages}
            onScroll={({ nativeEvent }) => {
              const isAtBottom = isCloseToBottom(nativeEvent);
              setIsAtBottom(isAtBottom);
            }}
            onTouchMove={Keyboard.dismiss}
            contentContainerStyle={{ justifyContent: "flex-end", flexGrow: 1 }}
          />
        </GestureHandlerRootView>

        {/* Likes Bottom Modal */}
        <LikesModal
          isVisible={isLikesModalVisible}
          onClose={() => setIsLikesModalVisible(false)}
          //userNames={likedUsernames} // This prop now contains ids instead of usernames
          profileImages={likedProfileImages}
        />

        {/* Toolbar */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View
            style={[
              styles.toolbar,
              {
                shadowColor: "black",
                shadowOffset: { width: 0, height: -3 },
                shadowOpacity: 0.1,
                borderTopWidth: 0,
                backgroundColor: colors.card,
              },
            ]}
          >
            {/* Reply Preview */}
            {replyingToMessage && (
              <ReplyPreview
                replyingToMessage={replyingToMessage}
                setReplyingToMessage={setReplyingToMessage}
              />
            )}

            <View style={styles.toolbarContent}>
              {/* Toolbar buttons */}
              <TouchableOpacity
                style={styles.toolbarButton}
                onPress={openModal}
              >
                <Ionicons
                  name="chevron-up-outline"
                  size={30}
                  color={colors.textLight}
                />
              </TouchableOpacity>

              {/* Modal for toolbar buttons*/}
              <BottomSheetModal
                isVisible={isModalVisible}
                onClose={closeModal}
                onUploadImage={() =>
                  handleImageUploadAndSend(
                    "chat",
                    setImageUrl,
                    closeModal,
                    setTempImageUrl
                  )
                }
                onUploadGif={() => handleGifSend(setGifUrl)}
                onOpenCamera={() =>
                  handleCameraPress(
                    "chat",
                    setImageUrl,
                    closeModal,
                    setTempImageUrl
                  )
                }
                onOpenDocument={() =>
                  handleDocumentUploadAndSend(
                    "chat",
                    setMessageText,
                    closeModal
                  )
                }
                setImage={setImageUrl}
                setTempImageUrl={setTempImageUrl}
                chatRef={collection(
                  firestore,
                  "schools",
                  schoolKey,
                  "chatData",
                  "clubs",
                  clubId,
                  "chats",
                  chatName
                )}
                clubMemberRef={collection(
                  firestore,
                  "schools",
                  schoolKey,
                  "clubMemberData",
                  "clubs",
                  clubId
                )}
                clearUnreadMessages={clearUnreadMessages}
                userData={userData}
                clubName={clubName}
              />

              {/* Container for TextInput and Image Preview */}
              <View
                style={[
                  styles.inputWithPreview,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.gray,
                  },
                ]}
              >
                {tempImageUrl && (
                  <View style={styles.imagePreviewContainer}>
                    <Image
                      source={{ uri: tempImageUrl }}
                      style={styles.imagePreview}
                    />
                    <TouchableOpacity
                      onPress={deleteImagePreview}
                      style={styles.removeImageButton}
                    >
                      <Ionicons name="close-circle" size={20} color="gray" />
                    </TouchableOpacity>
                  </View>
                )}

                {gifUrl && (
                  <View style={styles.imagePreviewContainer}>
                    <Image
                      source={{ uri: gifUrl }}
                      style={styles.imagePreview}
                    />
                    <TouchableOpacity
                      onPress={() => setGifUrl(null)}
                      style={styles.removeImageButton}
                    >
                      <Ionicons name="close-circle" size={20} color="gray" />
                    </TouchableOpacity>
                  </View>
                )}

                <TextInput
                  style={{ ...styles.input, color: colors.text }}
                  value={messageText}
                  onChangeText={setMessageText}
                  placeholder={
                    tempImageUrl
                      ? "Add a message or send."
                      : "Type a message..."
                  }
                  multiline={true}
                  maxHeight={120}
                  returnKeyType="done" // Prevents new lines
                  placeholderTextColor={colors.textLight}
                />
              </View>

              {/* Send Button */}
              <Animated.View
                style={{
                  ...sendButtonStyle,
                  opacity: sendButtonSize,
                }}
              >
                <TouchableOpacity
                  onPress={sendMessage}
                  style={styles.sendButton}
                >
                  <Ionicons
                    name="send"
                    size={24}
                    color={
                      tempImageUrl || gifUrl || messageText
                        ? colors.button
                        : colors.button
                    }
                  />
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>

          {/* add height if keyboard is not open */}
          <View
            style={{
              height: keyboardIsOpen ? 0 : 10,
              backgroundColor: colors.card,
            }}
          />
        </KeyboardAvoidingView>

        {/* Profile Overlay */}
        <ProfileOverlay
          visible={overlayVisible}
          setVisible={setOverlayVisible}
          userData={overlayUserData}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    paddingTop: 60,
  },
  headerIcon: {
    padding: 5,
    marginRight: 15,
  },
  toolbarButton: {
    paddingLeft: 5,
    backgroundColor: "transparent",
  },
  toolbar: {
    paddingHorizontal: 10,
    paddingTop: 15,
    paddingBottom: 15,
    borderTopWidth: 1,
  },
  toolbarContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  imagePreviewContainer: {
    alignItems: "center",
    justifyContent: "center",
    margin: 10,
    marginRight: 0,
  },
  inputWithPreview: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginLeft: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 8,
    marginLeft: -5,
    marginTop: 10,
    marginBottom: 5,
    paddingHorizontal: 20,
    height: "80%",
    width: "65%",
    textAlign: "left",
    // Adjust lineHeight for cursor height. Increase this value to make the cursor taller.
    lineHeight: 14,
    paddingBottom: 10,
    fontSize: 14,
  },
  sendButton: {
    padding: 10,
    borderRadius: 10,
    paddingRight: 15,
    marginLeft: 10,
  },
  imagePreview: {
    width: 50, // Adjust size as needed
    height: 50, // Adjust size as needed
    borderRadius: 15,
  },
  removeImageButton: {
    position: "absolute",
    right: 5,
    top: 5,
  },
  pinnedMessagesContainer: {
    marginTop: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingLeft: 10,
    height: 40,
    gap: 5,
  },
  pinnedMessagesText: {
    marginTop: 0,
    fontSize: 16,
    fontStyle: "italic",
    textAlignVertical: "center",
  },
  clubNameButton: {
    alignItems: "center",
    justifyContent: "center",
    marginRight: 20,
  },
  clubNameText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
  },
  clubNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
    marginLeft: 20,
    flex: 1,
    maxWidth: 160,
  },

  // admin chat banner
  adminChatBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingLeft: 10,
    height: 40,
    gap: 5,
  },
  adminChatBannerText: {
    color: "white",
  },
});
