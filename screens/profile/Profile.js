import React, { useState, useEffect } from 'react';
// react native components
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity } from 'react-native';
import { Avatar } from 'react-native-paper';
import { Overlay } from 'react-native-elements';
// backend
import { db } from '../../backend/FirebaseConfig';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { ref, get, onValue } from "firebase/database";
// icons
import Ionicons from 'react-native-vector-icons/Ionicons';
// my components
import CustomText from '../../components/CustomText';

const Profile = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  // state for overlay
  const [visible, setVisible] = useState(false);

  // toggle overlay
  const toggleOverlay = () => {
    if (userData?.clubs == undefined) {
      console.error("You have not joined any clubs yet!")
    } else {
      setVisible(!visible);
    }
  };

  useEffect(() => {
    // get user data from auth
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          await updateUserData(user.uid);
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

  // update user data (from useEffect)
  const updateUserData = async (userId) => {
    try {
      const userRef = ref(db, `users/${userId}`);
      const userSnapshot = await get(userRef);

      if (userSnapshot.exists()) {
        const userData = userSnapshot.val();

        // set user data
        setUserData(userData);
      }
    } catch (error) {
      console.error('Error fetching user clubs:', error);
    }
  };

  // log out (not yet working)
  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth); // make signOut function
      navigation.navigate('SignIn');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const screenHeight = Dimensions.get('window').height;

  // navigate to edit profile screen
  const goToEditProfile = () => {
    console.log(userData);
    navigation.navigate("EditProfile", {
      userData: userData,
      navigation: navigation,
    });
  }

  return (
    <View style={styles.container}>
      <View style={[styles.orangeSection, { height: screenHeight * 0.25 }]} />
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} >
        <CustomText style={styles.logoutText} text="Log Out" />
      </TouchableOpacity>
      <View style={styles.profileContainer}>
        <View style={styles.avatarContainer}> 
          <Avatar.Image source={{uri: userData?.profileImg}} size={150}></Avatar.Image>
        </View>
        <CustomText style={styles.usernameText} text={userData?.userName} font='bold'/>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button}>
          <Ionicons name="settings-outline" size={30} color="black" style={styles.icon} />
          <CustomText style={styles.buttonText} text="Settings" font='bold'/>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={goToEditProfile}>
          <Ionicons name="create-outline" size={30} color="black" style={styles.icon} />
          <CustomText style={styles.buttonText} text="Edit Profile" font='bold'/>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={toggleOverlay}>
          <Ionicons name="people-outline" size={30} color="black" style={styles.icon} />
          <CustomText style={styles.buttonText} text={"Manage Clubs: " + userData?.clubs?.map((club) => club.name).join(', ')} font='bold'/>
        </TouchableOpacity>
      </View>
      <Overlay overlayStyle={styles.clubsOverlay} isVisible={visible} onBackdropPress={toggleOverlay}>
        <CustomText style={styles.buttonText} text={userData?.clubs?.map((club) => club.name).join(', ')} />
      </Overlay>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  orangeSection: {
    backgroundColor: 'white',
  },
  logoutButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    backgroundColor: 'white',
  },
  logoutText: {
    color: 'black',
    fontWeight: 'bold',
  },
  profileContainer: {
    alignItems: 'center',
    marginTop: -120,
    zIndex: 1,
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    borderWidth: 10,
    borderColor: 'white',
    backgroundColor: 'white',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
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
    alignItems: 'flex-start',
  },
  buttonText: {
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'left',
    paddingLeft: 30,
    marginTop: 5,
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
    marginTop: 10,
  },
  usernameText: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  requestButton: {
    backgroundColor: '#FF5028',
    padding: 15,
    borderRadius: 25,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 4,
  },
  requestButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  clubsOverlay: {
    width: '80%',
    padding: 30,
    borderRadius: 20,
  },
  avatarContainer: {
    marginBottom: 20,
  }
});

export default Profile;
