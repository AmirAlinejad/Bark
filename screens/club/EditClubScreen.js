import React, { useState } from 'react'
// react native components
import { View, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
// my components
import CustomText from '../../components/display/CustomText';
import CustomInput from '../../components/input/CustomInput';
import CustomButton from '../../components/buttons/CustomButton';
import Header from '../../components/display/Header';
import ClubImg from '../../components/club/ClubImg';
import PrivacySwitch from '../../components/input/PrivacySwitch';
// functions
import { emailSplit } from '../../functions/backendFunctions';
// image picking
import { handleImageUploadAndSend } from '../../functions/backendFunctions';
// backend
import { ref, update } from 'firebase/database';
import { db } from '../../backend/FirebaseConfig';
import { updateDoc, doc } from 'firebase/firestore';
// colors
import { Colors } from '../../styles/Colors';
// keyboard avoiding view
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview';

const EditClubScreen = ({ route, navigation }) => {
  // get user data from previous screen
  const { name, id, img, description, publicClub } = route.params;

  // state variables
  const [clubName, setClubName] = useState(name);
  const [clubImg, setClubImg] = useState(img);
  const [clubDescription, setClubDescription] = useState(description);
  const [publicClubState, setpublicClub] = useState(publicClub);
  const [loading, setLoading] = useState(false);

  // edit club
  const onEditClubSubmitted = async (e) => {

    setLoading(true);
    // prevent default form submission if there is an error
    e.preventDefault();

    // make sure all fields are filled out
    if (!clubName || !clubDescription) {
      alert('Please fill out all fields.');
      setLoading(false);
      return;
    }

    // try to submit the edit profile request
    try {
        /*// update old club info
        const clubRef = ref(db, `${emailSplit()}/clubs/${id}`);
        await update(clubRef, {
            clubName: clubName,
            clubImg: clubImg ? clubImg : null,
            clubDescription: clubDescription,
            publicClub: publicClubState,
        });*/

        // update clubData
        await updateDoc(doc(db, 'clubData', id), {
          clubName: clubName,
          clubImg: clubImg ? clubImg : null,
          clubDescription: clubDescription,
          publicClub: publicClubState,
        });

        // update clubSearch data
        await updateDoc(doc(db, 'clubSearchData', id), {
          clubName: clubName,
          clubImg: clubImg ? clubImg : null,
          publicClub: publicClubState,
        });

        navigation.navigate("InClubView", { clubId: id });
    } catch (error) {
      console.log(error);
      alert('Edit Club failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header text={'Edit Club'} back navigation={navigation}/>

      <KeyboardAwareScrollView 
        contentContainerStyle={{flex: 1}}
        extraHeight={-100}
      >
        <View style={styles.clubImg} >
          <TouchableOpacity onPress={() => handleImageUploadAndSend('club', setClubImg)}>
            <ClubImg clubImg={clubImg} width={170} editable/>
          </TouchableOpacity>
        </View>

        <View style={styles.clubContainer}>

          <CustomText style={styles.text} font="bold" text="Club Name" />
          <CustomInput placeholder="New Club Name"
            value={clubName}
            setValue={setClubName}
          />

          <CustomText style={[styles.text, {marginTop: 10}]} font="bold" text="Public Club" />
          <PrivacySwitch toggled={publicClubState} setToggled={setpublicClub} style={{marginTop: 10}} />
          <View style={{height: 10}}></View>

          <CustomText style={styles.text} font="bold" text="Description" />
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Tell us about your club. (200 characters)"
              value={clubDescription}
              onChangeText={setClubDescription}
              keyboardType="default"
              maxLength={200}
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
        {loading && <ActivityIndicator size="large" color={Colors.buttonBlue} />}
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
  clubImg: {
    marginTop: 20,
    alignItems: 'center',
  },
  clubContainer: {
    justifyContent: 'flex-start',
    marginTop: 20,
    marginLeft: 20,
    gap: 0,
  },
  inputContainer: {
    borderColor: Colors.inputBorder,
    borderWidth: 1,
    borderRadius: 20,
    height: 100,
    width: '90%',
    padding: 15,
    marginBottom: 10,
  },
  buttonContainer: {
   marginLeft: 20,
   width: 400,
  },
  text: {
    fontSize: 20,
    marginLeft: 5,
  },
});
export default EditClubScreen;