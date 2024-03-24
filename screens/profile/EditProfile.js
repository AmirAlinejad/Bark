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

export default EditProfile;