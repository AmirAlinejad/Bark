// Chat.js

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TouchableOpacity, View, Text, Image, TextInput,FlatList,Button, StyleSheet } from 'react-native';
import { GiftedChat, Send, Bubble, Message,Time, Avatar } from 'react-native-gifted-chat';
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
  arrayUnion,
  arrayRemove,
  runTransaction
} from 'firebase/firestore';
import { getDatabase, ref, get } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { auth, firestore, db } from '../../backend/FirebaseConfig';
import { IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { uploadImage } from '../../components/imageUploadUtils'; // Import the utility function
import { Colors } from '../../styles/Colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { KeyboardAvoidingView} from 'react-native';
import { Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { TouchableWithoutFeedback, Keyboard } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Entypo from 'react-native-vector-icons/Entypo';


export default function Chat({ route, navigation }) {
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState([]);
  const [imageUrl, setImageUrl] = useState(null); // Define imageUrl state
  const [pinnedMessageCount, setPinnedMessageCount] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(true); // Initially assume the user is at the bottom
  const [likedMessages, setLikedMessages] = useState(new Set());
  const chatName = "chats";
  const clubName = route?.params?.clubName;
  const flatListRef = useRef(null);

  useEffect(() => {
    // Ensure there is a clubName before setting up the subscription
    if (!clubName) return;
  
    const unsubscribeMessages = onSnapshot(
      query(collection(firestore, 'chats'), where('clubName', '==', clubName), orderBy('createdAt', 'asc')),
      (querySnapshot) => {
        const fetchedMessages = querySnapshot.docs.map((doc) => ({
          _id: doc.id,
          createdAt: doc.data().createdAt.toDate(),
          text: doc.data().text,
          user: doc.data().user,
          image: doc.data().image,
          likeCount: doc.data().likeCount || 0,
          pinned: doc.data().pinned || false, // Ensure pinned property is present, default to false if not available
        }));
        setMessages(fetchedMessages);
        
        // Calculate pinned message count
        const pinnedMessageCount = fetchedMessages.filter(message => message.pinned).length;
        setPinnedMessageCount(pinnedMessageCount);
      },
      (error) => {
        console.error("Error fetching messages: ", error);
      }
    );
  
    return () => unsubscribeMessages();
  }, [clubName]); // Depend on clubName to re-run the effect when it changes


  useEffect(() => {
    // Function to fetch liked messages and update the local state
    const fetchLikedMessages = async () => {
      const userId = auth.currentUser.uid;
      const messagesRef = collection(firestore, 'chats');
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

  const handleCameraPress = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access camera was denied');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setImageUrl(result.uri); // Set the image URL
      sendMessage(); // Send the message
    }
  };



  const handleLongPress = async (message) => {
    const userId = auth.currentUser.uid;
    const db = getDatabase();
  
    // Correctly form the reference to the user's data in the Realtime Database
    const userRef = ref(db, `clubs/${clubName}/clubMembers/${userId}`);
  
    try {
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const currentUserPrivilege = snapshot.val().privilege;
        console.log(`Current user privilege: ${currentUserPrivilege}`);
  
        let options = [
          { text: 'Cancel', style: 'cancel' },
          {
            text: message.pinned ? 'Unpin' : 'Pin',
            onPress: async () => {
              // Assuming this part remains unchanged as it likely updates Firestore
              const newPinStatus = !message.pinned;
              await updateDoc(doc(firestore, 'chats', message._id), { pinned: newPinStatus });
              // Update local state as necessary
            },
          },
        ];
  
        // Add the delete option based on the fetched privilege
        if (message.user._id === userId || currentUserPrivilege === 'owner' || currentUserPrivilege === 'admin') {
          options.push({
            text: 'Delete Message',
            style: 'destructive',
            onPress: () => {
              // Assuming the delete operation targets Firestore
              deleteMessage(message._id);
            },
          });
        }
  
        Alert.alert('Options', 'Select an option', options.filter(Boolean), { cancelable: false });
      } else {
        console.log("User privilege data not found.");
      }
    } catch (error) {
      console.error("Error fetching user privilege:", error);
    }
  };
  
  const handleImageUploadAndSend = () => {
    uploadImage((imageUri) => {
      setImageUrl(imageUri); // Set the image URL
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
  
      sendMessage([message]); // Call sendMessage with the message containing the image
    });
  };
  
  
  const deleteMessage = async (messageId) => {
    await deleteDoc(doc(firestore, 'chats', messageId));
    console.log('Message deleted successfully');
  };
  
  const navigateToMessageSearchScreen = () => {
    navigation.navigate('MessageSearchScreen', { clubName, chatName});
  };

  const navigateToSearchPinnedMessages = () => {
    navigation.navigate('PinnedMessagesScreen', { clubName, chatName});
  };
  const isSameDay = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };
  
  const formatDate = (date) => {
    const options = { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };


  const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const amOrPm = hours >= 12 ? 'PM' : 'AM';
    const twelveHourFormatHours = hours % 12 || 12; // Convert 0 to 12 in 12-hour format

    // Removed the condition to add leading zero for hours
    const formattedHours = twelveHourFormatHours; // Directly use the calculated hour
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes; // Keep the leading zero for minutes if necessary
  
    // Return the formatted time string without leading zero for hours
    return `${formattedHours}:${formattedMinutes} ${amOrPm}`;
};

const renderMessage = ({ item, index }) => {
  const isFirstMessageOfDay = index === 0 || !isSameDay(messages[index - 1].createdAt, item.createdAt);

  // Conditional style for pinned messages
  const messageContainerStyle = [
    styles.messageContainer,
    item.pinned && styles.pinnedMessage, // Apply pinnedMessage style if the message is pinned
  ];

  // Determines if the message is liked by the user
  const isLikedByUser = likedMessages.has(item._id);

  return (
    <>
      {isFirstMessageOfDay && (
        <View style={styles.dateContainer}>
          <View style={styles.dateWrapper}>
            <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>
      )}
      <TouchableOpacity
        onLongPress={() => handleLongPress(item)}
        style={messageContainerStyle}
      >
        <View style={styles.messageContent}>
          <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
          <View>
            <Text style={styles.senderName}>{item.user.name}</Text>
            {item.text && <Text style={styles.messageText}>{item.text}</Text>}
            {item.image && (
              <TouchableOpacity onPress={() => navigation.navigate('ImageViewerScreen', { imageUri: item.image })}>
                <Image source={{ uri: item.image }} style={styles.messageImage} />
              </TouchableOpacity>
            )}
            <Text style={styles.messageTime}>{formatTime(item.createdAt)}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => toggleLike(item)} style={styles.likeButton}>
          <Ionicons
            name={isLikedByUser ? "heart" : "heart-outline"}
            size={24}
            color={isLikedByUser ? "red" : "black"} 
          />
          <Text style={styles.likeCountText}>{item.likeCount || 0}</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </>
  );
};

  
  
  
    const navigateToInClubView = () => {
      const imageUrls = getImageUrls(); // Get the current image URLs
      navigation.navigate("InClubView", { clubName, imageUrls, chatName }); // Pass them as part of navigation
    };
    
    const getImageUrls = () => {
      // Filter messages to get those with images, then map to get the URLs
      return messages.filter(message => message.image).map(message => message.image);
    };
    
    const toggleLike = async (message) => {
      const userId = auth.currentUser.uid;
      const messageRef = doc(firestore, 'chats', message._id);
  
      const messageDoc = await getDoc(messageRef);
      if (!messageDoc.exists()) {
        console.error("Document does not exist!");
        return;
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
  
      // Update the local likedMessages state
      if (isLikedByUser) {
        const newLikedMessages = new Set(likedMessages);
        newLikedMessages.delete(message._id);
        setLikedMessages(newLikedMessages);
      } else {
        const newLikedMessages = new Set(likedMessages);
        newLikedMessages.add(message._id);
        setLikedMessages(newLikedMessages);
      }
    };
  
    
  const scrollToBottom = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };
  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = 20; // distance from the bottom to consider "at the bottom"
    return layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
  };
  
  const sendMessage = useCallback(async () => {
    if (messageText.trim() || imageUrl) { // Check if there's either text or an image URL
      try {
        const message = {
          id:  Date.now().toString(),
          createdAt: new Date(),
          text: messageText.trim(),
          user: {
            _id: auth.currentUser.uid,
            name: "Username", 
            avatar: 'https://i.pravatar.cc/300',
          },
          likeCount: 0, // Initialize likes to 0
          image: imageUrl, // Include the image URL
          likes: []
        };
  
        // Add the message to Firestore
        await addDoc(collection(firestore, 'chats'), {
          ...message,
          clubName, // Ensure you include clubName in the message document
        });
  
        // Clear the message input field and image URL
        setMessageText('');
        setImageUrl(null);
  
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  }, [messageText, imageUrl]); // Add imageUrl as a dependency
  
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <View style={styles.container}>
    <View style={styles.header}>
  <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.goBack()}>
    <FontAwesome name="arrow-left" size={20} color="black" />
  </TouchableOpacity>
  <TouchableOpacity style={styles.clubNameContainer} onPress={navigateToInClubView}>
    <View style={styles.imageContainer}>
      {/* Placeholder image */}
    </View>
    <Text style={styles.clubNameText}>{clubName}</Text>
  </TouchableOpacity>
  <TouchableOpacity style={styles.headerIcon} onPress={navigateToMessageSearchScreen}>
    <FontAwesome name="search" size={20} color="black" />
  </TouchableOpacity>
</View>
{( pinnedMessageCount > 0 &&
<TouchableOpacity style={styles.pinnedMessagesContainer} onPress={navigateToSearchPinnedMessages}>
  <View style={styles.blueBar}>
    <MaterialCommunityIcons name="pin" size={24} color="black" />
  </View>
  <Text style={styles.pinnedMessagesText}>Pinned Messages: {pinnedMessageCount}</Text>
</TouchableOpacity>
)}
      {!isAtBottom && (
    <TouchableOpacity
      style={{
        position: 'absolute', // Ensures it's positioned relative to the container.
        right: 20, // Adjust this value to ensure it's comfortably reachable.
        bottom: 90, // Adjust this so it's above your keyboard avoiding view or other lower components.
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 25,
        padding: 10, // Increasing padding can help with touchability.
        zIndex: 1, // Only if necessary, to ensure it's above other components.
      }}
      onPress={scrollToBottom}
    >
      <Ionicons name="arrow-down" size={24} color="black" />
    </TouchableOpacity>
  )}

      <FlatList
        ref={flatListRef}
        renderItem={renderMessage}
        keyExtractor={(item) => item._id}
        onContentSizeChange={() => scrollToBottom()}
        onScroll={({nativeEvent}) => {
          const isAtBottom = isCloseToBottom(nativeEvent);
          setIsAtBottom(isAtBottom);
        }}
        scrollEventThrottle={400} // Adjust as needed for performance
        contentContainerStyle={{ paddingBottom: 50 }} 
        data={messages}
      />  
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolbarButton} onPress={handleImageUploadAndSend}>
          <Entypo name='plus' size={30} color="black" />
        </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={messageText}
            onChangeText={setMessageText}
            placeholder={imageUrl ? "add a message or send." : "Type a message..."}
            multiline={true}
            maxHeight={120}
            onContentSizeChange={() => scrollToBottom()}
            returnKeyType="done" // Prevents new lines
            placeholderTextColor="#888888"
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
            <Ionicons name="send" size={24} color={Colors.black} />
          </TouchableOpacity>
        <TouchableOpacity onPress={handleCameraPress} style={styles.toolbarButton}>
      <MaterialCommunityIcons name='camera' size={30} color="black" />
    </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>
    </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
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
  headerText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerIcon: {
    padding: 5,
    marginRight: 15,
  },
  messageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    paddingBottom: 20,
    
  },
  messageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '70%'
    
  },
  messageText: {
    marginLeft: 5,
    maxWidth: '100%',
  },
  toolbarButton: {
    paddingLeft:5,
    backgroundColor: 'transparent',
  },
  senderName: {
    fontWeight: 'bold',
    marginRight: 5,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    position: "absolute", // Corrected typo here
    right: 25, // Adjust right positioning as needed
  },
  likeCount: {
    marginLeft: 5,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Spread out the items evenly
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    backgroundColor: 'white',
    marginTop: -10,
    width: '100%',
  },
  input: {
    flex: 1,
    borderColor: 'white',
    borderRadius: 10,
    marginLeft: 10,
    backgroundColor: "#EEEEEE",
    paddingHorizontal: 20,
    height: '75%',
    width: '65%',
    textAlign: 'left',
    // Adjust lineHeight for cursor height. Increase this value to make the cursor taller.
    lineHeight: 20, 
  },
  sendButton: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingRight:15,
    marginLeft: 10,
    
  },
  sendButtonText: {
    color: 'white',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 40,
    marginRight: 10,
  },
  messageTime: {
    fontSize: 12,
    color: 'gray',
  },
  messageImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    borderRadius: 10,
  },
  pinnedMessagesContainer: {
    flexDirection: 'row',
    marginTop:10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  pinnedMessagesText: {
    color: 'gray',
    fontSize: 16,
    textAlign: 'left',
    fontStyle: 'italic',
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
  imageContainer: {
    width: 30,
    height: 30,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 10,
    backgroundColor: 'lightgray', // Placeholder background color
  },
  dateContainer: {
    alignItems: 'center',
    marginBottom: 10, // Add some space between date and message
  },
  dateWrapper: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  pinnedMessage: {
    backgroundColor: '#dbe9f4', // Light gray background color for pinned messages
  },
  dateText: {
    fontSize: 14, 
    color: 'gray',
  },
});