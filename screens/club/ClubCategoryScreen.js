import React, { useEffect, useState } from "react";
import { View, ScrollView, ActivityIndicator, StyleSheet, FlatList, RefreshControl } from "react-native";
// firebase
import { collection, query, limit, onSnapshot, orderBy } from "firebase/firestore";
import { firestore } from "../../backend/FirebaseConfig";
// my components
import Header from "../../components/display/Header";
import SearchBar from "../../components/input/SearchBar";
import ClubCardVertical from "../../components/club/ClubCardVertical";
import CustomText from "../../components/display/CustomText";
// functions
import { fetchClubs } from "../../functions/backendFunctions";
// icons
import Ionicon from "react-native-vector-icons/Ionicons";
// styles
import { Colors } from "../../styles/Colors";
// functions
import { goToClubScreen } from "../../functions/navigationFunctions";

const ClubCategoryScreen = ({ route, navigation }) => {
    // get club category from route
    const { clubCategory, schoolKey } = route.params;
    console.log(clubCategory);

    // states
    const [searchText, setSearchText] = React.useState("");
    const [clubCategoryData, setClubCategoryData] = useState([]);

    // Define state for refreshing the screen
    const [fetchLimit, setFetchLimit] = useState(10);
    const [refreshing, setRefreshing] = useState(false);

    // get club data on initial render
    useEffect(() => {

        // Fetching club data
        const clubsQuery = query(collection(firestore, 'schools', schoolKey, 'clubSearchData', clubCategory.slice(2), 'clubs'), orderBy('clubMembers', 'desc'), limit(fetchLimit)); // order by club members eventually
        
        const unsubscribe = onSnapshot(clubsQuery, querySnapshot => {

            fetchClubs(querySnapshot, setClubCategoryData);

        }, error => {
            console.error("Error fetching messages: ", error);
        });

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
        <View style={styles.container}>
            <Header text={clubCategory} navigation={navigation} back />

            <View style={styles.searchBarView}>
                <SearchBar placeholder='Search' value={searchText} setValue={setSearchText}/>
            </View>

            <FlatList
                data={filteredClubs}
                refreshControl={
                    <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    />
                }
                refreshing={refreshing}
                renderItem={({item}) => (
                    <ClubCardVertical
                        onPress={() => goToClubScreen(item.clubId, navigation)}
                        name={item.clubName}
                        description={item.clubDescription}
                        img={item.clubImg || null}
                    />
                )}
                keyExtractor={item => item.clubId}
                contentContainerStyle={styles.clubContent}
                style={styles.clubScrollView}
                onEndReached={onRefresh}
            />

            {/*<ScrollView style={styles.clubScrollView} contentContainerStyle={styles.clubContent}> 
                {filteredClubs.length == 0 ? (
                    // if no clubs found
                    <View style={styles.noClubsView}>
                        <Ionicon name="megaphone" size={100} color={Colors.lightGray} />
                        <CustomText style={styles.noClubsText} text="No clubs found." font='bold' />
                    </View>
                ) : (
                    filteredClubs.map((club, index) => (
                        <ClubCardVertical
                            key={index}
                            onPress={() => goToClubScreen(club.clubId, navigation)}
                            name={club.clubName}
                            description={club.clubDescription}
                            img={club.clubImg || null}
                            //memberCount={Object.keys(club.clubMembers).length}
                        />
                    ))
                )}
            </ScrollView>*/}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        backgroundColor: Colors.lightGray,
    },
    basicView: { flex: 1, 
        justifyContent: "center", 
        alignItems: "center",
    },
    noClubsView: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginTop: 180,
      },
    clubScrollView: {
        paddingTop: 15,
        paddingHorizontal: 15,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        flex: 1,
        backgroundColor: Colors.white,
    },
    searchBarView: {
        margin: 20,
    },
    clubContent: {
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        gap: 15,
    },
    noClubsText: {
        fontSize: 25,
        color: Colors.darkGray,
        marginTop: 10,
    },
});

export default ClubCategoryScreen;