import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import Header from '../../components/Header';
import { MaterialIcons } from '@expo/vector-icons'; // Add this import
import {Colors} from '../../styles/Colors'

const GifSelectionScreen = ({ navigation, route }) => {
  const [gifs, setGifs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { clubName, screenName } = route.params;

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
    if (screenName == "AdminChat") {
      navigation.navigate("AdminChat",{ selectedGifUrl: gifUrl, clubName });
    } else {
      navigation.navigate("Chat",{ selectedGifUrl: gifUrl, clubName });
    }
  };

  return (
    <View style={styles.container}>
      <Header navigation={navigation} text="Gifs" back={true} />
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={24} color="gray" style={{marginLeft: 5}} />
        <TextInput
          style={styles.searchInput}
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Search for GIFs"
          placeholderTextColor="gray" // Add placeholder text color
        />
      </View>
      <FlatList
        data={gifs}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleSelectGif(item)}>
            <Image source={{ uri: item }} style={styles.gif} />
          </TouchableOpacity>
        )}
        numColumns={3}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA"
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
    paddingBottom: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  gif: {
    width: '33%',
    height: 135,
    aspectRatio: 1,
  },
  row: {
    flex: 1,
  },
});

export default GifSelectionScreen;
