// Chat.js

import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { TouchableOpacity } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import {
  collection,
  addDoc,
  orderBy,
  query,
  onSnapshot
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth,firestore, db } from './backend/FirebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';
import colors from '../colors';
import { View } from 'react-native';
import { IconButton } from 'react-native-paper';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const navigation = useNavigation();

  const onSignOut = () => {
    signOut(auth).catch(error => console.log('Error logging out: ', error));
  };
  const onBackPress = () => {
    navigation.goBack();
  }
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={{ marginRight: 10 }}
          onPress={onSignOut}
        >
          <AntDesign name="logout" size={24} color={colors.gray} />
        </TouchableOpacity>
      )
    });
  }, [navigation]);

  useLayoutEffect(() => {
    const collectionRef = collection(firestore, 'chats');
    const q = query(collectionRef, orderBy('createdAt', 'desc'));
  
    const unsubscribe = onSnapshot(q, querySnapshot => {
      console.log('querySnapshot unsubscribe');
      setMessages(
        querySnapshot.docs.map(doc => ({
          _id: doc.id,
          createdAt: doc.data().createdAt.toDate(),
          text: doc.data().text,
          user: doc.data().user
        }))
      );
    });
  
    return () => unsubscribe();
  }, [db]); // Ensure db is included in the dependency array if it's being used inside the hook
  
  const onSend = useCallback((messages = []) => {
    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, messages)
    );

    const { _id, createdAt, text, user } = messages[0];
    addDoc(collection(firestore, 'chats'), {
      _id,
      createdAt,
      text,
      user
    });
  }, []);

  return (
    <View style={{ flex: 1 }}>
    <View style={{ marginTop: 30, paddingHorizontal: 10 }}>
      <IconButton
        onPress={onBackPress}
        icon="arrow-left"
        size={30}
      />
    </View>
    <GiftedChat
      messages={messages}
      showAvatarForEveryMessage={false}
      showUserAvatar={false}
      onSend={messages => onSend(messages)}
      messagesContainerStyle={{
        backgroundColor: '#fff'
      }}
      textInputStyle={{
        backgroundColor: '#fff',
        borderRadius: 20,
      }}
      user={{
        _id: auth?.currentUser?.email,
        avatar: 'https://i.pravatar.cc/300'
      }}
    />
  </View>
  );
}
