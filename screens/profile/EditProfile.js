import React, { useReducer, useState } from 'react'
// react native components
import {
  View,
  Image,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
} from 'react-native';
// icons
import Icon from 'react-native-vector-icons/FontAwesome';
// my components
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import UploadImage from '../../components/UploadImage';
// backend
import { ref, set } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { FIREBASE_AUTH, db } from '../../backend/FirebaseConfig';

const EditProfile = ({ route, navigation }) => {
  // get user data from previous screen
  const { userData } = route.params;

  // state variables
  const [userName, setUserName] = useState(userData.userName);
  const [email, setEmail] = useState(userData.email);
  const [profileImg, setProfileImg] = useState(null);
  const [loading, setLoading] = useState(false);
  const auth = FIREBASE_AUTH;

  // back to profile
  const onBack = () => {
    navigation.goBack();
  }

  // callback function for image upload
  const handleCallback = (childData) => {
    setProfileImg(childData);
  };

  // edit profile
  const onEditProfileSubmitted = async (e) => {
    setLoading(true);
    e.preventDefault();

    // try to submit the edit profile request
    try {
          
      // get old user info from uth
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {

        // update old user info
        const userRef = ref(db, `users/${user.uid}`);
        await set(userRef, {
            userName: userName,
            email: email,
            profileImg: profileImg,
        });

        navigation.navigate("HomeScreen");
      }
    } catch (error) {
      console.log(error);
      alert('Edit Profile failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const screenHeight = useWindowDimensions().height;

  return (
    <View style={styles.container}>
      <View style={[styles.orangeSection, { height: screenHeight * 0.25 }]} />
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-left" size={20} color="black" />
      </TouchableOpacity>
      <View style={styles.profileContainer}>
        <UploadImage parentCallback={handleCallback} />
        <CustomInput placeholder="New Username"
          value={userName}
          setValue={setUserName}
        />
        <CustomInput placeholder="New Email"
          value={email}
          setValue={setEmail}
        />
      </View>
      <View style={styles.buttonContainer}>
        <CustomButton text="Save Changes" onPress={onEditProfileSubmitted} />
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
    alignItems: 'center',
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
});
export default EditProfile