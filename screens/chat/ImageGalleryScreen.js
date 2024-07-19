import React, { useState, useEffect, useLayoutEffect } from 'react';
import { TouchableOpacity, StyleSheet, FlatList, View, Dimensions, ScrollView } from 'react-native';
// Firebase
import { query, collection, where, onSnapshot, orderBy } from 'firebase/firestore';
import { firestore } from '../../backend/FirebaseConfig'; // Update this path according to your project structure
// functions
import { fetchMessages } from '../../functions/backendFunctions'; // Update this path according to your project structure
// icons
import { Ionicons } from '@expo/vector-icons';
// navigation
import { useNavigation } from '@react-navigation/native';
// my components
import Header from '../../components/display/Header'; // Adjust the import path as per your project structure
import CustomText from '../../components/display/CustomText';
// image
import { Image } from 'expo-image';
// colors
import { Colors } from '../../styles/Colors';

const windowWidth = Dimensions.get('window').width;
const numColumns = 3; // Adjust based on your desired layout
const imageWidth = windowWidth / 3; // Adjust based on your desired layout

const ImageGalleryScreen = ({ route }) => {
  const { clubId } = route.params;
  const navigation = useNavigation();

  const [messages, setMessages] = useState([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Image Gallery',
    });
  }, [navigation]);

  // Fetch messages on initial render
  useEffect(() => {  
    // Fetching messages in descending order to suit the inverted list.
    const messagesQuery = query(collection(firestore, 'chats'), where('clubId', '==', clubId), orderBy('createdAt', 'desc')); // called clubName instead of clubId
  
    const unsubscribe = onSnapshot(messagesQuery, querySnapshot => {

      fetchMessages(querySnapshot, setMessages);
      
    }, error => {
      console.error("Error fetching messages: ", error);
    });
  
    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, []);

  const getImageUrls = () => {
    // Filter messages to get those with images, then map to get the URLs
    return messages.filter(message => message.image).map(message => message.image);
  };

  const imageUrls = getImageUrls();
  
  const renderImageItem = ({ item }) => (
    <TouchableOpacity
      style={styles.imageContainer}
      onPress={() => navigation.navigate('ImageViewerScreen', { imageUri: item })}>
      <Image source={{ uri: item }} style={styles.image} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentInsetAdjustmentBehavior='automatic'>
      <View style={{height: 15}} />

      {/* Show if no messages */}
      {imageUrls.length === 0 && (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 200 }}>
            <Ionicons name="images" size={100} color={Colors.gray} />
            <CustomText text="No images found" font='bold' style={{ fontSize: 20, color: Colors.darkGray }} />
          </View>
        )}

      <FlatList
        data={imageUrls}
        renderItem={renderImageItem}
        keyExtractor={(item, index) => index.toString()}
        horizontal={false}
        numColumns={numColumns}
        contentContainerStyle={styles.flatlistContainer}
        style={{margin: 0}}
        scrollEnabled={false}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  flatlistContainer: {
    alignItems: 'flex-start',
  },
  imageContainer: {
    width: imageWidth,
    height: imageWidth,
  },
  image: {
    flex: 1,
    width: '100%', // Ensure the image takes up the full width of its container
    resizeMode: 'cover',
  },
});

export default ImageGalleryScreen;
