import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Image } from 'react-native';
import { GiftedChat, Send, Message, Bubble, Day } from 'react-native-gifted-chat';
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
import {Colors} from '../styles/Colors';
import ImageViewerScreen from './ImageViewerScreen';

export default function Chat({ route,navigation }) {
  const [messages, setMessages] = useState([]);
 
  const clubName = route?.params?.clubName;

  const onSignOut = () => {
    signOut(auth).catch(error => console.log('Error logging out: ', error));
  };
  const onImagePress = (imageUri) => {
    navigation.navigate('ImageViewerScreen', { imageUri }); // Navigate to ImageViewerScreen with the imageUri
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
  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };
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
  const { currentMessage, previousMessage } = props;

  // Determine if it's a new day
  let isNewDay = false;
  if (currentMessage && previousMessage) {
    const currentDate = new Date(currentMessage.createdAt).toDateString();
    const prevDate = new Date(previousMessage.createdAt).toDateString();
    isNewDay = currentDate !== prevDate;
  }

  // Check if the message was sent by the current user
  const isCurrentUser = currentMessage.user._id === auth?.currentUser?.email;
  const usernameStyle = isCurrentUser ? styles.usernameRight : styles.usernameLeft;

  return (
    <View style={{ marginBottom: 5 }}>
      {isNewDay && (
        <Text style={styles.dateText}>
          {formatDate(new Date(currentMessage.createdAt))}
        </Text>
      )}
      <Text
        style={[
          styles.usernameText,
          usernameStyle,
        ]}
      >
        {isCurrentUser ? 'You' : currentMessage.user.name || currentMessage.user._id}
      </Text>
      <Message   {...props}
        containerStyle={{
          left: { backgroundColor: '#f0f0f0' },
          right: { backgroundColor: '#f0f0f0' }, 
        }} />
    </View>
  );
};
const renderBubble = (props) => {
  return (
    <Bubble
      {...props}
      wrapperStyle={{
        right: {
          backgroundColor: '#f0f0f0',
        },
        left: {
          
        },
      }}
      textStyle={{
        right: {
          color: 'black', 
        },
        left: {
          
        },
      }}
      timeTextStyle={{
        right: {
          color: 'black', 
        },
        left: {
          color: 'black', 
        },
      }}
    />
  );
};

const renderDay = (props) => {
  return null; // Suppress the rendering of day markers
};

const renderMessageImage = (props) => {
  if (props.currentMessage.image) {
    return (
      <TouchableOpacity onPress={() => onImagePress(props.currentMessage.image)}>
        <Image source={{ uri: props.currentMessage.image }} style={{ width: 200, height: 200 }} />
      </TouchableOpacity>
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
                <MaterialCommunityIcons name="camera" size={32} color={Colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={{ marginRight: 10 }} onPress={handleImageUploadAndSend}>
                <MaterialCommunityIcons name="plus" size={32} color={Colors.primary} />
                </TouchableOpacity>
              <TouchableOpacity style={{ marginBottom: 8, marginRight:10 }} onPress={() => props.onSend({ text: props.text }, true)}disabled={!props.text.trim()}>
                <MaterialCommunityIcons name="send-circle" size={32} color={Colors.primary} />
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
        renderBubble={renderBubble}
        renderDay={renderDay}
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
  dateText: {
    alignSelf: 'center',
    fontSize: 14,
    color: '#666',
    paddingVertical: 8, // Adjust as needed
    // Customize these styles to match your app’s design
  },
});