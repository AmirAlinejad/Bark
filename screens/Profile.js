
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const Profile = ({ route }) => {
  const [userData, setUserData] = useState(null); // State to hold user data
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // get user data from auth
      if (user) {
        try {
          const { displayName, email } = user;
          setUserData({ username: displayName, email });
          await fetchUserClubs(user.uid);
          await fetchUserClubsJoined(user.uid);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setLoading(false);
        }
      } else {
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

    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : (
        <View style={styles.userDataContainer}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.text}>Username: {userData?.username}</Text>
          <Text style={styles.text}>Email: {userData?.email}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -50,
    zIndex: 1,
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 10,
    borderColor: 'white',
    backgroundColor: 'white',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  loadingText: {
    fontSize: 18,
    alignSelf: 'center',
    marginTop: 20,
  },
  userDataContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
});

export default Profile;
