import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TouchableOpacity, View, Text, TextInput, FlatList, StyleSheet, Dimensions, KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback, Platform } from 'react-native';
// keyboard listener
import KeyboardListener from 'react-native-keyboard-listener';
// firebase
import { collection, addDoc, orderBy, query, onSnapshot, where, getDocs } from 'firebase/firestore';
import { ref, get, set } from 'firebase/database';
import { auth, firestore, db } from '../../backend/FirebaseConfig';
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
import { checkMembership, fetchMessages, handleCameraPress, handleImageUploadAndSend, emailSplit } from '../../functions/backendFunctions';
import { deleteImageFromStorage } from '../../functions/chatFunctions';
import { isSameDay } from '../../functions/timeFunctions';
import { goToClubScreen } from '../../functions/navigationFunctions';

async function sendPushNotification(expoPushToken, message, firstName, lastName, clubName) {
  const text = message ? message : "An image was sent.";

  const notification = {
    to: expoPushToken,
    sound: 'default',
    title: clubName,
    body: `${firstName} ${lastName}: ${message}`,
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

  // Define states for message text, messages, image URL, and pinned message count
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState([]);
  const [imageUrl, setImageUrl] = useState(null); // Define imageUrl state
  const [tempImageUrl, setTempImageUrl] = useState(null); // Define tempImageUrl state
  const [pinnedMessageCount, setPinnedMessageCount] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(true); // Initially assume the user is at the bottom
  const [likedMessages, setLikedMessages] = useState(new Set());
  const [gifUrl, setGifUrl] = useState(null); 

  // Define states for the liked messages modal
  const [isLikesModalVisible, setIsLikesModalVisible] = useState(false);
  const [likedUsernames, setLikedUsernames] = useState(new Set()); // user ids instead of usernames

  // replying state
  const [replyingToMessage, setReplyingToMessage] = useState(null);

  // user state
  const [currentUserPrivilege, setCurrentUserPrivilege] = useState(''); // Define currentUserPrivilege state

  // overlay state
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayUserData, setOverlayUserData] = useState(null);

  const chatName = "admin";
  const screenName = "Admin";
  const clubId = route?.params?.id;
  const clubName = route?.params?.name;
  const clubImg = route?.params?.img;
  
  const flatListRef = useRef(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Define functions to handle modal open and close0
  const openModal = () => {
    setIsModalVisible(true);
  };
  
  // Define function to close the modal
  const closeModal = () => {
    setIsModalVisible(false);
  };
  
  // Fetch messages on initial render
  useEffect(() => {  
    // Fetching messages in descending order to suit the inverted list.
    const messagesQuery = query(collection(firestore, 'admin'), where('clubId', '==', clubId), orderBy('createdAt', 'desc')); // called clubName instead of clubId
  
    const unsubscribe = onSnapshot(messagesQuery, querySnapshot => {

      fetchMessages(querySnapshot, setMessages, setPinnedMessageCount);
      
    }, error => {
      console.error("Error fetching messages: ", error);
    });

    // Check the user's membership status
    checkMembership(clubId, setCurrentUserPrivilege, clubId);

    // clear unread messages
    const unreadRef = ref(db, `${emailSplit()}/users/${auth.currentUser.uid}/clubs/${clubId}/unreadMessages`);
    set(unreadRef, 0);
  
    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, []);
  
  // Fetch liked messages on initial render after messages are fetched
  useEffect(() => {
    // Function to fetch liked messages and update the local state
    const fetchLikedMessages = async () => {
      const userId = auth.currentUser.uid;
      const messagesRef = collection(firestore, 'admin');
      const q = query(messagesRef, where('likes', 'array-contains', userId));

      const querySnapshot = await getDocs(q);
      const likedMsgs = new Set();
      querySnapshot.forEach((doc) => {
        likedMsgs.add(doc.id);
      });
      setLikedMessages(likedMsgs);
    };

    fetchLikedMessages();
  }, [messages]); 

  // Use the route params to set the selected GIF URL
  useEffect(() => {
    const { selectedGifUrl } = route.params;
    if (selectedGifUrl) {
      setGifUrl(selectedGifUrl); // Set the selected GIF URL for sending
      // Clear the selectedGifUrl from params after setting
      navigation.setParams({ selectedGifUrl: undefined });
    }
  }, [route.params]);
  
  // Function to navigate to the message search screen
  const navigateToMessageSearchScreen = (pin) => {
    navigation.navigate('MessageSearchScreen', { clubId, chatName: 'admin', pin });
  };
  
  const renderMessage = ({ item, index }) => {
    const isLastMessageOfTheDay = index === messages.length - 1 || !isSameDay(item.createdAt, messages[index + 1]?.createdAt);
    const isLikedByUser = likedMessages.has(item._id);

    return (
      
      <ChatMessage 
        item={item} 
        chatType='admin'
        isLastMessageOfTheDay={isLastMessageOfTheDay} 
        isLikedByUser={isLikedByUser} 
        likedMessages={likedMessages}
        setLikedMessages={setLikedMessages} 
        currentUserPrivilege={currentUserPrivilege}
        setLikedUsernames={setLikedUsernames}
        setIsLikesModalVisible={setIsLikesModalVisible}
        setReplyingToMessage={setReplyingToMessage}
        setOverlayUserData={setOverlayUserData}
        setOverlayVisible={setOverlayVisible}
        navigation={navigation}
      />
    );
  };

  const isCloseToTop = ({ contentOffset }) => {
    const paddingTop = 20; // Distance from the top to consider "at the top"
    return contentOffset.y <= paddingTop;
  };
    
  const navigateToInClubView = () => {
    goToClubScreen(route.params.club, navigation); // Pass the image URLs to the next screen
  };
  
  const scrollToTop = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  };
  
  const handleTextInputFocus = () => {
    if (flatListRef.current) {
      scrollToTop();
    }
  };
  
  const handleGifSend = () => {
    // Example: Navigate to a new screen for selecting a GIF
    navigation.navigate('GifSelectionScreen', {clubId, clubName, screenName});
    closeModal();
  };
  

  const sendMessage = useCallback(async () => {
    setMessageText('');
    setImageUrl(null);
    setTempImageUrl(null);
    setGifUrl(null);
    const userId = auth.currentUser.uid;

    // Adjust the reference path to include `userName` at the end
    const userRef = ref(db, `${emailSplit()}/users/${userId}`);
    const userSnapshot = await get(userRef);
    // Since you're now directly accessing the userName, you can directly use `.val()` to get the userName value
    const userData = userSnapshot.val();
    const userName = userData.userName;
    const firstName = userData.firstName;
    const lastName = userData.lastName;

    // Check if there's either text, an image URL, or a gifUrl
    if (messageText.trim() || tempImageUrl || gifUrl) {
      try {
        const message = {
          id: Date.now().toString(),
          createdAt: new Date(),
          text: messageText.trim(),
          user: {
            _id: auth.currentUser.uid,
            name: userName,
            avatar: userData.profileImg,
            first: firstName,
            last: lastName,
          },
          likeCount: 0,
          pinned: false,
          image: imageUrl,
          gifUrl: gifUrl, // Add the gifUrl to the message
          likes: [],
          userId: auth.currentUser.uid,
          replyTo: replyingToMessage,
        };

        // Add the message to Firestore
        await addDoc(collection(firestore, 'admin'), {
          ...message,
          clubId: clubId,
        });

        // say "sent an image" if no text
        if (message.text === '') {
          if (imageUrl) {
            message.text = 'sent an image.';
          } else if (gifUrl) {
            message.text = 'sent a gif.';
          }
        }

        // do for all members in club (if not muted)
        const clubMembersRef = ref(db, `${emailSplit()}/clubs/${clubId}/clubMembers`);
        const clubMembersSnapshot = await get(clubMembersRef);
        const clubMembers = clubMembersSnapshot.val();
        for (const member in clubMembers) {
          if (!clubMembers[member].muted && clubMembers[member].privilege !== 'member' && member !== auth.currentUser.uid) {
            const memberRef = ref(db, `${emailSplit()}/users/${member}`);
            const memberSnapshot = await get(memberRef);
            const memberData = memberSnapshot.val();
            sendPushNotification(memberData.expoPushToken, messageText, userData.firstName, userData.lastName, clubName);
          }

        }

        // set most recent message in club to current time
        const clubRef = ref(db, `${emailSplit()}/clubs/${clubId}/mostRecentMessage`);
        set(clubRef, Date.now());

        // Clear the message input field, image URL, and gifUrl
        setImageUrl(null);
        setTempImageUrl(null);
        setGifUrl(null); // Reset the gifUrl after sending the message
        setReplyingToMessage(null);

      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  }, [messageText, imageUrl, gifUrl]); // Include gifUrl in the dependency array

  const openKeyboard = () => {
    setKeyboardIsOpen(true);
  }

  const closeKeyboard = () => {
    setKeyboardIsOpen(false);
  }
  
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>

        {/* Keyboard listener */}
        <KeyboardListener
          onWillShow={openKeyboard}
          onWillHide={closeKeyboard}
        />

        <TouchableOpacity onPress={navigateToInClubView}>
          <Header text={clubName} navigation={navigation} back useClubImg clubImg={clubImg} onTextPress={() => navigation.goBack()}/>
        </TouchableOpacity>

        <IconButton icon="search" text="" onPress={() => navigateToMessageSearchScreen(false)} style={styles.searchButton} />
        <View style={{ height: 15}} />

        {/* Admin View */}
        <View style={styles.adminView}>
          <Ionicons name="shield-checkmark" size={24} color={Colors.white} />
          <CustomText style={styles.adminViewText} text="Admin View" font='bold' />
        </View>

        {/* Pinned Messages */}
        {pinnedMessageCount > 0 && (
        <TouchableOpacity style={styles.pinnedMessagesContainer} onPress={() => navigateToMessageSearchScreen(true)}>
          <MaterialCommunityIcons name="pin" size={20} color={Colors.darkGray} />
          <CustomText style={styles.pinnedMessagesText} text={`Pinned Messages: ${pinnedMessageCount}`} />
        </TouchableOpacity>)}

        {/* Scroll to top button */}
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
          onPress={scrollToTop}
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
          ref={flatListRef}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id}
          inverted
          data={messages} 
          onScroll={({nativeEvent}) => {
            const isAtBottom = isCloseToTop(nativeEvent);
            setIsAtBottom(isAtBottom);
          }}
        />

        {/* Likes Bottom Modal */}
        <LikesModal
          isVisible={isLikesModalVisible}
          onClose={() => setIsLikesModalVisible(false)}
          userIDs={likedUsernames} // This prop now contains userids instead of usernames
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
              <BottomSheetModal
                isVisible={isModalVisible}
                onClose={closeModal}
                onUploadImage={() => handleImageUploadAndSend("admin", setImageUrl, closeModal, setTempImageUrl)}
                onUploadGif={handleGifSend}
                onOpenCamera={() => handleCameraPress(setImageUrl, closeModal, setTempImageUrl)}
              />

              {/* Container for TextInput and Image Preview */}
              <View style={styles.inputWithPreview}>
                {tempImageUrl && (
                  <View style={styles.imagePreviewContainer}>
                    <Image source={{ uri: tempImageUrl }} style={styles.imagePreview} />
                    <TouchableOpacity onPress={() => {
                        deleteImageFromStorage(imageUrl);

                        setImageUrl(null)
                        setTempImageUrl(null);
                      }} style={styles.removeImageButton}
                    >
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
                  onFocus={handleTextInputFocus} // Add this line
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
    marginTop: 8,
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
    paddingBottom: 8,
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
  adminView: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.red,
    padding: 8,
    flexDirection: 'row',
    gap: 10,
  },
  adminViewText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
    color: Colors.white,
  },

  // absolute button
  searchButton: {
    position: 'absolute',
    top: 65,
    right: 20,
  },
});