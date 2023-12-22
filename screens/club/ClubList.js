import React, { useState, useEffect } from 'react';
// react native components
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
// backend
import { db } from '../../backend/FirebaseConfig';
import { ref, onValue } from "firebase/database";
// my components
import ClubCategory from '../../components/clubs/ClubCategory';
// macros
import { clubCategories } from '../../.expo/macros/clubCategories';
// fonts
import { title } from '../../styles/fontstyles';

// club list screen
const ClubList = ({ navigation }) => {
  // state for club data
  const [clubData, setClubData] = useState([]);

  // go to add club screen
  const onAddClubPress = () => {
    navigation.navigate("NewClub");
  }

  // get data from firebase
  useEffect (() => {
    const starCountRef = ref(db, 'clubs/');
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      const newClubs = Object.keys(data).map(key => ({
        id:key, 
        ...data[key]
      }));
      console.log(newClubs);
      setClubData(newClubs);
    })
  }, [])

  // sort the clubs by category
  sortedClubs = clubCategories.map((category) => {
    return ({
      categoryName: category.value,
      data: clubData.filter((club) => club.clubCategories.includes(category.value))
    });
  });

  return (
    <View style={styles.container}>
      <Text style={[styles.title, {marginTop: 80}]}>Club List</Text>
      <ScrollView>
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
       {/* Add event button */}
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D3D3D3',
  },
  clubCategory: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'left',
  },
  addClubButton: {
    alignItems: 'flex-end', 
    padding: 20
  },
  title: title,
});

export default ClubList;