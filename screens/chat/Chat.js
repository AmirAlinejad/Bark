import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TouchableOpacity, View, Text, TextInput, FlatList, StyleSheet, KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback, Platform, Dimensions, RefreshControl } from 'react-native';
// keyboard listener
import KeyboardListener from 'react-native-keyboard-listener';
// firebase
import { collection, addDoc, orderBy, query, onSnapshot, where, getDocs, getDoc, setDoc, updateDoc, limit, doc } from 'firebase/firestore';
import { auth, firestore } from '../../backend/FirebaseConfig';
// icons
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Ionicons from 'react-native-vector-icons/Ionicons';
// styles
import { Colors } from '../../styles/Colors';
// image
import { Image } from 'expo-image';
// my components
import BottomSheetModal from '../../components/chat/BottomSheetModal';
import ChatMessage from '../../components/chat/ChatMessage';
import LikesModal from '../../components/chat/LikesModal';
import Header from '../../components/display/Header';
import ProfileOverlay from '../../components/overlays/ProfileOverlay';
import CustomText from '../../components/display/CustomText';
import ReplyPreview from '../../components/chat/ReplyPreview';
import IconButton from '../../components/buttons/IconButton';
// functions
import { checkMembership, fetchMessages, handleCameraPress, handleImageUploadAndSend, emailSplit, getSetUserData } from '../../functions/backendFunctions';
import { deleteImageFromStorage } from '../../functions/chatFunctions';
import { isSameDay } from '../../functions/timeFunctions';
import { goToClubScreen } from '../../functions/navigationFunctions';

async function sendPushNotification(expoPushToken, message, firstName, lastName, clubName) {
  const text = message ? message : "An image was sent.";

  const notification = {
    to: expoPushToken,
    sound: 'default',
    title: clubName,
    body: `${firstName} ${lastName}: ${text}`,
    data: { someData: 'goes here' },
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(notification),
  });
}

