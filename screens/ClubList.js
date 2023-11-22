import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { db } from './backend/FirebaseConfig';
import { ref, onValue } from "firebase/database";
import Club from './Club';
import { title } from '../styles/fontstyles';

// club list screen
const ClubList = ({ navigation }) => {
  const [clubData, setClubData] = useState([]);

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Club List</Text>
      {
        // map through the club data and display each club
        clubData.map((item, index) => {
          const onPress = () => {
            // Navigate to the sign-up screen
            navigation.navigate("ClubScreen", {
              name: item.clubName,
              description: item.clubDescription,
              categories: item.clubCategories,
              img: item.clubImg,
            });
          }

          return (
            <View key={index}>
              <Club onPress={onPress} name={item.clubName} description={item.clubDescription} img={item.clubImg} />
            </View>
          )
        })
      }
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
  title: title,
});

export default ClubList;