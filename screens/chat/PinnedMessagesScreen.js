import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, Image, Alert, TouchableOpacity } from 'react-native';
import { query, collection, where, onSnapshot } from 'firebase/firestore';
import { firestore } from '../../backend/FirebaseConfig'; // Make sure this path matches your project structure
import { MaterialIcons } from '@expo/vector-icons';
import Header from '../../components/Header'; // Adjust this import to match your project structure
import { Colors } from '../../styles/Colors'; // Adjust this import to match your project structure

const PinnedMessagesScreen = ({ route, navigation }) => {
  const { clubName, chatName } = route.params;
  const [searchQuery, setSearchQuery] = useState('');
  const [pinnedMessages, setPinnedMessages] = useState([]);

  useEffect(() => {
    const messagesQuery = query(
      collection(firestore, chatName),
      where('clubName', '==', clubName),
      where('pinned', '==', true)
    );

    const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
      const fetchedMessages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
      }));
      setPinnedMessages(fetchedMessages);
    }, (error) => {
      Alert.alert("Error fetching pinned messages:", error.message);
    });

    return () => unsubscribe();
  }, [clubName]);

  const filteredPinnedMessages = pinnedMessages.filter(
    message => message.text.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const formatDateTime = (dateTime) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
    return dateTime.toLocaleString('en-US', options);
  };
  const renderPinnedMessage = ({ item }) => (
    <View style={styles.messageItem}>
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
      </View>
      <View style={styles.messageContent}>
        <Text style={styles.senderName}>{item.user.name}</Text>
        {/* Text message */}
        {item.text && <Text style={styles.messageText}>{item.text}</Text>}
        {/* Image message */}
        {item.image && (
          <TouchableOpacity onPress={() => navigation.navigate('ImageViewerScreen', { imageUri: item.image })}>
            <Image source={{ uri: item.image }} style={styles.messageImage} />
            <Text style={styles.viewImageText}></Text>
          </TouchableOpacity>
        )}
        <Text style={styles.dateTime}>{formatDateTime(item.createdAt)}</Text>
      </View>
    </View>
  );
  
  

  return (
    <View style={styles.container}>
      <Header navigation={navigation} text="Pinned Messages" back={true} />
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={24} color={Colors.gray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search messages"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <FlatList
        data={filteredPinnedMessages}
        renderItem={renderPinnedMessage}
        keyExtractor={(item) => item.id}
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

export default PinnedMessagesScreen;
