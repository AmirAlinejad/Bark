import React, { useState, useEffect, useLayoutEffect } from "react";
// react native components
import { View, StyleSheet, ScrollView, FlatList } from "react-native";
// mask view
import MaskedView from "@react-native-masked-view/masked-view";

import { LinearGradient } from "expo-linear-gradient";
// use focus effect
import { useFocusEffect, useNavigation } from "@react-navigation/native";
// stack navigator
import { createNativeStackNavigator } from "@react-navigation/native-stack";
// async storage
import AsyncStorage from "@react-native-async-storage/async-storage";
// fade
import Fade from "react-native-fade";
// my components
import ClubCategory from "../../components/club/ClubCategory";
import Header from "../../components/display/Header";
import SearchBar from "../../components/input/SearchBar";
import ToggleButton from "../../components/buttons/ToggleButton";
import CircleButton from "../../components/buttons/CircleButton";
import CustomText from "../../components/display/CustomText";
// icons
import Ionicon from "react-native-vector-icons/Ionicons";
// macrosr
import { CLUBCATEGORIES } from "../../macros/macros";
// functions
import {
  getClubCategoryData,
  emailSplit,
} from "../../functions/backendFunctions";
// styles
import { Colors } from "../../styles/Colors";
import { set } from "firebase/database";

const Stack = createNativeStackNavigator();

