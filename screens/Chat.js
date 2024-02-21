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

export default function Chat({ route, navigation }) {
  const [messages, setMessages] = useState([]);
  const [likedMessages, setLikedMessages] = useState({});
  const clubName = route?.params?.clubName;
  const onBackPress = () => {
    navigation.navigate("ClubScreen");
  }
  const toggleLike = async (messageId) => {
    const messageRef = doc(firestore, 'messagesLikes', auth.currentUser.uid, 'likes', messageId);
    const likedMessage = await getDoc(messageRef);

    if (likedMessage.exists()) {
      await deleteDoc(messageRef);
      updateMessageLikeCount(messageId, -1); // Decrement like count
    } else {
      await setDoc(messageRef, { liked: true });
      updateMessageLikeCount(messageId, 1); // Increment like count
    }

    // Update likedMessages state to trigger re-render
    setLikedMessages((prevLikedMessages) => ({
      ...prevLikedMessages,
      [messageId]: !likedMessage.exists(),
    }));
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
    <View style={styles.customToolbar}>
      <TouchableOpacity onPress={handleImageUploadAndSend} style={styles.toolbarButton}>
        <Ionicons name="image-outline" size={24} color={Colors.primary} />
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        value={messageText}
        onChangeText={setMessageText}
        placeholder="Type a message..."
        multiline
      />
      <TouchableOpacity onPress={sendTextMessage} style={styles.toolbarButton}>
        <Ionicons name="send" size={24} color={Colors.primary} />
      </TouchableOpacity>
    </View>
  );
}
const formatDate = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
};

// Renders each chat message
const renderMessage = (props) => {
  const { currentMessage } = props;

  const isCurrentUser = currentMessage.user._id === auth?.currentUser?.email;

  // Adjusted style application to align usernames correctly
  const usernameAlignmentStyle = isCurrentUser ? styles.usernameRight : styles.usernameLeft;

  return (
    <View style={{ marginBottom: 5 }}>
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
  );
};
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

  const renderBubble = (props) => {
    const { currentMessage } = props;
    const isLiked = !!likedMessages[currentMessage._id];
    return (
      <Bubble
        {...props}
        wrapperStyle={styles.bubbleWrapperStyle(props)}
        textStyle={styles.bubbleTextStyle}
        timeTextStyle={styles.bubbleTimeTextStyle}
        renderCustomView={() => (
          <TouchableOpacity
            onPress={() => toggleLike(currentMessage._id)}
            style={styles.likeButton(isLiked, props.position)}
          >
            <MaterialCommunityIcons name={isLiked ? 'heart' : 'heart-outline'} size={24} color={isLiked ? 'red' : 'grey'} />
            <Text style={styles.likeCount}>{currentMessage.likeCount || 0}</Text>
          </TouchableOpacity>
        )}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton onPress={onBackPress} icon="arrow-left" size={30} />
        <TouchableOpacity style={styles.clubNameButton} onPress={() => navigation.navigate("InClubView", { clubName })}>
          <Text style={styles.clubNameText}>{clubName}</Text>
        </TouchableOpacity>
        <IconButton icon="magnify" size={30} onPress={() => navigation.navigate("UserList", { clubName })} style={styles.searchButton} />
      </View>
      <GiftedChat
        messages={messages}
        onSend={messages => onSend(messages)}
        user={{ _id: auth?.currentUser?.email, avatar: 'https://i.pravatar.cc/300' }}
        renderBubble={renderBubble}
        renderMessageImage={props => (
          <TouchableOpacity onPress={() => onImagePress(props.currentMessage.image)}>
            <Image source={{ uri: props.currentMessage.image }} style={styles.messageImage} />
          </TouchableOpacity>
        )}
        renderInputToolbar={props => <CustomInputToolbar {...props} onSend={onSend} handleImageUploadAndSend={handleImageUploadAndSend} />}
        messagesContainerStyle={styles.messagesContainer}
        textInputStyle={styles.textInput}
        renderMessage={renderMessage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ccc',
    marginTop: -25,
  },
  input: {
    flex: 1,
    minHeight: 30,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 10,
    marginHorizontal: 5,
    backgroundColor: '#f2f2f2',
  },
  toolbarButton: {
    padding: 5,
    marginLeft: 4,
    marginRight: 4,
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
  likeButton: (isLiked, position) => ({
    position: 'absolute',
    bottom: 5,
    right: position === 'right' ? 'auto' : -250,
    left: position === 'right' ? -300 : 'auto',
    flexDirection: 'row',
    alignItems: 'center',
  }),
  likeCount: { marginLeft: 5 },
  messageImage: { width: 200, height: 200 },
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
});
