<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
// react native components
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
// my components
import ClubCategory from '../../components/club/ClubCategory';
import Header from '../../components/Header';
import SearchBar from '../../components/input/SearchBar';
import ToggleButton from '../../components/buttons/ToggleButton';
import CircleButton from '../../components/buttons/CircleButton';
// macros
import { clubCategories } from '../../macros/macros';
// functions
import { getSetAllClubsData } from '../../functions/backendFunctions';
// fonts
import { title } from '../../styles/FontStyles';
// icons
import { Ionicons } from '@expo/vector-icons';
// styles
import { Colors } from '../../styles/Colors';

const ClubList = ({ navigation }) => {
  // state for club data
  const [clubData, setClubData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [categoriesSelected, setSelectedCategories] = useState([]);

  // go to add club screen
  const onAddClubPress = () => {
    navigation.navigate("NewClub");
  }

  // get data from firebase
  useEffect(() => {
    // get club data and set state
    getSetAllClubsData(setClubData);
  }, []);

  // filter for clubs
  const filterFunct = (club) => {

    // filter by search text
    if (searchText.length > 0) {
      if (!club.clubName.toLowerCase().includes(searchText.toLowerCase())) {
        return false;
      }
    }
  
    // filter by categories selected
    if (categoriesSelected.length > 0) { 
      if (!categoriesSelected.some(item => club.clubCategories && club.clubCategories.includes(item))) { // make sure clubCategories is right
        return false;
      }
    }

    return true;
  }

  // filter clubs by category and sort into sortedClubs
  const sortedClubs = clubCategories.map((category) => {
    return {
      categoryName: category.emoji + ' ' + category.value,
      data: clubData?.filter(filterFunct).filter((club) => club.clubCategories && club.clubCategories.includes(category.value))
    };
  });

  return (
    <View style={styles.container}>
      <Header text='Club List'></Header>
      <View style={styles.searchBarView}>
        <SearchBar placeholder='Search' value={searchText} setValue={setSearchText}/>
      </View>

      <View style={styles.content}>
        <ScrollView style={{marginRight: 20, marginLeft: 20}} contentContainerStyle={styles.categoriesButtonRow} horizontal>
        { 
          // create a club category component for each category
          clubCategories.map((category) => {

            // toggle button to update categories selected
            const toggleButton = () => {
              if (categoriesSelected.includes(category.value)) {
                setSelectedCategories(categoriesSelected.filter((item) => item !== category.value));
              } else {
                setSelectedCategories([...categoriesSelected, category.value]);
              }
            }

            return (
              <ToggleButton 
                text={category.emoji + " " + category.value} 
                onPress={toggleButton} 
                toggled={categoriesSelected.includes(category.value)} 
                toggledCol={category.color}
                untoggledCol={Colors.lightGray}
              />
            )
          })
        }
        </ScrollView>
      </View>
      
        <ScrollView style={styles.clubCategoriesView} contentContainerStyle={styles.clubCategoriesContent}>
        { 
          // create a club category component for each category
          sortedClubs.map((category) => {
            if (category?.data.length != 0) {
              return (
                <View style={{flex: 1, width: '100%'}}>
                  <View style={styles.separator} />
                  <ClubCategory name={category.categoryName} data={category.data} navigation={navigation} />
                </View>
              )
            }
          })
        }
        </ScrollView>
  

      <CircleButton icon="create-outline" onPress={onAddClubPress} position={{ bottom: 0, right: 0 }} size={80} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: Colors.lightGray,
  },
  content: {
    backgroundColor: Colors.white,
    paddingTop: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    justifyContent: 'flex-start',
  },
  clubCategoriesView: {
    paddingLeft: 20,
    backgroundColor: Colors.white,
  },
  clubCategoriesContent: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  searchBarView: {
    marginLeft: 20,
    marginBottom: 20,
  },
  categoriesButtonRow: {
    marginBottom: 10,
    gap: 10,
  },
  separator: {
    height: 1,
    width: '110%',
    marginLeft: -20,
    backgroundColor: Colors.lightGray,
  },
  rightButtonView: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    margin: 30,
  },
  addClubButton: {
    backgroundColor: Colors.red,
    padding: 20,
    borderRadius: 50,
    shadowColor: 'black',
    shadowOffset: { width: 3, height: 5 },
    shadowOpacity: 0.25,
  },
  title: title,
});

