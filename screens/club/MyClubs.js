import React, { useState, useEffect } from "react";
// react native components
import { View, StyleSheet, ScrollView } from "react-native";
// use focus effect
import { useFocusEffect } from "@react-navigation/native";
// async storage
import AsyncStorage from "@react-native-async-storage/async-storage";
// storage
// my components
import ChatClubCard from "../../components/club/ChatClubCard";
import CustomText from "../../components/display/CustomText";
// functions
import {
  emailSplit,
  getSetMyClubsData,
  getSetUserData,
  showToastIfNewUser,
} from "../../functions/backendFunctions";
// backend
import { firestore } from "../../backend/FirebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
// icons
import Ionicon from "react-native-vector-icons/Ionicons";
// colors
import { useTheme } from "@react-navigation/native";
// stack navigator
import { createNativeStackNavigator } from "@react-navigation/native-stack";
// swipeable
import { GestureHandlerRootView } from "react-native-gesture-handler";
// toast
import Toast from "react-native-toast-message";

const Stack = createNativeStackNavigator();

const MyClubs = ({ navigation }) => {
  // user data
  const [userData, setUserData] = useState(null);
  // club data
  const [clubData, setClubData] = useState([]);
  // muted clubs
  const [mutedClubs, setMutedClubs] = useState([]);
  // unread messages
  //const [unreadMessages, setUnreadMessages] = useState({});
  // search text
  const [searchText, setSearchText] = useState("");
  // loading
  const [loading, setLoading] = useState(true);

  const { colors } = useTheme();

  const asyncFunc = async () => {
    setLoading(true);

    // get user data
    getSetUserData(setUserData);

    // get all club data from db
    getSetMyClubsData(setClubData, setMutedClubs);

    setLoading(false);
  };

  // load myClubs data from async storage
  const loadMyClubsData = async () => {
    const myClubsData = await AsyncStorage.getItem("myClubs");
    if (JSON.parse(myClubsData) > 0) {
      setClubData(JSON.parse(myClubsData));
    }
  };

  // get data from firebase
  useFocusEffect(
    React.useCallback(() => {
      loadMyClubsData();
      asyncFunc();
    }, [])
  );

  // show toast message for new users
  useEffect(() => {
    showToastIfNewUser('error', 'Welcome to Bark! 🎉', 'Join a club to start chatting with clubs and classmates!');

  }, []);

  // toggle mute
  const toggleMute = async (clubId) => {
    // get school key
    const schoolKey = await emailSplit();

    // get club member data
    const clubMemberRef = doc(
      firestore,
      "schools",
      schoolKey,
      "clubMemberData",
      "clubs",
      clubId,
      userData.id
    );
    getDoc(clubMemberRef).then((clubMemberSnapshot) => {
      const clubMemberData = clubMemberSnapshot.data();

      // if club member data exists
      if (clubMemberData) {
        // toggle mute
        const muted = clubMemberData.muted;
        updateDoc(clubMemberRef, { muted: !muted });
        if (muted) {
          setMutedClubs(mutedClubs.filter((item) => item !== clubId));
        } else {
          setMutedClubs([...mutedClubs, clubId]);
        }
      }
    });
  };

  // filter function
  const filterFunct = (club) => {
    // filter by search text
    if (searchText.length > 0) {
      if (!club.clubName.toLowerCase().includes(searchText.toLowerCase())) {
        return false;
      }
    }

    return true;
  };

  // filter clubs by filter function
  const filteredClubs = clubData.filter(filterFunct);

  // sort clubs by most recent message
  const sortedClubs = filteredClubs.sort((a, b) => {
    return a.lastMessageTime > b.lastMessageTime ? -1 : 1;
  });

  // show toast message
  const showToast = (type, text1, text2) => {
    Toast.show({
      type: type,
      text1: text1,
      text2: text2,
    });
  };

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ClubList"
        options={{
          headerTitle: "My Clubs",
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
            shadowColor: "transparent",
            elevation: 0,
          },
        }}
      >
        {() => (
          <View style={{ flex: 1, backgroundColor: colors.background }}>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={styles.container}
              contentInsetAdjustmentBehavior="automatic"
            >
              <GestureHandlerRootView>
                {
                  // if loading
                  loading ? (
                    <View style={styles.noClubsView}>
                      <Ionicon
                        name="chatbubbles"
                        size={100}
                        color={colors.gray}
                      />
                      <CustomText
                        style={[styles.title, { color: colors.textLight }]}
                        text="Loading..."
                        font="bold"
                      />
                    </View>
                  ) : (
                    <View>
                      {
                        // if no clubs found
                        sortedClubs.length === 0 ? (
                          <View style={styles.noClubsView}>
                            <Ionicon
                              name="chatbubbles"
                              size={100}
                              color={colors.gray}
                            />
                            <CustomText
                              style={[
                                styles.title,
                                { color: colors.textLight },
                              ]}
                              text="No clubs found."
                              font="bold"
                            />
                          </View>
                        ) : (
                          // create a chat club card for each club
                          sortedClubs.map((item, index) => {
                            return (
                              <View key={index}>
                                <ChatClubCard
                                  name={item.clubName}
                                  description={item.clubDescription}
                                  img={item.clubImg}
                                  muted={
                                    mutedClubs !== undefined
                                      ? mutedClubs.includes(item.clubId)
                                      : false
                                  }
                                  toggleMute={() => toggleMute(item.clubId)}
                                  unreadMessages={item.unreadMessages}
                                  lastMessage={item.lastMessage}
                                  lastMessageTime={item.lastMessageTime}
                                  clubId={item.clubId}
                                  navigation={navigation}
                                />
                                {index === sortedClubs.length - 1 ? null : (
                                  <View style={styles.separator}></View>
                                )}
                              </View>
                            );
                          })
                        )
                      }
                    </View>
                  )
                }
              </GestureHandlerRootView>
            </ScrollView>
          </View>
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  clubScrollView: {
    paddingTop: 15,
    paddingHorizontal: 15,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  clubContent: {
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  noClubsView: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: "50%",
  },
  title: {
    fontSize: 25,
    margin: 5,
  },
});

export default MyClubs;
