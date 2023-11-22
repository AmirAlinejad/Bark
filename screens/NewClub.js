import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { MultipleSelectList } from 'react-native-dropdown-select-list'
import { db } from './backend/FirebaseConfig';
import { ref, set } from "firebase/database";
import { textNormal, title} from '../styles/fontstyles';
import UploadImage from '../components/UploadImage';

const NewClub = ({ navigation }) => {
  // create states for club info
  const [clubName, setName] = useState('');
  const [clubDescription, setDescription] = useState('');
  const [categoriesSelected, setSelected] = React.useState([]);
  const [clubImg, setClubImg] = React.useState(null);
  const [loading, setLoading] = useState(false);

  // club categories
  const categories = [
    {key:'1', value:'Technology'},
    {key:'2', value:'Service/Volunteering'},
    {key:'3', value:'Sports'},
    {key:'4', value:'Math'},
    {key:'5', value:'Religion'},
    {key:'6', value:'Art'},
    {key:'7', value:'Cultural'},
  ]

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
      setName('');
      setDescription('');
  
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
      <Text style={styles.title}> Create a new Club</Text>

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
        data={categories} 
        save="value"
        label="Categories"
      />
      
      <CustomButton text="Submit" onPress={onSubmitPressed} type="primary" />
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D3D3D3',
  },
  title: title,
  textNormal: {
    ...textNormal,
    marginTop: 20,
  }
});

export default NewClub;