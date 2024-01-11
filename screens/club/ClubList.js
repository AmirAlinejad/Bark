import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { db } from '../../backend/FirebaseConfig';
import { ref, onValue } from "firebase/database";
import ClubCategory from '../../components/clubs/ClubCategory';
import Header from '../../components/Header';
import { clubCategories } from '../../macros/macros';
import { title } from '../../styles/fontstyles';

const ClubList = ({ navigation }) => {
  const [clubData, setClubData] = useState([]);

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

  const sortedClubs = clubCategories.map((category) => {
    return {
      categoryName: category.value,
      data: clubData.filter((club) => club.clubCategories && club.clubCategories.includes(category.value))
    };
  });

  return (
    <View style={styles.container}>
      <Header text='Club List'></Header>
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
  title: title,
});

export default ClubList;