export default function Chat({ route, navigation }) {

  // keyboard state
  const [keyboardIsOpen, setKeyboardIsOpen] = useState(false);

  // Define state for refreshing the messages
  const [fetchLimit, setFetchLimit] = useState(20);
  const [refreshing, setRefreshing] = useState(false);

  console.log(route.params)

  // Define states for message text, messages, image URL, and pinned message count
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState([]);
  const [imageUrl, setImageUrl] = useState(null); // Define imageUrl state
  const [tempImageUrl, setTempImageUrl] = useState(null); // Define tempImageUrl state
  const [pinnedMessageCount, setPinnedMessageCount] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(true); // Initially assume the user is at the bottom
  const [likedMessages, setLikedMessages] = useState(new Set());
  const [gifUrl, setGifUrl] = useState(null); // Define gifUrl state

  // Define states for the liked messages modal
  const [isLikesModalVisible, setIsLikesModalVisible] = useState(false);
  //const [likedUsernames, setLikedUsernames] = useState(new Set()); // user ids instead of usernames
  const [likedProfileImages, setLikedProfileImages] = useState(new Set());

  // replying state
  const [replyingToMessage, setReplyingToMessage] = useState(null);

  // user state
  const userId = auth.currentUser.uid;
  const [userData, setUserData] = useState(null);
  const [currentUserPrivilege, setCurrentUserPrivilege] = useState(''); // Define currentUserPrivilege state

  // overlay state
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayUserData, setOverlayUserData] = useState(null);

  const chatName = route?.params?.chatName || 'chat';
  const clubId = route?.params?.id;
  const clubName = route?.params?.name;
  const clubImg = route?.params?.img;
  const schoolKey = route?.params?.schoolKey;
  
  const flatListRef = useRef(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Define functions to handle modal open and close0
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
    const messagesQuery = query(collection(firestore, 'schools', schoolKey, 'chatData', 'clubs', clubId, 'chats', chatName), orderBy('createdAt', 'desc'), limit(fetchLimit));
  
    const unsubscribe = onSnapshot(messagesQuery, querySnapshot => {

      fetchMessages(querySnapshot, setMessages, setPinnedMessageCount);
      
    }, error => {
      console.error("Error fetching messages: ", error);
    });

    // Get the user data from AsyncStorage
    getSetUserData(setUserData);

    // Check the user's membership status
    checkMembership(clubId, setCurrentUserPrivilege);
  
    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, [fetchLimit]);

  // clear unread messages once user data is fetched
  useEffect(() => {
    if (userData) {
      const clubMemberRef = doc(firestore, 'schools', schoolKey, 'clubMemberData', 'clubs', clubId, userId);
      updateDoc(clubMemberRef, { unreadMessages: 0 });
    }
  }, [userData]);
  
  // Fetch liked messages on initial render after messages are fetched and scroll to bottom
  useEffect(() => {
    // Function to fetch liked messages and update the local state
    const fetchLikedMessages = async () => {
      const userId = auth.currentUser.uid;
      const messagesRef = collection(firestore, 'schools', schoolKey, 'chatData', 'clubs', clubId, 'chats', chatName);
      const q = query(messagesRef, where('likes', 'array-contains', userId));

      const querySnapshot = await getDocs(q);
      const likedMsgs = new Set();
      querySnapshot.forEach((doc) => {
        likedMsgs.add(doc.id);
      });
      setLikedMessages(likedMsgs);
    };

    fetchLikedMessages();

    setTimeout(() => {
      // scroll to bottom unanimated
      flatListRef.current.scrollToEnd({ animated: false });
    }, 500);

  }, [messages]); 

  // Use the route params to set the selected GIF URL
  useEffect(() => {
    setGifUrl(route.params.gif);
  }, [route.params]);
  
  // Function to navigate to the message search screen
  const navigateToMessageSearchScreen = (pin) => {
    navigation.navigate('MessageSearchScreen', { clubId, chatName, pin, schoolKey });
  };

  // checks id user is not at the bottom of the chat
  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
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
    navigation.navigate('GifSelectionScreen', {chatName, clubId, clubName, clubImg, schoolKey, setGifUrl});
    closeModal();
  };

  // send message
  const sendMessage = useCallback(async () => {

    // Clear the message input field, image URL, and gifUrl
    setMessageText('');
    setImageUrl(null);
    setTempImageUrl(null);
    setGifUrl(null); // Reset the gifUrl after sending the message
    setReplyingToMessage(null);

    // Check if there's either text, an image URL, or a gifUrl
    if (messageText.trim() != '' || tempImageUrl || gifUrl) { // Include gifUrl in the condition (figure out how tempImageUrl works)
      try {
        // Create the sender object
        const sender = {
          _id: auth.currentUser.uid,
          name: userData.userName,
          first:  userData.firstName,
          last: userData.lastName,
        };
        if (userData.profileImg) {
          sender.avatar = userData.profileImg;
        }

        // Create the message object
        const message = {
          id: new Date().getTime().toString(),
          createdAt: new Date(),
          user: sender,
          likeCount: 0,
          pinned: false,
          likes: [],
          userId: auth.currentUser.uid,
          replyTo: replyingToMessage,
        };
        if (messageText.trim() != '') {
          message.text = messageText.trim();
        }
        if (imageUrl) {
          message.image = imageUrl;
        }
        if (gifUrl) {
          message.gif = gifUrl;
        }

        // Add the message to Firestore
        await addDoc(collection(firestore, 'schools', schoolKey, 'chatData', 'clubs', clubId, 'chats', chatName), message);

        // say "sent an image" if no text
        let notificationText = messageText.trim();
        if (messageText.trim() === '') {
          if (imageUrl) {
            notificationText = 'sent an image.';
          } else if (gifUrl) {
            notificationText = 'sent a gif.';
          }
        }

        // do for all members in club (if not muted)
        const clubMembersCollection = collection(firestore, 'schools', schoolKey, 'clubMemberData', 'clubs', clubId);
        const clubMembers = await getDocs(clubMembersCollection);
        // loop through all members in the club
        for (const member of clubMembers.docs) {
          /*if (!member.data().muted && member.id !== auth.currentUser.uid) {
            // get the member's data
            const memberData = await getDoc(doc(firestore, 'schools', schoolKey, 'chatData', 'clubs', clubId, 'members', member.id));
            const memberDataVal = memberData.data();
            // send the push notification
            sendPushNotification(memberDataVal.expoPushToken, notificationText, userData.firstName, userData.lastName, clubName);
          }*/

          // increment unread messages in club member's data
          const memberRef = doc(firestore, 'schools', schoolKey, 'clubMemberData', 'clubs', clubId, member.id);
          const memberSnapshot = await getDoc(memberRef);
          const memberData = memberSnapshot.data();
          const unreadMessages = memberData.unreadMessages + 1;

          await updateDoc(memberRef, { unreadMessages });
        }

      } catch (error) {
        console.error('Error sending message:', error);
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
  }
  const closeKeyboard = () => {
    setKeyboardIsOpen(false);
  }

  // refresh messages
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setFetchLimit(fetchLimit + 20);

    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  // go to home screen and clear unread messages
  const goToHomeScreen = () => {
    navigation.navigate("HomeScreen");

    // Clear unread messages
    const clubMemberRef = doc(firestore, 'schools', schoolKey, 'clubMemberData', 'clubs', clubId, userId);
    updateDoc(clubMemberRef, { unreadMessages: 0 });
  }
  
  // go to message search screen
  const goToMessageSearchScreen = () => {
    navigateToMessageSearchScreen(false);
  }

  // delete image preview
  const deleteImagePreview = () => () => {
    deleteImageFromStorage(imageUrl);

    setImageUrl(null)
    setTempImageUrl(null);
  }

  // render message
  const renderMessage = ({ item, index }) => {
    const isFirstMessageOfTheDay = index === 0 || !isSameDay(item.createdAt, messages[index - 1].createdAt);
    const isLikedByUser = likedMessages.has(item.id);

    // Create a reference to the message document
    const messageRef = doc(firestore, 'schools', schoolKey, 'chatData', 'clubs', clubId, 'chats', chatName, item.id);

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
        navigation={navigation}
      />
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>

        {/* Keyboard listener */}
        <KeyboardListener
          onWillShow={openKeyboard}
          onWillHide={closeKeyboard}
        />

        <Header text={clubName} navigation={navigation} back onBack={goToHomeScreen} useClubImg clubImg={clubImg} onTextPress={navigateToClubScreen} />

        <IconButton icon="search" text="" onPress={goToMessageSearchScreen} style={styles.searchButton} />
        <View style={{ height: 15}} />

        {/* Pinned Messages */}
        {pinnedMessageCount > 0 && (
        <TouchableOpacity style={styles.pinnedMessagesContainer} onPress={goToMessageSearchScreen}>
          <MaterialCommunityIcons name="pin" size={20} color={Colors.darkGray} />
          <CustomText style={styles.pinnedMessagesText} text={`Pinned Messages: ${pinnedMessageCount}`} />
        </TouchableOpacity>)}

        {/* Scroll to bottom button */}
        {!isAtBottom && (
          <TouchableOpacity
            style={{
            position: 'absolute', // Ensures it's positioned relative to the container.
            right: 20, // Adjust this value to ensure it's comfortably reachable.
            bottom: 100, // Adjust this so it's above your keyboard avoiding view or other lower components.
            backgroundColor: 'rgba(255,255,255,0.7)',
            borderRadius: 25,
            padding: 10, // Increasing padding can help with touchability.
            zIndex: 1, // Only if necessary, to ensure it's above other components.
          }}
          onPress={scrollToBottom}
        >
          <Ionicons name="arrow-down" size={24} color="black" />
        </TouchableOpacity>)}

        {/* Show if no messages */}
        {messages.length === 0 && (
          <View style={{ position: 'absolute', left: Dimensions.get('window').width/2 - 75, top: 350 }}>
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
              <Ionicons name="chatbubbles" size={100} color={Colors.gray} />
              <CustomText text="Start chatting!" font='bold' style={{ fontSize: 20, color: Colors.darkGray }} />
            </View>
          </View>
        )}
      
        {/* Messages */}
        <FlatList
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          ref={flatListRef}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id}
          data={messages} 
          onScroll={({nativeEvent}) => {
            const isAtBottom = isCloseToBottom(nativeEvent);
            setIsAtBottom(isAtBottom);
          }}
          contentContainerStyle={{justifyContent: 'flex-end', flexGrow: 1}}
        />

        {/* Likes Bottom Modal */}
        <LikesModal
          isVisible={isLikesModalVisible}
          onClose={() => setIsLikesModalVisible(false)}
          //userNames={likedUsernames} // This prop now contains userids instead of usernames
          profileImages={likedProfileImages}
        />
      
        {/* Toolbar */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

          <View style={styles.toolbar}>
            
            {/* Reply Preview */}
            {replyingToMessage && (
              <ReplyPreview 
                replyingToMessage={replyingToMessage} 
                setReplyingToMessage={setReplyingToMessage}
              />
            )}

            <View style={styles.toolbarContent}>
              {/* Toolbar buttons */}
              <TouchableOpacity style={styles.toolbarButton} onPress={openModal}>
                <Ionicons name='add' size={30} color={Colors.darkGray} />
              </TouchableOpacity>

              {/* Modal for toolbar buttons*/}
              <BottomSheetModal
                isVisible={isModalVisible}
                onClose={closeModal}
                onUploadImage={() => handleImageUploadAndSend("chat", setImageUrl, closeModal, setTempImageUrl)}
                onUploadGif={() => handleGifSend(setGifUrl)}
                onOpenCamera={() => handleCameraPress(setImageUrl, closeModal, setTempImageUrl)}
              />

              {/* Container for TextInput and Image Preview */}
              <View style={styles.inputWithPreview}>
                {tempImageUrl && (
                  <View style={styles.imagePreviewContainer}>
                    <Image source={{ uri: tempImageUrl }} style={styles.imagePreview} />
                    <TouchableOpacity onPress={deleteImagePreview} style={styles.removeImageButton}  >
                      <Ionicons name="close-circle" size={20} color="gray" />
                    </TouchableOpacity>
                  </View>
                )}

                {gifUrl && (<View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: gifUrl }} style={styles.imagePreview} />
                  <TouchableOpacity onPress={() => setGifUrl(null)} style={styles.removeImageButton}>
                    <Ionicons name="close-circle" size={20} color="gray" />
                  </TouchableOpacity>
                </View>)}

                <TextInput
                  style={styles.input}
                  value={messageText}
                  onChangeText={setMessageText}
                  placeholder={tempImageUrl ? "Add a message or send." : "Type a message..."}
                  multiline={true}
                  maxHeight={120}
                  returnKeyType="done" // Prevents new lines
                  placeholderTextColor="#888888"
                />
              </View>

              {/* Send Button */}
              <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
                <Ionicons name="send" size={24} color={tempImageUrl || gifUrl || messageText ? Colors.buttonBlue : Colors.gray} />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* add height if keyboard is not open */}
          <View style={{ height: keyboardIsOpen ? 0 : 10, backgroundColor: Colors.white }} />
        </KeyboardAvoidingView>

        {/* Profile Overlay */}
        <ProfileOverlay
          visible={overlayVisible}
          setVisible={() => setOverlayVisible(false)}
          userData={overlayUserData}
        />
      
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: Colors.lightGray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
    paddingHorizontal: 10,
    justifyContent: 'space-between',
    marginBottom: 10,
    width: '100%',
  },
  headerIcon: {
    padding: 5,
    marginRight: 15,
  },
  toolbarButton: {
    paddingLeft: 5,
    backgroundColor: 'transparent',
  },
  toolbar: {
    paddingHorizontal: 10,
    paddingTop: 15,
    paddingBottom: 15,
    borderTopWidth: 1,
    borderTopColor: Colors.inputBorder,
    backgroundColor: Colors.white,
  },
  toolbarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  imagePreviewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
    marginRight: 0,
  },
  inputWithPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
    backgroundColor: Colors.lightGray,
    borderRadius: 20,
  },
  input: {
    flex: 1,
    borderRadius: 10,
    marginLeft: -5,
    marginTop: 10,
    marginBottom: 5,
    paddingHorizontal: 20,
    height: '80%',
    width: '65%',
    textAlign: 'left',
    // Adjust lineHeight for cursor height. Increase this value to make the cursor taller.
    lineHeight: 14, 
    paddingBottom: 10,
    fontSize: 14,
  },
  sendButton: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingRight: 15,
    marginLeft: 10,
  },
  sendButtonText: {
    color: Colors.white,
  },
  imagePreview: {
    width: 50, // Adjust size as needed
    height: 50, // Adjust size as needed
    borderRadius: 15,
  },
  removeImageButton: {
    position: 'absolute',
    right: 5,
    top: 5,
  },
  pinnedMessagesContainer: {
    flexDirection: 'row',
    paddingLeft: 10,
    borderBottomWidth: 1,
    gap: 5,
    borderBottomColor: Colors.inputBorder,
  },
  pinnedMessagesText: {
    color: 'gray',
    marginTop: 0,
    fontSize: 16,
    textAlign: 'left',
    fontStyle: 'italic',
    paddingBottom: 10,
  },
  clubNameButton: {
    padding: 10,
    borderRadius: 5,
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clubNameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
  clubNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
  },

  // absolute button
  searchButton: {
    position: 'absolute',
    top: 65,
    right: 20,
  },
});