=======
import React, { useState, useEffect } from 'react';
// react native components
import { View, StyleSheet, ScrollView, Button } from 'react-native';
import { IconButton } from 'react-native-paper';
// backend
import { db } from '../../backend/FirebaseConfig';
import { ref, onValue } from "firebase/database";
// my components
import ClubCategory from '../../components/club/ClubCategory';
import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';
import ClubCategoryButton from '../../components/club/ClubCategoryButton';
// macros
import { clubCategories } from '../../macros/macros';
// fonts
import { title } from '../../styles/FontStyles';
// styles
import { Colors } from '../../styles/Colors';

const ClubList = ({ navigation }) => {
  const [clubData, setClubData] = useState([]);
  const [searchText, setSearchText] = useState('');
  // for overlay
  const [visible, setVisible] = useState(false);
  const [categoriesSelected, setSelectedCategories] = useState([]);

  // toggle overlay
  const toggleOverlay = () => {
    setVisible(!visible);
  };

  // go to add club screen
  const onAddClubPress = () => {
    navigation.navigate("NewClub");
  }

  // get data from firebase
  useEffect(() => {
    // get club data
    const starCountRef = ref(db, 'clubs/');
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      const newClubs = Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
      console.log(newClubs);
      setClubData(newClubs);
    })
  }, []);

  // filter for clubs
  const filterFunct = (club) => {

    // filter by search text
    if (searchText.length > 0) {
      if (!club.clubName.toLowerCase().includes(searchText.toLowerCase())) {
        return false;
      }
    }
  
    // filter by categories selected
    if (categoriesSelected.length > 0) { 
      if (!categoriesSelected.some(item => club.clubCategories.includes(item))) { // make sure clubCategories is right
        return false;
      }
    }

    return true;
  }

  // filter clubs and sort clubs by category
  const sortedClubs = clubCategories.map((category) => {
    return {
      categoryName: category.value,
      data: clubData.filter(filterFunct).filter((club) => club.clubCategories && club.clubCategories.includes(category.value))
    };
  });

  return (
    <View style={styles.container}>
      <Header text='Club List'></Header>
      <View style={{marginLeft: 20, marginBottom: 10}}>
        <SearchBar placeholder='Search' value={searchText} setValue={setSearchText}/>
      </View>

      <ScrollView style={styles.categoriesButtonRow} horizontal>
      { 
        // create a club category component for each category
        clubCategories.map((category) => {

          // toggle button to update categories selected
          const toggleButton = () => {
            if (categoriesSelected.includes(category.value)) {
              setSelectedCategories(categoriesSelected.filter((i) => i !== category.value));
            } else {
              setSelectedCategories([...categoriesSelected, category.value]);
            }
          }

          return (
            <View style={styles.categoryButtonView} >
              <ClubCategoryButton text={category.value} onPress={toggleButton} toggled={categoriesSelected.includes(category.value)} />
            </View>
          )
        })
      }
      </ScrollView>
      <ScrollView style={styles.clubCategoriesView}>
      { 
        // create a club category component for each category
        sortedClubs.map((category) => {
          if (category.data.length != 0) {
            return (
              <ClubCategory name={category.categoryName} data={category.data} navigation={navigation} />
            )
          }
        })
      }
      </ScrollView>
      <View style={styles.addClubButton}>
        <IconButton
          onPress={onAddClubPress}
          icon="plus-circle"
          iconColor={Colors.red}
          size={70}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#FAFAFA',
  },
  clubCategoriesView: {
    marginLeft: 20,
    height: '100%',
  },
  categoriesButtonRow: {
    marginLeft: 20,
  },
  categoryButtonView: {
    height: 100,
  },  
  addClubButton: {
    bottom: 0,
    right: 0,
    padding: 20,
    position: 'absolute',
  },
  title: title,
});

>>>>>>> dfe4a17ddd108df15325f902cdfdaa4361e7c37e
export default ClubList;