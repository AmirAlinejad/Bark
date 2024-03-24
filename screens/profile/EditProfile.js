<<<<<<< HEAD
import React, { useState } from 'react'
// react native components
import { View, StyleSheet, TouchableOpacity } from 'react-native';
// keyboard avoiding view
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
// my components
import CustomText from '../../components/CustomText';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import ProfileImg from '../../components/display/ProfileImg';
import Header from '../../components/Header';
// select list
import { SelectList } from 'react-native-dropdown-select-list'
// colors
import { Colors } from '../../styles/Colors';
// macros
import { majors } from '../../macros/macros';
// image picking
import handleImageUpload from '../../functions/uploadImage';
// backend
import { ref, set, update } from 'firebase/database';
import { db } from '../../backend/FirebaseConfig';
// fonts
import { textNormal } from '../../styles/FontStyles';
import { getAuth } from 'firebase/auth';

const EditProfile = ({ route, navigation }) => {
  // get user data from previous screen
  const { userData } = route.params;

  // state variables
  const [userName, setUserName] = useState(userData.userName);
  const [firstName, setFirstName] = useState(userData.firstName);
  const [lastName, setLastName] = useState(userData.lastName);
  const [graduationYear, setGraduationYear] = useState(userData.graduationYear);
  const [major, setMajor] = useState(userData.major);
  const [profileImg, setProfileImg] = useState(userData.profileImg);
  const [loading, setLoading] = useState(false);

  // edit profile
  const onEditProfileSubmitted = async (e) => {
    setLoading(true);
    e.preventDefault();

    // check if any fields are empty
    if (!userName || !firstName || !lastName) {
      alert('Please fill out all required fields');
      setLoading(false);
      return;
    }

    // check grad year
    if (graduationYear.length !== 4 || isNaN(graduationYear)) {
      alert('Graduation year must be a 4-digit number');
      setLoading(false);
      return;
    }
    if (parseInt(graduationYear) < 2022) {
      alert('Graduation year must be 2022 or later');
      setLoading(false);
      return;
    }
    if (parseInt(graduationYear) > 2030) {
      alert('Graduation year must be 2030 or earlier');
      setLoading(false);
      return;
    }

    // try to submit the edit profile request
    try {
        // update old user info
        const userRef = ref(db, `users/${userData.uid}`);
        await update(userRef, {
            userName: userName,
            profileImg: profileImg,
            firstName: firstName,
            lastName: lastName,
            graduationYear: graduationYear,
            major: major,
        });

        navigation.navigate("HomeScreen");
    } catch (error) {
      console.log(error);
      alert('Edit Profile failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
    <Header text='Edit Profile' back navigation={navigation}/>
      <KeyboardAwareScrollView 
        contentContainerStyle={styles.elementsContainer}
        extraHeight={200}
      >
        <View style={{alignItems: 'center', margin: 20}} >
          <TouchableOpacity onPress={() => handleImageUpload('profile', setProfileImg)}>
            <ProfileImg profileImg={profileImg} width={170} editable/>
          </TouchableOpacity>
        </View>

        <View style={styles.profileContainer}>

          <CustomText style={styles.textNormal} font="bold" text="Username" />
          <CustomInput placeholder="New Username"
            value={userName}
            setValue={setUserName}
          />

          <CustomText style={styles.textNormal} font="bold" text="Full Name" />  
          <View style={{flexDirection: 'row', gap: -20}}>
            <View style={{width: 175}}>
              <CustomInput placeholder="First Name"
                value={firstName}
                setValue={setFirstName}
              />
            </View>

            <View style={{width: 175}}>
              <CustomInput placeholder="Last Name"
                value={lastName}
                setValue={setLastName}
              />
            </View>
          </View>

          <CustomText style={styles.textNormal} font="bold" text="🎓 Graduation Year" />
          <CustomInput placeholder="Graduation Year"
            value={graduationYear}
            setValue={setGraduationYear}
          />

          <CustomText style={styles.textNormal} font="bold" text="📚 Major" />
          <SelectList 
            setSelected={(val) => setMajor(val)} 
            data={majors} 
            save="value"
            boxStyles={{
              width: 300,
              borderRadius: 20,
              borderColor: Colors.gray,
              height: 50,
            }}
            dropdownStyles={{
              width: 300,
              borderRadius: 20,
              borderColor: Colors.gray,
            }}
            inputStyles={{color: Colors.black, fontSize: 14, marginTop: 3}}
            dropdownTextStyles={{color: Colors.black, fontSize: 14}}
          />

        </View>

        <View style={styles.buttonContainer}>
          <CustomButton text="Save Changes" onPress={onEditProfileSubmitted} />
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    justifyContent: 'flex-start',
  },
  profileContainer: {
    justifyContent: 'flex-start',
    marginTop: 20,
    marginLeft: 20,
  },
  buttonContainer: {
  marginTop: 20,
   marginLeft: 20,
   width: 400,
  },
  textNormal: {
    ...textNormal,
    fontSize: 20,
    marginLeft: 5,
  },
});
=======
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
>>>>>>> dfe4a17ddd108df15325f902cdfdaa4361e7c37e
export default EditProfile