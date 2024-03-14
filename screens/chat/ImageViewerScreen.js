// ImageViewerScreen.js
import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Alert, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import * as MediaLibrary from 'expo-media-library';
import { Ionicons } from '@expo/vector-icons'; // Import the Ionicons package for the X icon

export default function ImageViewerScreen({ route }) {
  const { imageUri } = route.params;
  const navigation = useNavigation(); // Initialize navigation

  const saveImage = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === 'granted') {
        await MediaLibrary.saveToLibraryAsync(imageUri);
        Alert.alert('Image Saved', 'The image has been saved to your device.');
      } else {
        Alert.alert('Permission Denied', 'You need to grant permission to save the image.');
      }
    } catch (error) {
      console.error('Error saving image:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.backButton}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={32} color="black" style={{ marginTop: 30 }} /> 
        </TouchableOpacity>
      </View>

      <Image source={{ uri: imageUri }} style={styles.image} />
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  saveButton: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: 'orange',
    padding: 10,
    borderRadius: 50,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1, // Ensure it's above other elements

  },
});
