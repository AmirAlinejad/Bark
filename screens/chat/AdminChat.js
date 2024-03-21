// Chat.js

import React, { useState, useEffect, useCallback, useRef,useLayoutEffect } from 'react';
import { TouchableOpacity, View, Text, TextInput,FlatList,Button, StyleSheet } from 'react-native';
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
import { Image } from 'expo-image';
import BottomSheetModal from '../../components/BottomSheetModal';

export default function Chat({ route, navigation }) {
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState([]);
  const [imageUrl, setImageUrl] = useState(null); // Define imageUrl state
  const [pinnedMessageCount, setPinnedMessageCount] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(true); // Initially assume the user is at the bottom
  const [likedMessages, setLikedMessages] = useState(new Set());
  const [gifUrl, setGifUrl] = useState(null); 

  const chatName = "adminchats";
  const screenName = "AdminChat";
  const clubName = route?.params?.clubName;
  
  const flatListRef = useRef(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Define functions to handle modal open and close
  const openModal = () => {
    setIsModalVisible(true);
  };
  
  const closeModal = () => {
    setIsModalVisible(false);
  };
  
  useEffect(() => {
    if (!clubName) return;
  
    // Fetching messages in descending order to suit the inverted list.
    const messagesQuery = query(collection(firestore, 'adminchats'), where('clubName', '==', clubName), orderBy('createdAt', 'desc'));
  
    const unsubscribe = onSnapshot(messagesQuery, querySnapshot => {
      const fetchedMessages = querySnapshot.docs.map(doc => ({
        _id: doc.id,
        createdAt: doc.data().createdAt.toDate(),
        text: doc.data().text,
        user: doc.data().user,
        image: doc.data().image,
        likeCount: doc.data().likeCount || 0,
        pinned: doc.data().pinned || false,
        gifUrl: doc.data().gifUrl,
      }));
  
      // Since we fetch messages in descending order, we set them directly.
      setMessages(fetchedMessages);
  
      // Calculate and update the count of pinned messages.
      setPinnedMessageCount(fetchedMessages.filter(message => message.pinned).length);
    }, error => {
      console.error("Error fetching messages: ", error);
    });
  
    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, [clubName]);
  
  useEffect(() => {
    const { selectedGifUrl } = route.params;
    if (selectedGifUrl) {
      setGifUrl(selectedGifUrl); // Set the selected GIF URL for sending
      // Clear the selectedGifUrl from params after setting
      navigation.setParams({ selectedGifUrl: undefined });
    }
  }, [route.params]);
  
  
  useEffect(() => {
    // Function to fetch liked messages and update the local state
    const fetchLikedMessages = async () => {
      const userId = auth.currentUser.uid;
      const messagesRef = collection(firestore, 'adminchats');
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
    closeModal();
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
        
  
        let options = [
          { text: 'Cancel', style: 'cancel' },
          {
            text: message.pinned ? 'Unpin' : 'Pin',
            onPress: async () => {
              // Assuming this part remains unchanged as it likely updates Firestore
              const newPinStatus = !message.pinned;
              await updateDoc(doc(firestore, 'adminchats', message._id), { pinned: newPinStatus });
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
    closeModal(); 
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
  const isSameDay = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
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
  const isLastMessageOfTheDay = index === messages.length - 1 || !isSameDay(item.createdAt, messages[index + 1]?.createdAt);
  const isLikedByUser = likedMessages.has(item._id);

  return (
    <View>
      {isLastMessageOfTheDay && (
        <View style={styles.dateContainer}>
          <View style={styles.dateWrapper}>
            <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>
      )}
      <TouchableOpacity onLongPress={() => handleLongPress(item)} style={[styles.messageContainer, item.pinned && styles.pinnedMessage]}>
        <View style={styles.messageContent}>
          {item.user.avatar && <Image source={{ uri: item.user.avatar }} style={styles.avatar} />}
          <View style={{ flex: 1 }}>
            <Text style={styles.senderName}>{item.user.name}</Text>
            {item.text && <Text style={styles.messageText}>{item.text}</Text>}
            
            {/* Render an image if it exists */}
            {item.image && (
              <TouchableOpacity onPress={() => navigation.navigate('ImageViewerScreen', { imageUri: item.image })}>
                <Image source={{ uri: item.image }} style={styles.messageImage} />
              </TouchableOpacity>
            )}

            {/* Render a GIF if it exists */}
            {item.gifUrl && (
              <TouchableOpacity onPress={() => navigation.navigate('ImageViewerScreen', { imageUri: item.gifUrl })}>
                <Image source={{ uri: item.gifUrl }} style={styles.messageImage} />
              </TouchableOpacity>
            )}

            <Text style={styles.messageTime}>{formatTime(item.createdAt)}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => toggleLike(item)} style={styles.likeButton}>
          <Ionicons name={isLikedByUser ? "heart" : "heart-outline"} size={24} color={isLikedByUser ? "red" : "black"} />
          <Text style={styles.likeCountText}>{item.likeCount || 0}</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
};

    const isCloseToTop = ({ layoutMeasurement, contentOffset, contentSize }) => {
      const paddingTop = 20; // Distance from the top to consider "at the top"
      return contentOffset.y <= paddingTop;
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
      const messageRef = doc(firestore, 'adminchats', message._id);
    
      // Optimistically update the UI
      let newLikedMessages = new Set(likedMessages);
      const isCurrentlyLiked = likedMessages.has(message._id);
      if (isCurrentlyLiked) {
        newLikedMessages.delete(message._id);
      } else {
        newLikedMessages.add(message._id);
      }
      setLikedMessages(newLikedMessages);
    
      try {
        const messageDoc = await getDoc(messageRef);
        if (!messageDoc.exists()) {
          console.error("Document does not exist!");
          throw new Error("Document does not exist!");
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
      } catch (error) {
        console.error('Error updating like:', error);
        // If error, revert the optimistic update
        setLikedMessages(likedMessages); // revert to previous state
      }
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
      navigation.navigate('GifSelectionScreen', {clubName, screenName});
      closeModal();
    };
    

    const sendMessage = useCallback(async () => {
      setMessageText('');
      const userId = auth.currentUser.uid;
      // Adjust the reference path to include `userName` at the end
      const userNameRef = ref(db, `users/${userId}/userName`);
      const userNameSnapshot = await get(userNameRef);
      // Since you're now directly accessing the userName, you can directly use `.val()` to get the userName value
      const userName = userNameSnapshot.val();
      // Check if there's either text, an image URL, or a gifUrl
      if (messageText.trim() || imageUrl || gifUrl) {
        try {
          const message = {
            id: Date.now().toString(),
            createdAt: new Date(),
            text: messageText.trim(),
            user: {
              _id: auth.currentUser.uid,
              name: userName,
              avatar: 'https://i.pravatar.cc/300',
            },
            likeCount: 0,
            image: imageUrl,
            gifUrl: gifUrl, // Add the gifUrl to the message
            likes: [],
          };
  
          // Add the message to Firestore
          await addDoc(collection(firestore, 'adminchats'), {
            ...message,
            clubName,
          });
  
          // Clear the message input field, image URL, and gifUrl
          setImageUrl(null);
          setGifUrl(null); // Reset the gifUrl after sending the message
  
        } catch (error) {
          console.error('Error sending message:', error);
        }
      }
  }, [messageText, imageUrl, gifUrl]); // Include gifUrl in the dependency array
  
  
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
<Text style={styles.adminViewText}>Admin View</Text> 
{( pinnedMessageCount > 0 &&
<TouchableOpacity style={styles.pinnedMessagesContainer} onPress={navigateToSearchPinnedMessages}>
  <View style={styles.blueBar}>
    <MaterialCommunityIcons name="pin" size={20} color="black" />
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
      onPress={scrollToTop}
    >
      <Ionicons name="arrow-down" size={24} color="black" />
    </TouchableOpacity>
  )}

      <FlatList
        ref={flatListRef}
        renderItem={renderMessage}
        keyExtractor={(item) => item._id}
        inverted
        //onContentSizeChange={() => scrollToTop()}
       // Adjust as needed for performance
        contentContainerStyle={{ paddingBottom: 50 }} 
        data={messages} 
        onScroll={({nativeEvent}) => {
          const isAtBottom = isCloseToTop(nativeEvent);
          setIsAtBottom(isAtBottom);
        }}
      />  
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
  <View style={styles.toolbar}>

    <TouchableOpacity style={styles.toolbarButton} onPress={openModal}>
        <Entypo name='plus' size={30} color="black" />
      </TouchableOpacity>
      <BottomSheetModal
        isVisible={isModalVisible}
        onClose={closeModal}
        onUploadImage={handleImageUploadAndSend}
        onUploadGif={handleGifSend}
        onOpenCamera={handleCameraPress}
      />
    {/* Container for TextInput and Image Preview */}
    <View style={styles.inputWithPreview}>
      {imageUrl && (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: imageUrl }} style={styles.imagePreview} />
          <TouchableOpacity onPress={() => setImageUrl(null)} style={styles.removeImageButton}>
            <Ionicons name="close-circle" size={20} color="gray" />
          </TouchableOpacity>
        </View>
      )}

    {gifUrl && (
      <View style={styles.imagePreviewContainer}>
        <Image source={{ uri: gifUrl }} style={styles.imagePreview} />
        <TouchableOpacity onPress={() => setGifUrl(null)} style={styles.removeImageButton}>
          <Ionicons name="close-circle" size={20} color="gray" />
        </TouchableOpacity>
      </View>
    )}
      <TextInput
        style={styles.input}
        value={messageText}
        onChangeText={setMessageText}
        placeholder={imageUrl ? "Add a message or send." : "Type a message..."}
        multiline={true}
        maxHeight={120}
        onFocus={handleTextInputFocus} // Add this line
        returnKeyType="done" // Prevents new lines
        placeholderTextColor="#888888"
      />
    </View>

    {/* Send Button */}
    <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
      <Ionicons name="send" size={24} color={Colors.black} />
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
    paddingBottom: 10,
  },
  messageContent: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Adjusted alignment
    maxWidth: '70%'
  },
  messageText: {
    maxWidth: '100%',
    paddingBottom: 5,
  },
  toolbarButton: {
    paddingLeft: 5,
    backgroundColor: 'transparent',
  },
  senderName: {
    fontSize: 12,
    marginRight: 5,
    color: '#3b3b3b'
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 25,
    paddingBottom: 25,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    backgroundColor: 'white',
  },
  imagePreviewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
  },
  inputWithPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
    backgroundColor: "#EEEEEE",
    borderRadius: 10,
  },
  input: {
    flex: 1,
    borderColor: 'white',
    borderRadius: 10,
    marginLeft: 0,
    marginTop: 5,
    backgroundColor: "#EEEEEE",
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
    color: 'white',
  },
  imagePreview: {
    width: 50, // Adjust size as needed
    height: 50, // Adjust size as needed
    borderRadius: 5,
  },
  removeImageButton: {
    position: 'absolute',
    right: 5,
    top: 5,
  },
  removeImageText: {
    color: 'white',
    fontSize: 12,
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
    contentFit: 'contain',
    borderRadius: 10,
  },
  pinnedMessagesContainer: {
    flexDirection: 'row',
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
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
  adminViewText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
    paddingVertical: 10,
  },
});
