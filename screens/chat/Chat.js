import React, { useState, useEffect, useCallback } from 'react';
import { TouchableOpacity, View, Text, Image, TextInput } from 'react-native';
import { GiftedChat,  Bubble, Time, Avatar } from 'react-native-gifted-chat';
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
  startAfter,
  limit,
  runTransaction
} from 'firebase/firestore';
import { auth, firestore } from '../../backend/FirebaseConfig';
import { IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { uploadImage } from '../../components/imageUploadUtils'; // Import the utility function
import { Colors } from '../../styles/Colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { KeyboardAvoidingView} from 'react-native';
import { Alert } from 'react-native';
import { styles } from '../../styles/chatStyles'; 
import SlackMessage from './SlackMessage';


export default function Chat({ route, navigation }) {
  const [messages, setMessages] = useState([]);
  const [likedMessages, setLikedMessages] = useState({});
  const [pinnedMessagesCount, setPinnedMessagesCount] = useState(0);
  const [imageUris, setImageUris] = useState([]);
  const [lastVisible, setLastVisible] = useState(null); // To keep track of the last loaded document
  const [isLoadingEarlier, setIsLoadingEarlier] = useState(false); // Loading state for earlier messages
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
;
  const clubName = route?.params?.clubName;

 
  
  
  //updates which messages are liked
  useEffect(() => {
    let unsubscribeMessages = () => {};
    let unsubscribePinnedMessages = () => {};
    fetchInitialMessages();
    // Fetch liked messages
    const fetchLikedMessages = async () => {
      const likedMessagesQuery = query(collection(firestore, 'messagesLikes', auth.currentUser.uid, 'likes'));
      const querySnapshot = await getDocs(likedMessagesQuery);
      const likedMessagesIds = {};
      querySnapshot.forEach((doc) => {
        likedMessagesIds[doc.id] = true;
      });
      setLikedMessages(likedMessagesIds);
    };
  
    
  
    // Fetch the count of pinned messages
    const fetchPinnedMessagesCount = () => {
      const pinnedMessagesQuery = query(collection(firestore, 'chats'), where('clubName', '==', clubName), where('pinned', '==', true));
      unsubscribePinnedMessages = onSnapshot(pinnedMessagesQuery, (snapshot) => {
        setPinnedMessagesCount(snapshot.size);
      });
    };
  
    // Ensure all data fetching is performed
    const initializeChat = async () => {
      fetchLikedMessages();
      fetchPinnedMessagesCount();
    };
  
    // Call the initialize function
    initializeChat();
  
    // Cleanup function to unsubscribe from firestore updates on component unmount
    return () => {
      unsubscribeMessages();
      unsubscribePinnedMessages();
    };
  }, [clubName, auth.currentUser.uid]);
  

  
  const fetchInitialMessages = async () => {
    setIsLoadingEarlier(true);
    const q = query(
      collection(firestore, 'chats'),
      where('clubName', '==', clubName),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    try {
      const documentSnapshots = await getDocs(q);
      const fetchedMessages = documentSnapshots.docs.map(doc => ({
        _id: doc.id,
        createdAt: doc.data().createdAt.toDate(),
        text: doc.data().text,
        user: doc.data().user,
        image: doc.data().image,
        likeCount: doc.data().likeCount || 0,
      })) // Reverse the array to display the messages in correct order

      setMessages(fetchedMessages);
      if (documentSnapshots.docs.length > 0) {
        setLastVisible(documentSnapshots.docs[documentSnapshots.docs.length - 1]);
      }
      setHasMoreMessages(documentSnapshots.docs.length === 20);
    } catch (error) {
      console.error("Error fetching initial messages: ", error);
    } finally {
      setIsLoadingEarlier(false);
    }
  };

  const loadEarlierMessages = async () => {
    if (!lastVisible || isLoadingEarlier || !hasMoreMessages) return;

    setIsLoadingEarlier(true);
    const nextQuery = query(
      collection(firestore, 'chats'),
      where('clubName', '==', clubName),
      orderBy('createdAt', 'desc'),
      startAfter(lastVisible),
      limit(20)
    );

    try {
      const documentSnapshots = await getDocs(nextQuery);
      const newMessages = documentSnapshots.docs.map(doc => ({
        _id: doc.id,
        createdAt: doc.data().createdAt.toDate(),
        text: doc.data().text,
        user: doc.data().user,
        image: doc.data().image,
        likeCount: doc.data().likeCount || 0,
      })) // Reverse to maintain chronological order

      if (newMessages.length > 0) {
        setMessages(prevMessages => [...prevMessages, ...newMessages]); // Append older messages
        setLastVisible(documentSnapshots.docs[documentSnapshots.docs.length - 1]); // Update for next pagination
      }

      setHasMoreMessages(newMessages.length === 20);
    } catch (error) {
      console.error("Error loading earlier messages:", error);
    } finally {
      setIsLoadingEarlier(false);
    }
  };
  
  
  
  
  
  const onBackPress = () => {
    navigation.navigate("HomeScreen");
    
  }

  const toggleLike = async (messageId) => {
    const isLiked = !!likedMessages[messageId];
  
    // Optimistically update the UI for like status
    setLikedMessages((prev) => ({ ...prev, [messageId]: !isLiked }));
  
    // Optimistically update the like count in the UI
    setMessages((currentMessages) =>
      currentMessages.map((message) =>
        message._id === messageId ? { ...message, likeCount: (message.likeCount || 0) + (isLiked ? -1 : 1) } : message
      )
    );
  
    // Firestore update for the user's like status and global like count
    try {
      const userLikeDocRef = doc(firestore, 'messagesLikes', auth.currentUser.uid, 'likes', messageId);
      const messageRef = doc(firestore, 'chats', messageId);
  
      if (isLiked) {
        // Remove the like
        await deleteDoc(userLikeDocRef);
      } else {
        // Add a like
        await setDoc(userLikeDocRef, { liked: true });
      }
  
      // Update the global like count atomically
      await runTransaction(firestore, async (transaction) => {
        const messageDoc = await transaction.get(messageRef);
        if (!messageDoc.exists()) {
          throw new Error("Document does not exist!");
        }
        const currentLikeCount = messageDoc.data().likeCount || 0;
        transaction.update(messageRef, { likeCount: currentLikeCount + (isLiked ? -1 : 1) });
      });
    } catch (error) {
      console.error("Failed to toggle like: ", error);
      // Rollback optimistic UI update if transaction fails
      setLikedMessages((prev) => ({ ...prev, [messageId]: isLiked }));
      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message._id === messageId ? { ...message, likeCount: (message.likeCount || 0) + (isLiked ? 1 : -1) } : message
        )
      );
    }
  };
  
  


  
// CustomInputToolbar component which shows up for chat
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
          name: "Username", 
          avatar: 'https://i.pravatar.cc/300',
        },
      };
      onSend([message]);
      setMessageText('');
    }
  }, [messageText, onSend]);

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.customToolbar}>
      {/* Main button */}
    <TouchableOpacity onPress={handleImageUploadAndSend} style={styles.toolbarButton}>
      <Ionicons name='add-circle' size={30} color="black" />
    </TouchableOpacity>

      <TextInput
        style={[styles.input, { maxHeight: 100 }]} // Add maxHeight here
        value={messageText}
        onChangeText={setMessageText}
        placeholder="Send messages..."
        multiline={true} maxHeight={70}
        returnKeyType="done" // Prevents new lines
      />
      <TouchableOpacity onPress={sendTextMessage} style={styles.toolbarButton}>
        <Ionicons name="send" size={24} color={Colors.black} />
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const navigateToSearchPinnedMessages = () => {
  navigation.navigate('PinnedMessagesScreen', { clubName });
}



