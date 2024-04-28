import React from "react";
import { View, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
// my components
import Header from "../../components/display/Header";
import SearchBar from "../../components/input/SearchBar";
import ClubCardVertical from "../../components/club/ClubCardVertical";
// styles
import { Colors } from "../../styles/Colors";
// functions
import { goToClubScreen } from "../../functions/navigationFunctions";

const ClubCategoryScreen = ({ route, navigation }) => {
    const { clubCategory } = route.params;

    // state for seatch
    const [searchText, setSearchText] = React.useState("");

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

    const filteredClubs = clubCategory.filter(filterFunct);

    return (
        <View style={styles.container}>
            <Header text="Clubs" navigation={navigation} back />

            <View style={styles.searchBarView}>
                <SearchBar
                    value={searchText}
                    onChangeText={(text) => setSearchText(text)}
                    placeholder="Search Clubs"
                />
            </View>

            <ScrollView style={styles.clubScrollView} contentContainerStyle={styles.clubContent}>
                {filteredClubs.length == 0 ? (
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                        <ActivityIndicator size="large" color={Colors.black} />
                    </View>
                ) : (
                    filteredClubs.slice(0, 6) // only show a few clubs
                    .map((club, index) => (
                        <ClubCardVertical
                            key={index}
                            onPress={() => goToClubScreen(club, navigation)}
                            name={club.clubName}
                            description={club.clubDescription}
                            img={club.clubImg}
                            memberCount={Object.keys(club.clubMembers).length}
                        />
                    ))
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        backgroundColor: Colors.lightGray,
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
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: 15,
    },
});

export default ClubCategoryScreen;