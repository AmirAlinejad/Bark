import React, { useState } from 'react'
// react native components
import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
// my components
import CustomText from '../../components/CustomText';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import Header from '../../components/Header';
import ClubImg from '../../components/club/ClubImg';
// image picking
import handleImageUpload from '../../functions/uploadImage';
// backend
import { ref, update } from 'firebase/database';
import { db } from '../../backend/FirebaseConfig';
// fonts
import { textNormal } from '../../styles/FontStyles';

const EditClubScreen = ({ route, navigation }) => {
  // get user data from previous screen
  const { name, clubId, img, description } = route.params;

  // state variables
  const [clubName, setClubName] = useState(name);
  const [clubImg, setClubImg] = useState(img);
  const [clubDescription, setClubDescription] = useState(description);
  const [loading, setLoading] = useState(false);

  // edit club
  const onEditClubSubmitted = async (e) => {
    setLoading(true);
    e.preventDefault();

    // try to submit the edit profile request
    try {
        // update old event info
        const userRef = ref(db, `clubs/${clubId}`);
        await update(userRef, {
            clubName: clubName,
            clubImg: clubImg,
        });

        navigation.navigate("HomeScreen");
    } catch (error) {
      console.log(error);
      alert('Edit Club failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header text={'Edit ' + clubName} back navigation={navigation}/>
      <View style={{alignItems: 'center', margin: 20}} >
        <TouchableOpacity onPress={() => handleImageUpload('club', setClubImg)}>
          <ClubImg clubImg={clubImg} width={170} editable/>
        </TouchableOpacity>
      </View>

      <View style={styles.clubContainer}>

        <CustomText style={styles.textNormal} font="bold" text="Club Name" />
        <CustomInput placeholder="New Club Name"
          value={clubName}
          setValue={setClubName}
        />

        <CustomText style={styles.textNormal} font="bold" text="Description" />
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Tell us about your club."
            value={clubDescription}
            onChangeText={setClubDescription}
            keyboardType="default"
            maxLength={500}
            numberOfLines={5}
            style={styles.input}
            multiline={true}
            textAlignVertical='top'
          />
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <CustomButton text="Save Changes" onPress={onEditClubSubmitted} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    justifyContent: 'flex-start',
  },
  clubContainer: {
    justifyContent: 'flex-start',
    marginTop: 20,
    marginLeft: 20,
  },
  inputContainer: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    height: 100,
    width: '90%',
    padding: 15,
    marginBottom: 20,
  },
  buttonContainer: {
   marginLeft: 20,
   width: 400,
  },
  textNormal: {
    ...textNormal,
    fontSize: 20,
    marginLeft: 5,
  },
});
export default EditClubScreen;