import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, Image, StyleSheet } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '../backend/FirebaseConfig';
import Header from '../components/Header';

export default function PinnedMessagesScreen({ route, navigation }) {
  const { clubName } = route.params;
  const [searchQuery, setSearchQuery] = useState('');
  const [pinnedMessages, setPinnedMessages] = useState([]);

  useEffect(() => {
    const getPinnedMessages = async () => {
      const q = query(
        collection(firestore, 'chats'),
        where('pinned', '==', true),
        where('clubName', '==', clubName)
      );
      const querySnapshot = await getDocs(q);
      const pinnedMessagesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        data: doc.data(),
      }));
      setPinnedMessages(pinnedMessagesData);
    };

    getPinnedMessages();
  }, [clubName]);

  const filteredPinnedMessages = pinnedMessages.filter((message) =>
    message.data.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Header navigation={navigation} text="Pinned Messages" back={true} />
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search messages..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <Text style={styles.sectionTitle}>Pinned Messages</Text>
      <FlatList
        data={filteredPinnedMessages}
        renderItem={({ item }) => (
          <View style={styles.messageItem}>
            <View style={styles.messageHeader}>
              <Text style={styles.username}>{item.data.user.name || item.data.user._id}</Text>
            </View>
            <Text>{item.data.text}</Text>
            <Text style={styles.likes}>Likes: {item.data.likeCount}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text>No pinned messages found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginTop: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: 'black',
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  messageItem: {
    backgroundColor: '#FAFAFA',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
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
