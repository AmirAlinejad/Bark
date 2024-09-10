import React, { useState, useEffect } from "react";
// react native components
import { View, StyleSheet } from "react-native";
// my components
import CustomText from "../../components/display/CustomText";
import CustomButton from "../../components/buttons/CustomButton";
import CircleButton from "../../components/buttons/CircleButton";
import Form from "../Form";
// modal
import Modal from "react-native-modal";
// backend
import { doc, setDoc } from "firebase/firestore";
import { firestore } from "../../backend/FirebaseConfig";
// functions
import { emailSplit } from "../../functions/backendFunctions";
import { deleteEvent } from "../../functions/eventFunctions";
// icons
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
// styles
import { useTheme } from "@react-navigation/native";

const EditEventScreen = ({ route, navigation }) => {
  // get user data from previous screen
  const event = route.params.event;
  const fromMap = route.params.fromMap;

  // state variables
  const [form, setForm] = useState({
    eventName: event ? event.name : "",
    eventDescription: event ? event.description : "",
    date: event && event.date ? new Date(event.date) : new Date(),
    // time: event && event.time ? new Date(event.time) : new Date(),
    duration: event ? event.duration : new Date(),
    repeats: event ? event.repeats : "never",
    roomNumber: event ? event.roomNumber : "",
    instructions: event ? event.instructions : "",
    publicEvent: event ? event.publicEvent : true,
    address: event ? event.address : "",
  });
  const [loading, setLoading] = useState(false);
  // overlay
  const [modalVisible, setModalVisible] = useState(false);

  // update address from map
  const updateAddress = (address) => {
    setForm({ ...form, address: address });
  };

  useEffect(() => {
    if (fromMap) {
      updateAddress(event.address);
    }
  }, [fromMap]);

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
      placeholder: "Tell us about your event!",
    },
    {
      propName: "date",
      type: "date",
      title: "Date",
    },
    {
      propName: "duration",
      type: "duration",
      title: "Duration",
    },
    {
      propName: "repeats",
      type: "repeats",
      title: "Repeats",
    },
    {
      propName: "roomNumber",
      type: "number",
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
      notes: "Public events are visible to all users.",
    },
    {
      propName: "address",
      type: "location",
      title: "Address",
    },
  ];

  const { colors } = useTheme();

  // edit event
  const onEditEventSubmitted = async (e) => {
    setLoading(true);
    e.preventDefault();

    // check if any fields are empty
    if (!form.eventName || !form.eventDescription) {
      alert("Please fill out all required fields");
      setLoading(false);
      return;
    }

    // try to submit the edit profile request
    try {
      const schoolKey = await emailSplit();

      const updatedEvent = {
        id: event.id,
        clubId: event.clubId,
        categories: event.categories,
        name: form.eventName,
        description: form.eventDescription,
        date: form.date.toString(),
        duration: form.duration.toString(),
        publicEvent: form.publicEvent,
        repeats: form.repeats,
      };
      if (form.address) updatedEvent.address = form.address;
      if (form.roomNumber) updatedEvent.roomNumber = form.roomNumber;
      if (form.instructions) updatedEvent.instructions = form.instructions;

      // update event in firestore
      const eventDoc = doc(
        firestore,
        "schools",
        schoolKey,
        "eventData",
        event.id
      ); // 'schools/{schoolId}/events/{eventId}
      await setDoc(eventDoc, updatedEvent);

      // update calendar data
      const calendarDataDoc = doc(
        firestore,
        "schools",
        schoolKey,
        "calendarData",
        event.id
      ); // 'schools/{schoolId}/calendarData/{eventId}

      const updatedCalendarData = {
        clubId: event.clubId,
        id: event.id,
        name: form.eventName,
        date: form.date.toString(),
        categories: event.categories,
        publicEvent: form.publicEvent,
        repeats: form.repeats,
      };

      await setDoc(calendarDataDoc, updatedCalendarData);

      navigation.goBack();
      navigation.goBack();
    } catch (error) {
      console.log(error);
      alert("Edit Event failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // navigate to map screen
  // const onMapPressed = () => {
  //   navigation.navigate("MapPicker", {
  //     // send event data to map picker screen
  //     event: {
  //       id: event.id,
  //       eventName: eventName,
  //       description: eventDescription,
  //       //location: location,
  //       address: eventAddress,
  //       date: eventDate.toDateString(),
  //       time: eventTime.toTimeString(),
  //       duration: eventDuration,
  //       roomNumber: eventRoomNumber,
  //       instructions: eventInstructions,
  //       clubId: event.clubId,
  //       categories: event.categories,
  //       publicEvent: publicEvent,
  //     },
  //     fromEdit: true,
  //   });
  // };

  // delete event
  const deleteThisEvent = async () => {
    deleteEvent(event.id);
    navigation.navigate("Home Screen");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAwareScrollView
        extraHeight={200}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={{ margin: 20 }}>
          <Form
            formPropertiesAndTypes={formPropertiesAndTypes}
            form={form}
            setForm={setForm}
            navigation={navigation}
            eventId={event.id}
            clubId={event.clubId}
            clubCategories={event.categories}
          />

          <CustomText
            style={[styles.smallText, { color: colors.textLight }]}
            text="* Indicates a required field"
          />

          <View style={styles.buttonContainer}>
            <CustomButton
              text="Save Changes"
              onPress={onEditEventSubmitted}
              width={140}
            />
          </View>
        </View>
      </KeyboardAwareScrollView>

      <CircleButton
        icon="trash-outline"
        onPress={() => setModalVisible(true)}
        position={{ bottom: 0, right: 0 }}
        size={80}
      />

      <Modal isVisible={modalVisible}>
        <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
          <CustomText
            style={styles.modalText}
            text="Are you sure you want to delete the event?"
          />
          <View style={styles.modalButtons}>
            <CustomButton
              text="Yes"
              onPress={deleteThisEvent}
              color={colors.red}
            />
            <CustomButton
              text="No"
              onPress={() => setModalVisible(false)}
              color={colors.button}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
  },
  elementsContainer: {
    justifyContent: "flex-start",
    marginTop: 20,
    marginLeft: 20,
    gap: 5,
  },
  mapStyle: {
    width: 170,
    height: 170,
    borderRadius: 20,
    marginBottom: 10,
  },
  buttonContainer: {
    marginTop: 10,
  },
  largeInputContainer: {
    borderWidth: 1,
    borderRadius: 20,
    height: 100,
    width: "90%",
    padding: 15,
    marginBottom: 20,
  },
  textNormal: {
    fontSize: 20,
    marginLeft: 5,
  },
  smallText: {
    // for required fields
    marginTop: -5,
    fontSize: 14,
  },
  textPressable: {
    fontSize: 18,
    marginLeft: 5,
  },
  textPressableSmall: {
    fontSize: 16,
    marginLeft: 5,
  },

  // modal styles
  modalContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    margin: 20,
    borderRadius: 20,
  },
  modalText: {
    textAlign: "center",
    fontSize: 18,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 80,
    justifyContent: "space-between",
  },
});
export default EditEventScreen;
