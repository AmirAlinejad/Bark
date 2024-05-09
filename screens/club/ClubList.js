import React, { useState, useEffect } from 'react';
// react native components
import { View, StyleSheet, ScrollView } from 'react-native';
// fade
import Fade from 'react-native-fade';
// my components
import ClubCategory from '../../components/club/ClubCategory';
import Header from '../../components/display/Header';
import SearchBar from '../../components/input/SearchBar';
import ToggleButton from '../../components/buttons/ToggleButton';
import CircleButton from '../../components/buttons/CircleButton';
// macros
import { CLUBCATEGORIES } from '../../macros/macros';
// functions
import { getSetAllClubsData } from '../../functions/backendFunctions';
// styles
import { Colors } from '../../styles/Colors';
import CustomText from '../../components/display/CustomText';

const ClubList = ({ navigation }) => {
  // state for club data
  const [clubData, setClubData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [categoriesSelected, setSelectedCategories] = useState([]);
  // fading text
  const [showText, setShowText] = useState(true);
  // loading
  const [loading, setLoading] = useState(true);

  // go to add club screen
  const onAddClubPress = () => {
    navigation.navigate("NewClub");
  }

  // get data from firebase
  useEffect(() => {
    const asyncFunc = async () => {
      setLoading(true);

      // get club data and set state
      await getSetAllClubsData(setClubData);

      setLoading(false);
    }

    asyncFunc();
  }, []);

  // fade out text after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowText(false);
    }, 2000);
    return () => clearTimeout(timer);
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
      if (!categoriesSelected.some(category => club.clubCategories.includes(category))) { // make sure at least one category is in the club's categories
        return false;
      }
    }

    return true;
  }

  // filter clubs by category and sort into sortedClubs
  const sortedClubs = CLUBCATEGORIES.map((category) => {

    // only have data if category is selected
    if (categoriesSelected.length > 0 && !categoriesSelected.includes(category.value)) {
      return {
        categoryName: category.emoji + ' ' + category.value,
        data: []
      };
    }

    return {
      categoryName: category.emoji + ' ' + category.value,
      data: clubData?.filter(filterFunct).filter((club) => club.clubCategories.includes(category.value))
    };
  });

  return (
    <View style={styles.container}>
      <Header text='Club List'></Header>

      <View style={styles.searchBarView}>
        <SearchBar placeholder='Search' value={searchText} setValue={setSearchText}/>
      </View>

      <View style={styles.upperContent}>
        {/* categories selected */}
        <ScrollView style={{marginHorizontal: 20}} contentContainerStyle={styles.categoriesButtonRow} horizontal>
        { 
          // create a club category component for each category
          CLUBCATEGORIES.map((category) => {

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
        <View style={styles.separator} />
      </View>
      
      <ScrollView style={styles.clubCategoriesView} contentContainerStyle={styles.clubCategoriesContent} nestedScrollEnabled={true}>
      {
          // create a club category component for each category
          sortedClubs?.map((category, index) => {
            if (category.data.length != 0) {
              return (
                <View style={{flex: 1, width: '100%', alignItems: 'flex-start'}}>
                  <View style={{height: 10}} />
                  <ClubCategory name={category.categoryName} data={category.data} navigation={navigation} />
                  <CustomText 
                    text="Load more..." 
                    style={styles.loadMoreText} 
                    onPress={() => {
                      navigation.navigate('ClubCategoryScreen', { 
                        clubCategory: category.data,
                        navigation: navigation,  
                      })
                    }}
                  />
                </View>
              )
            }
          })
      }
      </ScrollView>

      <View style={styles.fadeView}>
        <Fade visible={showText}>
          <CustomText style={styles.popUpText} text="Create a club." font='bold' />
        </Fade>
      </View>
      
      <CircleButton icon="create-outline" onPress={onAddClubPress} position={{ bottom: 0, right: 0 }} size={60} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: Colors.lightGray,
  },
  upperContent: {
    justifyContent: 'flex-start',
    backgroundColor: Colors.white,
    paddingTop: 10,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  clubCategoriesView: {
    paddingLeft: 15,
    backgroundColor: Colors.white,
  },
  clubCategoriesContent: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  searchBarView: {
    margin: 15,
    marginTop: 5,
    marginBottom: 15,
  },
  categoriesButtonRow: {
    marginBottom: 10,
    gap: 10,
  },
  separator: {
    height: 1,
    width: '95%',
    marginRight: 20,
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
    shadowColor: Colors.black,
    shadowOffset: { width: 3, height: 5 },
    shadowOpacity: 0.25,
  },
  loadMoreText: {
    color: Colors.buttonBlue,
  },
  title: {
    fontSize: 20,
  },
  popUpText: {
    color: Colors.black,
    fontSize: 25,
    textAlign: 'right',
  },
  fadeView: {
    position: 'absolute', 
    bottom: 5, 
    right: 75, 
    margin: 30
  }
});

export default ClubList;