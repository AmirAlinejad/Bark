import React from 'react';
import { Image, TouchableOpacity, StyleSheet, FlatList, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from '../../components/Header'; // Adjust the import path as per your project structure

const ImageGalleryScreen = ({ route }) => {
  const { imageUris } = route.params;
  const navigation = useNavigation();

  const renderImageItem = ({ item }) => (
    <TouchableOpacity
      style={styles.imageContainer}
      onPress={() => navigation.navigate('ImageViewerScreen', { imageUri: item })}>
      <Image source={{ uri: item }} style={styles.image} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header navigation={navigation} text="Gallery" back={true} />
      <FlatList
        data={imageUris}
        renderItem={renderImageItem}
        keyExtractor={(item, index) => index.toString()}
        numColumns={4} // Or however many columns you want
        contentContainerStyle={styles.container}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#FAFAFA",

  },
  imageContainer: {
    flex: 1,
    flexDirection: 'column',
    margin: 0, // Updated to remove space between images
  },
  image: {
    height: 100, // Adjust size as needed
    aspectRatio: 1, // Keeps the aspect ratio of images, adjust as needed
    resizeMode: 'cover', // Adjust resizeMode to 'cover' for no space between images
  },
});

export default ImageGalleryScreen;
