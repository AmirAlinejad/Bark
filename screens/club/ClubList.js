import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { db } from '../../backend/FirebaseConfig';
import { ref, onValue } from "firebase/database";
import ClubCategory from '../../components/clubs/ClubCategory';
import Header from '../../components/Header';
import { clubCategories } from '../../macros/macros';
// fonts
import { title } from '../../styles/FontStyles';

const ClubList = ({ navigation }) => {
  const [clubData, setClubData] = useState([]);

  // go to add club screen
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

  // sort the clubs by category
  sortedClubs = clubCategories.map((category) => {
    return ({
      categoryName: category.value,
      data: clubData.filter((club) => club.clubCategories.includes(category.value))
    });
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
