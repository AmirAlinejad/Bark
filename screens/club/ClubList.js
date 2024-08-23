import React, { useState, useEffect } from "react";
// react native components
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
// mask view
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
// use focus effect
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
// stack navigator
import { createNativeStackNavigator } from "@react-navigation/native-stack";
// async storage
import AsyncStorage from "@react-native-async-storage/async-storage";
// my components
import ClubCategory from "../../components/club/ClubCategory";
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
  showToastIfNewUser,
} from "../../functions/backendFunctions";
// styles
import { useTheme } from "@react-navigation/native";
// toast
import Toast from "react-native-toast-message";

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
  // screen timer
  const [timer, setTimer] = useState(0);

  const { colors } = useTheme();

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

  // increment timer if user stays on screen
  const focused = useIsFocused();

  useEffect(() => {
    if (focused) {
      const time = 10;
      const interval = setInterval(() => {
        if (timer < time) {
          setTimer(timer + 1);
        }
      }, 1000);

      if (timer == time) {
        Toast.show({
          type: "info",
          text1: "Can't find a club?",
          text2: "Try refreshing the page!",
          visibilityTime: 3000,
        });
        setTimer(timer + 1);
      }

      return () => clearInterval(interval);
    }
  }, [focused, timer]);

  // get data from firebase
  useFocusEffect(
    React.useCallback(() => {
      setTimer(0);
      // get school key
      const getSetSchoolKey = async () => {
        const schoolkey = await emailSplit();
        setSchoolKey(schoolkey);
      };
      getSetSchoolKey();

      loadClubSearchData(); // get data from async storage

      return () => {
        setShowText(false);
      };
    }, [])
  );

  useEffect(() => {
    showToastIfNewUser(
      "info",
      "Search for clubs!🔎",
      "Find a club that fits your interests."
    );
    asyncFunc();
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
            textColor: colors.text,
          },
          headerTransparent: true,
          headerBlurEffect: "light",
          // add club button top right
          headerLargeTitleStyle: {
            fontWeight: "bold",
            fontFamily: "Nunito",
            fontSize: 32,
          },
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerRight: () => (
            <TouchableOpacity onPress={asyncFunc}>
              <Ionicon name="refresh" size={30} color={colors.button} />
            </TouchableOpacity>
          ),
        }}
      >
        {() => (
          <View style={{ flex: 1 }}>
            <ScrollView
              style={styles.container}
              contentInsetAdjustmentBehavior="automatic"
            >
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
                          untoggledCol={colors.gray}
                        />
                      </View>
                    )}
                    keyExtractor={(item) => item.value}
                    horizontal={true}
                    contentContainerStyle={styles.categoriesButtonRow}
                    style={{ marginHorizontal: 0, mask: "hidden" }}
                    scrollEnabled={true}
                    // make scroll bar visible at all times
                    persistentScrollbar={true}
                  />
                </MaskedView>
              </View>
              <View style={styles.separator} />
              {loading ? (
                <View style={styles.noClubsView}>
                  <View style={{ height: 30 }} />
                  <ActivityIndicator size="large" color={colors.gray} />
                  <CustomText
                    style={[styles.noClubsText, { color: colors.textLight }]}
                    text="Loading clubs..."
                    font="bold"
                  />
                </View>
              ) : (
                <View style={styles.lowerContent}>
                  {
                    // if no clubs found
                    sortedClubs.length === 0 ? (
                      <View style={styles.noClubsView}>
                        <Ionicon
                          name="people-circle"
                          size={100}
                          color={colors.gray}
                        />
                        <CustomText
                          style={[
                            styles.noClubsText,
                            { color: colors.textLight },
                          ]}
                          text="No clubs found."
                          font="bold"
                        />
                        <CustomText
                          style={{ color: colors.textLight, fontSize: 16 }}
                          text="Try refreshing the page"
                        />
                        <CustomText
                          style={{ color: colors.textLight, fontSize: 16 }}
                          text="or search for a different club."
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
                              <View key={index} style={styles.categoryView}>
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
              )}
              <View style={styles.fadeView}>
                {/* <Fade visible={showText}>
                  <CustomText
                    style={styles.popUpText}
                    text="Create a club."
                    font="bold"
                  />
                </Fade> */}
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
  },
  rightButtonView: {
    position: "absolute",
    bottom: 0,
    right: 0,
    margin: 30,
  },
  title: {
    fontSize: 20,
  },
  noClubsText: {
    fontSize: 25,
    marginTop: 10,
  },
  popUpText: {
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
