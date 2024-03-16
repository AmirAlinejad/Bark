import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, Image, Alert } from 'react-native';
import { query, collection, where, onSnapshot } from 'firebase/firestore';
import { firestore } from '../../backend/FirebaseConfig'; // Update this path according to your project structure
import Header from '../../components/Header'; // Update this import based on your project structure

const MessageSearchScreen = ({ route, navigation }) => {
  const { clubName } = route.params;
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = () => {
      const messagesQuery = query(collection(firestore, 'chats'), where('clubName', '==', clubName));

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
        <Text style={styles.messageText}>{item.text}</Text>
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
      <Header navigation={navigation} text="Search Messages" back={true} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search messages..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
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
    paddingHorizontal: 10,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 5,
    marginBottom: 10,
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
});

export default MessageSearchScreen;
