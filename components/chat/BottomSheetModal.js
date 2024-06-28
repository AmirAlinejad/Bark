import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, TouchableWithoutFeedback, StyleSheet, Text, FlatList } from 'react-native';
// expo image
import { Image } from 'expo-image';
// swipe up down modal
import SwipeUpDownModal from 'react-native-swipe-modal-up-down';
// async storage
import AsyncStorage from '@react-native-async-storage/async-storage';
// giphy image
import Giphy from '../../assets/PoweredBy_200px-White_HorizText.png';
import GiphyAttribution from '../../assets/PoweredBy_200px-White_HorizText.png';
// backend
import { firestore } from '../../backend/FirebaseConfig';
// colors
import { Colors } from '../../styles/Colors';
// icons
import { Ionicons } from '@expo/vector-icons';
// my components
import CustomText from '../display/CustomText';
import SearchBar from '../input/SearchBar';


const BottomSheetModal = ({ isVisible, onClose, onUploadImage, onOpenCamera, onUploadGif, onOpenDocument, setImage, setTempImageUrl, chatRef  }) => {
  // state
  const [modalMode, setModalMode] = useState('upload'); // ['upload', 'gif', 'file', 'poll']
  const [images, setImages] = useState([]);
  // create states for gifs
  const [gifs, setGifs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // get images from async storage
  useEffect(() => {
    const getImages = async () => {
      try {
        const images = await AsyncStorage.getItem('userImages');
        if (images !== null) {
          console.log('images:', images);
          setImages(images.split(','));
        }
      } catch (error) {
        console.error('Error getting images:', error);
      }
    };

    getImages();
  }, []);

  const setImageAndClose = (image) => {
    setImage(image);
    setTempImageUrl(image);
    onClose();
  }

  // options data
  const options = [
    { key: 'Photo', onPress: () => setModalMode('upload'), icon: 'image' },
    { key: 'GIF', onPress: () => setModalMode('gif'), icon: 'film' },
    { key: 'Camera', onPress: () => {
      onOpenCamera();
      setModalMode('upload');
    }, icon: 'camera' }, 
    { key: 'Document',  onPress: () => {
      onOpenDocument();
      setModalMode('upload');
    }, icon: 'document', },
    { key: 'Poll', onPress: () => setModalMode('poll'), icon: 'ticket' },
    { key: 'Cancel', onPress: onClose, cancel: true },
  ];

  const renderItem = ({ item }) => {
    return (
      item.cancel ? (
        <TouchableOpacity style={styles.option} onPress={item.onPress}>
          <Ionicons name="close" size={24} color={Colors.red} />
          <Text style={styles.cancelButtonText}>{item.key}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.option} onPress={item.onPress}>
          <Ionicons name={item.icon || 'image'} size={24} color={Colors.darkGray} />
          <Text style={styles.optionText}>{item.key}</Text>
        </TouchableOpacity>
      )
    );
  }

  const renderImage = ({ item }) => {
    console.log('item:', item);

    if (item === 'add') {
      return (
        <TouchableOpacity style={{ width: 128, height: 128, backgroundColor: 'darkgray', margin: 1}} onPress={onUploadImage}>
          <Ionicons name="camera" size={50} color={Colors.darkGray} style={{ position: 'absolute', top: 40, left: 40 }} />
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity style={{ width: 128, height: 128, backgroundColor: 'darkgray', margin: 1}} onPress={() => setImageAndClose(item)}>
        <Image source={{ uri: item }} style={{ width: 128, height: 128, aspectRatio: 1 }} />
      </TouchableOpacity>
    );
  };

  // gifs
  const fetchGifs = async () => {
    const response = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=mCWWr1G26e4ZDcNz1bHjKDsbk9142AOC&q=${searchTerm ? searchTerm : 'trending'}&limit=30&offset=0&rating=g&lang=en`);
    const { data } = await response.json();
    setGifs(data.map(item => item.images.fixed_height.url));
  };

  useEffect(() => {
    fetchGifs();
  }, [searchTerm]);

  // polls
  const [questionText, setQuestionText] = useState('');
  const [newVoteOptionText, setNewVoteOptionText] = useState('');
  // const [editingOption, setEditingOption] = useState(null);
  // const [editingText, setEditingText] = useState('');
  const [voteOptions, setVoteOptions] = useState([]);

  // Add option
  const onAddOption = () => {
    if (newVoteOptionText) {
        setVoteOptions([...options, { id: options.length.toString(), text: newVoteOptionText }]);
        setNewVoteOptionText('');
    }
};

  // Post
  const onPost = () => {
      // Post question and options
      console.log(questionText);
      console.log(options);
      onClose();
  }

  // send poll message
  const sendPoll = useCallback(async () => {

    // Check if there's a question and at least two options
    if (questionText.trim() !== '' || options.length >= 2) {
        try {
            // Create the sender object
            const sender = {
            _id: auth.currentUser.uid,
            name: userData.userName,
            first:  userData.firstName,
            last: userData.lastName,
            };
            if (userData.profileImg) {
            sender.avatar = userData.profileImg;
            }

            // Create the message object
            const message = {
                _id: Math.random().toString(36).substring(7),
                createdAt: new Date().getTime(),
                sender,
                question: questionText.trim(),
                options,
                votes: [],
                voters: [],
            };

            // Add the message to Firestore
            await addDoc(chatRef, message);

            // say "sent an image" if no text
            const notificationText = "sent a poll";

            ////////////////////// worry ab notifications later //////////////////////
            
            // do for all members in club (if not muted)
            /*const clubMembersCollection = collection(firestore, 'schools', schoolKey, 'clubMemberData', 'clubs', clubId);
            const clubMembers = await getDocs(clubMembersCollection);
            // loop through all members in the club
            for (const member of clubMembers.docs) {
                /*if (!member.data().muted && member.id !== auth.currentUser.uid) {
                    // get the member's data
                    const memberData = await getDoc(doc(firestore, 'schools', schoolKey, 'chatData', 'clubs', clubId, 'members', member.id));
                    const memberDataVal = memberData.data();
                    // send the push notification
                    sendPushNotification(memberDataVal.expoPushToken, notificationText, userData.firstName, userData.lastName, clubName);
                }*/

                /*// increment unread messages in club member's data
                const memberRef = doc(firestore, 'schools', schoolKey, 'clubMemberData', 'clubs', clubId, member.id);
                const memberSnapshot = await getDoc(memberRef);
                const memberData = memberSnapshot.data();
                const unreadMessages = memberData.unreadMessages + 1;

                await updateDoc(memberRef, { unreadMessages });
            }*/

        } catch (error) {
            console.error('Error sending message:', error);
        }
    }
  }, []);

  return (
    <SwipeUpDownModal
      modalVisible={isVisible} 
      pressToanimate={isVisible}
      onClose={onClose}
      ContentModal={
      <TouchableWithoutFeedback style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.bar} />

          {/* Option select */}
          <View style={{ height: 160}}>
            <FlatList
              scrollEnabled={false}
              data={options}
              renderItem={renderItem}
              numColumns={3}
            />
          </View>

          {/* Content */}
          {/* eventually make last square a button to upload image */}
          {modalMode === 'upload' && 
            <View>
              <FlatList
                data={[...images,'add']}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderImage}
                numColumns={3}
              />
            </View>
          }
          {modalMode === 'gif' &&
            <View style={{ width: '100%' }}>
              <View style={styles.searchContainer}>
                <SearchBar value={searchTerm} setValue={setSearchTerm} placeholder="Search for GIFs" />
              </View>

              {/*Giphy attribution mark*/}
              <Image source={Giphy} style={{height: 30, resizeMode: 'center'}} />

              <FlatList
                data={gifs}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderImage}
                numColumns={3}
              />

              <Image source={{ uri: GiphyAttribution }} />
            </View>
          }
          {modalMode === 'poll' &&
            <View>
              {/* Title */}
              <CustomInput
                    placeholder="Ask a question"
                    style={styles.input}
                    onChangeText={setQuestionText}
                    value={questionText}
                />

                {/* List of options */}
                <FlatList
                    data={options}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    // footer - add option
                />

                {/* Create option */}
                <TouchableOpacity style={styles.option} onPress={onAddOption}>
                    <CustomInput
                        placeholder="Add option"
                        style={styles.input}
                        onChangeText={setNewOptionText}
                        value={newOptionText}
                    />
                    <TouchableOpacity style={styles.addOptionButton} onPress={onAddOption}>
                        <CustomText style={styles.addOptionButtonText} text="Add" />
                    </TouchableOpacity>
                </TouchableOpacity>

                {/* Post button */}
                <TouchableOpacity style={styles.option} onPress={onPost}>
                    <CustomText style={styles.optionText} text="Post" />
                </TouchableOpacity>

                {/* Cancel button */}
                <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                    <CustomText style={styles.cancelButtonText} text="Cancel" />
                </TouchableOpacity>
            </View>
          }
        </View>
      </TouchableWithoutFeedback>
    }
    />
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: Colors.white,
    width: '100%',
    height: 800,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 60,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  bar: {
    marginTop: 15,
    width: 50,
    height: 5,
    backgroundColor: Colors.lightGray,
    borderRadius: 5,
    alignSelf: 'center',
    marginBottom: 10,
  },
  option: {
    width: 120,
    height: 80,
    padding: 15,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 18,
    color: Colors.darkGray,
  },
  cancelButtonText: {
    fontSize: 18,
    color: Colors.red,
  },
  searchContainer: {
    alignSelf: 'center',
    width: 460,
    marginLeft: 90,
    paddingVertical: 10,
  },  
});

export default BottomSheetModal;
