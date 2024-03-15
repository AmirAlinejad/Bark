import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Header from '../../components/Header';
import { Colors } from '../../styles/Colors'; // Import your color constants here

const PinnedMessagesScreen = ({ route, navigation }) => {
  const { clubName, groupChats } = route.params;
  const [searchQuery, setSearchQuery] = useState('');

  // Filter pinned messages based on search query
  const filteredPinnedMessages = groupChats[clubName].filter(
    message =>
      message.pinned &&
      message.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render each pinned message item
  const renderPinnedMessage = ({ item }) => (
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

  // Format date and time in a human-readable format with AM/PM indicator
  const formatDateTime = (dateTime) => {
    const messageDate = new Date(dateTime);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[messageDate.getMonth()];
    const day = messageDate.getDate();
    const year = messageDate.getFullYear();
    let hours = messageDate.getHours();
    const minutes = messageDate.getMinutes();

    // Convert hours to 12-hour format and determine AM/PM
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // Convert 0 to 12 for 12-hour format

    // Pad single-digit minutes with leading zero
    const formattedMinutes = (minutes < 10 ? '0' : '') + minutes;

    return `${month} ${day}, ${year} ${hours}:${formattedMinutes} ${ampm}`;
  };

  return (
    <View style={styles.container}>
      <Header navigation={navigation} text="Pinned Messages" back={true} />
      <View style={styles.searchContainer}>
        <MaterialIcons
          name="search"
          size={24}
          color={Colors.gray}
        />
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
        keyExtractor={(item) => item.id.toString()}
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
});

export default PinnedMessagesScreen;
