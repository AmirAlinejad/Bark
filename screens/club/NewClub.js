import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { set, ref, get } from "firebase/database";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import UploadImage from '../../components/UploadImage';
import Header from '../../components/Header';
import { MultipleSelectList } from 'react-native-dropdown-select-list';
import { db } from '../../backend/FirebaseConfig';
import { clubCategories } from '../../macros/macros';
// fonts
import { textNormal, title} from '../../styles/FontStyles';

const NewClub = ({ navigation }) => {
  const [clubName, setName] = useState('');
  const [clubDescription, setDescription] = useState('');
  const [categoriesSelected, setSelected] = useState([]);
  const [clubImg, setClubImg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const handleCallback = (childData) => {
    setClubImg(childData);
  };

  const onBackPress = () => {
    navigation.goBack();
  }

  const onSubmitPressed = async () => {
    setLoading(true);

    if (!clubName || !clubDescription) {
      alert("Please enter both name and description.");
      setLoading(false);
      return;
    }

    try {
      const clubRef = ref(db, 'clubs/' + clubName);
      set(clubRef, {
        clubName: clubName,
        clubDescription: clubDescription,
        clubCategories: categoriesSelected,
        clubImg: clubImg,
      });

      const userId = currentUser?.uid;
      if (userId) {
        const userRef = ref(db, `users/${userId}`);
        const userSnapshot = await get(userRef);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.val();

          // Check if userData.clubs is an array
          const updatedClubs = Array.isArray(userData?.clubs) ? [...userData.clubs, clubName] : [clubName];

          await set(userRef, {
            ...userData,
            clubs: updatedClubs,
          });
        }
      }

      navigation.goBack();
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
        <View style={{ marginTop: 50, alignItems: 'center' }}>
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
          <UploadImage parentCallback={handleCallback} />

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
