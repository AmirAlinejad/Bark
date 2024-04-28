import React, { useState, useEffect } from 'react';
// react native components
import { View, StyleSheet, ScrollView } from 'react-native';
// my components
import ChatClubCard from '../../components/club/ChatClubCard';
import Header from '../../components/display/Header';
import SearchBar from '../../components/input/SearchBar';
import CustomText from '../../components/display/CustomText';
// functions
import { getSetAllClubsData, getSetUserData, emailSplit } from '../../functions/backendFunctions';
import { goToChatScreen } from '../../functions/navigationFunctions';
// firebase auth
import { getAuth } from 'firebase/auth';
// backend
import { set, ref } from 'firebase/database';
import { db } from '../../backend/FirebaseConfig';
// icons
import Ionicon from 'react-native-vector-icons/Ionicons';
// colors
import { Colors } from '../../styles/Colors';

const MyClubs = ({ navigation }) => {
  // user data
  const [userData, setUserData] = useState(null);
  // user id
  const [userId, setUserId] = useState('');
  // club data
  const [clubData, setClubData] = useState([]);
  // muted clubs
  const [mutedClubs, setMutedClubs] = useState([]);
  // search text
  const [searchText, setSearchText] = useState('');
  // loading
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const asyncFunc = async () => {
      setLoading(true);

      // get user id from auth
      const auth = getAuth(); 
      const user = auth.currentUser;

      if (user) {
        await getSetUserData(setUserData);
        setUserId(user.uid);
      }
      
      // get all club data from db
      getSetAllClubsData(setClubData);

      setLoading(false);
    }

    asyncFunc();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {  //assign interval to a variable to clear it.
      getSetUserData(setUserData);
    }, 1000)
  
    return () => clearInterval(intervalId); //This is important
   
  }, [])

  // update muted clubs once userData is updated
  useEffect(() => {
    if (userData) {
      setMutedClubs(userData.mutedClubs);
    } else {
      setMutedClubs([]);
    }
  }, [userData]);

  // toggle mute
  const toggleMute = (clubId) => {

    if (mutedClubs == undefined) {
      // add club to muted clubs
      setMutedClubs([clubId]);
      set(ref(db, `${emailSplit()}/users/${userId}/mutedClubs`), [clubId]);
    } else if (mutedClubs.includes(clubId)) {
      const updatedMutedClubs = mutedClubs.filter((id) => id !== clubId);
      setMutedClubs(updatedMutedClubs);
      // update user data
      set(ref(db, `${emailSplit()}/users/${userId}/mutedClubs`), updatedMutedClubs);
      // update club data
      set(ref(db, `${emailSplit()}/clubs/${clubId}/clubMembers/${userId}/muted`), false)
    } else {
      const updatedMutedClubs = [...mutedClubs, clubId];
      setMutedClubs(updatedMutedClubs);
      // update user data
      set(ref(db, `${emailSplit()}/users/${userId}/mutedClubs`), updatedMutedClubs);
      // update club data
      set(ref(db, `${emailSplit()}/clubs/${clubId}/clubMembers/${userId}/muted`), true)
    }
  };

  // filter function
  const filterFunct = (club) => {

    // filter by my clubs
    if (!club.clubMembers || !Object.keys(club.clubMembers).includes(userId)) {
      return false;
    }

    // filter by search text
    if (searchText.length > 0) {
      if (!club.clubName.toLowerCase().includes(searchText.toLowerCase())) {
        return false;
      }
    }

    return true;
  }

  // filter clubs by filter function
  const filteredClubs = clubData.filter(filterFunct);

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

      <View style={styles.searchBarView}>
        <SearchBar placeholder='Search' value={searchText} setValue={setSearchText}/>
      </View>

      <ScrollView style={styles.clubScrollView} contentContainerStyle={styles.clubContent}>
      { 
        // if no clubs found
        sortedClubs.length === 0 ? (
          <View style={{alignItems: 'center', justifyContent: 'center', width: '100%', marginTop: 200 }}>
            <Ionicon name="chatbubbles" size={100} color={Colors.lightGray} />
            <CustomText style={styles.title} text="No clubs found." font='bold' />
          </View>
        ) : 
          // create a chat club card for each club
          sortedClubs.map((item, index) => {

            let unreadMessages = 0;
            if (userData && userData.clubs && userData.clubs[item.clubId] && userData.clubs[item.clubId].unreadMessages) {
              unreadMessages = userData.clubs[item.clubId].unreadMessages;
            }

            return (
              <View key={index} style={{width: '100%'}}>
                <ChatClubCard onPress={() => goToChatScreen(item, navigation)} name={item.clubName} description={item.clubDescription} img={item.clubImg} 
                  muted={mutedClubs !== undefined ? mutedClubs.includes(item.clubId) : false} toggleMute={() => toggleMute(item.clubId)} 
                  unreadMessages={unreadMessages} />
                {
                  index === sortedClubs.length - 1 ? null : <View style={styles.separator}></View>
                }
              </View>
            )
          }
        )
      }
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
    justifyContent: 'flex-start',
  },
  clubScrollView: {
    paddingTop: 15,
    paddingHorizontal: 15,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: Colors.white,
  },
  searchBarView: {
    margin: 15,
    marginTop: 5,
    marginBottom: 15,
  },
  clubContent: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 25,
    margin: 5,
    color: Colors.darkGray,
  },
});

export default MyClubs;