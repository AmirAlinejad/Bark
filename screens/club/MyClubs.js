import React, { useState, useEffect } from 'react';
// react native components
import { View, StyleSheet, ScrollView } from 'react-native';
// my components
import ChatClubCard from '../../components/club/ChatClubCard';
import Header from '../../components/Header';
import SearchBar from '../../components/input/SearchBar';
import CustomText from '../../components/CustomText';
// functions
import { getSetUserData, getSetAllClubsData } from '../../functions/backendFunctions';
// fonts
import { title } from '../../styles/FontStyles';
// colors
import { Colors } from '../../styles/Colors';

const MyClubs = ({ navigation }) => {
  // user data from auth
  const [loading, setLoading] = useState(true); // Loading state
  // all users data from db
  const [userData, setUserData] = useState([]); // State to hold all user data
  // club data
  const [clubData, setClubData] = useState([]);
  // search text
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    // get user data from aut
    getSetUserData(setUserData, setLoading);

    // get all club data from db
    getSetAllClubsData(setClubData);
  }, []);
  
  // my clubs
  const myClubs = clubData.filter((club) => club.clubMembers && Object.keys(club.clubMembers).includes(userData.uid));

  // filter clubs by search text
  const filteredClubs = myClubs.filter((club) => club.clubName.toLowerCase().includes(searchText.toLowerCase()));

  // sort clubs by most recent message
  let sortedClubs = [];
  if (filteredClubs.length > 0) {
    sortedClubs = filteredClubs.sort((a, b) => {
      console.log(a.mostRecentMessage, b.mostRecentMessage);
      return a.mostRecentMessage > b.mostRecentMessage? -1 : 1;
    });
  }

  return (
    <View style={styles.container}>
      <Header text='My Clubs'></Header>
      <View style={{marginLeft: 20, marginBottom: 20}}>
        <SearchBar placeholder='Search' value={searchText} setValue={setSearchText}/>
      </View>
      <ScrollView style={styles.clubScrollView} contentContainerStyle={styles.clubContent}>
      {
        sortedClubs.length === 0 ?
          (
            <View style={{marginTop: 20, marginLeft: 20}}>
              <CustomText style={styles.title} text="No clubs found" />
            </View>
          ) : 
          sortedClubs.map((item, index) => {
            const onPress = () => {
              // Navigate to the sign-up screen
              navigation.navigate("ClubScreen", {
                name: item.clubName,
                id: item.clubId,
                description: item.clubDescription,
                categories: item.clubCategories,
                img: item.clubImg,
                events: item.events,
              });
            }

            return (
              <View key={index} >
                <ChatClubCard onPress={onPress} name={item.clubName} description={item.clubDescription} img={item.clubImg} />
                {
                  index === myClubs.length - 1 ? null : <View style={styles.separator}></View>
                }
              </View>
            )
          })
      }
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  clubScrollView: {
    paddingTop: 20,
    paddingHorizontal: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: Colors.white,
  },
  clubContent: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 15,
  },
  separator: {
    width: 500,
    marginLeft: -20,
    height: 1,
    backgroundColor: Colors.lightGray,
    borderRadius: 3,
  },
  title: title,
});

export default MyClubs;