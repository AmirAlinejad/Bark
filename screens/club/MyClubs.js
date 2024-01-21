import React, { useState, useEffect } from 'react';
// react native components
import { View, StyleSheet, ScrollView } from 'react-native';
// backend
import { db } from '../../backend/FirebaseConfig';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { ref, onValue } from "firebase/database";
// my components
import ClubCategory from '../../components/club/ClubCategory';
import Header from '../../components/Header';
// macros
import { clubCategories } from '../../macros/macros';
// fonts
import { title } from '../../styles/FontStyles';

const MyClubs = ({ navigation }) => {
  // user data from auth
  const [userData, setUserData] = useState(null); // State to hold user data
  const [loading, setLoading] = useState(true); // Loading state
  // all users data from db
  const [allUsersData, setAllUsersData] = useState([]); // State to hold all user data
  // club data
  const [clubData, setClubData] = useState([]);

  useEffect(() => {
    // get user data from auth
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch user data from Firebase Auth
          const { displayName, email } = user;

          // Set user data to state
          setUserData({ username: displayName, email });
          setLoading(false);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setLoading(false);
        }
      } else {
        // User is signed out
        setLoading(false);
      }
    });

    // set all users data
    const starCountRef = ref(db, 'users/');
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      const newUsers = Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
      console.log(newUsers);
      setAllUsersData(newUsers);
    })

    // get club data
    const starCountRef2 = ref(db, 'clubs/');
    onValue(starCountRef2, (snapshot) => {
      const data2 = snapshot.val();
      const newClubs = Object.keys(data2).map(key => ({
        id: key,
        ...data2[key]
      }));
      console.log(newClubs);
      setClubData(newClubs);
    })

    return () => unsubscribe(); // Detach the listener when unmounting
  }, []);

  // filter data to personal data
  const clubsJoined = allUsersData.filter((user) => user.userName === userData?.username)[0]?.clubsJoined;

  // get clubs from list of clubs joined
  const myClubs = clubData.filter((club) => club.clubName && clubsJoined && clubsJoined.includes(club.clubName));

  // sort clubs by category
  const sortedClubs = clubCategories.map((category) => {
    return {
      categoryName: category.value,
      data: myClubs.filter((club) => club.clubCategories && club.clubCategories.includes(category.value))
    };
  });

  return (
    <View style={styles.container}>
      <Header text='My Clubs'></Header>
      <ScrollView style={styles.clubCategories}>
        {
          sortedClubs.map((category) => {
            if (category.data && category.data.length !== 0) {
              return (
                <ClubCategory key={category.categoryName} name={category.categoryName} data={category.data} navigation={navigation} />
              )
            } else {
              return null; // handle empty category case if needed
            }
          })
        }
      </ScrollView>
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

export default MyClubs;