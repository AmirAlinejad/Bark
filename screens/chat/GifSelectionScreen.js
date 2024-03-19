import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import Header from '../../components/Header';
const GifSelectionScreen = ({ navigation, route }) => {
  const [gifs, setGifs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const clubName = route?.params?.clubName;
  console.log(clubName);
  const fetchGifs = async () => {
    // Example API call (replace with actual API call to Giphy or Tenor)
    const response = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=mCWWr1G26e4ZDcNz1bHjKDsbk9142AOC&q=${searchTerm}`);
    const { data } = await response.json();
    setGifs(data.map(item => item.images.fixed_height.url));
  };

  useEffect(() => {
    fetchGifs();
  }, [searchTerm]);

  const handleSelectGif = (gifUrl) => {
    // Pass the selected GIF URL back to the Chat screen
    navigation.navigate('Chat', { selectedGifUrl: gifUrl, clubName });
  };

  return (
    <View style={styles.container}>
         <Header navigation={navigation} text="Gifs" back={true} />
      <TextInput
        style={styles.searchInput}
        value={searchTerm}
        onChangeText={setSearchTerm}
        placeholder="Search for GIFs"
      />
      <FlatList
        data={gifs}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleSelectGif(item)}>
            <Image source={{ uri: item }} style={styles.gif} />
          </TouchableOpacity>
        )}
        // Adjust the number of columns for the grid here
        numColumns={3} // Adjust this number based on your desired column count
        columnWrapperStyle={styles.row} // Style for each row
      />
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 20,
      },
      searchInput: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
      },
      gif: {
        width: '33%', // Each GIF should take up roughly one-third of the available space
        height: 100, // Adjust height as needed
        margin: 1, // Keep some margin to separate the GIFs
        aspectRatio: 1, // Optional: Force the items to be square (remove if GIFs have varied aspect ratios)
      },
      row: {
        flex: 1,
        justifyContent: 'space-around',
      },
});

export default GifSelectionScreen;
