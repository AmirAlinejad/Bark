
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity } from 'react-native';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import Icon from 'react-native-vector-icons/FontAwesome';
import { db } from '../backend/FirebaseConfig'; // Import the Firebase database instance

const Profile = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [userClubs, setUserClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const { displayName, email } = user;
          setUserData({ username: displayName, email });
          await fetchUserClubs(user.uid);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserClubs = async (userId) => {
    try {
      const userRef = ref(db, `users/${userId}`);
      const userSnapshot = await get(userRef);

      if (userSnapshot.exists()) {
        const userData = userSnapshot.val();
        setUserClubs(userData.clubs || []);
      }
    } catch (error) {
      console.error('Error fetching user clubs:', error);
    }
  };

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      navigation.navigate('SignIn');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const screenHeight = Dimensions.get('window').height;

  return (
    <View style={styles.container}>
      <View style={[styles.orangeSection, { height: screenHeight * 0.25 }]} />
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-left" size={20} color="black" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
      <View style={styles.profileContainer}>
        <View style={styles.profileImageContainer}>
          <Image
            source={require('../assets/images/Heart.png')}
            style={styles.profileImage}
          />
        </View>
      </View>
      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : (
        <View style={styles.userDataContainer}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.text}>Username: {userData?.username}</Text>
          <Text style={styles.text}>Email: {userData?.email}</Text>
          <Text style={styles.text}>Clubs Part Of:</Text>
          {userClubs.map((club, index) => (
            <Text key={index}>{club}</Text>
          ))}
        </View>
      )}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button}>
          <Icon name="cog" size={20} color="black" style={styles.icon} />
          <Text style={styles.buttonText}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Icon name="pencil" size={20} color="black" style={styles.icon} />
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Icon name="users" size={20} color="black" style={styles.icon} />
          <Text style={styles.buttonText}>Friends</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  orangeSection: {
    backgroundColor: 'orange',
  },
  logoutButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    backgroundColor: 'orange',
  },
  logoutText: {
    color: 'black',
    fontWeight: 'bold',
    
  },
  profileContainer: {
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
  buttonContainer: {
    paddingHorizontal: 0,
    marginTop: 2,
  },
  button: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'flex-start', // Align text to the left
  },
  buttonText: {
  color: 'black',
  fontWeight: 'bold',
  textAlign: 'left', // Align text to the left
  paddingLeft: 30, // Add left padding to the text
},
  icon: {
    position: 'absolute',
    left: 10,
    top: 8,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
    marginTop: 10, // Adjust the margin to separate it from the email
  },
});

export default Profile;


/* */

