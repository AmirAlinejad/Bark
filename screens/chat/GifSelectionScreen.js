import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
// image
import { Image } from 'expo-image';
// giphy image
import Giphy from '../../assets/PoweredBy_200px-White_HorizText.png';
// my components
import Header from '../../components/display/Header';
// icons
import { MaterialIcons } from '@expo/vector-icons'; // Add this import
// styles
import { useTheme } from '@react-navigation/native';

const GifSelectionScreen = ({ navigation, route }) => { 
  // create states for gifs
  const [gifs, setGifs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  // get club name from previous screen
  const { chatName, clubId, clubName, clubImg, schoolKey } = route.params;

  const fetchGifs = async () => {
    // Example API call (replace with actual API call to Giphy or Tenor)
    const response = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=mCWWr1G26e4ZDcNz1bHjKDsbk9142AOC&q=${searchTerm ? searchTerm : 'trending'}&limit=30&offset=0&rating=g&lang=en`);
    const { data } = await response.json();
    setGifs(data.map(item => item.images.fixed_height.url));
  };

  const { colors } = useTheme();

  useEffect(() => {
    fetchGifs();
  }, [searchTerm]);

  const handleSelectGif = (gifUrl) => {
    navigation.navigate("Chat", { gif: gifUrl, chatName, id: clubId, name: clubName, img: clubImg, schoolKey});
  };

  return (
    <View style={[ styles.container, { backgroundColor: colors.background } ]}>
      <Header navigation={navigation} text="" back />
      <View style={[styles.searchContainer, { borderBottomColor: colors.gray }]}>

        <MaterialIcons name="search" size={24} color={colors.gray} style={{marginLeft: 5}} />
        <TextInput
          style={styles.searchInput}
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Search for GIFs"
          placeholderTextColor={colors.textLight}
        />
      </View>

      {/*Giphy attribution mark*/}
      <Image source={Giphy} style={{height: 30, resizeMode: 'center'}} />

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

      <Image source={{ uri: '..\..\assets\PoweredBy_200px-White_HorizText.png' }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
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
