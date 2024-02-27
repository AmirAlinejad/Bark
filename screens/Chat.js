import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Image, TextInput } from 'react-native';
import { GiftedChat, Send, Bubble, Message } from 'react-native-gifted-chat';
import {
  collection,
  addDoc,
  orderBy,
  query,
  onSnapshot,
  where,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { auth, firestore } from '../backend/FirebaseConfig';
import { IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { uploadImage } from '../components/imageUploadUtils'; // Import the utility function
import { Colors } from '../styles/Colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { KeyboardAvoidingView,ScrollView } from 'react-native';
import { Alert } from 'react-native';


export default function Chat({ route, navigation }) {
  const [messages, setMessages] = useState([]);
  const [likedMessages, setLikedMessages] = useState({});
  const [pinnedMessagesCount, setPinnedMessagesCount] = useState(0);
  
  const clubName = route?.params?.clubName;
  const onBackPress = () => {
    navigation.navigate("ClubScreen");
  }
  const toggleLike = async (messageId) => {
    // Check if the message is already liked by the current user
    const isLiked = !!likedMessages[messageId];
    
    // Update the local state of likedMessages immediately
    setLikedMessages((prevLikedMessages) => ({
      ...prevLikedMessages,
      [messageId]: !isLiked,
    }));
  
    // Update the like count locally
    setMessages((prevMessages) =>
      prevMessages.map((message) =>
        message._id === messageId
          ? {
              ...message,
              likeCount: isLiked ? message.likeCount - 1 : message.likeCount + 1,
            }
          : message
      )
    );
  
    // Perform the database operation
    const messageRef = doc(firestore, 'messagesLikes', auth.currentUser.uid, 'likes', messageId);
    const likedMessage = await getDoc(messageRef);
  
    if (likedMessage.exists()) {
      await deleteDoc(messageRef);
      updateMessageLikeCount(messageId, -1); // Decrement like count
    } else {
      await setDoc(messageRef, { liked: true });
      updateMessageLikeCount(messageId, 1); // Increment like count
    }
  };


  
// CustomInputToolbar component definition
function CustomInputToolbar({ onSend, handleImageUploadAndSend }) {
  const [messageText, setMessageText] = useState('');

  const sendTextMessage = useCallback(() => {
    if (messageText.trim()) {
      const message = {
        _id: Date.now().toString(),
        createdAt: new Date(),
        text: messageText,
        user: {
          _id: auth?.currentUser?.email,
          avatar: 'https://i.pravatar.cc/300',
        },
      };
      onSend([message]);
      setMessageText('');
    }
  }, [messageText, onSend]);

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.customToolbar}>
      <TouchableOpacity onPress={handleImageUploadAndSend} style={styles.toolbarButton}>
        <Ionicons name="image-outline" size={24} color={Colors.black} />
      </TouchableOpacity>
      <TextInput
        style={[styles.input, { maxHeight: 100 }]} // Add maxHeight here
        value={messageText}
        
        onChangeText={setMessageText}
        placeholder="Type a message..."
        multiline={true} maxHeight={70}
        returnKeyType="done" // Prevents new lines
      />
      <TouchableOpacity onPress={sendTextMessage} style={styles.toolbarButton}>
        <Ionicons name="send" size={24} color={Colors.black} />
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

// Function to get the count of pinned messages
const getPinnedMessagesCount = async () => {
  const q = query(collection(firestore, 'chats'), where('clubName', '==', clubName), where('pinned', '==', true));
  const querySnapshot = await getDocs(q);
  setPinnedMessagesCount(querySnapshot.size); // Update the count of pinned messages
}
const navigateToSearchPinnedMessages = () => {
  navigation.navigate('PinnedMessagesScreen', { clubName });
}
useEffect(() => {
  const unsubscribe = onSnapshot(query(collection(firestore, 'chats'), where('clubName', '==', clubName), where('pinned', '==', true)), () => {
    getPinnedMessagesCount(); // Update the count of pinned messages
  });
  
  return () => unsubscribe();
}, [clubName]);

//Displays the date above messages
const formatDate = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
};
//Null the automatic day rendering
const renderDay = (props) => {
  return null;

}
// Renders each chat message
const renderMessage = (props) => {
  const { currentMessage, previousMessage } = props;
  let isNewDay = false;
  if (currentMessage && previousMessage) {
    const currentDate = new Date(currentMessage.createdAt).toDateString();
    const prevDate = new Date(previousMessage.createdAt).toDateString();
    isNewDay = currentDate !== prevDate;
  }

  const isCurrentUser = currentMessage.user._id === auth?.currentUser?.email;

  // Adjusted style application to align usernames correctly
  const usernameAlignmentStyle = isCurrentUser ? styles.usernameRight : styles.usernameLeft;

  return (
    <TouchableOpacity
      onLongPress={() => togglePin(currentMessage._id)} // Add onLongPress handler
      activeOpacity={0.7} // Add some feedback when pressing
    >
      <View style={{ marginBottom: 5 }}>
        {isNewDay && (
          <Text style={styles.dateText}>
            {formatDate(new Date(currentMessage.createdAt))}
          </Text>
        )}

        <View style={{ flexDirection: 'row', justifyContent: isCurrentUser ? 'flex-end' : 'flex-start' }}>
          <Text style={[styles.usernameText, usernameAlignmentStyle]}>
            {isCurrentUser ? 'You' : currentMessage.user.name || currentMessage.user._id}
          </Text>
        </View>
        <Message {...props}
          containerStyle={{
            left: { backgroundColor: 'white' },
            right: { backgroundColor: 'white' },
          }} />
      </View>
    </TouchableOpacity>
  );
};

//uploads images
const handleImageUploadAndSend = () => {
  uploadImage((imageUri) => {
    const message = {
      _id: Date.now().toString(),
      createdAt: new Date(),
      user: {
        _id: auth?.currentUser?.email,
        avatar: 'https://i.pravatar.cc/300',
      },
      image: imageUri,
      text: '', // Ensure text is always defined
    };

    onSend([message]);
  });
};
//updates the like count
  const updateMessageLikeCount = async (messageId, increment) => {
    const messageRef = doc(firestore, 'chats', messageId);
    const messageSnapshot = await getDoc(messageRef);
    if (messageSnapshot.exists()) {
      const currentLikeCount = messageSnapshot.data().likeCount || 0;
      await updateDoc(messageRef, { likeCount: currentLikeCount + increment });
    }
  };

  useEffect(() => {
    const unsubscribeLikedMessages = onSnapshot(query(collection(firestore, 'messagesLikes', auth.currentUser.uid, 'likes')), (querySnapshot) => {
      const updatedLikedMessages = {};
      querySnapshot.forEach((doc) => {
        updatedLikedMessages[doc.id] = true;
      });
      setLikedMessages(updatedLikedMessages);
    });

    return () => unsubscribeLikedMessages();
  }, []);

  useLayoutEffect(() => {
    const q = query(collection(firestore, 'chats'), where('clubName', '==', clubName), orderBy('createdAt', 'desc'));
    const unsubscribeChatMessages = onSnapshot(q, (querySnapshot) => {
      const fetchedMessages = querySnapshot.docs.map((doc) => ({
        _id: doc.id,
        createdAt: doc.data().createdAt.toDate(),
        text: doc.data().text,
        user: doc.data().user,
        image: doc.data().image,
        likeCount: doc.data().likeCount || 0,
      }));
      setMessages(fetchedMessages);
    });

    return () => unsubscribeChatMessages();
  }, [clubName]);

  const onSend = useCallback((messages = []) => {
    setMessages((previousMessages) => GiftedChat.append(previousMessages, messages));
    messages.forEach((message) => {
      addDoc(collection(firestore, 'chats'), { ...message, clubName, likeCount: 0 });
    });
  }, [clubName]);
  const renderMessageImage = (props) => {
    const { currentMessage } = props;
    const isLiked = !!likedMessages[currentMessage._id];
    return (
      <View style={styles.messageImageContainer}>
        <TouchableOpacity onPress={() => onImagePress(props.currentMessage.image)}>
          <Image source={{ uri: props.currentMessage.image }} style={styles.messageImage} />
        </TouchableOpacity>
        
      </View>
    );
  };
  const onImagePress = (imageUri) => {
    navigation.navigate('ImageViewerScreen', { imageUri });
  };
  
  const renderBubble = (props) => {
    const { currentMessage } = props;
    const isLiked = !!likedMessages[currentMessage._id];
    const isPinned = currentMessage.pinned; // Check if the message is pinned
  
    const isCurrentUser = currentMessage.user._id === auth?.currentUser?.email;
  
    return (
      <Bubble
        {...props}
        wrapperStyle={styles.bubbleWrapperStyle(props)}
        textStyle={styles.bubbleTextStyle}
        timeTextStyle={styles.bubbleTimeTextStyle}
        onLongPress={() => togglePin(currentMessage._id)} // Add onLongPress handler
        renderCustomView={() => (
          <View style={[styles.likeButton, isCurrentUser ? styles.likeButtonCurrentUser : styles.likeButtonOtherUser]}>
            <TouchableOpacity
              onPress={() => toggleLike(currentMessage._id)}
              style={styles.likeButtonInner}
            >
              <MaterialCommunityIcons name={isLiked ? 'heart' : 'heart-outline'} size={24} color={isLiked ? 'red' : 'grey'} />
              <Text style={styles.likeCount}>{currentMessage.likeCount || 0}</Text>
            </TouchableOpacity>
            
          </View>
        )}
      />
    );
  };
  
  

  const togglePin = async (messageId) => {
    const messageRef = doc(firestore, 'chats', messageId);
    const messageSnapshot = await getDoc(messageRef);
    if (messageSnapshot.exists()) {
      const currentPinStatus = messageSnapshot.data().pinned || false;
      const confirmationMessage = currentPinStatus ? 'Unpin this message?' : 'Pin this message?'; // Confirmation message based on current pin status
  
      // Show confirmation dialog
      Alert.alert(
        'Confirmation',
        confirmationMessage,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: async () => {
              // Toggle pin status if user confirms
              await updateDoc(messageRef, { pinned: !currentPinStatus });
              // Update the local state to reflect the change
              setMessages((prevMessages) =>
                prevMessages.map((message) =>
                  message._id === messageId ? { ...message, pinned: !currentPinStatus } : message
                )
              );
            },
          },
        ],
        { cancelable: false }
      );
    }
  };
  

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton onPress={onBackPress} icon="arrow-left" size={30} />
        <TouchableOpacity style={styles.clubNameContainer} onPress={() => navigation.navigate("InClubView", { clubName })}>
          <View style={styles.imageContainer}>
            {/* Placeholder image */}
          </View>
          <Text style={styles.clubNameText}>{clubName}</Text>
        </TouchableOpacity>
        
        <IconButton icon="magnify" size={30} onPress={() => navigation.navigate("UserList", { clubName })} style={styles.searchButton} />
      </View>
      <TouchableOpacity style={styles.pinnedMessagesContainer} onPress={navigateToSearchPinnedMessages}>
          {pinnedMessagesCount > 0 && <View style={styles.blueBar}></View>}
          <Text style={styles.pinnedMessagesText}>{pinnedMessagesCount} Pinned Messages</Text>
        </TouchableOpacity>
      <GiftedChat
        messages={messages}
        onSend={messages => onSend(messages)}
        user={{ _id: auth?.currentUser?.email, avatar: 'https://i.pravatar.cc/300' }}
        renderBubble={renderBubble}
        renderMessageImage={renderMessageImage}
        renderInputToolbar={props => <CustomInputToolbar {...props} onSend={onSend} handleImageUploadAndSend={handleImageUploadAndSend} />}
        messagesContainerStyle={styles.messagesContainer}
        textInputStyle={styles.textInput}
        renderMessage={renderMessage}
        renderDay={renderDay}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    paddingHorizontal: 10,
    
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
  searchButton: {
    marginLeft: 'auto',
    marginRight: 10,
  },
  customToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ccc',
    marginTop: -50,
    
    
  },
  input: {
    flex: 1,
    minHeight: 30,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 10,
    marginHorizontal: 5,
    backgroundColor: 'white',
  },
  toolbarButton: {
    padding: 5,
    marginLeft: 4,
    marginRight: 4,
  },
  pinnedMessagesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10, // Add some right margin for spacing
  },
 
  pinnedMessagesText: {
    color: 'blue',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  bubbleWrapperStyle: ({ position }) => ({
    right: position === 'right' ? {
      backgroundColor: 'white',
      marginRight: 0,
      flex: 1,
      minHeight: 40,
    } : {},
    left: position === 'left' ? {
      backgroundColor: "white",
      marginLeft: 0,
      flex: 1,
      minHeight: 40,
    } : {},
  }),
  bubbleTextStyle: {
    right: { color: 'black' },
    left: { color: 'black' },
  },
  bubbleTimeTextStyle: {
    right: { color: 'black' },
    left: { color: 'black' },
  },
  likeButtonImage: {
    position: 'absolute',
    right: 100,
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  likeButton: {
    position: 'absolute',
    right: 300,
    bottom: 10,
  },

  likeButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCount: { marginLeft: 5 },
 
  messagesContainer: {
    backgroundColor: 'white',
    width: '100%',
    paddingBottom: 35,
  },
  textInput: {
    backgroundColor: '#f2f2f2',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ccc',
    color: '#333',
    padding: 10,
    fontSize: 16,
  },
  usernameText: {
    fontSize: 12,
    paddingHorizontal: 5,
    paddingTop: 2,
    paddingBottom: 2,
    // Common style for username text
  },
  usernameRight: {
    // Specific style for the current user's username
    alignSelf: 'flex-end',
    color: 'gray', // Example color
  },
  usernameLeft: {
    // Specific style for other users' usernames
    alignSelf: 'flex-start',
    color: 'gray', // Example color
  },
  dateText: {
    alignSelf: 'center',
    fontSize: 14,
    color: '#666',
    paddingVertical: 8,
  },
  messageImageContainer: {
    position: 'relative',
    padding: 10,
    flexDirection: 'column',
    alignItems: 'flex-start', // Align items to the start to keep the image and button aligned
  },
 
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 13, // Optional: for styled image edges
  },
  likeButtonCurrentUser: {
    position: 'absolute',
    right: 325, // Adjust the left position as needed
    bottom: 10,
  },
  likeButtonOtherUser: {
    position: 'fixed',
    right: -275, // Adjust the right position as needed
    bottom: -20,
  },
  clubNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
  },
  imageContainer: {
    width: 30,
    height: 30,
    borderRadius: 5,
    overflow: 'hidden',
    marginRight: 10,
    backgroundColor: 'lightgray', // Placeholder background color
  },
});
