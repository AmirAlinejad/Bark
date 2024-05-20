import React, { useState } from 'react';
// react native components
import { View, StyleSheet, TextInput } from 'react-native';
// backend
import { set, ref, get } from "firebase/database";
// async storage
import AsyncStorage from '@react-native-async-storage/async-storage';
// firestore
import { setDoc, doc } from 'firebase/firestore';
import { firestore } from '../../backend/FirebaseConfig';
// my components
import CustomInput from '../../components/input/CustomInput';
import CustomButton from '../../components/buttons/CustomButton';
import CustomText from '../../components/display/CustomText';
import Header from '../../components/display/Header';
import IconOverlay from '../../components/overlays/IconOverlay';
import PrivacySwitch from '../../components/input/PrivacySwitch';
// functions
import { emailSplit, joinClub } from '../../functions/backendFunctions';
// multi-select list
import { MultipleSelectList } from 'react-native-dropdown-select-list';
// macros
import { CLUBCATEGORIES } from '../../macros/macros';
// scroll view
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
// colors
import { Colors } from '../../styles/Colors';

const NewClub = ({ navigation }) => {
  // set state for all club vars
  const [clubName, setName] = useState('');
  const [clubDescription, setDescription] = useState('');
  const [categoriesSelected, setSelected] = useState([]);
  const [publicClub, setpublicClub] = useState(true);
  const [loading, setLoading] = useState(false);
  // overlay
  const [overlayVisible, setOverlayVisible] = useState(false);

  // submit club
  const onSubmitPressed = async () => {
    setLoading(true);

    // make sure data is valid
    if (!clubName || !clubDescription) {
      alert("Please enter both name and description.");
      setLoading(false);
      return;
    }

    // add data to clubs
    try {
      // generate unique club id
      const clubId = (Math.random() + 1).toString(36).substring(7);

      const schoolKey = await emailSplit();
      console.log(schoolKey);

      // add club to clubData
      const clubDoc = doc(firestore, 'schools', schoolKey, 'clubData', clubId);
      await setDoc(clubDoc, {
        clubName: clubName,
        clubId: clubId,
        clubDescription: clubDescription,
        clubCategories: categoriesSelected,
        publicClub: publicClub,
      });

      // add club to club search data for each category
      for (let i = 0; i < categoriesSelected.length; i++) {
        const category = categoriesSelected[i];
        const categoryDoc = doc(firestore, 'schools', schoolKey, 'clubSearchData', category, 'clubs', clubId);
        await setDoc(categoryDoc, {
          clubName: clubName,
          clubId: clubId,
          clubDescription: clubDescription,
          publicClub: publicClub,
          clubMembers: 0,
        });
      }

      // add user to club's members
      await joinClub(clubId, 'owner');

    } catch (error) {
      console.log(error);
      alert('Club creation failed: ' + error.message);
    } finally {
      setLoading(false);
      setOverlayVisible(true);
    }
  }

  return (
    <View style={styles.container}>
      <Header text='New Club' back navigation={navigation}></Header>
      <KeyboardAwareScrollView 
          contentContainerStyle={styles.elementsContainer}
          extraHeight={200}
        >

        <CustomText style={styles.textNormal} font="bold" text="Club Name" />
        <CustomInput
          placeholder="Club Name (50 characters)"
          value={clubName}
          setValue={setName}
          maxLength={50}
        />

        <CustomText style={styles.textNormal} font="bold" text="Public Club" />
        <PrivacySwitch toggled={publicClub} setToggled={setpublicClub} />
        <View style={{height: 10}}></View>

        <CustomText style={styles.textNormal} font="bold" text="Description" />
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Tell us about your club. (200 characters)"
            value={clubDescription}
            onChangeText={setDescription}
            keyboardType="default"
            maxLength={200}
            numberOfLines={5}
            style={styles.input}
            multiline={true}
            textAlignVertical='top'
          />
        </View>

        <CustomText style={styles.textNormal} font="bold" text="Club Categories" />
        <MultipleSelectList
          data={CLUBCATEGORIES}
          setSelected={(val) => setSelected(val)}
          save='value'
          label='Categories'
          boxStyles={{borderWidth: 1, borderColor: Colors.inputBorder, borderRadius: 20, width: 200, padding: 15, marginBottom: 20}}
          dropdownStyles={{borderWidth: 1, borderColor: Colors.inputBorder, borderRadius: 20, width: 200, marginBottom: 20}}
        />
    
        <CustomButton text="Create" onPress={onSubmitPressed} type="primary"/>
        <View style={{height: 50}}></View>
      </KeyboardAwareScrollView>
      
      <IconOverlay 
        visible={overlayVisible} 
        setVisible={setOverlayVisible} 
        closeCondition={() => {
          navigation.goBack();
        }} 
        icon="checkmark-circle" 
        iconColor={Colors.green} 
        text="Club Created!" 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  elementsContainer: {
    marginTop: 10,
    alignItems: 'flex-start',
    marginLeft: 20,
    gap: 5,
  },
  inputContainer: {
    borderColor: Colors.inputBorder,
    borderWidth: 1,
    borderRadius: 20,
    height: 100,
    width: '90%',
    padding: 15,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 50,
    color: Colors.black,
    backgroundColor: 'transparent',
    width: '90%',
  },
  textNormal: {
    fontSize: 20,
    marginBottom: 5,
    marginLeft: 5,
  },
  text: {
    fontSize: 12,
  },
});

export default NewClub;