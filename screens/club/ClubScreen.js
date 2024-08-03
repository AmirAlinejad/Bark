import React, { useState, useLayoutEffect, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
// fade
import Fade from "react-native-fade";
// functions
import {
  requestToJoinClub,
  checkMembership,
  getSetClubData,
  getSetClubCalendarData,
  emailSplit,
} from "../../functions/backendFunctions";
import {
  goToChatScreen,
  goToAdminChatScreen,
} from "../../functions/navigationFunctions";
// my components
import UpcomingEvents from "../../components/event/UpcomingEvents";
import CustomText from "../../components/display/CustomText";
import ClubImg from "../../components/club/ClubImg";
import IconButton from "../../components/buttons/IconButton";
import Chip from "../../components/display/Chip";
import IconOverlay from "../../components/overlays/IconOverlay";
import CircleButton from "../../components/buttons/CircleButton";
import CustomButton from "../../components/buttons/CustomButton";
// macros
import { CLUBCATEGORIES } from "../../macros/macros";
// colors
import { useTheme } from "@react-navigation/native";
import SettingsSection from "../../components/display/SettingsSection";

const ClubScreen = ({ route, navigation }) => {
  //  get club data
  const { clubId } = route.params; // just use clubId to get club data
  // membership
  const [currentUserPrivilege, setCurrentUserPrivilege] = useState("none");
  // club data
  const [clubData, setClubData] = useState(null);
  // event data
  const [eventData, setEventData] = useState([]);
  // fade text
  const [showText, setShowText] = useState(true);
  // loading
  const [loading, setLoading] = useState(true);
  // modals
  const [isJoinClubModalVisible, setJoinClubModalVisible] = useState(false);
  const [isRequestClubModalVisible, setRequestClubModalVisible] =
    useState(false);
  const [isRequestSent, setIsRequestSent] = useState(false);

  const { colors } = useTheme();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: "row" }}>
          <IconButton
            icon="qr-code-outline"
            onPress={onQRCodeButtonPress}
            style={styles.shareButton}
            text=""
            color={colors.button}
          />
          <IconButton
            icon="calendar-outline"
            onPress={onCalendarButtonPress}
            style={styles.calendarButton}
            text=""
            color={colors.button}
          />
        </View>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const asyncFunction = async () => {
      setLoading(true);

      await getSetClubData(clubId, setClubData);
      await getSetClubCalendarData(clubId, setEventData);

      checkMembership(clubId, setCurrentUserPrivilege, setIsRequestSent);
      setLoading(false);
    };

    asyncFunction();
  }, []);

  // fade out text after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowText(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // go to calendar with this club's events
  const onCalendarButtonPress = () => {
    navigation.navigate("Club Calendar", {
      clubId: clubId,
    });
  };

  // go to QR code screen
  const onQRCodeButtonPress = () => {
    navigation.navigate("QR Code", {
      qrCodeData: "?screen=club&clubId=" + clubId,
    });
  };

  // request to join club
  const onRequestButtonPress = () => {
    if (isRequestSent) {
      Alert.alert("Request already sent.");
      return;
    }
    // change modal
    requestToJoinClub(clubId, clubData.clubName, clubData.publicClub);
    if (clubData.publicClub) {
      setJoinClubModalVisible(true);

      // start timer for checking membership
      const timer = setTimeout(() => {
        checkMembership(clubId, setCurrentUserPrivilege, setIsRequestSent);
      }, 1000);
    } else {
      setRequestClubModalVisible(true);
    }
  };

  // goto UserList
  const gotoUserList = () => {
    navigation.navigate("UserList", {
      clubId: clubId,
      members: clubData.clubMembers,
      clubName: clubData.clubName,
    });
  };

  // goto message search
  const gotoMessageSearch = async () => {
    const schoolKey = await emailSplit();

    navigation.navigate("MessageSearchScreen", {
      clubId: clubId,
      chatName: "chat",
      pin: false,
      schoolKey: schoolKey,
    });
  };

  // goto image gallery
  const gotoImageGallery = () => {
    navigation.navigate("ImageGalleryScreen", { clubId: clubId });
  };

  // goto admin chat (fix later)
  const gotoAdminChat = () => {
    goToAdminChatScreen(clubData, navigation);
  };

  // go to manage club
  const goToManageClub = () => {
    navigation.navigate("InClubView", {
      clubData: clubData,
    });
  };

  // add event button
  const onAddEventPress = () => {
    navigation.navigate("NewEvent", {
      clubId: clubId,
      clubCategories: clubData.clubCategories,
      clubName: clubData.clubName,
    });
  };

  // filter events by club
  const filterFunct = (event) => {
    if (event.clubId !== clubId) {
      return false;
    }

    // filter by public events
    if (currentUserPrivilege == "none") {
      if (!event.public) {
        return false;
      }
    }

    return true;
  };

  const filteredEvents = eventData.filter(filterFunct);

  const settingsData = [
    {
      data: [
        {
          id: "1",
          icon: "people-outline",
          text: "Members",
          onPress: gotoUserList,
        },
        {
          id: "2",
          icon: "search-outline",
          text: "Search Messages",
          onPress: gotoMessageSearch,
        },
        {
          id: "3",
          icon: "images-outline",
          text: "Image Gallery",
          onPress: gotoImageGallery,
        },
        {
          id: "4",
          icon: "key-outline",
          text: "Admin Chat",
          onPress: gotoAdminChat,
          disabled:
            currentUserPrivilege !== "admin" &&
            currentUserPrivilege !== "owner",
        },
        {
          id: "5",
          icon: "settings-outline",
          text: "Manage Club",
          onPress: goToManageClub,
        },
      ],
    },
  ];

  console.log("clubData", clubData);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {clubData && (
        <ScrollView contentInsetAdjustmentBehavior="automatic">
          <View style={styles.content}>
            <ClubImg clubImg={clubData.clubImg} width={120} />

            <View style={styles.clubContent}>
              <CustomText
                style={[styles.clubName, { color: colors.text }]}
                text={clubData.clubName}
                font="black"
              />

              {/* categories */}
              <View style={styles.categoriesContent}>
                {clubData.clubCategories.length !== 0 &&
                  clubData.clubCategories.map((item) => {
                    // get corresponding club category
                    const category = CLUBCATEGORIES.find(
                      (clubCategory) => clubCategory.value === item
                    );

                    return (
                      <Chip
                        key={item}
                        style={styles.categoriesChip}
                        text={category.emoji + " " + category.value}
                        color={category.lightColor}
                        textColor={category.color}
                      />
                    );
                  })}
              </View>

              {/* description */}
              <CustomText
                style={[styles.clubDescription, { color: colors.textLight }]}
                text={clubData.clubDescription}
                numberOfLines={5}
              />

              {/* join club button */}
              {currentUserPrivilege === "none" && !loading && (
                <View style={{ marginBottom: 10 }}>
                  <CustomButton
                    text="Join the club!"
                    onPress={onRequestButtonPress}
                  />
                </View>
              )}
            </View>

            {currentUserPrivilege !== "none" && (
              <View style={styles.clubButtons}>
                <SettingsSection data={settingsData} loading={loading} />
              </View>
            )}

            <View style={{ paddingHorizontal: 16 }}>
              <View
                style={{ alignSelf: "center", marginBottom: 8, marginTop: 16 }}
              >
                <CustomText
                  font="bold"
                  style={{ fontSize: 24, color: colors.text }}
                  text="Upcoming Events"
                />
              </View>
              <UpcomingEvents
                filteredEvents={filteredEvents}
                screenName={"ClubScreen"}
                navigation={navigation}
              />

              {/* extra space at the bottom of the screen */}
              <View style={{ height: 50 }} />

              <View
                style={{
                  position: "absolute",
                  bottom: -600,
                  left: 0,
                  right: 0,
                  backgroundColor: colors.background,
                  height: 600,
                }}
              />
            </View>
          </View>
        </ScrollView>
      )}

      {/* extra buttons */}
      {(currentUserPrivilege == "admin" || currentUserPrivilege == "owner") && (
        <View>
          <View
            style={{ position: "absolute", bottom: 5, right: 75, margin: 30 }}
          >
            {/* <Fade visible={showText}>
              <CustomText
                style={[styles.popUpText, { color: colors.text }]}
                text="Create an Event."
                font="bold"
              />
            </Fade> */}
          </View>
          <CircleButton
            icon="calendar-number-outline"
            onPress={onAddEventPress}
            position={{ bottom: 0, right: 0 }}
            size={80}
          />
        </View>
      )}

      {/* other modals */}
      <IconOverlay
        visible={isJoinClubModalVisible}
        setVisible={setJoinClubModalVisible}
        icon="checkmark-circle-outline"
        iconColor={colors.green}
        text="You have joined the club."
      />
      <IconOverlay
        visible={isRequestClubModalVisible}
        setVisible={setRequestClubModalVisible}
        icon="mail-outline"
        iconColor={colors.green}
        text="Your request has been sent."
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "flex-start",
    flex: 1,
  },
  content: {
    marginTop: 30,
    alignItems: "center",
  },
  clubContent: {
    marginTop: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  clubName: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 16,
    marginHorizontal: 40,
  },
  categoriesChip: {
    margin: 0,
    padding: 10,
    borderRadius: 8,
    gap: 10,
    flexDirection: "row",
  },
  categoriesContent: {
    marginBottom: 8,
    justifyContent: "center",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  clubDescription: {
    textAlign: "center",
    marginHorizontal: 40,
    marginBottom: 10,
  },
  clubButtons: {
    flex: 1,
    width: "100%",
    paddingTop: 20,
    gap: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  popUpText: {
    fontSize: 25,
    textAlign: "right",
  },
});

export default ClubScreen;
