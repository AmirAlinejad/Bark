import React, { useState, useEffect } from 'react';
// react native components
import { View, StyleSheet, ScrollView, Button } from 'react-native';
import { IconButton } from 'react-native-paper';
// backend
import { db } from '../../backend/FirebaseConfig';
import { ref, onValue } from "firebase/database";
// my components
import ClubCategory from '../../components/club/ClubCategory';
import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';
import ClubCategoryButton from '../../components/club/ClubCategoryButton';
// macros
import { clubCategories } from '../../macros/macros';
// fonts
import { title } from '../../styles/FontStyles';
// styles
import { Colors } from '../../styles/Colors';

const ClubList = ({ navigation }) => {
  const [clubData, setClubData] = useState([]);
  const [searchText, setSearchText] = useState('');
  // for overlay
  const [visible, setVisible] = useState(false);
  const [categoriesSelected, setSelectedCategories] = useState([]);

  // toggle overlay
  const toggleOverlay = () => {
    setVisible(!visible);
  };

  // go to add club screen
  const onAddClubPress = () => {
    navigation.navigate("NewClub");
  }

  // get data from firebase
  useEffect(() => {
    // get club data
    const starCountRef = ref(db, 'clubs/');
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      const newClubs = Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
      console.log(newClubs);
      setClubData(newClubs);
    })
  }, []);

  // filter for clubs
  const filterFunct = (club) => {

    // filter by search text
    if (searchText.length > 0) {
      if (!club.clubName.toLowerCase().includes(searchText.toLowerCase())) {
        return false;
      }
    }
  
    // filter by categories selected
    if (categoriesSelected.length > 0) { 
      if (!categoriesSelected.some(item => club.clubCategories.includes(item))) { // make sure clubCategories is right
        return false;
      }
    }

    return true;
  }

  // filter clubs and sort clubs by category
  const sortedClubs = clubCategories.map((category) => {
    return {
      categoryName: category.value,
      data: clubData.filter(filterFunct).filter((club) => club.clubCategories && club.clubCategories.includes(category.value))
    };
  });

  return (
    <View style={styles.container}>
      <Header text='Club List'></Header>
      <View style={{marginLeft: 20, marginBottom: 10}}>
        <SearchBar placeholder='Search' value={searchText} setValue={setSearchText}/>
      </View>

      <ScrollView style={styles.categoriesButtonRow} horizontal>
      { 
        // create a club category component for each category
        clubCategories.map((category) => {

          // toggle button to update categories selected
          const toggleButton = () => {
            if (categoriesSelected.includes(category.value)) {
              setSelectedCategories(categoriesSelected.filter((i) => i !== category.value));
            } else {
              setSelectedCategories([...categoriesSelected, category.value]);
            }
          }

          return (
            <View style={styles.categoryButtonView} >
              <ClubCategoryButton text={category.value} onPress={toggleButton} toggled={categoriesSelected.includes(category.value)} />
            </View>
          )
        })
      }
      </ScrollView>
      <ScrollView style={styles.clubCategoriesView}>
      { 
        // create a club category component for each category
        sortedClubs.map((category) => {
          if (category.data.length != 0) {
            return (
              <ClubCategory name={category.categoryName} data={category.data} navigation={navigation} />
            )
          }
        })
      }
      </ScrollView>
      <View style={styles.addClubButton}>
        <IconButton
          onPress={onAddClubPress}
          icon="plus-circle"
          iconColor={Colors.red}
          size={70}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#FAFAFA',
  },
  clubCategoriesView: {
    marginLeft: 20,
    height: '100%',
  },
  categoriesButtonRow: {
    marginLeft: 20,
  },
  categoryButtonView: {
    height: 100,
  },  
  addClubButton: {
    bottom: 0,
    right: 0,
    padding: 20,
    position: 'absolute',
  },
  title: title,
});

export default ClubList;