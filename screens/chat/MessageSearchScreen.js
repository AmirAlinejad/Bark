import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
// Firebase
import { query, collection, where, onSnapshot } from 'firebase/firestore';
import { firestore } from '../../backend/FirebaseConfig'; // Update this path according to your project structure
// icons
import { Ionicons } from '@expo/vector-icons';
// my components
import Header from '../../components/display/Header';
import MessageItem from '../../components/chat/MessageItem';
import SearchBar from '../../components/input/SearchBar';
import ProfileOverlay from '../../components/overlays/ProfileOverlay';
import CustomText from '../../components/display/CustomText';
// icons
import { MaterialCommunityIcons } from '@expo/vector-icons';
// styles
import { Colors } from '../../styles/Colors'

const MessageSearchScreen = ({ route, navigation }) => {
  const { clubId, chatName, pin } = route.params;
  // states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchPinned, setSearchPinned] = useState(pin);
  const [messages, setMessages] = useState([]);
  // overlay
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayUserData, setOverlayUserData] = useState({});
  // loading
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = () => {
      const messagesQuery = query(collection(firestore, chatName), where('clubId', '==', clubId), where('pinned', '==', searchPinned)); // [2

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

      setLoading(false);

      return unsubscribe;
    };
    return fetchMessages();
  }, [ searchPinned]);

  const filteredMessages = messages.filter(message =>
    message.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderMessage = ({ item }) => (
    <MessageItem 
      item={item} 
      setOverlayVisible={setOverlayVisible} 
      setOverlayUserData={setOverlayUserData}
    />
  );

  return (
    <View style={styles.container}>
      <Header navigation={navigation} text="Messages" back={true} />
      <TouchableOpacity style={styles.pinnedButton} onPress={() => setSearchPinned(!searchPinned)}>
        <MaterialCommunityIcons
          name={'pin'}
          size={30}
          color={searchPinned ? Colors.buttonBlue : Colors.gray}
          
        />
      </TouchableOpacity>
      
      <View style={styles.searchBarView}>
        <SearchBar value={searchQuery} setValue={setSearchQuery} placeholder="Search messages" />
      </View>

      {/* Show if no messages */}
      {filteredMessages.length === 0 && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 200 }}>
          <Ionicons name="chatbubbles" size={100} color={Colors.gray} />
          <CustomText text="No messages to display." font='bold' style={{ fontSize: 20, color: Colors.darkGray }} />
        </View>
      )}

      <FlatList
        data={filteredMessages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
      />

      {/* Overlay */}
      <ProfileOverlay
        visible={overlayVisible}
        setVisible={setOverlayVisible}
        userData={overlayUserData}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
  },
  searchBarView: {
    margin: 15,
    marginTop: 5,
    marginBottom: 10,
  },
  messageList: {
    paddingBottom: 20,
    paddingHorizontal: 0,
  },
  pinnedButton: {
    position: 'absolute',
    right: 30,
    top: 65,
  },
});

export default MessageSearchScreen;
