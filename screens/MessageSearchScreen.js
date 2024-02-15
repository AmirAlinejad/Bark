import React, { useState } from 'react';
import { View, TextInput, FlatList, Text, StyleSheet, Image } from 'react-native';
import { firestore } from '../backend/FirebaseConfig'; // Import your Firebase config
import { query, collection, where, getDocs } from 'firebase/firestore';

const MessageSearchScreen = ({ route }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const clubName = route?.params?.clubName; // Assume you pass the clubName as a parameter

  const handleSearch = async () => {
    const messagesRef = collection(firestore, 'chats');
    const q = query(messagesRef, where('clubName', '==', clubName), where('text', '>=', searchTerm), where('text', '<=', searchTerm + '\uf8ff'));

    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map(doc => ({
      _id: doc.id,
      text: doc.data().text,
      createdAt: doc.data().createdAt.toDate(),
      user: doc.data().user,
      likeCount: doc.data().likeCount || 0, // Assume you're storing like count in the message document
    }));
    setSearchResults(results);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search messages..."
        value={searchTerm}
        onChangeText={setSearchTerm}
        onSubmitEditing={handleSearch} // Trigger search when the user submits the input
      />
      <FlatList
        data={searchResults}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.messageItem}>
            <View style={styles.messageHeader}>
              {item.user.avatar ? (
                <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.placeholderAvatar} />
              )}
              <Text style={styles.username}>{item.user.name || item.user._id}</Text>
            </View>
            <Text>{item.text}</Text>
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
    paddingTop: 50,
    paddingHorizontal: 10,
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
  likes: {
    marginTop: 5,
    fontSize: 12,
    color: 'grey',
  },
});

export default MessageSearchScreen;
