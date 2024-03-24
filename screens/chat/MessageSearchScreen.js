import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, Alert, TouchableOpacity } from 'react-native';
import { query, collection, where, onSnapshot } from 'firebase/firestore';
import { firestore } from '../../backend/FirebaseConfig'; // Update this path according to your project structure
import Header from '../../components/Header'; // Update this import based on your project structure
import {Colors} from '../../styles/Colors'
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';

const MessageSearchScreen = ({ route, navigation }) => {
  const { clubName, chatName } = route.params;
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = () => {
      const messagesQuery = query(collection(firestore, chatName), where('clubName', '==', clubName));

      const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
        const fetchedMessages = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
        }));
        setMessages(fetchedMessages);
      }, (error) => {
        Alert.alert("Error fetching messages", error.message);
      });

      return unsubscribe;
    };

    return fetchMessages();
  }, [clubName]);

  const filteredMessages = messages.filter(message =>
    message.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderMessage = ({ item }) => (
    <View style={styles.messageItem}>
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
      </View>
      <View style={styles.messageContent}>
        <Text style={styles.senderName}>{item.user.name}</Text>
        {/* Display text message */}
        {item.text && <Text style={styles.messageText}>{item.text}</Text>}
        {/* Display image with option to view larger */}
        {item.image && (
          <TouchableOpacity onPress={() => navigation.navigate('ImageViewerScreen', { imageUri: item.image })}>
            <Image source={{ uri: item.image }} style={styles.messageImage} />
            <Text style={styles.viewImageText}></Text>
          </TouchableOpacity>
        )}
        {/* Display GIF with option to view larger */}
        {item.gifUrl && (
          <TouchableOpacity onPress={() => navigation.navigate('ImageViewerScreen', { imageUri: item.gifUrl })}>
            <Image source={{ uri: item.gifUrl }} style={styles.messageImage} />
            <Text style={styles.viewImageText}></Text>
          </TouchableOpacity>
        )}
        <Text style={styles.dateTime}>{formatDateTime(item.createdAt)}</Text>
      </View>
    </View>
  );
  
  

  const formatDateTime = (dateTime) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
    return dateTime.toLocaleString('en-US', options);
  };

  return (
    <View style={styles.container}>
      <Header navigation={navigation} text="Pinned Messages" back={true} />
      <View style={styles.searchContainer}>
      <MaterialIcons name="search" size={24} color={Colors.gray} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search messages..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      </View>
      <FlatList
        data={filteredMessages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    padding: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
    paddingBottom: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  messageList: {
    paddingBottom: 20,
  },
  messageItem: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  avatarContainer: {
    marginRight: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  messageContent: {
    flex: 1,
  },
  senderName: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  messageText: {
    fontSize: 16,
    marginBottom: 5,
  },
  dateTime: {
    color: 'gray',
    fontSize: 12,
  },
  messageImage: {
    width: 100, // Adjust the size as needed
    height: 100, // Adjust the size as needed
    resizeMode: 'cover',
    borderRadius: 5, // Optional: if you want rounded corners
    marginVertical: 5, // Spacing above and below the image
  },
  viewImageText: {
    fontSize: 14,
    color: Colors.primary, // Use a color that indicates it's clickable
    textDecorationLine: 'underline',
    textAlign: 'center', // Center the text below the image
  },
});

export default MessageSearchScreen;