const ClubList = ({ navigation }) => {
  // state for club data
  const [clubData, setClubData] = useState({});
  const [sortedClubs, setSortedClubs] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [categoriesSelected, setSelectedCategories] = useState([]);
  // fading text
  const [showText, setShowText] = useState(true);
  // loading
  const [loading, setLoading] = useState(true);
  // school key to pass to club category screen
  const [schoolKey, setSchoolKey] = useState("");

  // useLayoutEffect(() => {
  //   navigation.setOptions({
  //
  //   });
  // }, [navigation]);

  // go to add club screen
  const onAddClubPress = () => {
    navigation.navigate("NewClub");
  };

  const asyncFunc = async () => {
    setLoading(true);

    // get data for each club category
    let data = {};
    for (let i = 0; i < CLUBCATEGORIES.length; i++) {
      const category = CLUBCATEGORIES[i].value;
      const clubData = await getClubCategoryData(category);

      data[category] = clubData;
    }
    console.log(data);

    // update async storage
    await AsyncStorage.setItem("clubSearchData", JSON.stringify(data));

    setClubData(data);
    setLoading(false);
  };

  // get club data from async storage
  const loadClubSearchData = async () => {
    const clubSearchData = await AsyncStorage.getItem("clubSearchData");
    if (clubSearchData) {
      setClubData(JSON.parse(clubSearchData));
    }
  };

  // get data from firebase
  useFocusEffect(
    React.useCallback(() => {
      loadClubSearchData();
      asyncFunc();

      // get school key
      const getSetSchoolKey = async () => {
        const schoolkey = await emailSplit();
        setSchoolKey(schoolkey);
      };
      getSetSchoolKey();
    }, [])
  );

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
    if (searchText && searchText.length > 0) {
      if (!club.clubName.toLowerCase().includes(searchText.toLowerCase())) {
        return false;
      }
    }

    return true;
  };

  // sort categories into sortedClubs whenever categoriesSelected changes
  useEffect(() => {
    const sortedClubs = [];
    for (let i = 0; i < CLUBCATEGORIES.length; i++) {
      const emoji = CLUBCATEGORIES[i].emoji;
      const category = CLUBCATEGORIES[i].value;
      const data = clubData[category];

      if (!data) {
        continue;
      }
      const filteredData = data.filter(filterFunct);

      if (filteredData.length > 0) {
        sortedClubs.push({
          categoryName: emoji + category,
          data: filteredData,
        });
      }
    }

    setSortedClubs(sortedClubs);
  }, [categoriesSelected, searchText, clubData]);

  // toggle button
  const toggleButton = (text) => {
    const newCategories = categoriesSelected.slice();
    if (newCategories.includes(text)) {
      newCategories.splice(newCategories.indexOf(text), 1);
    } else {
      newCategories.push(text);
    }
    setSelectedCategories(newCategories);
  };

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ClubList"
        options={{
          headerTitle: "Search Clubs",
          headerLargeTitle: true,
          headerShadowVisible: false,
          headerSearchBarOptions: {
            placeholder: "Search Clubs",
            onChangeText: (event) => {
              setSearchText(event.nativeEvent.text);
            },
            hideWhenScrolling: false,
          },
          headerTransparent: true,
          headerBlurEffect: "light",
          // add club button top right
        }}
      >
        {() => (
          <View style={{ flex: 1 }}>
            <ScrollView
              style={styles.container}
              contentInsetAdjustmentBehavior="automatic"
            >
              {/* <View style={styles.searchBarView}>
              <SearchBar placeholder='Search' value={searchText} setValue={setSearchText}/>
            </View> */}

              <View style={styles.upperContent}>
                <MaskedView
                  maskElement={
                    <LinearGradient // Background Linear Gradient
                      colors={["transparent", "black", "black", "transparent"]}
                      locations={[0, 0.05, 0.95, 1]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.background}
                    />
                  }
                >
                  {/* categories selected */}
                  <FlatList
                    data={CLUBCATEGORIES}
                    renderItem={({ item, index }) => (
                      <View
                        style={{
                          marginLeft: index === 0 ? 16 : 0,
                          marginRight:
                            index === CLUBCATEGORIES.length - 1 ? 16 : 0,
                        }}
                      >
                        <ToggleButton
                          text={item.emoji + " " + item.value}
                          onPress={() => toggleButton(item.value)}
                          toggled={categoriesSelected.includes(item.value)}
                          toggledCol={item.color}
                          untoggledCol={Colors.mediumGray}
                        />
                      </View>
                    )}
                    keyExtractor={(item) => item.value}
                    horizontal={true}
                    contentContainerStyle={styles.categoriesButtonRow}
                    style={{ marginHorizontal: 0, mask: "hidden" }}
                    scrollEnabled={true}
                  />
                </MaskedView>

              </View>
                
              <View style={styles.separator} />

              <View style={styles.lowerContent}>
                {
                  // if no clubs found
                  sortedClubs.length === 0 ? (
                    <View style={styles.noClubsView}>
                      <Ionicon
                        name="megaphone"
                        size={100}
                        color={Colors.mediumGray}
                      />
                      <CustomText
                        style={styles.noClubsText}
                        text="No clubs found."
                        font="bold"
                      />
                    </View>
                  ) : (
                    // create a club category component for each category
                    <View
                      style={styles.clubCategoriesView}
                      contentContainerStyle={styles.clubCategoriesContent}
                      nestedScrollEnabled={true}
                    >
                      {sortedClubs?.map((category, index) => {
                        if (
                          category.data.length != 0 &&
                          (categoriesSelected.length == 0 ||
                            categoriesSelected.includes(
                              category.categoryName.slice(2)
                            ))
                        ) {
                          return (
                            <View index={index} style={styles.categoryView}>
                              <ClubCategory
                                name={
                                  category.categoryName.slice(0, 2) +
                                  " " +
                                  category.categoryName.slice(2)
                                }
                                data={category.data}
                                schoolKey={schoolKey}
                                navigation={navigation}
                              />
                            </View>
                          );
                        }
                      })}
                    </View>
                  )
                }
              </View>

              <View style={styles.fadeView}>
                <Fade visible={showText}>
                  <CustomText
                    style={styles.popUpText}
                    text="Create a club."
                    font="bold"
                  />
                </Fade>
              </View>
            </ScrollView>
            <CircleButton
              icon="create-outline"
              onPress={onAddClubPress}
              position={{ bottom: 0, right: 0 }}
              size={60}
            />
          </View>
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: Colors.lightGray,
  },
  upperContent: {
    justifyContent: "flex-start",
    paddingHorizontal: 16,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  lowerContent: {
    justifyContent: "flex-start",
    flex: 1,
  },
  noClubsView: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: 155,
  },
  clubCategoriesView: {
    paddingLeft: 15,
  },
  clubCategoriesContent: {
    justifyContent: "flex-start",
    alignItems: "flex-start",
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
  categoryView: {
    flex: 1,
    width: "100%",
    alignItems: "flex-start",
  },
  separator: {
    height: 1,
    width: "100%",
    marginRight: 20,
    backgroundColor: Colors.gray,
  },
  rightButtonView: {
    position: "absolute",
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
  noClubsText: {
    fontSize: 25,
    color: Colors.gray,
    marginTop: 10,
  },
  popUpText: {
    color: Colors.black,
    fontSize: 25,
    textAlign: "right",
  },
  fadeView: {
    position: "absolute",
    bottom: 5,
    right: 75,
    margin: 30,
  },

  // mask view
  background: {
    flex: 1,
  },
});

export default ClubList;
