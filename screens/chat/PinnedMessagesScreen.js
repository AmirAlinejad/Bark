import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { firestore } from '../../backend/FirebaseConfig'; // Import your Firebase config
import { query, collection, where, getDocs } from 'firebase/firestore';
import Header from '../../components/Header';

const PinnedMessagesScreen = ({ route, navigation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [messages, setMessages] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const clubName = route?.params?.clubName; // Assume you pass the clubName as a parameter

  useEffect(() => {
    const fetchMessages = async () => {
      const messagesRef = collection(firestore, 'chats');
      const q = query(messagesRef, where('clubName', '==', clubName), where('pinned', '==', true));

      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map(doc => ({
        _id: doc.id,
        text: doc.data().text,
        createdAt: doc.data().createdAt?.toDate(),
        user: doc.data().user,
        likeCount: doc.data().likeCount || 0, // Assume you're storing like count in the message document
        image: doc.data().image, // Assuming image URL is stored in 'image' field
      }));
      setMessages(results);
      setSearchResults(results);
    };

    fetchMessages();
  }, [clubName]);

  const handleSearch = (text) => {
    setSearchTerm(text);
    const filteredResults = messages.filter(message =>
      message.text.toLowerCase().includes(text.toLowerCase())
    );
    setSearchResults(filteredResults);
  };

  const onViewImage = (imageUri) => {
    navigation.navigate('ImageViewerScreen', { imageUri });
  };

  return (
    <View style={styles.container}>
      <Header navigation={navigation} text="Pinned Messages" back={true} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search messages..."
        value={searchTerm}
        onChangeText={handleSearch}
      />
      <FlatList
        data={searchResults}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.messageItem}>
            <View style={styles.messageHeader}>
              {item.user && item.user.avatar ? (
                <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.placeholderAvatar} />
              )}
              <Text style={styles.username}>{item.user ? item.user.name || item.user._id : 'Unknown'}</Text>
            </View>
            <Text>{item.text}</Text>
            {item.image && (
              <TouchableOpacity onPress={() => onViewImage(item.image)}>
                <Text style={styles.viewImageButton}>View Image</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.likes}>Likes: {item.likeCount}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    backgroundColor: "#FAFAFA",
  },
  searchInput: {
    height: 40,
    marginBottom: 20,
    borderWidth: 1,
    padding: 10,
    borderColor: 'gray',
    borderRadius: 5,
  },
  messageItem: {
    backgroundColor: 'lightgrey',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  placeholderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ccc',
    marginRight: 10,
  },
  username: {
    fontWeight: 'bold',
  },
  viewImageButton: {
    color: 'blue',
    marginTop: 5,
  },
  likes: {
    marginTop: 5,
    fontSize: 12,
    color: 'grey',
  },
});

export default PinnedMessagesScreen;
