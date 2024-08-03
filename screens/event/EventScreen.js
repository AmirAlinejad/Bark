import React, { useState, useEffect, useLayoutEffect } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
// fade
import Fade from "react-native-fade";
// backend
import { doc, updateDoc } from "firebase/firestore";
import { firestore } from "../../backend/FirebaseConfig";
// my components
import CustomText from "../../components/display/CustomText";
import IconButton from "../../components/buttons/IconButton";
import CircleButton from "../../components/buttons/CircleButton";
import CustomButton from "../../components/buttons/CustomButton";
// icons
import { Ionicons } from "@expo/vector-icons";
// functions
import {
  emailSplit,
  checkMembership,
  getSetEventData,
  getSetUserData,
} from "../../functions/backendFunctions";
import { timeToString, reformatDate } from "../../functions/timeFunctions";
import { goToClubScreen } from "../../functions/navigationFunctions";
// colors
import { useTheme } from "@react-navigation/native";
// clipboard
import * as Clipboard from "expo-clipboard";

const EventScreen = ({ route, navigation }) => {
  const { eventId, fromScreen } = route.params;

  // event data
  const [event, setEvent] = useState(null);
  const [currentUserPrivilege, setCurrentUserPrivilege] = useState("none");
  const [RSVPList, setRSVPList] = useState([]);
  const [userData, setUserData] = useState(null);
  const [addressCopied, setAddressCopied] = useState(false);
  const [showText, setShowText] = useState(true);
  // loading
  const [loading, setLoading] = useState(true);

  const { colors } = useTheme();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: "row" }}>
          {/* QR code button */}

          <IconButton
            icon={"qr-code-outline"}
            text=""
            onPress={onQRCodeButtonPress}
            color={colors.button}
          />
        </View>
      ),
    });
  }, [navigation]);

  // clipboard
  const copyAddressToClipboard = async () => {
    Clipboard.setStringAsync(event.address);
    setAddressCopied(true);
  };

  // get event data
  useEffect(() => {
    const asyncFunc = async () => {
      console.log("getting event data for", eventId);
      await getSetEventData(eventId, setEvent, setRSVPList);

      // get user id
      getSetUserData(setUserData);
    };

    asyncFunc();
  }, []);

  console.log("rsvp list", RSVPList);
  console.log("event", event);

  // check user privilege after event data is loaded
  useEffect(() => {
    if (event != undefined) {
      const asyncFunc = async () => {
        await checkMembership(event.clubId, setCurrentUserPrivilege);
      };

      asyncFunc();
    }
  }, [event]);

  // fade out text after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowText(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // edit event button
  const onEditButtonPress = () => {
    console.log("editing event", event);
    console.log("date", new Date(event.date));
    const editingEvent = {
      ...event,
    };
    navigation.navigate("Edit Event", {
      event: editingEvent,
    });
  };

  // duplicate event button
  const onDuplicateButtonPress = () => {
    // create new event object
    let newEvent = {
      name: event.name + " (Copy)",
      description: event.description,
      address: event.address,
      location: event.location,
      clubId: event.clubId,
      clubName: event.clubName,
      clubCategories: event.clubCategories,
      duration: event.duration,
      instructions: event.instructions,
      roomNumber: event.roomNumber,
    };

    navigation.navigate("NewEvent", {
      event: newEvent,
      clubId: event.clubId,
      clubCategories: event.clubCategories,
      clubName: event.clubName,
    });
  };

  // split address into street and city
  const splitAddress = (address) => {
    let split = [];
    split[0] = address.split(",")[0];
    split[1] = address.slice(address.indexOf(",") + 2, address.length);
    return split;
  };

  // toggle RSVP
  const toggleRSVP = async () => {
    let newRSVPList = RSVPList;

    if (RSVPList.includes(userData.id)) {
      // remove user from rsvp list
      newRSVPList = RSVPList.filter((id) => id != userData.id);
    } else {
      // add user to rsvp list
      newRSVPList = [...RSVPList, userData.id];
    }

    console.log("new rsvp list", newRSVPList);
    setRSVPList(newRSVPList);

    // update backend
    const schoolKey = await emailSplit();
    const eventRef = doc(firestore, "schools", schoolKey, "eventData", eventId);
    updateDoc(eventRef, { rsvps: newRSVPList });
  };

  // go to QR code screen
  const onQRCodeButtonPress = () => {
    navigation.navigate("QR Code", {
      qrCodeData: "?screen=event&eventId=" + eventId,
    });
  };

  const gap = 20;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {event == {} && <CustomText text="Loading..." />}
      {event != undefined && (
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={styles.eventContent}
        >
          <View style={{ width: "100%", alignItems: "center", marginTop: 32 }}>
            <CustomText
              style={{ ...styles.title, color: colors.text }}
              text={event.name}
              font="black"
            />

            <CustomText
              style={{ ...styles.textNormal, color: colors.textLight }}
              text={event.clubName}
            />

            <View style={{ height: 32 }} />
          </View>

          <CustomText
            style={{ ...styles.textNormal, color: colors.textLight }}
            text={`${RSVPList.length} ${
              RSVPList.length === 1 ? "person is" : "people are"
            } going`}
          />

          <View style={{ height: gap }} />

          <CustomText
            style={{ ...styles.textNormal, color: colors.text }}
            text={event?.description?.trim()}
          />

          <View style={{ height: gap }} />

          <View>
            <CustomText
              style={{ ...styles.textNormal, color: colors.text }}
              text={reformatDate(event.date)}
              font="bold"
            />
            {/* <CustomText
              style={styles.textNormal}
              text={timeToString(event.time)}
            /> */}
          </View>

          <View style={{ height: gap }} />

          {/*} <MapView
            style={styles.mapStyle}
            region={event.location}
          >
            <Marker coordinate={event.location} />
          </MapView>*/}

          <View>
            {event.address ? (
              <View style={{ flexDirection: "row" }}>
                <View>
                  <CustomText
                    style={{ ...styles.textNormal, color: colors.text }}
                    text={splitAddress(event.address)[0]}
                  />
                  <CustomText
                    style={{ ...styles.textNormal, color: colors.textLight }}
                    text={splitAddress(event.address)[1]}
                  />
                </View>
                <TouchableOpacity
                  style={{ marginLeft: 20, marginTop: 15 }}
                  onPress={copyAddressToClipboard}
                >
                  <Ionicons
                    name={!addressCopied ? "copy-outline" : "checkmark"}
                    size={20}
                    color="black"
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ flexDirection: "row" }}>
                <CustomText
                  style={{ ...styles.textNormal, color: colors.text }}
                  text="No address provided"
                />
                <View style={{ marginLeft: 8 }}>
                  <Ionicons
                    name={"location-outline"}
                    size={20}
                    color={colors.text}
                  />
                </View>
              </View>
            )}
          </View>

          {/* duration */}
          {event.duration && (
            <View style={{ marginTop: gap }}>
              <CustomText
                style={{ ...styles.textNormal, color: colors.text }}
                text={`Duration: ${event.duration} min`}
              />
            </View>
          )}

          {/* instructions */}
          {event.instructions && (
            <View style={{ marginTop: gap }}>
              <CustomText
                style={{ ...styles.textNormal, color: colors.text }}
                text={`Instructions: ${event.instructions}`}
              />
            </View>
          )}

          {/* room number */}
          {event.room && (
            <View style={{ marginTop: gap }}>
              <CustomText
                style={{ ...styles.textNormal, color: colors.text }}
                text={`Room: ${event.roomNumber}`}
              />
            </View>
          )}

          {/* go to clubs screen */}
          {fromScreen != "ClubScreen" && (
            <TouchableOpacity
              onPress={() => goToClubScreen(event.clubId, navigation)}
              style={{ marginTop: gap }}
            >
              <CustomText
                style={{ ...styles.textNormal, color: colors.button }}
                text="Go to Club"
              />
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      {userData != null && userData.id && (
        <View style={{ position: "absolute", alignSelf: "center", bottom: 32 }}>
          <CustomButton
            icon={RSVPList.includes(userData.id) ? "checkmark" : "people"}
            color={
              RSVPList.includes(userData.id) ? colors.darkGray : colors.button
            }
            text={`RSVP`}
            onPress={toggleRSVP}
          />
        </View>
      )}

      {(currentUserPrivilege == "admin" || currentUserPrivilege == "owner") && (
        <View>
          {/* <View
            style={{ position: "absolute", bottom: 5, right: 75, margin: 30 }}
          >
            <Fade visible={showText}>
              <CustomText
                style={{ ...styles.popUpText, color: colors.textLight }}
                text="Edit the Event."
                font="bold"
              />
            </Fade>
          </View> */}
          <CircleButton
            icon="create-outline"
            onPress={onEditButtonPress}
            position={{ bottom: 0, right: 0 }}
            size={60}
          />
          <CircleButton
            icon="copy-outline"
            onPress={onDuplicateButtonPress}
            position={{ bottom: 72, right: 0 }}
            size={60}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
  },
  eventContent: {
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: 0,
    marginTop: 24,
    marginHorizontal: 24,
  },
  mapStyle: {
    width: 170,
    height: 170,
    borderRadius: 20,
    marginBottom: 10,
  },
  eventButtons: {
    gap: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    position: "absolute",
    right: 30,
    top: 68,
  },

  // bottom buttons
  rightButtonView: {
    position: "absolute",
    bottom: 0,
    right: 0,
    margin: 30,
  },
  leftButtonView: {
    position: "absolute",
    bottom: 0,
    left: 0,
    margin: 25,
  },

  // fonts
  title: {
    fontSize: 28,
    textAlign: "center",
  },
  textNormal: {
    fontSize: 18,
  },
  textSmall: {
    fontSize: 14,
  },
  popUpText: {
    fontSize: 25,
    textAlign: "right",
  },
});

export default EventScreen;
