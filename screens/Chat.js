import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { GiftedChat,Send } from 'react-native-gifted-chat';
import {
  collection,
  addDoc,
  orderBy,
  query,
  onSnapshot,
  where
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, firestore, db } from '../backend/FirebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';
import colors from '../styles/Colors';
import { IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
    console.log('ClubName in useLayoutEffect:', clubName);

    let unsubscribe;

    if (clubName) {
      const collectionRef = collection(firestore, 'chats');
      const q = query(
        collectionRef,
        where('clubName', '==', clubName),
        orderBy('createdAt', 'desc')
      );

      unsubscribe = onSnapshot(q, querySnapshot => {
        console.log('querySnapshot in useLayoutEffect:', querySnapshot);
        setMessages(
          querySnapshot.docs.map(doc => ({
            _id: doc.id,
            createdAt: doc.data().createdAt.toDate(),
            text: doc.data().text,
            user: doc.data().user
          }))
        );
      });
    }

    return () => {
      if (unsubscribe) {
        console.log('Unsubscribing...');
        unsubscribe();
      }
    };
  }, [clubName, db]);

  const onSend = useCallback((messages = []) => {
    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, messages)
    );

    const { _id, createdAt, text, user } = messages[0];
    if (clubName) {
      addDoc(collection(firestore, 'chats'), {
        _id,
        createdAt,
        text,
        user,
        clubName
      });
    }
  }, [clubName]);

  return (
    <View style={{ flex: 1 }}>
      <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 30, paddingHorizontal: 10  }}>
        <IconButton
          onPress={onBackPress}
          icon="arrow-left"
          size={30}
        />
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginLeft: 5 }}>{clubName}</Text>
        <View style={{ marginLeft: 'auto', marginRight: 10 }}>
          {/* Add your search icon here */}
          <IconButton
            icon="magnify"
            size={30}
            onPress={() => {
              // Add your search functionality here
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
              <TouchableOpacity style={{ marginRight: 10 }} onPress={() => {/* Handle plus button tap */}}>
                <MaterialCommunityIcons name="plus" size={32} color={colors.lightBlue} />
              </TouchableOpacity>
              <TouchableOpacity style={{ marginBottom: 10 }} onPress={() => props.onSend({ text: props.text }, true)}>
                <MaterialCommunityIcons name="send-circle" size={32} color={colors.lightBlue} />
              </TouchableOpacity>
            </View>
          </Send>
        )}
      
        
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
      />
    </View>
  );
}
