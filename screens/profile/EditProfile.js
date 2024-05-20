import React, { useState } from 'react'
// react native components
import { View, StyleSheet, TouchableOpacity } from 'react-native';
// storage
import AsyncStorage from '@react-native-async-storage/async-storage';
// keyboard avoiding view
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
// my components
import CustomText from '../../components/display/CustomText';
import CustomInput from '../../components/input/CustomInput';
import CustomButton from '../../components/buttons/CustomButton';
import ProfileImg from '../../components/display/ProfileImg';
import Header from '../../components/display/Header';
// backend functions
import { emailSplit, handleImageUploadAndSend } from '../../functions/backendFunctions';
// select list
import { SelectList } from 'react-native-dropdown-select-list'
// colors
import { Colors } from '../../styles/Colors';
// macros
import { MAJORS } from '../../macros/macros';
// backend
import { doc, setDoc } from 'firebase/firestore';
import { firestore } from '../../backend/FirebaseConfig';

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
    if (!graduationYear == "" && graduationYear.length !== 4) {
      alert('Graduation year must be a 4-digit number');
      setLoading(false);
      return;
    }
    if (!graduationYear == "" && parseInt(graduationYear) < 2022) {
      alert('Graduation year must be 2022 or later');
      setLoading(false);
      return;
    }
    if (!graduationYear == "" && parseInt(graduationYear) > 2030) {
      alert('Graduation year must be 2030 or earlier');
      setLoading(false);
      return;
    }

    // try to submit the edit profile request
    try {

        let updatedUserData = {
            userName: userName,
            firstName: firstName,
            lastName: lastName,
            id: userData.id,
            email: userData.email,
            expoPushToken: userData.expoPushToken,
        }
        if (graduationYear) updatedUserData.graduationYear = graduationYear;
        if (major) updatedUserData.major = major;
        if (profileImg) updatedUserData.profileImg = profileImg;

        // update firestore
        const schoolKey = await emailSplit();
        await setDoc(doc(firestore, 'schools', schoolKey, 'userData', userData.id), updatedUserData);
        
        // update async storage
        await AsyncStorage.setItem('user', JSON.stringify(updatedUserData));

        navigation.navigate("HomeScreen");
    } catch (error) {
      console.log(error);
      alert('Edit Profile failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // sort majors by alphabetical order by first character
  MAJORS.sort((a, b) => a.value.substring(2).localeCompare(b.value.substring(2)));

  return (
    <View style={styles.container}>
    <Header text='Edit Profile' back navigation={navigation}/>
      <KeyboardAwareScrollView 
        contentContainerStyle={styles.elementsContainer}
        extraHeight={200}
      >
        <View style={{alignItems: 'center', margin: 20}} >
          <TouchableOpacity onPress={() => handleImageUploadAndSend('profile', setProfileImg)}>
            <ProfileImg profileImg={profileImg} width={170} editable/>
          </TouchableOpacity>
        </View>

        <View style={styles.profileContainer}>

          <CustomText style={styles.textNormal} font="bold" text="Username*" />
          <CustomInput placeholder="New Username"
            value={userName}
            setValue={setUserName}
          />

          <CustomText style={styles.textNormal} font="bold" text="Full Name*" />  
          <View style={styles.namesView}>
            <CustomInput placeholder="First Name"
              value={firstName}
              setValue={setFirstName}
              width={150}
            />
            <View style={{width: 10}} />
            <CustomInput placeholder="Last Name"
              value={lastName}
              setValue={setLastName}
              width={150}
            />
          </View>

          <CustomText style={styles.textNormal} font="bold" text="🎓 Graduation Year" />
          <CustomInput placeholder="Graduation Year"
            value={graduationYear}
            setValue={setGraduationYear}
            keyboardType='numeric'
          />

          <CustomText style={styles.textNormal} font="bold" text="📚 Major" />
          <SelectList 
            setSelected={(val) => setMajor(val)} 
            data={MAJORS} 
            save="value"
            boxStyles={styles.boxStyles}
            dropdownStyles={styles.dropdownStyles}
            inputStyles={styles.inputStyles}
            dropdownTextStyles={styles.dropdownTextStyles}
          />

          <CustomText style={styles.smallText} text="* Indicates a required field" />

        </View>

        <View style={styles.buttonContainer}>
          {loading && <CustomText text="Loading..." />}
          <CustomButton text="Save Changes" onPress={onEditProfileSubmitted} />
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    justifyContent: 'flex-start',
  },
  profileContainer: {
    justifyContent: 'flex-start',
    marginTop: 20,
    marginLeft: 20,
  },
  namesView: {
    flexDirection: 'row',
  },
  buttonContainer: {
    marginTop: 20,
   marginLeft: 20,
   width: 400,
  },
  textNormal: {
    fontSize: 20,
    marginLeft: 5,
  },

  // dropdown
  boxStyles: {
    width: 300,
    borderRadius: 20,
    borderColor: Colors.inputBorder,
    height: 50,
  },
  dropdownStyles: {
    width: 300,
    borderRadius: 20,
    borderColor: Colors.inputBorder,
  },
  inputStyles: {
    color: Colors.black,
    fontSize: 14,
    marginTop: 3,
  },
  dropdownTextStyles: {
    color: Colors.black,
    fontSize: 14,
  },
  smallText: {
    marginTop: 10,
    fontSize: 14,
    color: Colors.darkGray,
  },
});

export default EditProfile;