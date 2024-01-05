import React, { useState } from 'react';
// react native components
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
// my components
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import UploadImage from '../../components/UploadImage';
import Header from '../../components/Header';
// multiple select list
import { MultipleSelectList } from 'react-native-dropdown-select-list'
// backend
import { db } from '../../backend/FirebaseConfig';
import { ref, set } from "firebase/database";
// macros
import { clubCategories } from '../../macros/macros';
// fonts
import { textNormal, title} from '../../styles/FontStyles';

const NewClub = ({ navigation }) => {
  // create states for club info
  const [clubName, setName] = useState('');
  const [clubDescription, setDescription] = useState('');
  const [categoriesSelected, setSelected] = React.useState([]);
  const [clubImg, setClubImg] = React.useState(null);
  const [loading, setLoading] = useState(false);

  // go back to the previous screen
  const onBackPress = () => {
    navigation.goBack();
  }

  // get the image from the upload image component
  const handleCallback=(childData) => {
    setClubImg(childData);
  };

  // submit the form
  const onSubmitPressed = async () => {
    setLoading(true);

    if (!clubName || !clubDescription) { // change
      alert("Please enter both name and description.");
      setLoading(false);
      return;
    }
    
    // try to submit the form
    try {
      set(ref(db, 'clubs/' + clubName), {
        clubName: clubName,
        clubDescription: clubDescription,
        clubCategories: categoriesSelected,
        clubImg: clubImg,
      });
  
      navigation.navigate("ClubList");
    } catch (error) {
      console.log(error);
      alert('Club creation failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Header text='New Club' back navigation={navigation}></Header>
      <ScrollView>
        <View style={{marginTop: 50, alignItems: 'center'}}>
          <CustomInput
            placeholder="Club Name"
            value={clubName}
            setValue={setName}
          />
          <CustomInput
            placeholder="Club Description"
            value={clubDescription}
            setValue={setDescription}
          />

          <Text style={styles.textNormal}>Upload a club image</Text>
          <UploadImage parentCallback={handleCallback}/>

          <Text style={styles.textNormal}>Select categories for your club</Text>
          <MultipleSelectList 
            setSelected={(val) => setSelected(val)} 
            data={clubCategories} 
            save="value"
            label="Categories"
          />

          <CustomButton text="Submit" onPress={onSubmitPressed} type="primary" />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
  },
  title: title,
  textNormal: {
    ...textNormal,
    marginTop: 20,
  }
});

export default NewClub;