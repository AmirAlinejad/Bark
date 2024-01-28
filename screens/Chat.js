import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Image } from 'react-native';
import { GiftedChat, Send, Message } from 'react-native-gifted-chat';
import {
  collection,
  addDoc,
  orderBy,
  query,
  onSnapshot,
  where
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, firestore } from '../backend/FirebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { uploadImage} from '../components/imageUploadUtils' // Import the utility function
import colors from '../styles/Colors';

export default function Chat({ route }) {
  const [messages, setMessages] = useState([]);
  const navigation = useNavigation();
  const clubName = route?.params?.clubName;

  const onSignOut = () => {
    signOut(auth).catch(error => console.log('Error logging out: ', error));
  };

  const onBackPress = () => {
    navigation.goBack();
  };

  useLayoutEffect(() => {
    let unsubscribe;

    if (clubName) {
      const collectionRef = collection(firestore, 'chats');
      const q = query(
        collectionRef,
        where('clubName', '==', clubName),
        orderBy('createdAt', 'desc')
      );

      unsubscribe = onSnapshot(q, querySnapshot => {
        setMessages(
          querySnapshot.docs.map(doc => ({
            _id: doc.id,
            createdAt: doc.data().createdAt.toDate(),
            text: doc.data().text,
            user: doc.data().user,
            image: doc.data().image // Ensure you handle the image field in your Firestore documents
          }))
        );
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [clubName]);

  const onSend = useCallback((messages = []) => {
    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, messages)
    );
  
    const { _id, createdAt, text, user, image } = messages[0];
    if (clubName) {
      const messageData = {
        _id,
        createdAt,
        text,
        user,
        clubName,
        image: image || null, // Set to null if image is undefined
      };
  
      addDoc(collection(firestore, 'chats'), messageData);
    }
  }, [clubName]);
  
  const handleImageUploadAndSend = () => {
    uploadImage((imageUri) => {
        const message = {
            _id: Date.now().toString(),
            createdAt: new Date(),
            user: {
                _id: auth?.currentUser?.email,
                avatar: 'https://i.pravatar.cc/300',
            },
            image: imageUri,
            text: '', // Ensure text is always defined
        };

        onSend([message]);
    });
};
const isCurrentUser = (messageUser) => {
  // Check if the message was sent by the current user
  return messageUser._id === auth?.currentUser?.email;
};

const renderMessage = (props) => {
  const currentUser = isCurrentUser(props.currentMessage.user);
  return (
    <View style={{ marginBottom: 5 }}>
      <Text
        style={[
          styles.usernameText,
          currentUser ? styles.usernameRight : styles.usernameLeft,
        ]}
      >
        {currentUser ? 'You' : props.currentMessage.user.name || props.currentMessage.user._id}
      </Text>
      <Message
        {...props}
        containerStyle={{
          left: { backgroundColor: '#f0f0f0' },
          right: { backgroundColor: '#007bff' }, // Blue bubble for current user
        }}
      />
    </View>
  );
};
  const renderMessageImage = (props) => {
    if (props.currentMessage.image) {
      return (
        <View style={{ padding: 5 }}>
          <Image source={{ uri: props.currentMessage.image }} style={{ width: 200, height: 200 }} />
        </View>
      );
    }
    return null;
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 30, paddingHorizontal: 10 }}>
        <IconButton
          onPress={onBackPress}
          icon="arrow-left"
          size={30}
        />
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginLeft: 5 }}>{clubName}</Text>
        <View style={{ marginLeft: 'auto', marginRight: 10 }}>
          <IconButton
            icon="magnify"
            size={30}
            onPress={() => {
              navigation.navigate("UserList", {
                clubName: clubName,
              });
            }}
          />
        </View>
      </View>
      <GiftedChat
        messages={messages}
        renderSend={(props) => (
          <Send {...props} alwaysShowSend>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <TouchableOpacity style={{ marginRight: 10 }} onPress={() => {/* Handle camera button tap */}}>
                <MaterialCommunityIcons name="camera" size={32} color={colors.lightBlue} />
              </TouchableOpacity>
              <TouchableOpacity style={{ marginRight: 10 }} onPress={handleImageUploadAndSend}>
                <MaterialCommunityIcons name="plus" size={32} color={colors.lightBlue} />
                </TouchableOpacity>
              <TouchableOpacity style={{ marginBottom: 10 }} onPress={() => props.onSend({ text: props.text }, true)}disabled={!props.text.trim()}>
                <MaterialCommunityIcons name="send-circle" size={32} color={colors.lightBlue} />
              </TouchableOpacity>
            </View>
          </Send>
        )}
        renderMessageImage={renderMessageImage}
        showAvatarForEveryMessage={false}
        showUserAvatar={false}
        onSend={messages => onSend(messages)}
        messagesContainerStyle={{
          backgroundColor: '#fff',
          width: '100%',
        }}
        textInputStyle={{
          backgroundColor: '#fff',
          borderRadius: 20,
        }}
        user={{
          _id: auth?.currentUser?.email,
          avatar: 'https://i.pravatar.cc/300'
        }}
        renderMessage={renderMessage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  usernameText: {
    alignSelf: 'flex-start',
    fontSize: 12,
    color: '#666',
    paddingHorizontal: 5,
    paddingTop: 2,
    paddingBottom: 2,
    // Customize these styles to match your app’s design
  },
  usernameRight: {
    alignSelf: 'flex-end',
  },
  usernameLeft: {
    alignSelf: 'flex-start',
  },
});