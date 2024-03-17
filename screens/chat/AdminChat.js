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
import { auth, firestore } from '../../backend/FirebaseConfig';
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

  const chatName = "adminchats";
  const clubName = route?.params?.clubName;
  const flatListRef = useRef(null);

  useEffect(() => {
    // Ensure there is a clubName before setting up the subscription
    if (!clubName) return;
  
    const unsubscribeMessages = onSnapshot(
      query(collection(firestore, 'adminchats'), where('clubName', '==', clubName), orderBy('createdAt', 'asc')),
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



  const handleLongPress = (message) => {
    const userId = auth.currentUser.uid;
    const messageRef = doc(firestore, 'adminchats', message._id);
    const isCurrentUserMessage = message.user._id === userId;
  
    // Define the delete option text if the message belongs to the current user
    let deleteOptionText = isCurrentUserMessage ? 'Delete Message' : null;
  
    Alert.alert(
      'Options',
      'Select an option',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: message.pinned ? 'Unpin' : 'Pin',
          onPress: async () => {
            // Toggle pin status
            const newPinStatus = !message.pinned;
            await updateDoc(messageRef, { pinned: newPinStatus });
  
            // Update the local state to reflect the change
            setMessages((prevMessages) =>
              prevMessages.map((m) => (m._id === message._id ? { ...m, pinned: newPinStatus } : m))
            );
          },
        },
        // Add the delete option if the message belongs to the current user
        deleteOptionText && {
          text: deleteOptionText,
          style: 'destructive',
          onPress: () => deleteMessage(message._id),
        },
      ].filter(Boolean), // Filter out any falsy options
      { cancelable: false }
    );
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
    await deleteDoc(doc(firestore, 'adminchats', messageId));
    console.log('Message deleted successfully');
  };
  
  const navigateToMessageSearchScreen = () => {
    navigation.navigate('MessageSearchScreen', { clubName, chatName});
  };

  const navigateToSearchPinnedMessages = () => {
    navigation.navigate('PinnedMessagesScreen', { clubName, chatName});
  };
  
  const renderMessage = ({ item }) => {
    const userId = auth.currentUser.uid; // Assuming this is how you identify the current user
    const isLikedByUser = item.likes?.includes(userId);
    
    return (
      <TouchableOpacity 
        onLongPress={() => handleLongPress(item)}
        style={styles.messageContainer}
      >
        <View style={styles.messageContent}>
          <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
          <View>
            <Text style={styles.senderName}>{item.user.name}</Text>
            {item.text && <Text style={styles.messageText}>{item.text}</Text>}
            {item.image && <TouchableOpacity onPress={() => navigation.navigate('ImageViewerScreen', { imageUri: item.image })}><Image source={{ uri: item.image }} style={styles.messageImage} /></TouchableOpacity>}
          </View>
        </View>
        <TouchableOpacity onPress={() => toggleLike(item)} style={styles.likeButton}>
        <Ionicons
          name={isLikedByUser ? "heart" : "heart-outline"}
          size={24}
          color={isLikedByUser ? "red" : "black"} // Change to "black" for outline
        />
        <Text style={styles.likeCountText}>{item.likeCount || 0}</Text>
      </TouchableOpacity>

      </TouchableOpacity>
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
      const userId = auth.currentUser.uid; // Ensure this is how you get the current user ID
      const messageRef = doc(firestore, 'adminchats', message._id);
    
      // Fetch the current message document
      const messageDoc = await getDoc(messageRef);
      if (!messageDoc.exists()) {
        console.error("Document does not exist!");
        return;
      }
    
      const data = messageDoc.data();
      // Ensure likes is an array. If undefined, initialize as an empty array.
      const likesArray = data.likes || [];
      const isLikedByUser = likesArray.includes(userId);
    
      // Determine the new likes array and like count
      const newLikesArray = isLikedByUser 
        ? likesArray.filter(id => id !== userId) 
        : [...likesArray, userId];
      const newLikeCount = isLikedByUser 
        ? (data.likeCount || 0) - 1 
        : (data.likeCount || 0) + 1;
    
      // Update Firestore document
      await updateDoc(messageRef, {
        likes: newLikesArray,
        likeCount: newLikeCount
      });
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
        await addDoc(collection(firestore, 'adminchats'), {
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
        bottom: 100, // Adjust this so it's above your keyboard avoiding view or other lower components.
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
    right: 20, // Adjust right positioning as needed
  },
  likeCount: {
    marginLeft: 5,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Spread out the items evenly
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 20,
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
    paddingHorizontal: 20, // Adjust this as needed
    height: '60%',
    width: '65%',
    textAlign: 'left',
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
    borderRadius: 10,
    marginRight: 10,
  },
  messageImage: {
    width: 100,
    height: 100,
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
});