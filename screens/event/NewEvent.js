import React, { useState, useLayoutEffect, useEffect } from "react";
// react native components
import { View, StyleSheet, ActivityIndicator } from "react-native";
// my components
import CustomButton from "../../components/buttons/CustomButton";
import CustomText from "../../components/display/CustomText";
import IconOverlay from "../../components/overlays/IconOverlay";
import Form from "../Form";
// functions
import {
  emailSplit,
  addEventToGoogleCalendar,
} from "../../functions/backendFunctions";
// backend
import { firestore } from "../../backend/FirebaseConfig";
// date time picker
import { doc, setDoc } from "firebase/firestore"; // firestore
// styles
import { useTheme } from "@react-navigation/native";
// scroll view
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const NewEvent = ({ route, navigation }) => {
  // get club name from previous screen
  const { clubId, clubCategories, event, fromMap } = route.params;

  const [form, setForm] = useState({
    eventName: event ? event.name : "",
    eventDescription: event ? event.description : "",
    date: event && event.date ? new Date(event.date) : new Date(),
    // time: event && event.time ? new Date(event.time) : new Date(),
    duration: event ? event.duration : "",
    roomNumber: event ? event.roomNumber : "",
    instructions: event ? event.instructions : "",
    publicEvent: event ? event.publicEvent : true,
    address: event ? event.address : "",
  });

  // update address from map
  const updateAddress = (address) => {
    setForm({ ...form, address: address });
  };

  useEffect(() => {
    if (fromMap) {
      updateAddress(event.address);
    }
  }, [fromMap]);

  const [loading, setLoading] = useState(false);
  // overlay
  const [overlayVisible, setOverlayVisible] = useState(false);

  const { colors } = useTheme();

  console.log("event: ", event);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "New Event",
    });
  }, [navigation]);

  const formPropertiesAndTypes = [
    {
      propName: "eventName",
      type: "text",
      title: "Event Name*",
      placeholder: "Event Name",
    },
    {
      propName: "eventDescription",
      type: "textLong",
      title: "Event Description*",
      placeholder: "Event Description",
    },
    {
      propName: "date",
      type: "date",
      title: "Date",
    },
    // {
    //   propName: "time",
    //   type: "time",
    //   title: "Time",
    // },
    {
      propName: "duration",
      type: "text",
      title: "Duration (mins)",
      placeholder: "Duration",
    },
    {
      propName: "roomNumber",
      type: "text",
      title: "Room Number",
      placeholder: "Room Number",
    },
    {
      propName: "instructions",
      type: "text",
      title: "Instructions",
      placeholder: "Instructions",
    },
    {
      propName: "publicEvent",
      type: "boolean",
      title: "Public Event",
    },
    {
      propName: "address",
      type: "location",
      title: "Location",
    },
  ];

  /*// location is const (not implemented currently)
  const location = event ? event.location : {
    // university of georgia by default
    latitude: 33.9562,
    longitude: -83.3740,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };*/

  // submit the form
  const onSubmitPressed = async () => {
    setLoading(true);

    // name, desc, address, and time are required
    if (!form.eventName || !form.eventDescription) {
      alert("Please fill out all required fields.");
      setLoading(false);
      return;
    }

    // try to submit the form
    try {
      // generate unique event id
      const eventId = Math.random().toString(36).substring(7);

      // get school key from async storage
      const schoolKey = await emailSplit();

      try {
        let newEvent = {
          id: eventId,
          clubId: clubId,
          categories: clubCategories,
          name: form.eventName,
          description: form.eventDescription,
          date: form.date.toString(),
          // time: form.time.toTimeString(),
          publicEvent: form.publicEvent,
          duration: form.duration,
        };
        if (form.duration !== "") newEvent.duration = form.duration;
        //if (location) newEvent.location = location
        if (form.address !== "") newEvent.address = form.address;
        if (form.instructions != "") newEvent.instructions = form.instructions;
        if (form.roomNumber != "") newEvent.roomNumber = form.roomNumber;

        await setDoc(
          doc(firestore, "schools", schoolKey, "eventData", eventId),
          newEvent
        );

        // set calendar event
        await setDoc(
          doc(firestore, "schools", schoolKey, "calendarData", eventId),
          {
            clubId: clubId,
            id: eventId,
            name: form.eventName,
            date: form.date.toString(),
            // time: form.time.toTimeString(),
            categories: clubCategories,
            publicEvent: form.publicEvent,
          }
        );

        //addEventToGoogleCalendar(newEvent);
      } catch (e) {
        console.error("Error adding document: ", e);
      }

      setOverlayVisible(true);
    } catch (error) {
      console.log(error);
      alert("event creation failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAwareScrollView
        contentInsetAdjustmentBehavior="automatic"
        extraHeight={200}
      >
        <View style={{ margin: 20 }}>
          <Form
            formPropertiesAndTypes={formPropertiesAndTypes}
            form={form}
            setForm={setForm}
            navigation={navigation}
            clubId={clubId}
            clubCategories={clubCategories}
          />

          <CustomText
            style={[styles.smallText, { color: colors.textLight }]}
            text="* Indicates a required field"
          />

          {loading && <ActivityIndicator size="large" color={colors.gray} />}
        </View>
      </KeyboardAwareScrollView>

      <View
        style={{
          alignSelf: "center",
          margin: 40,
          position: "absolute",
          bottom: 0,
        }}
      >
        <CustomButton
          text="Submit"
          onPress={onSubmitPressed}
          loading={loading}
          width={100}
          color={
            form.eventName && form.eventDescription
              ? colors.button
              : colors.gray
          }
        />
      </View>

      <IconOverlay
        visible={overlayVisible}
        setVisible={setOverlayVisible}
        closeCondition={() => {
          navigation.goBack();
        }}
        icon="checkmark-circle"
        iconColor={colors.green}
        text="Event created!"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 5,
  },
  elementsContainer: {
    marginTop: 0,
    alignItems: "flex-start",
    marginLeft: 20,
  },
  mapStyle: {
    width: 150,
    height: 150,
    borderRadius: 20,
    marginBottom: 20,
  },
  largeInputContainer: {
    borderWidth: 1,
    borderRadius: 20,
    height: 100,
    width: "90%",
    padding: 15,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 50,
    backgroundColor: "transparent",
    width: "90%",
  },
  textNormal: {
    fontSize: 20,
    marginLeft: 5,
    marginTop: 10,
  },
  textPressable: {
    fontSize: 18,
    marginLeft: 5,
    marginTop: 10,
  },
  textPressableSmall: {
    fontSize: 16,
    marginLeft: 5,
    marginTop: 10,
  },
  smallText: {
    // for required fields
    marginTop: -5,
    fontSize: 14,
  },
});

export default NewEvent;
