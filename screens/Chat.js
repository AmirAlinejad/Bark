import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Image, TextInput } from 'react-native';
import { GiftedChat, Send, Message, Bubble } from 'react-native-gifted-chat';
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

// Function to toggle like status of a message
const toggleLike = async (messageId) => {
  const newLikedMessages = { ...likedMessages };
  const messageRef = doc(firestore, 'likedMessages', messageId);
  const likedMessage = await getDoc(messageRef);

  if (likedMessage.exists()) {
    delete newLikedMessages[messageId];
    await deleteDoc(messageRef);
    await updateMessageLikeCount(messageId, -1); // Decrement like count
  } else {
    newLikedMessages[messageId] = true;
    await setDoc(messageRef, { messageId });
    await updateMessageLikeCount(messageId, 1); // Increment like count
  }
  setLikedMessages(newLikedMessages);
};

// Function to update the like count of a message
const updateMessageLikeCount = async (messageId, increment) => {
  const messageRef = doc(firestore, 'chats', messageId);
  const messageSnapshot = await getDoc(messageRef);

  if (messageSnapshot.exists()) {
    const currentLikeCount = messageSnapshot.data().likeCount || 0;
    await updateDoc(messageRef, { likeCount: currentLikeCount + increment });
  }
};


  // Goes to screen that allows clicking on an image to view it up close
  const onImagePress = (imageUri) => {
    navigation.navigate('ImageViewerScreen', { imageUri });
  };

  // Goes back to Home Screen
  const onBackPress = () => {
    navigation.goBack();
  };

  useEffect(() => {
    const unsubscribeLikedMessages = onSnapshot(collection(firestore, 'likedMessages'), (querySnapshot) => {
      const likedMessagesData = {};
      querySnapshot.forEach((doc) => {
        likedMessagesData[doc.id] = doc.data();
      });
      setLikedMessages(likedMessagesData);
    });
  
    return () => unsubscribeLikedMessages();
  }, []);

  // Handles loading chat messages
  useLayoutEffect(() => {
    let unsubscribeChatMessages;

    if (clubName) {
      const chatMessagesRef = collection(firestore, 'chats');
      const q = query(
        chatMessagesRef,
        where('clubName', '==', clubName),
        orderBy('createdAt', 'desc')
      );

      unsubscribeChatMessages = onSnapshot(q, (querySnapshot) => {
        setMessages(
          querySnapshot.docs.map((doc) => ({
            _id: doc.id,
            createdAt: doc.data().createdAt.toDate(),
            text: doc.data().text,
            user: doc.data().user,
            image: doc.data().image,
            likeCount: doc.data().likeCount || 0,
          }))
        );
      });
    }

    return () => {
      if (unsubscribeChatMessages) unsubscribeChatMessages();
    };
  }, [clubName]);

  // Renders the custom input toolbar for sending messages
  function CustomInputToolbar({ onSend, handleImageUploadAndSend }) {
    const [messageText, setMessageText] = useState('');

    const sendTextMessage = () => {
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
    };

    return (
      <View style={styles.customToolbar}>
        <TouchableOpacity onPress={handleImageUploadAndSend} style={styles.toolbarButton}>
          <Ionicons name="add-circle" size={24} color={Colors.primary} />
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

  // Formats the date for message display
  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };

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
    const usernameStyle = isCurrentUser ? styles.usernameRight : styles.usernameLeft;

    return (
      <View style={{ marginBottom: 5 }}>
        {isNewDay && (
          <Text style={styles.dateText}>
            {formatDate(new Date(currentMessage.createdAt))}
          </Text>
        )}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[styles.usernameText, usernameStyle]}>
            {isCurrentUser ? 'You' : currentMessage.user.name || currentMessage.user._id}
          </Text>
          <TouchableOpacity onPress={() => toggleLike(currentMessage._id)} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons
              name={likedMessages[currentMessage._id] ? 'heart' : 'heart-outline'}
              size={24}
              color={likedMessages[currentMessage._id] ? 'red' : 'grey'}
            />
            <Text style={{ marginLeft: 5 }}>{currentMessage.likeCount}</Text>
          </TouchableOpacity>
        </View>
        <Message {...props}
          containerStyle={{
            left: { backgroundColor: 'white' },
            right: { backgroundColor: 'white' },
          }} />
      </View>
    );
  };

  // Renders the chat message bubbles
  const renderBubble = (props) => {
    // Destructure necessary props
    const { currentMessage, likedMessages, toggleLike, currentUserId } = props;
  
    // Determine if the message is from the current user
    const isCurrentUser = currentMessage.user._id === currentUserId;
  
    // Function to handle the press event for the like button
    const onLikePress = () => {
      if (toggleLike && currentMessage && currentMessage._id) {
        toggleLike(currentMessage._id);
      }
    };
  
    // Check if the message is liked to determine the icon and color
    const isLiked = likedMessages && likedMessages[currentMessage._id];
    const likeIconName = isLiked ? 'heart' : 'heart-outline';
    const likeIconColor = isLiked ? 'red' : 'grey';
  
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: 'white',
            marginRight: 0,
            flex: 1,
            minHeight: 40,
          },
          left: {
            backgroundColor: "white",
            marginLeft: 0,
            flex: 1,
            minHeight: 40,
          },
        }}
        textStyle={{
          right: {
            color: 'black',
          },
          left: {
            color: 'black',
          },
        }}
        timeTextStyle={{
          right: {
            color: 'black',
          },
          left: {
            color: 'black',
          },
        }}
        renderCustomView={() => (
          <View style={{
            position: 'absolute',
            // Position the like button based on the user
            top: 20,
            [isCurrentUser ? 'left' : 'right']: 250, // Adjust as needed
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <TouchableOpacity onPress={onLikePress} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons
                name={likeIconName}
                size={24}
                color={likeIconColor}
              />
              <Text style={{ marginLeft: 5 }}>{currentMessage.likeCount || 0}</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    );
  };
  
  

  // Suppresses the rendering of day markers
  const renderDay = (props) => {
    return null;
  };

  // Renders images in the chat
  const renderMessageImage = (props) => {
    if    (props.currentMessage.image) {
      return (
        <TouchableOpacity onPress={() => onImagePress(props.currentMessage.image)}>
          <Image source={{ uri: props.currentMessage.image }} style={{ width: 200, height: 200 }} />
        </TouchableOpacity>
      );
    }
    return null;
  };

  // Sends text messages
  const onSend = useCallback((messages = []) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, messages)
    );

    messages.forEach((message) => {
      const { _id, createdAt, text, user, image } = message;
      if (clubName) {
        const messageData = {
          _id,
          createdAt,
          text,
          user,
          clubName,
          image: image || null,
          likeCount: 0,
        };

        addDoc(collection(firestore, 'chats'), messageData);
      }
    });
  }, [clubName]);

  // Handles uploading images and sending them in messages
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

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 30, paddingHorizontal: 10 }}>
        <IconButton
          onPress={onBackPress}
          icon="arrow-left"
          size={30}
        />
        
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("InClubView", {clubName})}>
           <Text style={styles.text}>{clubName}</Text>
        </TouchableOpacity>
        <View style={{ marginLeft: 'auto', marginRight: 10 }}>
          <IconButton
            icon="magnify"
            size={30}
            onPress={() => {
              navigation.navigate("UserList", {
                clubName: clubName,
              });
            }}
          />
        </View>
      </View>
      <GiftedChat
        messages={messages}
        renderSend={(props) => (
          <Send {...props} alwaysShowSend>
            
          </Send>
        )}
        renderMessageImage={renderMessageImage}
        showAvatarForEveryMessage={false}
        showUserAvatar={true}
        onSend={messages => onSend(messages)}
        messagesContainerStyle={{
          backgroundColor: 'white',
          width: '100%',
          paddingBottom: 35,
        }}
        textInputStyle={{
          backgroundColor: '#f2f2f2',
          borderRadius: 25,
          borderWidth: 1,
          borderColor: '#ccc',
          color: '#333',
          padding: 10,
          fontSize: 16,
        }}
        user={{
          _id: auth?.currentUser?.email,
          avatar: 'https://i.pravatar.cc/300'
        }}
        renderMessage={renderMessage}
        renderBubble={renderBubble}
        renderDay={renderDay}
        renderInputToolbar={(props) => (
          <CustomInputToolbar
            onSend={props.onSend}
            handleImageUploadAndSend={handleImageUploadAndSend}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 20,
  },

  usernameText: {
    alignSelf: 'flex-start',
    fontSize: 12,
    color: '#666',
    paddingHorizontal: 5,
    paddingTop: 2,
    paddingBottom: 2,
  },
  usernameRight: {
    alignSelf: 'flex-end',
  },
  usernameLeft: {
    alignSelf: 'flex-start',
  },
  dateText: {
    alignSelf: 'center',
    fontSize: 14,
    color: '#666',
    paddingVertical: 8,
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
    marginHorizontal:  5,
    backgroundColor: '#f2f2f2',
  },
  toolbarButton: {
    padding: 5,
    marginLeft: 4,
    marginRight: 4,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black', // Example text color
  },
});

