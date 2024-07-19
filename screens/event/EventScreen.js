import React, { useState, useEffect, useLayoutEffect } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
// fade
import Fade from "react-native-fade";
// backend
import { ref, get, set } from "firebase/database";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, firestore } from "../../backend/FirebaseConfig";
import { getAuth } from "firebase/auth";
// my components
import Header from "../../components/display/Header";
import CustomText from "../../components/display/CustomText";
import IconButton from "../../components/buttons/IconButton";
import CircleButton from "../../components/buttons/CircleButton";
import ToggleButton from "../../components/buttons/ToggleButton";
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
// map
import MapView, { Marker } from "react-native-maps";
// colors
import { Colors } from "../../styles/Colors";
// clipboard
import * as Clipboard from "expo-clipboard";

const EventScreen = ({ route, navigation }) => {
  const { eventId, fromScreen } = route.params;

  // event data
  const [event, setEvent] = useState(undefined);
  const [currentUserPrivilege, setCurrentUserPrivilege] = useState("none");
  const [RSVPList, setRSVPList] = useState([]);
  const [userData, setUserData] = useState(null);
  const [addressCopied, setAddressCopied] = useState(false);
  const [showText, setShowText] = useState(true);
  // loading
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: "row" }}>
          {/* go to clubs screen */}
          {fromScreen != "ClubScreen" && (
            <IconButton
              icon={"enter-outline"}
              onPress={() => goToClubScreen(event.clubId, navigation)}
              color={Colors.buttonBlue}
            />
          )}

          {/* QR code button */}

          <IconButton
            icon={"qr-code-outline"}
            text=""
            onPress={onQRCodeButtonPress}
            color={Colors.buttonBlue}
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
    navigation.navigate("EditEvent", {
      event: event,
    });
  };

  // duplicate event button
  const onDuplicateButtonPress = () => {
    navigation.navigate("NewEvent", {
      event: event,
      clubId: event.clubId,
      clubCategories: event.clubCategories,
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
    navigation.navigate("QRCodeScreen", {
      name: event.name,
      qrCodeData: "?screen=event&eventId=" + eventId,
    });
  };

  return (
    <View style={{ flex: 1 }}>
      {event == {} && <CustomText text="Loading..." />}
      {event != undefined && (
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={styles.eventContent}
        >
          <View style={{ width: "100%", alignItems: "center", marginTop: 32 }}>
            <CustomText style={styles.title} text={event.name} font="black" />

            <CustomText
              style={{ ...styles.textNormal, color: Colors.darkGray }}
              text={event.clubName}
            />

            <View style={{ height: 32 }} />
          </View>

          <CustomText
            style={{ ...styles.textNormal, color: Colors.darkGray }}
            text={`${RSVPList.length} people are going`}
          />

          <View style={{ height: 16 }} />

          <CustomText
            style={styles.textNormal}
            text={event?.description?.trim()}
          />

          <View style={{ height: 16 }} />

          <View>
            <CustomText
              style={styles.textNormal}
              text={reformatDate(event.date)}
              font="bold"
            />
            <CustomText
              style={styles.textNormal}
              text={timeToString(event.time)}
            />
          </View>

          <View style={{ height: 16 }} />

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
                    style={styles.textNormal}
                    text={splitAddress(event.address)[0]}
                  />
                  <CustomText
                    style={styles.textNormal}
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
                  style={styles.textNormal}
                  text="No address provided"
                />
                <View style={{ marginLeft: 8 }}>
                  <Ionicons name={"location-outline"} size={20} color="black" />
                </View>
              </View>
            )}
          </View>

          {/* duration */}
          {event.duration && (
            <View style={{ marginTop: 16 }}>
              <CustomText
                style={styles.textNormal}
                text={`Duration: ${event.duration} min`}
              />
            </View>
          )}

          {/* instructions */}
          {event.instructions && (
            <View style={{ marginTop: 16 }}>
              <CustomText
                style={styles.textNormal}
                text={`Instructions: ${event.instructions}`}
              />
            </View>
          )}

          {/* room number */}
          {event.room && (
            <View style={{ marginTop: 16 }}>
              <CustomText
                style={styles.textNormal}
                text={`Room: ${event.roomNumber}`}
              />
            </View>
          )}
        </ScrollView>
      )}

      {userData != null && userData.id && (
        <View style={{ position: "absolute", alignSelf: 'center', bottom: 32 }}>
          <ToggleButton
            toggled={RSVPList.includes(userData.id) ? true : false}
            icon={RSVPList.includes(userData.id) ? "checkmark" : "people"}
            toggledCol={Colors.red}
            untoggledCol={Colors.lightRed}
            text={`RSVP`}
            onPress={toggleRSVP}
          />
        </View>
      )}

      {(currentUserPrivilege == "admin" || currentUserPrivilege == "owner") && (
        <View>
          <View
            style={{ position: "absolute", bottom: 5, right: 75, margin: 30 }}
          >
            <Fade visible={showText}>
              <CustomText
                style={styles.popUpText}
                text="Edit the Event."
                font="bold"
              />
            </Fade>
          </View>
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
    backgroundColor: Colors.white,
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
  addEventButton: {
    backgroundColor: Colors.red,
    padding: 20,
    borderRadius: 50,
    shadowColor: "black",
    shadowOffset: { width: 3, height: 5 },
    shadowOpacity: 0.25,
  },
  leftButtonView: {
    position: "absolute",
    bottom: 0,
    left: 0,
    margin: 25,
  },

  // fonts
  title: {
    fontSize: 32,
    textAlign: "center",
  },
  textNormal: {
    fontSize: 18,
    color: Colors.black,
  },
  textSmall: {
    fontSize: 14,
  },
  popUpText: {
    color: Colors.black,
    fontSize: 25,
    textAlign: "right",
  },
});

export default EventScreen;
