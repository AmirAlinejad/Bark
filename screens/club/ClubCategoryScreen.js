import React, { useEffect, useState, useLayoutEffect } from "react";
import { StyleSheet, FlatList } from "react-native";
// firebase
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { firestore } from "../../backend/FirebaseConfig";
// my components
import ClubCardVertical from "../../components/club/ClubCardVertical";
// functions
import { fetchClubs } from "../../functions/clubFunctions";
// functions
import { goToClubScreen } from "../../functions/navigationFunctions";
// colors
import { useTheme } from "@react-navigation/native";

const ClubCategoryScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  // get club category from route
  const { clubCategory, schoolKey } = route.params;

  // states
  const [searchText, setSearchText] = React.useState("");
  const [clubCategoryData, setClubCategoryData] = useState([]);

  // Define state for refreshing the screen
  const [fetchLimit, setFetchLimit] = useState(10);
  const [refreshing, setRefreshing] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: clubCategory,
      headerSearchBarOptions: {
        placeholder: "Search Clubs",
        onChangeText: (event) => {
          setSearchText(event.nativeEvent.text);
        },
        hideWhenScrolling: false,
      },
    });
  }, [navigation]);

  // get club data on initial render
  useEffect(() => {
    // Fetching club data
    const clubsQuery = query(
      collection(
        firestore,
        "schools",
        schoolKey,
        "clubSearchData",
        clubCategory.slice(3),
        "clubs"
      ),
      orderBy("clubMembers", "desc")
      // limit(fetchLimit)
    ); // order by club members eventually

    const unsubscribe = onSnapshot(
      clubsQuery,
      (querySnapshot) => {
        fetchClubs(querySnapshot, setClubCategoryData);
      },
      (error) => {
        console.error("Error fetching messages: ", error);
      }
    );

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, [fetchLimit]);

  // refresh messages
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setFetchLimit(fetchLimit + 20);

    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  // filter for clubs
  const filterFunct = (club) => {
    // filter by search text
    if (searchText.length > 0) {
      if (!club.clubName.toLowerCase().includes(searchText.toLowerCase())) {
        return false;
      }
    }

    return true;
  };

  const filteredClubs = clubCategoryData.filter(filterFunct);

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.clubScrollView}
      contentInsetAdjustmentBehavior="automatic"
      data={filteredClubs}
      //   refreshControl={
      //     <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      //   }
      refreshing={refreshing}
      renderItem={({ item }) => (
        <ClubCardVertical
          onPress={() => goToClubScreen(item.clubId, navigation)}
          name={item.clubName}
          description={item.clubDescription}
          img={item.clubImg || null}
        />
      )}
      keyExtractor={(item) => item.clubId}
      onEndReached={onRefresh}
      // ListFooterComponent={
      //   <TouchableOpacity
      //     onPress={() => {
      //       setFetchLimit(fetchLimit + 20);
      //     }}
      //   >
      //     <CustomText
      //       text="Load more clubs"
      //       style={{ color: colors.button, fontSize: 16 }}
      //     />
      //   </TouchableOpacity>
      // }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  basicView: { flex: 1, justifyContent: "center", alignItems: "center" },
  noClubsView: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: 180,
  },
  clubScrollView: {
    flex: 1,
    gap: 16,
  },
  searchBarView: {
    margin: 20,
  },
  clubContent: {
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: 15,
    backgroundColor: "red",
  },
  noClubsText: {
    fontSize: 25,
    marginTop: 10,
  },
});

export default ClubCategoryScreen;
