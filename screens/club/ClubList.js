import React, { useState, useEffect } from 'react';
// react native components
import { View, StyleSheet, ScrollView, Button } from 'react-native';
import { IconButton } from 'react-native-paper';
import { Overlay } from 'react-native-elements';
// backend
import { db } from '../../backend/FirebaseConfig';
import { ref, onValue } from "firebase/database";
// my components
import ClubCategory from '../../components/club/ClubCategory';
import Header from '../../components/Header';
import FilterList from '../../components/FilterList';
// macros
import { clubCategories } from '../../macros/macros';
// fonts
import { title } from '../../styles/FontStyles';

const ClubList = ({ navigation }) => {
  const [clubData, setClubData] = useState([]);
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

  // filter for events
  const filterFunct = (club) => {
  
    // filter by category
    if (categoriesSelected.length > 0) {
      // convert categoriesSelected to array of strings
      console.log(categoriesSelected);
      filteredCategories = [];
      categoriesSelected.forEach((categoryNum) => {
        filteredCategories.push(clubCategories[categoryNum - 1].value);
      });
      
      if (!filteredCategories.some(item => club.clubCategories.includes(item))) { // make sure clubCategories is right
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
      <Button title="Filter" onPress={toggleOverlay} />
      <Overlay isVisible={visible} onBackdropPress={toggleOverlay}>
        <View style={styles.filterPopUp}>
          <FilterList items={clubCategories} selected={categoriesSelected} setter={setSelectedCategories} text="Categories" />
          
        </View>
      </Overlay>
      <ScrollView style={styles.clubCategories}>
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
          size={30}
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
  clubCategories: {
    marginLeft: 20,
  },
  addClubButton: {
    bottom: 0,
    right: 0,
    padding: 20,
    position: 'absolute',
  },
  filterPopUp: {
    width: 300,
    height: 400,
    padding: 20,
  },
  title: title,
});

export default ClubList;