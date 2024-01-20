import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { db } from '../../backend/FirebaseConfig';
import { ref, onValue } from "firebase/database";
import ClubCategory from '../../components/clubs/ClubCategory';
import Header from '../../components/Header';
import { clubCategories } from '../../macros/macros';
import { title } from '../../styles/FontStyles';
import { Button, Overlay } from 'react-native-elements';
import MultiSelect from 'react-native-multiple-select';

const ClubList = ({ navigation }) => {
  const [clubData, setClubData] = useState([]);
  // for overlay
  const [visible, setVisible] = useState(false);
  const [categoriesSelected, setSelectedCategories] = useState([]);

  // toggle overlay
  const toggleOverlay = () => {
    setVisible(!visible);
  };

  // add club button
  const onAddClubPress = () => {
    navigation.navigate("NewClub");
  }

  useEffect(() => {
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
      
      console.log("filtered categories " + filteredCategories);

      console.log("club categories " + club.clubCategories);
      
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
          <MultiSelect
            hideTags
            items={clubCategories}
            uniqueKey="key"
            ref={(component) => { this.multiSelect = component }}
            onSelectedItemsChange={setSelectedCategories}
            selectedItems={categoriesSelected}
            selectText="Pick Items"
            searchInputPlaceholderText="Search Items..."
            onChangeInput={ (text)=> console.log(text)}
            tagRemoveIconColor="#CCC"
            tagBorderColor="#CCC"
            tagTextColor="#CCC"
            selectedItemTextColor="#CCC"
            selectedItemIconColor="#CCC"
            itemTextColor="#000"
            displayKey="value"
            searchInputStyle={{ color: '#CCC' }}
            submitButtonColor="#CCC"
            submitButtonText="Submit"
          />
        </View>
      </Overlay>
      <ScrollView style={styles.clubCategories}>
      {
        sortedClubs.map((category) => {
          if (category.data && category.data.length !== 0) {
            return (
              <ClubCategory key={category.categoryName} name={category.categoryName} data={category.data} navigation={navigation} />
            )
          } else {
            return null; // or handle empty category case if needed
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