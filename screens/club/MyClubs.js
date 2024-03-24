<<<<<<< HEAD
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

=======
import React, { useState, useEffect } from 'react';
// react native components
import { View, StyleSheet, ScrollView } from 'react-native';
// backend
import { db } from '../../backend/FirebaseConfig';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
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

>>>>>>> dfe4a17ddd108df15325f902cdfdaa4361e7c37e
export default MyClubs;