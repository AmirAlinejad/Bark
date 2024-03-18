import { TouchableOpacity, StyleSheet, FlatList, View, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from '../../components/Header'; // Adjust the import path as per your project structure
import { Image } from 'expo-image';

const windowWidth = Dimensions.get('window').width;

const ImageGalleryScreen = ({ route }) => {
  const { clubName, imageUrls } = route.params;
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
        data={imageUrls}
        renderItem={renderImageItem}
        keyExtractor={(item, index) => index.toString()}
        horizontal={false}
        numColumns={Math.floor(windowWidth / 100)} // Adjust based on your desired layout
        contentContainerStyle={styles.flatlistContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  flatlistContainer: {
    alignItems: 'flex-start',
  },
  imageContainer: {
    width: windowWidth / Math.floor(windowWidth / 100), // Adjust based on your desired layout
    height: 130,
  },
  image: {
    flex: 1,
    width: '100%', // Ensure the image takes up the full width of its container
    resizeMode: 'cover',
  },
});

export default ImageGalleryScreen;
