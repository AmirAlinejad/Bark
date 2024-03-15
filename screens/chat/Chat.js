import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, StyleSheet, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [likedMessages, setLikedMessages] = useState({});
  const flatListRef = useRef(null);

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    saveMessages();
  }, [messages]);

  useEffect(() => {
    saveLikedMessages();
  }, [likedMessages]);

  const loadMessages = async () => {
    try {
      const savedMessages = await AsyncStorage.getItem('chat');
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }

      const likedMessagesStatus = await AsyncStorage.getItem('likedMessages');
      if (likedMessagesStatus) {
        setLikedMessages(JSON.parse(likedMessagesStatus));
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const saveMessages = async () => {
    try {
      await AsyncStorage.setItem('chat', JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  };

  const saveLikedMessages = async () => {
    try {
      await AsyncStorage.setItem('likedMessages', JSON.stringify(likedMessages));
    } catch (error) {
      console.error('Error saving liked messages:', error);
    }
  };

  const onSendMessage = () => {
    if (messageText.trim() === '') return;

    const newMessage = {
      id: messages.length + 1,
      text: messageText.trim(),
      sender: 'User',
      likes: 0, // Initialize likes to 0
      avatarUrl: 'https://i.pravatar.cc/300',
    };

    setMessages(prevMessages => [...prevMessages, newMessage]);
    setMessageText('');

    // Scroll to the end after updating messages
    scrollToBottom();
  };

  const onAddImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      const newMessage = {
        id: messages.length + 1,
        image: result.uri,
        sender: 'User',
        likes: 0, // Initialize likes to 0
        avatarUrl: 'https://i.pravatar.cc/300',
      };

      setMessages(prevMessages => [...prevMessages, newMessage]);

      // Scroll to the end after adding the image
      scrollToBottom();
    }
  };

  const scrollToBottom = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  const onLikePress = (messageId) => {
    setLikedMessages(prev => {
      const newState = { ...prev };
      newState[messageId] = !newState[messageId];
      return newState;
    });

    setMessages(prevMessages =>
      prevMessages.map(message =>
        message.id === messageId ? { ...message, likes: likedMessages[messageId] ? message.likes - 1 : message.likes + 1 } : message
      )
    );
  };

  const renderMessage = ({ item }) => (
    <View style={styles.messageContainer}>
      <View style={styles.messageContent}>
        <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.messageImage} />
        ) : (
          <View>
            <Text style={styles.senderName}>{item.sender}:</Text>
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
      </View>
      <TouchableOpacity onPress={() => onLikePress(item.id)} style={styles.likeButton}>
        <FontAwesome name="heart" size={20} color={likedMessages[item.id] ? 'red' : 'black'} />
        <Text style={styles.likeCount}>{item.likes}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon}>
          <FontAwesome name="arrow-left" size={20} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Club Name</Text>
        <TouchableOpacity style={styles.headerIcon}>
          <FontAwesome name="search" size={20} color="black" />
        </TouchableOpacity>
      </View>
      <FlatList
        ref={flatListRef}
        data={messages}
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
            <Text style={styles.sendButtonText}>Send</Text>
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
    marginTop: 40,
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
  },
  messageContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageText: {
    marginLeft: 5,
  },
  senderName: {
    fontWeight: 'bold',
    marginRight: 5,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
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
    borderColor: 'gray',
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  sendButton: {
    marginLeft: 10,
    padding: 10,
    backgroundColor: 'blue',
    borderRadius: 5,
  },
  sendButtonText: {
    color: 'white',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  messageImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    borderRadius: 10,
  },
});

export default Chat;
