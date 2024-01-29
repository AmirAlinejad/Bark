import React, { useState, useEffect } from 'react';
// react native components
import { View, StyleSheet, ScrollView, Text } from 'react-native';
// backend
import { set, ref, get } from "firebase/database";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../../backend/FirebaseConfig';
// my components
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import CustomText from '../../components/CustomText';
import UploadImage from '../../components/UploadImage';
import Header from '../../components/Header';
// multi-select list
import { MultipleSelectList } from 'react-native-dropdown-select-list';
// macros
import { clubCategories } from '../../macros/macros';
// fonts
import { textNormal, title} from '../../styles/FontStyles';

const NewClub = ({ navigation }) => {
  // set state for all club vars
  const [clubName, setName] = useState('');
  const [clubDescription, setDescription] = useState('');
  const [categoriesSelected, setSelected] = useState([]);
  const [clubImg, setClubImg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // get user data from auth
  const auth = getAuth();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  // callback function for image upload
  const handleCallback = (childData) => {
    setClubImg(childData);
  };

  // go back
  const onBackPress = () => {
    navigation.goBack();
  }

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
      const clubRef = ref(db, 'clubs/' + clubName);
      set(clubRef, {
        clubName: clubName,
        clubDescription: clubDescription,
        clubCategories: categoriesSelected,
        clubImg: clubImg,
      });

      const auth = getAuth();
      const user = auth.currentUser;
  
      if (user) {
        const userId = user.uid;
        const userRef = ref(db, `users/${userId}`);
        const userSnapshot = await get(userRef);
  
        if (userSnapshot.exists()) {
          const userData = userSnapshot.val();
          const updatedClubs = [...(userData.clubs || []), {
            name: clubName,
            privelege: 'owner',
          }];
  
          // Update the user's information in the database
          await set(userRef, {
            ...userData,
            clubs: updatedClubs,
          });

          // add user to club's members
          const clubRef = ref(db, 'clubs/' + clubName);
          const clubSnapshot = await get(clubRef);

          // if club exists
          if (clubSnapshot.exists()) {
            const clubData = clubSnapshot.val();

            const updatedClubMembers = {...clubData.clubMembers, [userData.userName]: {
              userName: userData.userName,
              privilege: 'owner',
            }};

            await set(clubRef, {
              ...clubData,
              clubMembers: updatedClubMembers,
            });
          } else {
            console.error('Club data not found.');
          }
  
          alert(`Created new club ${clubName}`);
        } else {
          console.error('User data not found.');
        }
      } else {
        console.error('User not authenticated.');
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

          <CustomText style={styles.textNormal} text='Upload a club image' />
          <UploadImage parentCallback={handleCallback} />

          <CustomText style={styles.textNormal} text='Select categories for your club' />
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