// Renders each chat message
const renderMessage = (props) => {
  return (
    <TouchableOpacity onLongPress={() => togglePin(props.currentMessage._id)}>
      <SlackMessage {...props} />
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
        name: 'Username',
        avatar: 'https://i.pravatar.cc/300',
      },
      image: imageUri,
      text: '', // Ensure text is always defined
    };

    onSend([message]);
  });
};
const updateMessageLikeCount = async (messageId, increment) => {
  const messageRef = doc(firestore, 'chats', messageId);
  
  // Run a transaction to ensure accurate like count updates in concurrent scenarios
  await runTransaction(firestore, async (transaction) => {
    const messageDoc = await transaction.get(messageRef);
    if (!messageDoc.exists()) {
      console.error("Document does not exist!");
      return;
    }

    const newLikeCount = (messageDoc.data().likeCount || 0) + increment;
    transaction.update(messageRef, { likeCount: newLikeCount });
  });
};


  
  const onSend = useCallback(async (newMessages = []) => {
    const updates = newMessages.map(async (message) => {
      // Prepare the message with additional data but without a predetermined _id
      const messageData = { ...message, clubName, likeCount: 0, createdAt: new Date() };
  
      // Remove the temporary client-side ID
      delete messageData._id;
  
      // Add the message to Firestore and wait for the operation to complete
      const docRef = await addDoc(collection(firestore, 'chats'), messageData);
  
      // Use the Firestore-generated ID to update the message
      return { ...message, _id: docRef.id };
    });
  
    // Wait for all Firestore operations to complete and retrieve the updated messages
    const updatedMessages = await Promise.all(updates);
  
    // Update the local state with messages that now include the Firestore-generated IDs
    setMessages((previousMessages) => GiftedChat.append(previousMessages, updatedMessages));
  }, [clubName]);
  

  
  const renderBubble = (props) => {
    const { currentMessage } = props;
    const isLiked = !!likedMessages[currentMessage._id];
    
  
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
  
  const deleteMessage = async (messageId) => {
    try {
      // Remove the message from the local state
      setMessages((prevMessages) =>
        prevMessages.filter((message) => message._id !== messageId)
      );
  
      // Delete the message from Firestore
      await deleteDoc(doc(firestore, 'chats', messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };
  
  const collectImageUris = useCallback(() => {
    // Filter messages to get those with images, then map to extract the image URIs
    const uris = messages
      .filter((message) => message.image)
      .map((message) => message.image);
    return uris;
  }, [messages]);

  const togglePin = async (messageId) => {
    const messageRef = doc(firestore, 'chats', messageId);
    const messageSnapshot = await getDoc(messageRef);
    if (messageSnapshot.exists()) {
      const currentPinStatus = messageSnapshot.data().pinned || false;
      const confirmationMessage = currentPinStatus ? 'Unpin this message?' : 'Pin this message?'; // Confirmation message based on current pin status
  
      // Check if the message belongs to the current user
      const isCurrentUser = messageSnapshot.data().user._id === auth.currentUser?.email;
  
      // Determine the additional option text based on whether the message belongs to the current user
      const additionalOptionText = isCurrentUser ? 'Delete this message?' : null;
  
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
          // Add the additional option if applicable
          additionalOptionText && {
            text: additionalOptionText,
            onPress: () => {
              // Call the deleteMessage function if the additional option is selected
              deleteMessage(messageId);
            },
          },
        ].filter(Boolean), // Filter out null options
        { cancelable: false }
      );
    }
  };
  
  

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton onPress={onBackPress} icon="arrow-left" size={30} />
        <TouchableOpacity style={styles.clubNameContainer} onPress={() => {
          const imageUris = collectImageUris();
          navigation.navigate('InClubView', { clubName, imageUris });
        }}>
          <View style={styles.imageContainer}>
            {/* Placeholder image */}
          </View>
          <Text style={styles.clubNameText}>{clubName}</Text>
        </TouchableOpacity>
        
        <IconButton icon="magnify" size={30} onPress={() => navigation.navigate("MessageSearchScreen", { clubName })} style={styles.searchButton} />
      </View>
      <TouchableOpacity style={styles.pinnedMessagesContainer} onPress={navigateToSearchPinnedMessages}>
        {pinnedMessagesCount > 0 && <View style={styles.blueBar}><MaterialCommunityIcons name="pin" size={24} color="black" /></View>}
        {pinnedMessagesCount > 0 && pinnedMessagesCount != 1 && <Text style={styles.pinnedMessagesText}>{pinnedMessagesCount} Pinned Messages</Text>}
        {pinnedMessagesCount == 1 && <Text style={styles.pinnedMessagesText}>{pinnedMessagesCount} Pinned Message</Text>}
      </TouchableOpacity>
      <GiftedChat
        messages={messages}
        onSend={messages => onSend(messages)}
        user={{ _id: 1, avatar: 'https://i.pravatar.cc/300' }}
        renderBubble={renderBubble}
        
        renderInputToolbar={props => <CustomInputToolbar {...props} onSend={onSend} handleImageUploadAndSend={handleImageUploadAndSend} />}
        messagesContainerStyle={styles.messagesContainer}
        textInputStyle={styles.textInput}
        renderMessage={renderMessage}
        loadEarlier={hasMoreMessages}
        isLoadingEarlier={isLoadingEarlier}
        onLoadEarlier={loadEarlierMessages}
        infiniteScroll
        showAvatarForEveryMessage={true}
        
      />
    </View>
  );
}