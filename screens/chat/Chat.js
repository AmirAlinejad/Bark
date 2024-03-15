import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, StyleSheet, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../styles/Colors';
import { Alert } from 'react-native';
import ImageViewerScreen from './ImageViewerScreen'; // Import ImageViewerScreen component

const Chat = ({ route, auth, navigation }) => {
  const [groupChats, setGroupChats] = useState({});
  const [messageText, setMessageText] = useState('');
  const [likedMessages, setLikedMessages] = useState({});
  const [pinnedMessagesCount, setPinnedMessagesCount] = useState(0);
  const [imageUris, setImageUris] = useState([]);

  const flatListRef = useRef(null);
  const clubName = route?.params?.clubName;

  useEffect(() => {
    loadLikedMessages();
    loadGroupChats();
  }, []);

  useEffect(() => {
    saveGroupChats();
    updatePinnedMessagesCount(); 
    collectImageUris()
  }, [groupChats]);

  useEffect(() => {
    saveLikedMessages();
  }, [likedMessages]);

  const loadLikedMessages = async () => {
    try {
      const likedMessagesStatus = await AsyncStorage.getItem('likedMessages');
      if (likedMessagesStatus) {
        setLikedMessages(JSON.parse(likedMessagesStatus));
      }
    } catch (error) {
      console.error('Error loading liked messages:', error);
    }
  };
  
  const loadGroupChats = async () => {
    try {
      const savedGroupChats = await AsyncStorage.getItem('groupChats');
      if (savedGroupChats) {
        setGroupChats(JSON.parse(savedGroupChats));
      }

      const likedMessagesStatus = await AsyncStorage.getItem('likedMessages');
      if (likedMessagesStatus) {
        setLikedMessages(JSON.parse(likedMessagesStatus));
      }
    } catch (error) {
      console.error('Error loading group chats:', error);
    }
  };

  const saveGroupChats = async () => {
    try {
      await AsyncStorage.setItem('groupChats', JSON.stringify(groupChats));
    } catch (error) {
      console.error('Error saving group chats:', error);
    }
  };

  const saveLikedMessages = async () => {
    try {
      await AsyncStorage.setItem('likedMessages', JSON.stringify(likedMessages));
    } catch (error) {
      console.error('Error saving liked messages:', error);
    }
  };

  const togglePin = async (messageId) => {
    // Retrieve the message from the groupChats state based on the messageId
    const message = groupChats[clubName].find(message => message.id === messageId);
  
    // Toggle the pinned status of the message
    message.pinned = !message.pinned;
  
    // Update the groupChats state
    setGroupChats(prevGroupChats => ({
      ...prevGroupChats,
      [clubName]: [...prevGroupChats[clubName]],
    }));
  
    // Save the updated groupChats to AsyncStorage
    await saveGroupChats();
  };

  const updatePinnedMessagesCount = () => {
    if (groupChats[clubName]) {
      const pinnedCount = groupChats[clubName].filter(message => message.pinned).length;
      setPinnedMessagesCount(pinnedCount);
    }
  };

  const deleteMessage = async (messageId) => {
    // Filter out the message to be deleted from the groupChats state
    const updatedChats = {
      ...groupChats,
      [clubName]: groupChats[clubName].filter(message => message.id !== messageId),
    };
  
    // Update the groupChats state
    setGroupChats(updatedChats);
  
    // Save the updated groupChats to AsyncStorage
    await saveGroupChats();
  };
  const collectImageUris = () => {
    const uris = [];
    Object.values(groupChats).forEach(messages => {
      messages.forEach(message => {
        if (message.image) {
          uris.push(message.image);
        }
      });
    });
    setImageUris(uris);
  };
  const onSendMessage = () => {
    if (messageText.trim() === '' || !clubName) return;

    const newMessage = {
      id: Date.now().toString(),
      createdAt: new Date(),
      text: messageText.trim(),
      user: {
        _id: auth?.currentUser?.email,
        name: "Username", 
        avatar: 'https://i.pravatar.cc/300',
      },
      likes: 0, // Initialize likes to 0
    };

    const updatedChats = { ...groupChats };
    if (!updatedChats[clubName]) {
      updatedChats[clubName] = [];
    }
    updatedChats[clubName].push(newMessage);

    setGroupChats(updatedChats);
    setMessageText('');

    // Scroll to the end after updating messages
    scrollToBottom();
  };

  const onAddImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      alert("You've refused to allow this app to access your photos!");
      return;
    }

    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!pickerResult.cancelled && pickerResult.assets && pickerResult.assets.length > 0) {
      const selectedImageUri = pickerResult.assets[0].uri;
      navigation.navigate('ImageViewerScreen', { imageUri: selectedImageUri }); // Navigate to ImageViewerScreen with image URI
    }
  };

  const scrollToBottom = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  const onLikePress = (clubName, messageId) => {
    const updatedChats = { ...groupChats };
    const chatMessages = updatedChats[clubName];
    const messageIndex = chatMessages.findIndex(message => message.id === messageId);
    
    if (messageIndex !== -1) {
      // Toggle the like status for the current message
      chatMessages[messageIndex].likes += likedMessages[messageId] ? -1 : 1;
      
      // Toggle the liked status for the current message for the current user
      setLikedMessages(prev => {
        const newState = { ...prev };
        newState[messageId] = !newState[messageId];
        return newState;
      });
  
      // Update the groupChats state
      setGroupChats(updatedChats);
  
      // Save the updated liked messages to AsyncStorage
      saveLikedMessages();
    }
  };
  

  const navigateToMessageSearchScreen = () => {
    navigation.navigate('MessageSearchScreen', { clubName, groupChats });
  };

  const navigateToSearchPinnedMessages = () => {
    navigation.navigate('PinnedMessagesScreen', { clubName, groupChats });
  };

  const handleLongPress = (messageId) => {
    // Retrieve the message from the groupChats state based on the messageId
    const message = groupChats[clubName].find(message => message.id === messageId);
  
    // Check if the message belongs to the current user
    const isCurrentUserMessage = message.user._id === auth?.currentUser?.email;
  
    // Define the alert options based on whether the message belongs to the current user and its pinned status
    const alertOptions = [
      { 
        text: message.pinned ? 'Unpin' : 'Pin', 
        onPress: () => isCurrentUserMessage ? togglePin(messageId) : null 
      },
      { 
        text: isCurrentUserMessage ? 'Delete' : message.pinned ? 'Unpin' : 'Pin', 
        onPress: () => isCurrentUserMessage ? deleteMessage(messageId) : togglePin(messageId) 
      },
      { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
    ];
  
    // Show the alert
    Alert.alert(
      'Message Options',
      'Choose an action for this message:',
      alertOptions,
      { cancelable: true }
    );
  };

  const renderMessage = ({ item }) => (
    
    <TouchableOpacity 
      onLongPress={() => handleLongPress(item.id)}
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
      <TouchableOpacity onPress={() => onLikePress(clubName, item.id)} style={styles.likeButton}>
        <Ionicons name="heart" size={20} color={likedMessages[item.id] ? 'red' : 'black'} />
        <Text style={styles.likeCount}>{item.likes}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.goBack()}>
          <FontAwesome name="arrow-left" size={20} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.clubNameContainer} onPress={() => navigation.navigate("InClubView", { clubName, groupChats, imageUris })}>
          <View style={styles.imageContainer}>
            {/* Placeholder image */}
          </View>
          <Text style={styles.clubNameText}>{clubName}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerIcon}onPress={navigateToMessageSearchScreen}>
          <FontAwesome name="search" size={20} color="black" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.pinnedMessagesContainer} onPress={navigateToSearchPinnedMessages}>
        {<View style={styles.blueBar}><MaterialCommunityIcons name="pin" size={24} color="black" /></View>}
        {pinnedMessagesCount > 0 && <View style={styles.blueBar}></View>}
        {pinnedMessagesCount > 0 && <Text style={styles.pinnedMessagesText}>{pinnedMessagesCount} Pinned Messages</Text>}
      </TouchableOpacity>
      <FlatList
        ref={flatListRef}
        data={groupChats[clubName] || []}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        onContentSizeChange={() => scrollToBottom()}
        contentContainerStyle={{ paddingBottom: 50 }} 
      />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={styles.toolbar}>
          <TouchableOpacity style={styles.toolbarButton} onPress={onAddImage}>
            <Ionicons name='add-circle' size={30} color="black" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Type a message..."
          />
          <TouchableOpacity onPress={onSendMessage} style={styles.sendButton}>
            <Ionicons name="send" size={30} color={Colors.black} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    marginTop: 50,
    paddingHorizontal: 10,
    justifyContent: 'space-between',
  },
  headerText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerIcon: {
    padding: 5,
  },
  messageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    paddingBottom: 20,
    maxWidth: '60%',
  },
  messageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    
  },
  messageText: {
    marginLeft: 5,
    maxWidth: '100%',
  },
  senderName: {
    fontWeight: 'bold',
    marginRight: 5,
  },
  likeButton: {
    flexDirection: 'row',
  alignItems: 'center',
  position: "absolute", // Corrected typo here
  right: -120, // Adjust right positioning as needed
  

  },
  likeCount: {
    marginLeft: 5,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: 'gray',
    backgroundColor: '#f0f0f0',
    marginTop: -10,
  },
  input: {
    flex: 1,
    borderColor: '#f0f0f0',
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  sendButton: {
    marginLeft: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
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
    marginLeft: 10, // Add some right margin for spacing
    marginTop:10,
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
    borderRadius: 5,
    overflow: 'hidden',
    marginRight: 10,
    backgroundColor: 'lightgray', // Placeholder background color
  },
});

export default Chat;
